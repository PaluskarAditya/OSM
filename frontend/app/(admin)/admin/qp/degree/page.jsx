"use client";

import * as XLSX from "xlsx";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  CirclePlusIcon,
  Eye,
  FileDown,
  FileUp,
  Search,
  Pencil,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export default function DegreeManagementPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [degrees, setDegrees] = useState([]);
  const [streams, setStreams] = useState({});
  const [fetchStreams, setFetchStreams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStream, setSelectedStream] = useState(null);
  const [degreeName, setDegreeName] = useState("");
  const [fileInputDialog, setInputDialog] = useState(false);

  // Fetch degrees
  useEffect(() => {
    const getDegrees = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees`
        );
        const data = await res.json();

        // Map streams
        const streamMap = {};
        await Promise.all(
          data.map(async (deg) => {
            if (!streamMap[deg.stream]) {
              const streamRes = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams/${deg.stream}`
              );
              const streamData = await streamRes.json();
              streamMap[deg.stream] = streamData.name || "Unknown";
            }
          })
        );

        setStreams(streamMap);
        setDegrees(data);
      } catch (error) {
        toast.error(error.message);
      }
    };

    getDegrees();
  }, []);

  useEffect(() => {
    if (isDialogOpen) {
      const getStreams = async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams`
          );

          if (res.ok) {
            const data = await res.json();
            setFetchStreams(data);
          }
        } catch (error) {
          toast.error(error.message);
        }
      };

      getStreams();
    }
  }, [isDialogOpen]);

  // Update handler
  const handleUpdate = (degreeId) => {
    toast.info(`Update clicked for degree ID: ${degreeId}`);
    // Implement actual update logic or show a modal
  };

  // Deactivate handler
  const handleDeactivate = async (degreeId) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees/${degreeId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: false }),
        }
      );

      if (res.ok) {
        toast.success("Degree deactivated");
        setDegrees((prev) =>
          prev.map((deg) =>
            deg._id === degreeId ? { ...deg, isActive: false } : deg
          )
        );
      } else {
        toast.error("Failed to deactivate");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filteredDegrees = degrees.filter((deg) =>
    deg.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDegree = async () => {
    const code = [...Array(6)]
      .map(() => Math.random().toString(36)[2].toUpperCase())
      .join("");

    const degree = {
      stream: selectedStream.uuid,
      name: degreeName,
      uuid: code,
    };

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(degree),
      }
    );

    if (res.ok) {
      const data = await res.json();
      setDegrees([...degrees, data]);
      setStreams((prev) => {
        const newMap = { ...prev };
        if (!newMap[data.stream]) {
          newMap[data.stream] = selectedStream.name;
        }
        return newMap;
      });
      toast.success("Degree added successfully");
      setSelectedStream(null);
      setDegreeName("");
      setIsDialogOpen(false);
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredDegrees.map((deg) => ({
      "Degree Name": deg.name,
      "Stream Name": streams[deg.stream] || "Unknown",
      "Created At": new Date(deg.createdAt).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Degrees");
    XLSX.writeFile(workbook, "Degrees.xlsx");
  };

  const handleImportExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validate required fields (Status removed)
        const requiredFields = ['Subject Name', 'Code', 'Type', 'Semester', 'Exam Date', 'Course', 'Combined'];
        const missingFields = [];

        jsonData.forEach((row, index) => {
          requiredFields.forEach(field => {
            if (!row[field] && row[field] !== 0) {
              missingFields.push(`Row ${index + 2}: Missing ${field}`);
            }
          });
        });

        if (missingFields.length > 0) {
          toast.error(`Missing required fields:\n${missingFields.join('\n')}`);
          return;
        }

        // Transform imported data
        const subjectsReady = jsonData.map((row) => {
          const uuid = [...Array(6)]
            .map(() => Math.random().toString(36)[2].toUpperCase())
            .join("");

          let examDate;
          if (typeof row['Exam Date'] === 'number') {
            examDate = new Date((row['Exam Date'] - 25569) * 86400 * 1000);
          } else {
            examDate = new Date(row['Exam Date']);
          }

          return {
            name: row['Subject Name'],
            code: row['Code'],
            type: row['Type'],
            semester: row['Semester'].toString(),
            exam: examDate.toISOString(),
            course: "unknown",
            courseName: row['Course'],
            combined: "unknown",
            combinedName: row['Combined'],
            uuid,
            isActive: row['Status']?.toLowerCase() === 'active' ? true : false, // Default to false if Status is missing
            createdAt: new Date().toISOString(),
            __isImported: true
          };
        });

        setDegrees(prev => [...prev, ...subjectsReady]); // Changed to setDegrees to align with state
        toast.success(`${subjectsReady.length} subjects imported successfully (frontend only)`);

      } catch (error) {
        toast.error("Error importing file: " + error.message);
        console.error("Import error:", error);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="flex p-6 h-full flex-col gap-5 bg-gray-100/50 w-full">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Degree</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Add a new examination stream to the system
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stream-name" className="text-sm font-medium">
                Select Stream
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="w-full cursor-pointer flex justify-between items-center"
                    variant={"outline"}
                  >
                    <span>{selectedStream?.name || "Select"}</span>
                    <ChevronDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] p-0">
                  <DropdownMenuGroup>
                    {fetchStreams.map((el) => (
                      <DropdownMenuItem
                        className={`w-full cursor-pointer ${selectedStream?.name === el.name ? "bg-gray-100 font-semibold" : ""}`}
                        key={el._id || el.name}
                        onClick={() =>
                          setSelectedStream((prev) =>
                            prev?.name === el.name ? null : el
                          )
                        }
                      >
                        {el.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-2">
              <Label>Degree Name</Label>
              <Input
                placeholder="BCA 1st Year"
                value={degreeName}
                onChange={(e) => setDegreeName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="hover:bg-gray-100">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleAddDegree}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              Create Degree
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={fileInputDialog} onOpenChange={setInputDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Import data from Excel
            </DialogDescription>
          </DialogHeader>
          <div>
            <Input type="file" onChange={handleImportExcel} />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="hover:bg-gray-100">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={() => setInputDialog(false)} // Close dialog after import
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              Import Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium">Question Paper Management</h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/qp">
                Streams & Subjects
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-muted-foreground">
                Degree
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search degrees..."
            className="pl-9 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 cursor-pointer">
              Actions
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => setIsDialogOpen(true)}
                className="gap-2 cursor-pointer"
              >
                <CirclePlusIcon className="h-4 w-4" />
                New Degree
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={exportToExcel}
                className="gap-2 cursor-pointer"
              >
                <FileDown className="h-4 w-4" />
                Export
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setInputDialog(true)}
                className="gap-2 cursor-pointer"
              >
                <FileUp className="h-4 w-4" />
                Import
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Eye className="h-4 w-4" />
                View deactivated
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card className="flex-1 overflow-hidden">
        <div className="p-6 py-0 rounded-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">
              Degrees{" "}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({degrees.length} total)
              </span>
            </h2>
          </div>
          <div className="rounded-md">
            <Table className="bg-white border shadow-sm rounded-md">
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox disabled />
                  </TableHead>
                  <TableHead className="font-medium">Degree Name</TableHead>
                  <TableHead className="font-medium">Stream Name</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="text-right font-medium">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDegrees.length > 0 ? (
                  filteredDegrees.map((deg) => (
                    <TableRow
                      key={deg._id || deg.uuid}
                      className={`hover:bg-gray-50 ${!deg.isActive ? "bg-red-50 text-gray-500" : ""}`}
                    >
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell className="font-medium">{deg.name}</TableCell>
                      <TableCell>
                        {streams[deg.stream] || deg.courseName || "Loading..."}
                      </TableCell>
                      <TableCell>
                        {deg.isActive ? (
                          <span className="text-green-600 font-semibold">
                            Active
                          </span>
                        ) : (
                          <span className="text-red-500 font-medium">
                            Inactive
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-gray-700 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleUpdate(deg._id || deg.uuid)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-red-600 hover:bg-red-50 cursor-pointer"
                          disabled={!deg.isActive}
                          onClick={() => handleDeactivate(deg._id || deg.uuid)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Deactivate</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-4 text-gray-500"
                    >
                      No degrees found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
}