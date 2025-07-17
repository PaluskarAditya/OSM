"use client";

import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Link from "next/link";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ChevronDown,
  CirclePlusIcon,
  Eye,
  FileDown,
  FileUp,
  Pencil,
  CheckCircle2,
  Search,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export default function AcademicYearManagementPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // "add" or "edit"
  const [editingYear, setEditingYear] = useState(null);
  const [newYear, setNewYear] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStream, setSelectedStream] = useState(null);
  const [selectedDegree, setSelectedDegree] = useState(null);
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [streams, setStreams] = useState([]);
  const [streamMap, setStreamMap] = useState({});
  const [degrees, setDegrees] = useState([]);
  const [degreeMap, setDegreeMap] = useState({}); // New state for degreeMap
  const [academicYears, setAcademicYears] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectedFile, setSelectedFile] = useState(null);

  // Generate UUID
  const generateUUID = () => [...Array(6)].map(() => Math.random().toString(36)[2].toUpperCase()).join("");

  // Validate year format (YYYY-YY)
  const isValidYearFormat = (year) => {
    const regex = /^\d{4}-\d{2}$/;
    return regex.test(year);
  };

  // Fetch streams and create streamMap
  const fetchStreams = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams`);
      if (!res.ok) throw new Error("Failed to fetch streams");
      const data = await res.json();
      
      // Create streamMap
      const newStreamMap = {};
      data.forEach((stream) => {
        newStreamMap[stream.uuid] = {
          name: stream.name || "Unknown",
          isActive: stream.isActive !== false,
        };
      });

      setStreams(data);
      setStreamMap(newStreamMap);
    } catch (err) {
      toast.error("Error loading streams: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch degrees and create degreeMap
  const fetchDegrees = async () => {
    try {
      setIsLoading(true);
      const url = selectedStream
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams/${selectedStream.uuid}/degrees`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch degrees");
      const data = await res.json();

      // Create degreeMap
      const newDegreeMap = {};
      data.forEach((degree) => {
        newDegreeMap[degree.uuid] = {
          name: degree.name || "Unknown",
          isActive: degree.isActive !== false,
        };
      });

      setDegrees(data);
      setDegreeMap(newDegreeMap);
    } catch (err) {
      toast.error("Error loading degrees: " + err.message);
      setDegrees([]);
      setDegreeMap({});
    } finally {
      setIsLoading(false);
    }
  };

  // Activate stream
  const activateStream = async (streamUuid) => {
    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams/${streamUuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
      if (!res.ok) throw new Error("Failed to activate stream");

      // Refetch streams to update streamMap
      await fetchStreams();
      toast.success("Stream activated successfully");
    } catch (error) {
      toast.error("Error activating stream: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Activate degree
  const activateDegree = async (degreeUuid) => {
    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees/${degreeUuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
      if (!res.ok) throw new Error("Failed to activate degree");

      // Refetch degrees to update degreeMap
      await fetchDegrees();
      toast.success("Degree activated successfully");
    } catch (error) {
      toast.error("Error activating degree: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch degrees by stream
  useEffect(() => {
    fetchDegrees();
  }, [selectedStream]);

  // Fetch academic years
  useEffect(() => {
    const fetchAcademicYears = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years`);
        if (!res.ok) throw new Error("Failed to fetch academic years");
        const data = await res.json();

        // Filter academic years to only include those with active streams and degrees
        const filteredAcademicYears = data.filter((academicYear) => {
          const stream = streamMap[academicYear.stream];
          const degree = degreeMap[academicYear.degree];
          return stream && stream.isActive !== false && degree && degree.isActive !== false;
        });

        setAcademicYears(filteredAcademicYears);
      } catch (err) {
        toast.error("Error loading academic years: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch academic years if streamMap and degreeMap are populated
    if (Object.keys(streamMap).length > 0 && Object.keys(degreeMap).length > 0) {
      fetchAcademicYears();
    } else {
      fetchStreams();
    }
  }, [streamMap, degreeMap]);

  // Filter academic years
  const filteredAcademicYears = academicYears.filter((academicYear) => {
    const matchesSearch = academicYear.year?.toLowerCase().includes(searchTerm?.toLowerCase() || "");
    const matchesStream = selectedStream ? academicYear.stream === selectedStream.uuid : true;
    const matchesDegree = selectedDegree ? academicYear.degree === selectedDegree.uuid : true;
    const matchesActiveStatus = showDeactivated ? true : academicYear.isActive;
    return matchesSearch && matchesStream && matchesDegree && matchesActiveStatus;
  });

  // Add new academic year
  const handleAddAcademicYear = async () => {
    if (!newYear.trim() || !selectedStream || !selectedDegree) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!isValidYearFormat(newYear.trim())) {
      toast.error("Academic year must be in YYYY-YY format (e.g., 2024-25)");
      return;
    }

    const payload = {
      year: newYear.trim(),
      stream: selectedStream.uuid,
      degree: selectedDegree.uuid,
      uuid: generateUUID(),
      isActive: true,
    };

    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create academic year");
      }
      const created = await res.json();
      setAcademicYears((prev) => [...prev, created]);
      toast.success("Academic year created successfully");
      resetForm();
    } catch (err) {
      if (err.message.includes("E11000")) {
        toast.error("An academic year with this stream, degree, and year already exists");
      } else {
        toast.error("Error creating academic year: " + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Edit academic year
  const handleEditAcademicYear = async () => {
    if (!newYear.trim() || !selectedStream || !selectedDegree || !editingYear) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!isValidYearFormat(newYear.trim())) {
      toast.error("Academic year must be in YYYY-YY format (e.g., 2024-25)");
      return;
    }

    const payload = {
      year: newYear.trim(),
      stream: selectedStream.uuid,
      degree: selectedDegree.uuid,
      isActive: editingYear.isActive,
    };

    try {
      setIsLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years/${editingYear.uuid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update academic year");
      }
      const updated = await res.json();
      setAcademicYears((prev) =>
        prev.map((year) => (year.uuid === updated.uuid ? updated : year))
      );
      toast.success("Academic year updated successfully");
      resetForm();
    } catch (err) {
      if (err.message.includes("E11000")) {
        toast.error("An academic year with this stream, degree, and year already exists");
      } else {
        toast.error("Error updating academic year: " + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle academic year status
  const handleToggleAcademicYearStatus = async (year) => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years/${year.uuid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !year.isActive }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update status");
      }
      setAcademicYears((prev) =>
        prev.map((y) => (y.uuid === year.uuid ? { ...y, isActive: !y.isActive } : y))
      );
      toast.success(`Academic year ${year.isActive ? "deactivated" : "activated"} successfully`);
    } catch (err) {
      toast.error("Error updating status: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Export to Excel
  const handleExport = () => {
    const exportData = filteredAcademicYears.map((year) => ({
      "Academic Year": year.year,
      "Stream Name": streamMap[year.stream]?.name || "Unknown",
      "Degree Name": degreeMap[year.degree]?.name || "Unknown",
      Status: year.isActive ? "Active" : "Inactive",
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AcademicYears");
    XLSX.writeFile(workbook, "AcademicYears.xlsx");
  };

  // Import from Excel
  const handleImportExcel = async () => {
    if (!selectedFile) {
      toast.error("No file selected");
      return;
    }

    try {
      setIsLoading(true);
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (!jsonData.length) {
        toast.error("The file is empty");
        return;
      }

      const payload = jsonData.map((row) => ({
        year: row["Academic Year"]?.toString().trim() || "",
        stream: row["Stream Name"]?.toString().trim() || "",
        degree: row["Degree Name"]?.toString().trim() || "",
        isActive: row["Status"]?.toString().trim().toLowerCase() === "active" ? true : false,
        uuid: generateUUID(),
      }));

      // Validate required fields and year format
      const requiredFields = ["Academic Year", "Stream Name", "Degree Name"];
      const missingFields = [];
      jsonData.forEach((row, index) => {
        requiredFields.forEach((field) => {
          if (!row[field]) {
            missingFields.push(`Row ${index + 2}: Missing ${field}`);
          }
        });
        if (row["Academic Year"] && !isValidYearFormat(row["Academic Year"])) {
          missingFields.push(`Row ${index + 2}: Invalid Academic Year format (use YYYY-YY)`);
        }
      });

      if (missingFields.length > 0) {
        toast.error(`Invalid file data:\n${missingFields.join("\n")}`);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Import failed");
      }

      if (result.created > 0) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years`);
        const newAcademicYears = await res.json();
        // Filter based on active streams and degrees
        const filteredAcademicYears = newAcademicYears.filter((academicYear) => {
          const stream = streamMap[academicYear.stream];
          const degree = degreeMap[academicYear.degree];
          return stream && stream.isActive !== false && degree && degree.isActive !== false;
        });
        setAcademicYears(filteredAcademicYears);
        toast.success(`Imported ${result.created} academic years`);
      }

      if (result.errors.length > 0) {
        toast.info(`Skipped ${result.errors.length} existing or invalid academic years`);
      }

      setIsImportDialogOpen(false);
      setSelectedFile(null);
    } catch (error) {
      toast.error(`Import failed: ${error.message}`);
      console.error("Import error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get stream name by ID
  const getStreamName = (id) => streamMap[id]?.name || "Unknown";

  // Get degree name by ID
  const getDegreeName = (id) => degreeMap[id]?.name || "Unknown";

  // Reset form state
  const resetForm = () => {
    setNewYear("");
    setSelectedStream(null);
    setSelectedDegree(null);
    setIsDialogOpen(false);
    setDialogMode("add");
    setEditingYear(null);
  };

  // Open edit dialog
  const openEditDialog = (year) => {
    setEditingYear(year);
    setNewYear(year.year);
    setSelectedStream(streams.find((s) => s.uuid === year.stream));
    setSelectedDegree(degrees.find((d) => d.uuid === year.degree));
    setDialogMode("edit");
    setIsDialogOpen(true);
  };

  // Toggle row selection
  const toggleRowSelection = (uuid) => {
    setSelectedRows((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(uuid)) {
        newSelection.delete(uuid);
      } else {
        newSelection.add(uuid);
      }
      return newSelection;
    });
  };

  // Toggle all rows selection
  const toggleAllRowsSelection = () => {
    if (selectedRows.size === filteredAcademicYears.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredAcademicYears.map((year) => year.uuid)));
    }
  };

  return (
    <div className="flex flex-col h-screen w-full gap-6 bg-gray-50 p-6">
      {/* Dialog for adding/editing academic year */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) resetForm();
        setIsDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {dialogMode === "add" ? "Create New Academic Year" : "Edit Academic Year"}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {dialogMode === "add" ? "Add a new academic year to the system" : "Update the selected academic year"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Select Stream <span className="text-red-500">*</span>
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex justify-between w-full" disabled={isLoading}>
                    {selectedStream ? selectedStream.name : "Select Stream"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuGroup>
                    {streams.map((stream) => (
                      <DropdownMenuItem
                        key={stream.uuid}
                        onSelect={() => {
                          setSelectedStream(stream);
                          setSelectedDegree(null);
                        }}
                        className={selectedStream?.uuid === stream.uuid ? "bg-gray-100 font-semibold" : ""}
                      >
                        {stream.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Select Degree <span className="text-red-500">*</span>
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between w-full"
                    disabled={!selectedStream || isLoading}
                  >
                    {selectedDegree ? selectedDegree.name : "Select Degree"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuGroup>
                    {degrees.length > 0 ? (
                      degrees.map((degree) => (
                        <DropdownMenuItem
                          key={degree.uuid}
                          onSelect={() => setSelectedDegree(degree)}
                          className={selectedDegree?.uuid === degree.uuid ? "bg-gray-100 font-semibold" : ""}
                        >
                          {degree.name}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled>
                        No degrees available
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year" className="text-sm font-medium">
                Academic Year <span className="text-red-500">*</span>
              </Label>
              <Input
                id="year"
                placeholder="e.g. 2024-25"
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (dialogMode === "add" ? handleAddAcademicYear() : handleEditAcademicYear())}
                className="focus-visible:ring-1 focus-visible:ring-blue-500"
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="hover:bg-gray-100" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={dialogMode === "add" ? handleAddAcademicYear : handleEditAcademicYear}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!newYear.trim() || !selectedStream || !selectedDegree || isLoading}
            >
              {isLoading ? "Processing..." : dialogMode === "add" ? "Create" : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={(open) => {
        if (!open) setSelectedFile(null);
        setIsImportDialogOpen(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Academic Years</DialogTitle>
            <DialogDescription className="flex flex-col gap-0">
              Upload an Excel file to import academic years
              <span className="text-xs text-red-500 mt-2">
                File should contain columns: Academic Year, Stream Name, Degree Name, Status
              </span>
            </DialogDescription>
          </DialogHeader>
          <div>
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              disabled={isLoading}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isLoading}>Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleImportExcel}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!selectedFile || isLoading}
            >
              {isLoading ? "Processing..." : "Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header Section */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-semibold text-gray-800">Academic Year Management</h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-blue-600">
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin/qp" className="text-sm font-medium text-gray-600 hover:text-blue-600">
                  Streams & Subjects
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="text-sm font-medium text-muted-foreground">
                <Link href="/admin/qp/academic-year">Academic Years</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Stream and Degree Activation Buttons */}
      <div className="flex flex-wrap gap-2">
        {streams.map((stream) => (
          <Button
            key={stream.uuid}
            variant="outline"
            className={stream.isActive ? "text-green-600" : "text-red-600"}
            onClick={() => !stream.isActive && activateStream(stream.uuid)}
            disabled={stream.isActive || isLoading}
          >
            {stream.name}: {stream.isActive ? "Active" : "Activate"}
          </Button>
        ))}
        {degrees.map((degree) => (
          <Button
            key={degree.uuid}
            variant="outline"
            className={degree.isActive ? "text-green-600" : "text-red-600"}
            onClick={() => !degree.isActive && activateDegree(degree.uuid)}
            disabled={degree.isActive || isLoading}
          >
            {degree.name}: {degree.isActive ? "Active" : "Activate"}
          </Button>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between" disabled={isLoading}>
                  {selectedStream ? selectedStream.name : "All Streams"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onSelect={() => {
                      setSelectedStream(null);
                      setSelectedDegree(null);
                    }}
                    className={!selectedStream ? "bg-gray-100 font-semibold" : ""}
                  >
                    All Streams
                  </DropdownMenuItem>
                  {streams.map((stream) => (
                    <DropdownMenuItem
                      key={stream.uuid}
                      onSelect={() => {
                        setSelectedStream(stream);
                        setSelectedDegree(null);
                      }}
                      className={selectedStream?.uuid === stream.uuid ? "bg-gray-100 font-semibold" : ""}
                    >
                      {stream.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="w-full sm:w-64">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  disabled={!selectedStream || isLoading}
                >
                  {selectedDegree ? selectedDegree.name : "All Degrees"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onSelect={() => setSelectedDegree(null)}
                    className={!selectedDegree ? "bg-gray-100 font-semibold" : ""}
                  >
                    All Degrees
                  </DropdownMenuItem>
                  {degrees.map((degree) => (
                    <DropdownMenuItem
                      key={degree.uuid}
                      onSelect={() => setSelectedDegree(degree)}
                      className={selectedDegree?.uuid === degree.uuid ? "bg-gray-100 font-semibold" : ""}
                    >
                      {degree.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search academic years..."
              className="pl-9 bg-white focus-visible:ring-1 focus-visible:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="flex gap-2">
          {(selectedStream || selectedDegree || showDeactivated) && (
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedStream(null);
                setSelectedDegree(null);
                setShowDeactivated(false);
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear Filters
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2" disabled={isLoading}>
                Actions <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => {
                    setDialogMode("add");
                    setIsDialogOpen(true);
                  }}
                >
                  <CirclePlusIcon className="h-4 w-4 mr-2" />
                  New Year
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleExport}
                  disabled={filteredAcademicYears.length === 0 || isLoading}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsImportDialogOpen(true)} disabled={isLoading}>
                  <FileUp className="h-4 w-4 mr-2" />
                  Import
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDeactivated(!showDeactivated)} disabled={isLoading}>
                  <Eye className="h-4 w-4 mr-2" />
                  {showDeactivated ? "Show Active Only" : "View Deactivated"}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="flex-1 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">
              Academic Years{" "}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredAcademicYears.length} {showDeactivated ? "found" : "active"})
              </span>
            </h2>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-16">
                    <Checkbox
                      checked={selectedRows.size === filteredAcademicYears.length && filteredAcademicYears.length > 0}
                      onCheckedChange={toggleAllRowsSelection}
                      disabled={isLoading}
                    />
                  </TableHead>
                  <TableHead className="font-medium">ID</TableHead>
                  <TableHead className="font-medium">Year</TableHead>
                  <TableHead className="font-medium">Stream</TableHead>
                  <TableHead className="font-medium">Degree</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredAcademicYears.length > 0 ? (
                  filteredAcademicYears.map((academicYear) => (
                    <TableRow
                      key={academicYear.uuid}
                      className={`hover:bg-gray-50 ${!academicYear.isActive ? "bg-red-50 text-gray-500" : ""}`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.has(academicYear.uuid)}
                          onCheckedChange={() => toggleRowSelection(academicYear.uuid)}
                          disabled={isLoading}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{academicYear.uuid}</TableCell>
                      <TableCell>{academicYear.year}</TableCell>
                      <TableCell>{getStreamName(academicYear.stream)}</TableCell>
                      <TableCell>{getDegreeName(academicYear.degree)}</TableCell>
                      <TableCell>
                        <span
                          className={
                            academicYear.isActive
                              ? "text-green-600 font-semibold"
                              : "text-red-500 font-medium"
                          }
                        >
                          {academicYear.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-gray-700 hover:bg-gray-100"
                          onClick={() => openEditDialog(academicYear)}
                          disabled={isLoading}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={`h-8 gap-1 ${academicYear.isActive
                              ? "text-red-600 hover:bg-red-50"
                              : "text-green-600 hover:bg-green-50"
                            }`}
                          onClick={() => handleToggleAcademicYearStatus(academicYear)}
                          disabled={isLoading}
                        >
                          {academicYear.isActive ? (
                            <>
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Deactivate</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Activate</span>
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                      No academic years found
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