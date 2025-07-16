"use client";

import * as XLSX from "xlsx";
<<<<<<< HEAD
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
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
=======
import Link from 'next/link';
>>>>>>> 1a0c944 (Degree Module working properly)
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
  DialogTrigger,
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
<<<<<<< HEAD
=======
  const [editingDegree, setEditingDegree] = useState(null);
>>>>>>> 1a0c944 (Degree Module working properly)
  const [degrees, setDegrees] = useState([]);
  const [streams, setStreams] = useState({});
  const [fetchedStreams, setFetchedStreams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStream, setSelectedStream] = useState(null);
  const [degreeName, setDegreeName] = useState("");
  const [fileInputDialog, setInputDialog] = useState(false);
  const [currentDegree, setCurrentDegree] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnlyActive, setShowOnlyActive] = useState(true);

<<<<<<< HEAD
  // Memoized filtered degrees
  const filteredDegrees = degrees.filter((deg) => {
    const matchesSearch = deg.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = showOnlyActive ? deg.isActive !== false : true;
    const matchesStream = selectedStream
      ? deg.stream === selectedStream.uuid
      : true;
    return matchesSearch && matchesStatus && matchesStream;
  });

  // Fetch all necessary data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch degrees and streams in parallel
      const [degreesRes, streamsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees`),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams`),
      ]);
=======
  // Fetch degrees
  useEffect(() => {
    const getDegrees = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees`
        );
        if (!res.ok) throw new Error("Failed to fetch degrees");
        const data = await res.json();

        // Map streams
        const streamMap = {};
        await Promise.all(
          data.map(async (deg) => {
            if (!streamMap[deg.stream]) {
              const streamRes = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams/${deg.stream}`
              );
              if (streamRes.ok) {
                const streamData = await streamRes.json();
                streamMap[deg.stream] = streamData.name || "Unknown";
              }
            }
          })
        );
>>>>>>> 1a0c944 (Degree Module working properly)

      if (!degreesRes.ok || !streamsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const degreesData = await degreesRes.json();
      const streamsData = await streamsRes.json();

      // Create stream map
      const streamMap = streamsData.reduce((acc, stream) => {
        acc[stream.uuid] = stream.name;
        return acc;
      }, {});

      setDegrees(degreesData);
      setStreams(streamMap);
      setFetchedStreams(streamsData);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
<<<<<<< HEAD
    fetchData();
  }, [fetchData]);

  // Degree CRUD operations
  const handleAddDegree = async () => {
    if (!degreeName.trim() || !selectedStream) {
      toast.error("Please fill all fields");
      return;
    }

=======
    const getStreams = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams`);
        if (!res.ok) throw new Error("Failed to fetch streams");
        const data = await res.json();
        setFetchedStreams(data);
      } catch (error) {
        toast.error(error.message);
      }
    };

    getStreams();
  }, []);

  // Update handler
  const handleUpdate = async () => {
    if (!editingDegree || !degreeName || !selectedStream) {
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
            name: degreeName,
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
          [updatedDegree.stream]: selectedStream.name,
        }));
        toast.success("Degree updated successfully");
        setIsEditDialogOpen(false);
        setEditingDegree(null);
        setDegreeName("");
        setSelectedStream(null);
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to update degree");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Deactivate handler
  const handleDeactivate = async (degreeId) => {
>>>>>>> 1a0c944 (Degree Module working properly)
    try {
      const code = [...Array(6)]
        .map(() => Math.random().toString(36)[2].toUpperCase())
        .join("");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees`,
        {
<<<<<<< HEAD
          method: "POST",
=======
          method: "PUT", // Changed to PUT to match backend handler
>>>>>>> 1a0c944 (Degree Module working properly)
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stream: selectedStream.uuid,
            name: degreeName.trim(),
            uuid: code,
          }),
        }
      );

      if (res.ok) {
<<<<<<< HEAD
        const data = await res.json();
        setDegrees((prev) => [...prev, data]);
        setStreams((prev) => ({ ...prev, [data.stream]: selectedStream.name }));
        toast.success("Degree added successfully");
        resetForm();
      } else {
        throw new Error("Failed to add degree");
=======
        const updatedDegree = await res.json();
        setDegrees((prev) =>
          prev.map((deg) =>
            deg.uuid === degreeId ? updatedDegree : deg
          )
        );
        toast.success("Degree deactivated successfully");
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to deactivate degree");
>>>>>>> 1a0c944 (Degree Module working properly)
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

<<<<<<< HEAD
  const handleUpdateDegree = async () => {
    if (!degreeName.trim() || !currentDegree || !selectedStream) {
      toast.error("Please fill all fields");
      return;
=======
  // Activate handler
  const handleActivate = async (degreeId) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees/${degreeId}`,
        {
          method: "PUT", // Changed to PUT to match backend handler
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: true }),
        }
      );

      if (res.ok) {
        const updatedDegree = await res.json();
        setDegrees((prev) =>
          prev.map((deg) =>
            deg.uuid === degreeId ? updatedDegree : deg
          )
        );
        toast.success("Degree deactivated successfully");
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to deactivate degree");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEditClick = (degree) => {
    setEditingDegree(degree);
    setDegreeName(degree.name);
    setSelectedStream(fetchedStreams.find((s) => s.uuid === degree.stream));
    setIsEditDialogOpen(true);
  };

  const filteredDegrees = degrees.filter((deg) =>
    deg.name?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const handleAddDegree = async () => {
    if (!degreeName || !selectedStream) {
      toast.error("Please fill in all fields");
      return;
    }

    const code = [...Array(6)]
      .map(() => Math.random().toString(36)[2].toUpperCase())
      .join("");

    const degree = {
      stream: selectedStream.uuid,
      name: degreeName,
      uuid: code,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(degree),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setDegrees([...degrees, data]);
        setStreams((prev) => ({
          ...prev,
          [data.stream]: selectedStream.name,
        }));
        toast.success("Degree added successfully");
        setSelectedStream(null);
        setDegreeName("");
        setIsDialogOpen(false);
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to add degree");
      }
    } catch (err) {
      toast.error(err.message);
>>>>>>> 1a0c944 (Degree Module working properly)
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees/${currentDegree.uuid}`,
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
        const data = await res.json();
        setDegrees((prev) =>
          prev.map((deg) =>
            deg.uuid === currentDegree.uuid
              ? { ...deg, name: degreeName.trim(), stream: selectedStream.uuid }
              : deg
          )
        );
        setStreams((prev) => ({
          ...prev,
          [selectedStream.uuid]: selectedStream.name,
        }));
        toast.success("Degree updated successfully");
        resetForm();
      } else {
        throw new Error("Failed to update degree");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

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
        setDegrees((prev) =>
          prev.map((deg) =>
            deg.uuid === degreeId ? { ...deg, isActive: !isActive } : deg
          )
        );
        toast.success(`Degree ${isActive ? "deactivated" : "activated"}`);
      } else {
        throw new Error(
          `Failed to ${isActive ? "deactivate" : "activate"} degree`
        );
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Helper functions
  const resetForm = () => {
    setDegreeName("");
    setSelectedStream(null);
    setIsDialogOpen(false);
    setIsEditDialogOpen(false);
    setCurrentDegree(null);
  };

  const openEditDialog = (degree) => {
    setCurrentDegree(degree);
    setDegreeName(degree.name);
    setSelectedStream({
      uuid: degree.stream,
      name: streams[degree.stream] || "Unknown",
    });
    setIsEditDialogOpen(true);
  };

  const exportToExcel = () => {
    const dataToExport = filteredDegrees.map((deg) => ({
      "Degree Name": deg.name,
<<<<<<< HEAD
      "Stream Name": streams[deg.stream] || "Unknown",
      Status: deg.isActive ? "Active" : "Inactive",
      "Created At": new Date(deg.createdAt).toLocaleDateString(),
=======
      "Stream Name": streams[deg.stream] || "Unknown"
>>>>>>> 1a0c944 (Degree Module working properly)
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

<<<<<<< HEAD
        // Validate and transform data
        const degreesToAdd = jsonData
          .filter((row) => row["Degree Name"] && row["Stream Name"])
          .map((row) => {
            const uuid = [...Array(6)]
              .map(() => Math.random().toString(36)[2].toUpperCase())
              .join("");
=======
        // Validate required fields for degrees
        const requiredFields = ['Degree Name', 'Stream Name'];
        const missingFields = [];
>>>>>>> 1a0c944 (Degree Module working properly)

            // Find matching stream
            const stream = fetchedStreams.find(
              (s) => s.name === row["Stream Name"]
            );

            return {
              name: row["Degree Name"],
              stream: stream?.uuid || "",
              uuid,
              isActive:
                row["Status"]?.toLowerCase() === "active" ? true : false,
              createdAt: new Date().toISOString(),
              __isImported: true,
            };
          });

        if (degreesToAdd.length === 0) {
          toast.error("No valid degrees found in the file");
          return;
        }

<<<<<<< HEAD
        // Add to state (for demo - in real app you'd send to API)
        setDegrees((prev) => [...prev, ...degreesToAdd]);
        toast.success(`${degreesToAdd.length} degrees imported successfully`);
=======
        // Transform imported data
        const degreesReady = await Promise.all(jsonData.map(async (row) => {
          const uuid = [...Array(6)]
            .map(() => Math.random().toString(36)[2].toUpperCase())
            .join("");

          // Find stream UUID by name
          const stream = fetchedStreams.find(s => s.name === row['Stream Name']);
          if (!stream) {
            throw new Error(`Stream "${row['Stream Name']}" not found`);
          }

          return {
            name: row['Degree Name'],
            stream: stream.uuid,
            uuid,
            isActive: row['Status']?.toLowerCase() === 'active' ? true : true,
            createdAt: new Date().toISOString(),
          };
        }));

        // Send to backend
        const responses = await Promise.all(degreesReady.map(degree =>
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(degree),
          })
        ));

        const newDegrees = await Promise.all(responses.map(res => res.json()));
        setDegrees(prev => [...prev, ...newDegrees]);
        toast.success(`${newDegrees.length} degrees imported successfully`);
>>>>>>> 1a0c944 (Degree Module working properly)
        setInputDialog(false);
      } catch (error) {
        toast.error("Error importing file: " + error.message);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="flex p-6 h-full flex-col gap-5 bg-gray-100/50 w-full">
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
                    {fetchedStreams.map((stream) => (
                      <DropdownMenuItem
<<<<<<< HEAD
                        key={stream.uuid}
                        onClick={() => setSelectedStream(stream)}
                        className={
                          selectedStream?.uuid === stream.uuid
                            ? "bg-gray-100"
                            : ""
=======
                        className={`w-full cursor-pointer ${selectedStream?.uuid === el.uuid ? "bg-gray-100 font-semibold" : ""}`}
                        key={el.uuid}
                        onClick={() =>
                          setSelectedStream((prev) =>
                            prev?.uuid === el.uuid ? null : el
                          )
>>>>>>> 1a0c944 (Degree Module working properly)
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
<<<<<<< HEAD
              <Label htmlFor="edit-stream" className="text-sm font-medium">
=======
              <Label htmlFor="stream-name" className="text-sm font-medium">
>>>>>>> 1a0c944 (Degree Module working properly)
                Select Stream
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
<<<<<<< HEAD
                    variant="outline"
                    className="w-full flex justify-between items-center"
                  >
                    <span>{selectedStream?.name || "Select Stream"}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuGroup>
                    {fetchedStreams.map((stream) => (
                      <DropdownMenuItem
                        key={stream.uuid}
                        onClick={() => setSelectedStream(stream)}
                        className={
                          selectedStream?.uuid === stream.uuid
                            ? "bg-gray-100"
                            : ""
                        }
                      >
                        {stream.name}
=======
                    className="w-full cursor-pointer flex justify-between items-center"
                    variant={"outline"}
                  >
                    <span>{selectedStream?.name || "Select"}</span>
                    <ChevronDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] p-0">
                  <DropdownMenuGroup>
                    {fetchedStreams.map((el) => (
                      <DropdownMenuItem
                        className={`w-full cursor-pointer ${selectedStream?.uuid === el.uuid ? "bg-gray-100 font-semibold" : ""}`}
                        key={el.uuid}
                        onClick={() =>
                          setSelectedStream((prev) =>
                            prev?.uuid === el.uuid ? null : el
                          )
                        }
                      >
                        {el.name}
>>>>>>> 1a0c944 (Degree Module working properly)
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-2">
              <Label>Degree Name</Label>
              <Input
<<<<<<< HEAD
                placeholder="e.g. BCA 1st Year"
                value={degreeName}
                onChange={(e) => setDegreeName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUpdateDegree()}
=======
                placeholder="BCA 1st Year"
                value={degreeName}
                onChange={(e) => setDegreeName(e.target.value)}
>>>>>>> 1a0c944 (Degree Module working properly)
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
<<<<<<< HEAD
              onClick={handleUpdateDegree}
              className="bg-blue-600 hover:bg-blue-700"
=======
              type="button"
              onClick={handleUpdate}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
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
            <DialogTitle>Import Data</DialogTitle>
            <DialogDescription className="text-sm text-gray-500 flex flex-col ">
              Import degrees from Excel
              <span className="text-xs text-red-500">NOTE: Use exported degree format for importing as well</span>
            </DialogDescription>
          </DialogHeader>
          <div>
            <Input type="file" accept=".xlsx,.xls" onChange={handleImportExcel} />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="hover:bg-gray-100">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={() => setInputDialog(false)}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
>>>>>>> 1a0c944 (Degree Module working properly)
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
            </DialogDescription>
          </DialogHeader>
          <div>
            <Input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleImportExcel}
            />
            <p className="text-xs text-gray-500 mt-2">
              File should contain columns: Degree Name, Stream Name, Status
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Breadcrumb */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium">Degree Management</h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
<<<<<<< HEAD
                <Link href="/admin">Home</Link>
=======
                <Link href={'/admin'}>Home</Link>
>>>>>>> 1a0c944 (Degree Module working properly)
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
<<<<<<< HEAD
                <Link href="/admin/qp">Streams & Subjects</Link>
=======
                <Link href={'/admin/qp'}>Streams & Degrees</Link>
>>>>>>> 1a0c944 (Degree Module working properly)
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="text-muted-foreground">
<<<<<<< HEAD
                <Link href="/admin/qp/degree">Degree</Link>
=======
                <Link href={'/admin/qp/degree'}>Degree</Link>
>>>>>>> 1a0c944 (Degree Module working properly)
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
          {/* Add this near your search and action buttons */}
          {(selectedStream || showOnlyActive) && (
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

<<<<<<< HEAD
      {/* Stream Filter - Replace the existing one with this */}
      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="stream-filter">Filter by Stream:</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex justify-between items-center w-64"
              >
                <span>
                  {selectedStream ? selectedStream.name : "All Streams"}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => setSelectedStream(null)}
                  className={!selectedStream ? "bg-gray-100" : ""}
                >
                  All Streams
                </DropdownMenuItem>
                {fetchedStreams.map((stream) => (
                  <DropdownMenuItem
                    onClick={() => setSelectedStream(stream)}
                    key={stream.uuid}
                    className={
                      selectedStream?.uuid === stream.uuid ? "bg-gray-100" : ""
                    }
                  >
                    {stream.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Active filter checkbox - move it here if you want */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="active-only"
            checked={showOnlyActive}
            onCheckedChange={() => setShowOnlyActive(!showOnlyActive)}
          />
          <Label htmlFor="active-only">Show active only</Label>
        </div>
=======
      <div className="relative w-full sm:w-64">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex justify-between items-center" variant={'outline'}>
              <span>{selectedStream?.name || "All Streams"}</span>
              <ChevronDown />
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
              {fetchedStreams.map((el) => (
                <DropdownMenuItem
                  key={el.uuid}
                  onClick={() => setSelectedStream(el)}
                  className="cursor-pointer"
                >
                  {el.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
>>>>>>> 1a0c944 (Degree Module working properly)
      </div>

      {/* Degrees Table */}
      <Card className="flex-1 overflow-hidden">
        <div className="p-6 py-0 rounded-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">
              Degrees{" "}
              <span className="text-sm font-normal text-gray-500 ml-2">
<<<<<<< HEAD
                ({filteredDegrees.length}{" "}
                {filteredDegrees.length === 1 ? "item" : "items"})
                {selectedStream && ` in ${selectedStream.name}`}
                {showOnlyActive && " (Active only)"}
=======
                ({filteredDegrees.length} total)
>>>>>>> 1a0c944 (Degree Module working properly)
              </span>
            </h2>
          </div>
          <div className="rounded-md">
<<<<<<< HEAD
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
              </div>
            ) : filteredDegrees.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-gray-500 mb-4">
                  {searchTerm
                    ? "No matching degrees found"
                    : "No degrees available"}
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <CirclePlusIcon className="h-4 w-4 mr-2" /> Create Degree
                </Button>
              </div>
            ) : (
              <Table className="bg-white border shadow-sm rounded-md">
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox />
                    </TableHead>
                    <TableHead>Degree Name</TableHead>
                    <TableHead>Stream Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDegrees.map((deg) => (
                    <TableRow
                      key={deg.uuid}
                      className={`hover:bg-gray-50 ${
                        !deg.isActive ? "bg-gray-50 text-gray-500" : ""
                      }`}
                    >
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell className="font-medium">{deg.name}</TableCell>
                      <TableCell>{streams[deg.stream] || "Unknown"}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            deg.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {deg.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(deg)}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={
                            deg.isActive
                              ? "text-red-600 hover:bg-red-50"
                              : "text-green-600 hover:bg-green-50"
                          }
                          onClick={() =>
                            handleStatusToggle(deg.uuid, deg.isActive)
                          }
                        >
                          {deg.isActive ? (
                            <>
                              <Trash2 className="h-3.5 w-3.5 mr-1" /> Deactivate
                            </>
                          ) : (
                            <>
                              <CirclePlusIcon className="h-3.5 w-3.5 mr-1" />{" "}
                              Activate
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
=======
            <Table className="bg-white border shadow-sm rounded-md">
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox disabled />
                  </TableHead>
                  <TableHead className="font-medium">Degree Name</TableHead>
                  <TableHead className="font-medium">Stream Name</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="text-right font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDegrees.length > 0 ? (
                  filteredDegrees
                    .filter(deg => !selectedStream || deg.stream === selectedStream.uuid)
                    .map((deg) => (
                      <TableRow
                        key={deg.uuid}
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
                            <span className="text-green-600 font-semibold">Active</span>
                          ) : (
                            <span className="text-red-500 font-medium">Inactive</span>
                          )}
                        </TableCell>
                        <TableCell className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1 text-gray-700 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleEditClick(deg)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </Button>
                          {deg.isActive ? <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1 text-red-600 hover:bg-red-50 cursor-pointer"
                            onClick={() => handleDeactivate(deg.uuid)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Deactivate</span>
                          </Button> : <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1 text-green-600 hover:bg-green-50 cursor-pointer"
                            onClick={() => handleActivate(deg.uuid)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Activate</span>
                          </Button>}
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
>>>>>>> 1a0c944 (Degree Module working properly)
          </div>
        </div>
      </Card>
    </div>
  );
}
