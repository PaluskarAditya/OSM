"use client";

import React, { useEffect, useState, useCallback } from "react";
import { v4 as uuid } from "uuid";
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
  Trash2,
  Search,
} from "lucide-react";
import { toast } from "sonner";
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

export default function AcademicYearManagementPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // "add" or "edit"
  const [editingYear, setEditingYear] = useState(null);
  const [newYear, setNewYear] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStreamId, setSelectedStreamId] = useState(null);
  const [selectedDegreeId, setSelectedDegreeId] = useState(null);
  const [selectedStream, setSelectedStream] = useState(null);
  const [selectedDegree, setSelectedDegree] = useState(null);
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [streams, setStreams] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch streams
  const fetchStreams = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams`);
      if (!res.ok) throw new Error("Failed to fetch streams");
      const data = await res.json();
      setStreams(data);
    } catch (err) {
      toast.error("Error loading streams: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch degrees by stream
  const fetchDegrees = useCallback(async (streamId = null) => {
    setIsLoading(true);
    try {
      const url = streamId
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams/${streamId}/degrees`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch degrees");
      const data = await res.json();
      setDegrees(data);
    } catch (err) {
      toast.error("Error loading degrees: " + err.message);
      setDegrees([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch academic years
  const fetchAcademicYears = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years`);
      if (!res.ok) throw new Error("Failed to fetch academic years");
      const data = await res.json();
      setAcademicYears(data);
    } catch (err) {
      toast.error("Error loading academic years: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStreams();
    fetchAcademicYears();
  }, [fetchStreams, fetchAcademicYears]);

  useEffect(() => {
    if (selectedStream) {
      fetchDegrees(selectedStream.uuid);
    } else {
      fetchDegrees();
    }
  }, [selectedStream, fetchDegrees]);

  // Filter academic years
  const filteredAcademicYears = academicYears.filter((academicYear) => {
    const matchesSearch = academicYear.year.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStream = selectedStreamId ? academicYear.stream === selectedStreamId : true;
    const matchesDegree = selectedDegreeId ? academicYear.degree === selectedDegreeId : true;
    const matchesActiveStatus = showDeactivated ? true : academicYear.isActive;
    return matchesSearch && matchesStream && matchesDegree && matchesActiveStatus;
  });

  // Add new academic year
  const handleAddAcademicYear = async () => {
    if (!newYear.trim() || !selectedStream || !selectedDegree) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      year: newYear.trim(),
      stream: selectedStream.uuid,
      degree: selectedDegree.uuid,
      uuid: [...Array(6)].map(() => Math.random().toString(36)[2].toUpperCase()).join(""),
      isActive: true,
    };

    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create academic year");
      const created = await res.json();
      setAcademicYears((prev) => [...prev, created]);
      toast.success("Academic year created successfully");
      resetForm();
    } catch (err) {
      toast.error("Error creating academic year: " + err.message);
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

    const payload = {
      year: newYear.trim(),
      stream: selectedStream.uuid,
      degree: selectedDegree.uuid,
      isActive: editingYear.isActive,
    };

    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years/${editingYear.uuid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to update academic year");
      const updated = await res.json();
      setAcademicYears((prev) =>
        prev.map((year) => (year.uuid === updated.uuid ? updated : year))
      );
      toast.success("Academic year updated successfully");
      resetForm();
    } catch (err) {
      toast.error("Error updating academic year: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle academic year status
  const handleToggleAcademicYearStatus = async (year) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years/${year.uuid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !year.isActive }),
        }
      );

      if (!res.ok) throw new Error("Failed to update status");
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

  // Get stream name by ID
  const getStreamName = (id) => {
    const stream = streams.find((str) => str.uuid === id);
    return stream?.name || "Unknown";
  };

  // Get degree name by ID
  const getDegreeName = (id) => {
    const degree = degrees.find((deg) => deg.uuid === id);
    return degree?.name || "Unknown";
  };

  // Reset form state
  const resetForm = () => {
    setNewYear("");
    setSelectedStream(null);
    setSelectedDegree(null);
    setSelectedStreamId(null);
    setSelectedDegreeId(null);
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
              {dialogMode === "add" 
                ? "Add a new academic year to the system" 
                : "Update the selected academic year"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Select Stream <span className="text-red-500">*</span>
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex justify-between w-full">
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
                          fetchDegrees(stream.uuid);
                        }}
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
                    disabled={!selectedStream}
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
                className="focus-visible:ring-1 focus-visible:ring-blue-500"
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
              onClick={dialogMode === "add" ? handleAddAcademicYear : handleEditAcademicYear}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
              disabled={!newYear.trim() || !selectedStream || !selectedDegree || isLoading}
            >
              {isLoading ? "Processing..." : dialogMode === "add" ? "Create" : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header Section */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-semibold text-gray-800">
          Question Paper Management
        </h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/admin"
                className="text-sm font-medium text-gray-600 hover:text-blue-600"
              >
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-gray-400">
              <ChevronDown className="h-3 w-3 rotate-90" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/admin/qp"
                className="text-sm font-medium text-gray-600 hover:text-blue-600"
              >
                QP Management
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-gray-400" />
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/admin/qp/academic-year"
                className="text-sm font-medium text-blue-600"
              >
                Academic Year
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {selectedStreamId
                    ? streams.find((s) => s.uuid === selectedStreamId)?.name
                    : "All Streams"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={() => {
                    setSelectedStreamId(null);
                    setSelectedDegreeId(null);
                    fetchDegrees();
                  }}>
                    All Streams
                  </DropdownMenuItem>
                  {streams.map((stream) => (
                    <DropdownMenuItem
                      key={stream.uuid}
                      onSelect={() => {
                        setSelectedStreamId(stream.uuid);
                        setSelectedDegreeId(null);
                        fetchDegrees(stream.uuid);
                      }}
                    >
                      {stream.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {selectedStreamId && (
            <div className="w-full sm:w-64">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedDegreeId
                      ? degrees.find((d) => d.uuid === selectedDegreeId)?.name
                      : "All Degrees"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onSelect={() => setSelectedDegreeId(null)}>
                      All Degrees
                    </DropdownMenuItem>
                    {degrees.map((degree) => (
                      <DropdownMenuItem
                        key={degree.uuid}
                        onSelect={() => setSelectedDegreeId(degree.uuid)}
                      >
                        {degree.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search academic years..."
              className="pl-9 bg-white focus-visible:ring-1 focus-visible:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              Actions
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => {
                  setDialogMode("add");
                  setIsDialogOpen(true);
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <CirclePlusIcon className="h-4 w-4" />
                <span>New Year</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                <FileUp className="h-4 w-4" />
                <span>Import</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                <FileDown className="h-4 w-4" />
                <span>Export</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeactivated(!showDeactivated)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Eye className="h-4 w-4" />
                <span>{showDeactivated ? "Hide" : "View"} Deactivated</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Content Card */}
      <Card className="flex-1 overflow-hidden">
        <div className="p-6 py-0">
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
                  <TableHead className="w-12">
                    <Checkbox />
                  </TableHead>
                  <TableHead className="font-medium">ID</TableHead>
                  <TableHead className="font-medium">Year</TableHead>
                  <TableHead className="font-medium">Stream</TableHead>
                  <TableHead className="font-medium">Degree</TableHead>
                  <TableHead className="font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredAcademicYears.length > 0 ? (
                  filteredAcademicYears.map((academicYear) => (
                    <TableRow key={academicYear.uuid} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell className="font-medium">{academicYear.uuid}</TableCell>
                      <TableCell>{academicYear.year}</TableCell>
                      <TableCell>{getStreamName(academicYear.stream)}</TableCell>
                      <TableCell>{getDegreeName(academicYear.degree)}</TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-gray-700 hover:bg-gray-100"
                          onClick={() => openEditDialog(academicYear)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={`h-8 gap-1 ${
                            academicYear.isActive
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
                              <CirclePlusIcon className="h-3.5 w-3.5" />
                              <span>Activate</span>
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
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