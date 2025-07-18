"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import {
  ChevronDown,
  CirclePlusIcon,
  Eye,
  FileDown,
  FileUp,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useEffect, useState, useCallback } from "react";
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
import * as XLSX from "xlsx";

export default function SpecializationManagementPage() {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSpecialization, setEditingSpecialization] = useState(null);
  const [inputDialog, setInputDialog] = useState(false);
  const [streams, setStreams] = useState([]);
  const [streamMap, setStreamMap] = useState({});
  const [degrees, setDegrees] = useState([]);
  const [degreeMap, setDegreeMap] = useState({});
  const [courses, setCourses] = useState([]);
  const [courseMap, setCourseMap] = useState({});
  const [specializations, setSpecializations] = useState([]);
  const [filteredSpecializations, setFilteredSpecializations] = useState([]);
  const [selectedStream, setSelectedStream] = useState(null);
  const [selectedDegree, setSelectedDegree] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [specializationName, setSpecializationName] = useState("");
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function for UUID generation
  const generateUUID = () =>
    [...Array(6)]
      .map(() => Math.random().toString(36)[2].toUpperCase())
      .join("");

  // Fetch initial data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const endpoints = [
        "/specializations",
        "/streams",
        "/degrees",
        "/courses",
      ];
      const responses = await Promise.all(
        endpoints.map((endpoint) =>
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1${endpoint}`)
        )
      );

      if (responses.some((res) => !res.ok)) {
        throw new Error("Failed to fetch initial data");
      }

      const [specializationData, streamData, degreeData, courseData] =
        await Promise.all(responses.map((res) => res.json()));

      // Create maps for efficient lookup
      const newStreamMap = Object.fromEntries(
        streamData.map((stream) => [
          stream.uuid,
          {
            name: stream.name || "Unknown",
            isActive: stream.isActive !== false,
          },
        ])
      );

      const newDegreeMap = Object.fromEntries(
        degreeData.map((degree) => [
          degree.uuid,
          {
            name: degree.name || "Unknown",
            isActive: degree.isActive !== false,
          },
        ])
      );

      const newCourseMap = Object.fromEntries(
        courseData.map((course) => [
          course.uuid,
          {
            name: course.name || "Unknown",
            isActive: course.isActive !== false,
          },
        ])
      );

      // Filter specializations to include only those linked to active streams, degrees, and courses
      const filteredSpecializations = specializationData.filter((spec) => {
        return (
          newStreamMap[spec.stream]?.isActive !== false &&
          newDegreeMap[spec.degree]?.isActive !== false &&
          newCourseMap[spec.course]?.isActive !== false
        );
      });

      setStreamMap(newStreamMap);
      setDegreeMap(newDegreeMap);
      setCourseMap(newCourseMap);
      setSpecializations(filteredSpecializations);
      setFilteredSpecializations(filteredSpecializations);
      setStreams(streamData);
      setDegrees(degreeData);
      setCourses(courseData);
    } catch (err) {
      toast.error("Error loading data: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generic toggle status function
  const toggleEntityStatus = async (entityType, uuid, isActive) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/${entityType}/${uuid}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive }),
        }
      );
      if (!res.ok)
        throw new Error(
          `Failed to ${isActive ? "activate" : "deactivate"} ${entityType}`
        );
      await fetchData();
      toast.success(
        `${entityType.slice(0, -1)} ${
          isActive ? "activated" : "deactivated"
        } successfully`
      );
    } catch (error) {
      toast.error(
        `Error ${isActive ? "activating" : "deactivating"} ${entityType.slice(
          0,
          -1
        )}: ${error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let results = specializations;

    // Apply search filter
    if (searchTerm) {
      results = results.filter((spec) =>
        spec.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply stream filter
    if (selectedStream) {
      results = results.filter((spec) => spec.stream === selectedStream.uuid);
    }

    // Apply degree filter
    if (selectedDegree) {
      results = results.filter((spec) => spec.degree === selectedDegree.uuid);
    }

    // Apply course filter
    if (selectedCourse) {
      results = results.filter((spec) => spec.course === selectedCourse.uuid);
    }

    // Apply deactivated filter
    if (!showDeactivated) {
      results = results.filter((spec) => {
        return (
          spec.isActive !== false &&
          streamMap[spec.stream]?.isActive !== false &&
          degreeMap[spec.degree]?.isActive !== false &&
          courseMap[spec.course]?.isActive !== false
        );
      });
    }

    setFilteredSpecializations(results);
  }, [
    specializations,
    searchTerm,
    selectedStream,
    selectedDegree,
    selectedCourse,
    showDeactivated,
    streamMap,
    degreeMap,
    courseMap,
  ]);

  // Form validation
  const validateForm = () => {
    if (!selectedStream || !selectedDegree || !selectedCourse) {
      toast.error("Please select Stream, Degree, and Course.");
      return false;
    }
    if (!specializationName) {
      toast.error("Please enter Specialization Name.");
      return false;
    }
    return true;
  };

  // Create new specialization
  const createSpecialization = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const newSpec = {
        name: specializationName.trim(),
        stream: selectedStream.uuid,
        degree: selectedDegree.uuid,
        course: selectedCourse.uuid,
        uuid: generateUUID(),
        isActive: true,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/specializations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSpec),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success("Specialization created successfully!");
        setSpecializations((prev) => [...prev, data]);
        setFilteredSpecializations((prev) => [...prev, data]);
        setIsDialogOpen(false);
        resetForm();
      } else {
        toast.error(data?.error || "Something went wrong.");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit specialization
  const editSpecialization = async () => {
    if (!editingSpecialization || !validateForm()) return;

    try {
      setIsLoading(true);
      const updatedSpecialization = {
        name: specializationName.trim(),
        stream: selectedStream.uuid,
        degree: selectedDegree.uuid,
        course: selectedCourse.uuid,
        isActive: editingSpecialization.isActive,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/specializations/${editingSpecialization.uuid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedSpecialization),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success("Specialization updated successfully!");
        setSpecializations((prev) =>
          prev.map((s) =>
            s.uuid === editingSpecialization.uuid ? { ...s, ...data } : s
          )
        );
        setFilteredSpecializations((prev) =>
          prev.map((s) =>
            s.uuid === editingSpecialization.uuid ? { ...s, ...data } : s
          )
        );
        setIsEditDialogOpen(false);
        resetForm();
      } else {
        toast.error(data?.error || "Something went wrong.");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form fields
  const resetForm = () => {
    setSpecializationName("");
    setSelectedStream(null);
    setSelectedDegree(null);
    setSelectedCourse(null);
    setEditingSpecialization(null);
  };

  // Export to Excel
  const toExcel = () => {
    const dataToExport = filteredSpecializations.map((spec) => ({
      "Specialization Name": spec.name,
      Stream: streamMap[spec.stream]?.name || "Unknown",
      Degree: degreeMap[spec.degree]?.name || "Unknown",
      Course: courseMap[spec.course]?.name || "Unknown",
      Status: spec.isActive === false ? "Deactivated" : "Active",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Specializations");
    XLSX.writeFile(workbook, "Specializations.xlsx");
  };

  // Download template
  const downloadTemplate = () => {
    const template = [
      {
        "Specialization Name": "",
        Stream: "",
        Degree: "",
        Course: "",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "Specialization_Template.xlsx");
  };

  // Import from Excel
  const importFromExcel = async () => {
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

      const requiredHeaders = [
        "Specialization Name",
        "Stream",
        "Degree",
        "Course",
      ];
      const headers = Object.keys(jsonData[0]);
      const missingHeaders = requiredHeaders.filter(
        (h) => !headers.includes(h)
      );
      if (missingHeaders.length > 0) {
        toast.error(`Missing required headers: ${missingHeaders.join(", ")}`);
        return;
      }

      const payload = jsonData.map((row, index) => {
        const stream = streams.find(
          (s) => s.name === row["Stream"]?.toString().trim()
        );
        const degree = degrees.find(
          (d) => d.name === row["Degree"]?.toString().trim()
        );
        const course = courses.find(
          (c) => c.name === row["Course"]?.toString().trim()
        );

        return {
          name: row["Specialization Name"]?.toString().trim() || "",
          stream: stream?.uuid || "",
          degree: degree?.uuid || "",
          course: course?.uuid || "",
          uuid: generateUUID(),
          isActive: true,
        };
      });

      const missingFields = [];
      payload.forEach((row, index) => {
        if (!row.name)
          missingFields.push(`Row ${index + 2}: Missing Specialization Name`);
        if (!row.stream || !streamMap[row.stream]?.isActive) {
          missingFields.push(`Row ${index + 2}: Invalid or inactive Stream`);
        }
        if (!row.degree || !degreeMap[row.degree]?.isActive) {
          missingFields.push(`Row ${index + 2}: Invalid or inactive Degree`);
        }
        if (!row.course || !courseMap[row.course]?.isActive) {
          missingFields.push(`Row ${index + 2}: Invalid or inactive Course`);
        }
      });

      if (missingFields.length > 0) {
        toast.error(`Invalid file data:\n${missingFields.join("\n")}`);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/specializations/bulk`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Import failed");

      if (result.created > 0) {
        await fetchData();
        toast.success(`Imported ${result.created} specializations`);
      }

      if (result.skipped > 0) {
        toast.info(`Skipped ${result.skipped} existing specializations`);
      }

      setInputDialog(false);
      setSelectedFile(null);
    } catch (error) {
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle specialization status
  const handleToggleSpecializationStatus = async (uuid) => {
    try {
      setIsLoading(true);
      const specialization = specializations.find((s) => s.uuid === uuid);
      if (!specialization) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/specializations/${uuid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !specialization.isActive }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setSpecializations((prev) =>
          prev.map((s) => (s.uuid === uuid ? { ...s, ...data } : s))
        );
        setFilteredSpecializations((prev) =>
          prev.map((s) => (s.uuid === uuid ? { ...s, ...data } : s))
        );
        toast.success(
          `Specialization ${
            specialization.isActive ? "deactivated" : "activated"
          } successfully`
        );
      } else {
        const errorData = await res.json();
        toast.error(
          errorData?.error || "Failed to update specialization status"
        );
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit button click
  const handleEditSpecialization = (specialization) => {
    setEditingSpecialization(specialization);
    setSpecializationName(specialization.name);
    setSelectedStream(
      streams.find((s) => s.uuid === specialization.stream) || null
    );
    setSelectedDegree(
      degrees.find((d) => d.uuid === specialization.degree) || null
    );
    setSelectedCourse(
      courses.find((c) => c.uuid === specialization.course) || null
    );
    setIsEditDialogOpen(true);
  };

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="flex h-screen w-full bg-gray-100/50 p-6 flex-col gap-5">
      {/* Create Specialization Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) resetForm();
          setIsDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Specialization</DialogTitle>
            <DialogDescription>
              Add new specialization to the system
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Stream</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    disabled={isLoading}
                  >
                    {selectedStream?.name || "Select"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                  <DropdownMenuGroup>
                    {streams
                      .filter((s) => streamMap[s.uuid]?.isActive !== false)
                      .map((el) => (
                        <DropdownMenuItem
                          key={el.uuid}
                          onSelect={() => setSelectedStream(el)}
                          className="cursor-pointer"
                        >
                          {el.name}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <Label>Degree</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    disabled={!selectedStream || isLoading}
                  >
                    {selectedDegree?.name || "Select"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                  <DropdownMenuGroup>
                    {degrees
                      .filter((d) => degreeMap[d.uuid]?.isActive !== false)
                      .map((el) => (
                        <DropdownMenuItem
                          key={el.uuid}
                          onSelect={() => setSelectedDegree(el)}
                          className="cursor-pointer"
                        >
                          {el.name}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <Label>Course</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    disabled={!selectedDegree || isLoading}
                  >
                    {selectedCourse?.name || "Select"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                  <DropdownMenuGroup>
                    {courses
                      .filter((c) => courseMap[c.uuid]?.isActive !== false)
                      .map((el) => (
                        <DropdownMenuItem
                          key={el.uuid}
                          onSelect={() => setSelectedCourse(el)}
                          className="cursor-pointer"
                        >
                          {el.name}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <Label>Specialization Name</Label>
              <Input
                placeholder="e.g Machine Learning"
                value={specializationName}
                onChange={(e) => setSpecializationName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={createSpecialization}
              disabled={
                isLoading ||
                !specializationName ||
                !selectedStream ||
                !selectedDegree ||
                !selectedCourse
              }
            >
              {isLoading ? "Creating..." : "Create Specialization"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Specialization Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) resetForm();
          setIsEditDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Specialization</DialogTitle>
            <DialogDescription>Update specialization details</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Stream</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    disabled={isLoading}
                  >
                    {selectedStream?.name || "Select"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                  <DropdownMenuGroup>
                    {streams
                      .filter((s) => streamMap[s.uuid]?.isActive !== false)
                      .map((el) => (
                        <DropdownMenuItem
                          key={el.uuid}
                          onSelect={() => setSelectedStream(el)}
                          className="cursor-pointer"
                        >
                          {el.name}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <Label>Degree</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    disabled={!selectedStream || isLoading}
                  >
                    {selectedDegree?.name || "Select"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                  <DropdownMenuGroup>
                    {degrees
                      .filter((d) => degreeMap[d.uuid]?.isActive !== false)
                      .map((el) => (
                        <DropdownMenuItem
                          key={el.uuid}
                          onSelect={() => setSelectedDegree(el)}
                          className="cursor-pointer"
                        >
                          {el.name}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <Label>Course</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    disabled={!selectedDegree || isLoading}
                  >
                    {selectedCourse?.name || "Select"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                  <DropdownMenuGroup>
                    {courses
                      .filter((c) => courseMap[c.uuid]?.isActive !== false)
                      .map((el) => (
                        <DropdownMenuItem
                          key={el.uuid}
                          onSelect={() => setSelectedCourse(el)}
                          className="cursor-pointer"
                        >
                          {el.name}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <Label>Specialization Name</Label>
              <Input
                placeholder="e.g Machine Learning"
                value={specializationName}
                onChange={(e) => setSpecializationName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={editSpecialization}
              disabled={
                isLoading ||
                !specializationName ||
                !selectedStream ||
                !selectedDegree ||
                !selectedCourse
              }
            >
              {isLoading ? "Updating..." : "Update Specialization"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={inputDialog} onOpenChange={setInputDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Specializations</DialogTitle>
            <DialogDescription>
              Upload an Excel file to import specializations
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="w-full gap-2"
              disabled={isLoading}
            >
              <FileDown className="h-4 w-4" />
              Download Template
            </Button>
            <div className="space-y-2">
              <Label>Select Excel File</Label>
              <Input
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                id="file-upload"
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={importFromExcel}
              disabled={!selectedFile || isLoading}
            >
              {isLoading ? "Importing..." : "Import Excel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-1 justify-start items-center">
          <SidebarTrigger className="mt-1 mb-1" />
          <h1 className="text-2xl font-semibold text-gray-800">
            Question Paper Management
          </h1>
        </div>
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
                <Link href="/admin/qp">Streams & Subjects</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin/qp/specialization">Specializations</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Stream, Degree, and Course Activation/Deactivation Buttons */}
      <div className="flex flex-wrap gap-2 max-w-full">
        {streams.map((stream) => (
          <Button
            key={stream.uuid}
            variant="outline"
            className={stream.isActive ? "text-green-600" : "text-red-600"}
            onClick={() =>
              toggleEntityStatus("streams", stream.uuid, !stream.isActive)
            }
            disabled={isLoading}
          >
            {stream.name}: {stream.isActive ? "Deactivate" : "Activate"}
          </Button>
        ))}
        {degrees.map((degree) => (
          <Button
            key={degree.uuid}
            variant="outline"
            className={degree.isActive ? "text-green-600" : "text-red-600"}
            onClick={() =>
              toggleEntityStatus("degrees", degree.uuid, !degree.isActive)
            }
            disabled={isLoading}
          >
            {degree.name}: {degree.isActive ? "Deactivate" : "Activate"}
          </Button>
        ))}
        {courses.map((course) => (
          <Button
            key={course.uuid}
            variant="outline"
            className={course.isActive ? "text-green-600" : "text-red-600"}
            onClick={() =>
              toggleEntityStatus("courses", course.uuid, !course.isActive)
            }
            disabled={isLoading}
          >
            {course.name}: {course.isActive ? "Deactivate" : "Activate"}
          </Button>
        ))}
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center flex-col md:flex-row gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search specializations..."
              className="pl-9 bg-white focus-visible:ring-1 focus-visible:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2" disabled={isLoading}>
                Actions
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onSelect={() => setIsDialogOpen(true)}
                  className="gap-2"
                >
                  <CirclePlusIcon className="h-4 w-4" />
                  New Specialization
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={toExcel}
                  className="gap-2"
                  disabled={isLoading || filteredSpecializations.length === 0}
                >
                  <FileDown className="h-4 w-4" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setInputDialog(true)}
                  className="gap-2"
                  disabled={isLoading}
                >
                  <FileUp className="h-4 w-4" />
                  Import
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setShowDeactivated(!showDeactivated)}
                  className="gap-2"
                  disabled={isLoading}
                >
                  <Eye className="h-4 w-4" />
                  {showDeactivated ? "Hide" : "Show"} Deactivated
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Stream</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    disabled={isLoading}
                  >
                    {selectedStream?.name || "All"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                  <DropdownMenuItem onSelect={() => setSelectedStream(null)}>
                    All
                  </DropdownMenuItem>
                  {streams
                    .filter((s) => streamMap[s.uuid]?.isActive !== false)
                    .map((el) => (
                      <DropdownMenuItem
                        key={el.uuid}
                        onSelect={() => setSelectedStream(el)}
                      >
                        {el.name}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {selectedStream && (
              <div className="space-y-2">
                <Label>Degree</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      disabled={isLoading}
                    >
                      {selectedDegree?.name || "All"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                    <DropdownMenuItem onSelect={() => setSelectedDegree(null)}>
                      All
                    </DropdownMenuItem>
                    {degrees
                      .filter((d) => degreeMap[d.uuid]?.isActive !== false)
                      .map((el) => (
                        <DropdownMenuItem
                          key={el.uuid}
                          onSelect={() => setSelectedDegree(el)}
                        >
                          {el.name}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {selectedDegree && (
              <div className="space-y-2">
                <Label>Course</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      disabled={isLoading}
                    >
                      {selectedCourse?.name || "All"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                    <DropdownMenuItem onSelect={() => setSelectedCourse(null)}>
                      All
                    </DropdownMenuItem>
                    {courses
                      .filter((c) => courseMap[c.uuid]?.isActive !== false)
                      .map((el) => (
                        <DropdownMenuItem
                          key={el.uuid}
                          onSelect={() => setSelectedCourse(el)}
                        >
                          {el.name}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {selectedCourse && (
              <div className="space-y-2">
                <Label>Status</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      disabled={isLoading}
                    >
                      {showDeactivated ? "All" : "Active Only"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem
                      onSelect={() => setShowDeactivated(false)}
                    >
                      Active Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setShowDeactivated(true)}>
                      Show All
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Specializations Table */}
      <Card className="flex-1 overflow-hidden">
        <div className="p-6 py-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">
              Specializations
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredSpecializations.length}{" "}
                {showDeactivated ? "found" : "active"})
              </span>
            </h2>
          </div>

          <div className="rounded-md border overflow-y-scroll min-h-[45vh] max-h-[80vh]">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox disabled={isLoading} />
                  </TableHead>
                  <TableHead>Specialization Name</TableHead>
                  <TableHead>Stream</TableHead>
                  <TableHead>Degree</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredSpecializations.length > 0 ? (
                  filteredSpecializations.map((spec) => (
                    <TableRow key={spec.uuid} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox disabled={isLoading} />
                      </TableCell>
                      <TableCell className="font-medium">{spec.name}</TableCell>
                      <TableCell>
                        {streamMap[spec.stream]?.name || "Unknown"}
                      </TableCell>
                      <TableCell>
                        {degreeMap[spec.degree]?.name || "Unknown"}
                      </TableCell>
                      <TableCell>
                        {courseMap[spec.course]?.name || "Unknown"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            spec.isActive === false
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {spec.isActive === false ? "Deactivated" : "Active"}
                        </span>
                      </TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-gray-700 hover:bg-gray-100"
                          onClick={() => handleEditSpecialization(spec)}
                          disabled={isLoading}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={`h-8 gap-1 ${
                            spec.isActive === false
                              ? "text-green-600 hover:bg-green-50"
                              : "text-red-600 hover:bg-red-50"
                          }`}
                          onClick={() =>
                            handleToggleSpecializationStatus(spec.uuid)
                          }
                          disabled={isLoading}
                        >
                          {spec.isActive === false ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Activate</span>
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Deactivate</span>
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No specializations found
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
