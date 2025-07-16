"use client";

import * as XLSX from "xlsx";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
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
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export default function DegreeManagementPage() {
  // State management
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDegree, setEditingDegree] = useState(null);
  const [degrees, setDegrees] = useState([]);
  const [streams, setStreams] = useState({}); // { [streamUuid]: { name, isActive } }
  const [fetchedStreams, setFetchedStreams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStream, setSelectedStream] = useState(null);
  const [degreeName, setDegreeName] = useState("");
  const [fileInputDialog, setInputDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnlyActive, setShowOnlyActive] = useState(true);

  // Fetch degrees and streams
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch degrees and streams concurrently
      const [degreesRes, streamsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees`),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams`),
      ]);

      if (!degreesRes.ok) throw new Error("Failed to fetch degrees");
      if (!streamsRes.ok) throw new Error("Failed to fetch streams");

      const degreesData = await degreesRes.json();
      const streamsData = await streamsRes.json();

      // Create stream map with name and isActive
      const streamMap = {};
      streamsData.forEach((stream) => {
        streamMap[stream.uuid] = {
          name: stream.name || "Unknown",
          isActive: stream.isActive !== false,
        };
      });

      setDegrees(degreesData);
      setStreams(streamMap);
      setFetchedStreams(streamsData);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [showOnlyActive]);

  // Add degree
  const handleAddDegree = async () => {
    if (!degreeName.trim() || !selectedStream) {
      toast.error("Please fill in all fields");
      return;
    }

    const code = [...Array(6)]
      .map(() => Math.random().toString(36)[2].toUpperCase())
      .join("");

    const degree = {
      stream: selectedStream.uuid,
      name: degreeName.trim(),
      uuid: code,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(degree),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setDegrees([...degrees, data]);
        setStreams((prev) => ({
          ...prev,
          [data.stream]: {
            name: selectedStream.name,
            isActive: selectedStream.isActive !== false,
          },
        }));
        toast.success("Degree added successfully");
        resetForm();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to add degree");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Update degree
  const handleUpdate = async () => {
    if (!editingDegree || !degreeName.trim() || !selectedStream) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees/${editingDegree.uuid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: degreeName.trim(),
            stream: selectedStream.uuid,
          }),
        }
      );

      if (res.ok) {
        const updatedDegree = await res.json();
        setDegrees((prev) =>
          prev.map((deg) =>
            deg.uuid === editingDegree.uuid ? updatedDegree : deg
          )
        );
        setStreams((prev) => ({
          ...prev,
          [updatedDegree.stream]: {
            name: selectedStream.name,
            isActive: selectedStream.isActive !== false,
          },
        }));
        toast.success("Degree updated successfully");
        resetForm();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to update degree");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Status toggle (activate/deactivate)
  const handleStatusToggle = async (degreeId, isActive) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees/${degreeId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !isActive }),
        }
      );

      if (res.ok) {
        const updatedDegree = await res.json();
        setDegrees((prev) =>
          prev.map((deg) => (deg.uuid === degreeId ? updatedDegree : deg))
        );
        toast.success(
          `Degree ${isActive ? "deactivated" : "activated"} successfully`
        );
      } else {
        const errorData = await res.json();
        toast.error(
          errorData.message ||
            `Failed to ${isActive ? "deactivate" : "activate"} degree`
        );
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Open edit dialog
  const handleEditClick = (degree) => {
    setEditingDegree(degree);
    setDegreeName(degree.name);
    setSelectedStream(fetchedStreams.find((s) => s.uuid === degree.stream));
    setIsEditDialogOpen(true);
  };

  // Export to Excel
  const exportToExcel = () => {
    const dataToExport = filteredDegrees.map((deg) => ({
      "Degree Name": deg.name,
      "Stream Name": streams[deg.stream]?.name || "Unknown",
      Status: deg.isActive ? "Active" : "Inactive",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Degrees");
    XLSX.writeFile(workbook, "Degrees.xlsx");
  };

  // Import from Excel
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

        // Validate required fields
        const requiredFields = ["Degree Name", "Stream Name"];
        const missingFields = [];
        jsonData.forEach((row, index) => {
          requiredFields.forEach((field) => {
            if (!row[field]) {
              missingFields.push(`Row ${index + 2}: Missing ${field}`);
            }
          });
        });

        if (missingFields.length > 0) {
          toast.error(`Missing required fields:\n${missingFields.join("\n")}`);
          return;
        }

        // Transform and validate imported data
        const degreesReady = await Promise.all(
          jsonData.map(async (row, index) => {
            const uuid = [...Array(6)]
              .map(() => Math.random().toString(36)[2].toUpperCase())
              .join("");
            const stream = fetchedStreams.find(
              (s) => s.name === row["Stream Name"]
            );
            if (!stream) {
              throw new Error(
                `Row ${index + 2}: Stream "${row["Stream Name"]}" not found`
              );
            }
            if (!stream.isActive) {
              throw new Error(
                `Row ${index + 2}: Stream "${row["Stream Name"]}" is inactive`
              );
            }

            return {
              name: row["Degree Name"],
              stream: stream.uuid,
              uuid,
              isActive:
                row["Status"]?.toLowerCase() === "active" ? true : false,
              createdAt: new Date().toISOString(),
            };
          })
        );

        // Send to backend
        const responses = await Promise.all(
          degreesReady.map((degree) =>
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(degree),
            })
          )
        );

        const newDegrees = await Promise.all(
          responses.map((res) => res.json())
        );
        const successfulImports = newDegrees.filter((deg) => !deg.error);
        if (successfulImports.length > 0) {
          setDegrees((prev) => [...prev, ...successfulImports]);
          setStreams((prev) => {
            const updatedStreams = { ...prev };
            successfulImports.forEach((deg) => {
              if (!updatedStreams[deg.stream]) {
                const stream = fetchedStreams.find(
                  (s) => s.uuid === deg.stream
                );
                updatedStreams[deg.stream] = {
                  name: stream?.name || "Unknown",
                  isActive: stream?.isActive !== false,
                };
              }
            });
            return updatedStreams;
          });
          toast.success(
            `${successfulImports.length} degrees imported successfully`
          );
        } else {
          toast.error("No degrees were imported successfully");
        }
        setInputDialog(false);
      } catch (error) {
        toast.error("Error importing file: " + error.message);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Reset form
  const resetForm = () => {
    setDegreeName("");
    setSelectedStream(null);
    setIsDialogOpen(false);
    setIsEditDialogOpen(false);
    setEditingDegree(null);
  };

  // Filter degrees
  const filteredDegrees = degrees
    .filter((deg) =>
      deg.name?.toLowerCase().includes(searchTerm?.toLowerCase() || "")
    )
    .filter((deg) => !selectedStream || deg.stream === selectedStream.uuid)
    .filter(
      (deg) =>
        !showOnlyActive || (deg.isActive && streams[deg.stream]?.isActive)
    );

  return (
    <div className="flex p-6 h-full flex-col gap-5 bg-gray-100/50 w-full">
      {/* Breadcrumb */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium">Degree Management</h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin/qp">Streams & Degrees</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="text-muted-foreground">
                <Link href="/admin/qp/degree">Degree</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {/* Action Bar */}
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

        <div className="flex gap-2">
          {(selectedStream || !showOnlyActive) && (
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedStream(null);
                setShowOnlyActive(true);
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear filters
            </Button>
          )}
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => fetchData()}
          >
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                Actions <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                  <CirclePlusIcon className="h-4 w-4 mr-2" /> New Degree
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={exportToExcel}
                  disabled={filteredDegrees.length === 0}
                >
                  <FileDown className="h-4 w-4 mr-2" /> Export
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setInputDialog(true)}>
                  <FileUp className="h-4 w-4 mr-2" /> Import
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowOnlyActive(!showOnlyActive)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showOnlyActive ? "Show All" : "Show Active Only"}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stream Filter */}
      <div className="relative w-full sm:w-64">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex justify-between items-center"
            >
              <span>{selectedStream?.name || "All Streams"}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => setSelectedStream(null)}
                className="cursor-pointer"
              >
                All Streams
              </DropdownMenuItem>
              {fetchedStreams
                .filter((stream) => stream.isActive !== false)
                .map((stream) => (
                  <DropdownMenuItem
                    key={stream.uuid}
                    onClick={() => setSelectedStream(stream)}
                    className="cursor-pointer"
                  >
                    {stream.name}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Degrees Table */}
      <Card className="flex-1 overflow-hidden">
        <div className="p-6 py-0 rounded-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">
              Degrees{" "}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredDegrees.length} total)
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
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-4 text-gray-500"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredDegrees.length > 0 ? (
                  filteredDegrees.map((deg) => {
                    console.log(
                      "Stream for degree",
                      deg.uuid,
                      streams[deg.stream]
                    );
                    return (
                      <TableRow
                        key={deg.uuid}
                        className={`hover:bg-gray-50 ${
                          !deg.isActive ? "bg-red-50 text-gray-500" : ""
                        }`}
                      >
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell className="font-medium">
                          {deg.name}
                        </TableCell>
                        <TableCell>
                          {streams[deg.stream]?.name || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              deg.isActive
                                ? "text-green-600 font-semibold"
                                : "text-red-500 font-medium"
                            }
                          >
                            {deg.isActive ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1 text-gray-700 hover:bg-gray-100"
                            onClick={() => handleEditClick(deg)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className={`h-8 gap-1 ${
                              deg.isActive
                                ? "text-red-600 hover:bg-red-50"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                            onClick={() =>
                              handleStatusToggle(deg.uuid, deg.isActive)
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>
                              {deg.isActive ? "Deactivate" : "Activate"}
                            </span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
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

      {/* Add Degree Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Degree</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Add a new degree to the system
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
                    variant="outline"
                    className="w-full flex justify-between items-center"
                  >
                    <span>{selectedStream?.name || "Select Stream"}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuGroup>
                    {fetchedStreams
                      .filter((stream) => stream.isActive !== false)
                      .map((stream) => (
                        <DropdownMenuItem
                          className={`w-full cursor-pointer ${
                            selectedStream?.uuid === stream.uuid
                              ? "bg-gray-100 font-semibold"
                              : ""
                          }`}
                          key={stream.uuid}
                          onClick={() =>
                            setSelectedStream((prev) =>
                              prev?.uuid === stream.uuid ? null : stream
                            )
                          }
                        >
                          {stream.name}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-2">
              <Label>Degree Name</Label>
              <Input
                placeholder="e.g. BCA 1st Year"
                value={degreeName}
                onChange={(e) => setDegreeName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddDegree()}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleAddDegree}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Degree
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Degree Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Degree</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Update degree information
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
                    variant="outline"
                    className="w-full flex justify-between items-center"
                  >
                    <span>{selectedStream?.name || "Select Stream"}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuGroup>
                    {fetchedStreams
                      .filter((stream) => stream.isActive !== false)
                      .map((stream) => (
                        <DropdownMenuItem
                          className={`w-full cursor-pointer ${
                            selectedStream?.uuid === stream.uuid
                              ? "bg-gray-100 font-semibold"
                              : ""
                          }`}
                          key={stream.uuid}
                          onClick={() =>
                            setSelectedStream((prev) =>
                              prev?.uuid === stream.uuid ? null : stream
                            )
                          }
                        >
                          {stream.name}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-2">
              <Label>Degree Name</Label>
              <Input
                placeholder="e.g. BCA 1st Year"
                value={degreeName}
                onChange={(e) => setDegreeName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleUpdate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Update Degree
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={fileInputDialog} onOpenChange={setInputDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Degrees</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Upload an Excel file to import degrees
              <p className="text-xs text-gray-500 mt-2">
                File should contain columns: Degree Name, Stream Name, Status
              </p>
            </DialogDescription>
          </DialogHeader>
          <div>
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => setInputDialog(false)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
