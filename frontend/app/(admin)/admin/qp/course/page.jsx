"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { v4 as uuid } from "uuid";
import * as XLSX from "xlsx";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function CourseManagementPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inputDialog, setInputDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // "add" or "edit"
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStream, setSelectedStream] = useState(null);
  const [selectedDegree, setSelectedDegree] = useState(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [numSemesters, setNumSemesters] = useState("");
  const [streams, setStreams] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [courses, setCourses] = useState([]);

  // Helper function for UUID generation
  const generateUUID = () =>
    [...Array(6)]
      .map(() => Math.random().toString(36)[2].toUpperCase())
      .join("");

  // Fetch initial data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [streamsRes, coursesRes, degreeRes, academicRes] =
        await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/courses`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years`),
        ]);

      if (
        !streamsRes.ok ||
        !coursesRes.ok ||
        !degreeRes.ok ||
        !academicRes.ok
      ) {
        throw new Error("Failed to fetch initial data");
      }

      const [streamsData, coursesData, degreeData, academicData] =
        await Promise.all([
          streamsRes.json(),
          coursesRes.json(),
          degreeRes.json(),
          academicRes.json(),
        ]);

      setStreams(streamsData);
      setCourses(coursesData);
      setDegrees(degreeData);
      setAcademicYears(academicData);
    } catch (err) {
      toast.error("Error loading data: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch degrees by stream
  const fetchDegrees = useCallback(async (streamUuid) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams/${streamUuid}/degrees`
      );
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

  // Fetch academic years by degree
  const fetchAcademicYears = useCallback(async (degreeUuid) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees/${degreeUuid}/academic-years`
      );
      if (!res.ok) throw new Error("Failed to fetch academic years");
      const data = await res.json();
      setAcademicYears(data);
    } catch (err) {
      toast.error("Error loading academic years: " + err.message);
      setAcademicYears([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle filter chain
  useEffect(() => {
    if (selectedStream) {
      fetchDegrees(selectedStream.uuid);
      setSelectedDegree(null);
      setSelectedAcademicYear(null);
      setAcademicYears([]);
    } else {
      setDegrees([]);
      setAcademicYears([]);
      setSelectedDegree(null);
      setSelectedAcademicYear(null);
    }
  }, [selectedStream, fetchDegrees]);

  useEffect(() => {
    if (selectedDegree) {
      fetchAcademicYears(selectedDegree.uuid);
      setSelectedAcademicYear(null);
    } else {
      setAcademicYears([]);
      setSelectedAcademicYear(null);
    }
  }, [selectedDegree, fetchAcademicYears]);

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      course.code?.toLowerCase().includes(searchTerm?.toLowerCase());
    const matchesStream = selectedStream
      ? course.stream === selectedStream.uuid
      : true;
    const matchesDegree = selectedDegree
      ? course.degree === selectedDegree.uuid
      : true;
    const matchesAcademicYear = selectedAcademicYear
      ? course.academicYear === selectedAcademicYear.uuid
      : true;
    const matchesStatus = showDeactivated ? true : course.isActive !== false;
    return (
      matchesSearch &&
      matchesStream &&
      matchesDegree &&
      matchesAcademicYear &&
      matchesStatus
    );
  });

  // Add course
  const handleAddCourse = async () => {
    if (
      !courseName.trim() ||
      !courseCode.trim() ||
      !selectedStream ||
      !selectedDegree ||
      !selectedAcademicYear ||
      !selectedSemester ||
      !numSemesters ||
      isNaN(numSemesters) ||
      parseInt(numSemesters) <= 0
    ) {
      toast.error("Please fill all required fields with valid data");
      return;
    }

    const payload = {
      name: courseName.trim(),
      code: courseCode.trim(),
      stream: selectedStream.uuid,
      degree: selectedDegree.uuid,
      academicYear: selectedAcademicYear.uuid,
      semester: selectedSemester,
      numSemesters: parseInt(numSemesters),
      uuid: [...Array(6)]
        .map(() => Math.random().toString(36)[2].toUpperCase())
        .join(""),
      isActive: true,
    };

    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/courses`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create course");
      }

      const createdCourse = await res.json();
      setCourses((prev) => [...prev, createdCourse]);
      toast.success("Course created successfully");
      resetForm();
      setIsDialogOpen(false);
    } catch (err) {
      toast.error("Error creating course: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit course
  const handleEditCourse = async () => {
    if (
      !courseName.trim() ||
      !courseCode.trim() ||
      !selectedStream ||
      !selectedDegree ||
      !selectedAcademicYear ||
      !selectedSemester ||
      !numSemesters ||
      isNaN(numSemesters) ||
      parseInt(numSemesters) <= 0
    ) {
      toast.error("Please fill all required fields with valid data");
      return;
    }

    const payload = {
      name: courseName.trim(),
      code: courseCode.trim(),
      stream: selectedStream.uuid,
      degree: selectedDegree.uuid,
      academicYear: selectedAcademicYear.uuid,
      semester: selectedSemester,
      numSemesters: parseInt(numSemesters),
      isActive: editingCourse.isActive,
    };

    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/courses/${editingCourse.uuid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update course");
      }

      const updatedCourse = await res.json();
      setCourses((prev) =>
        prev.map((course) =>
          course.uuid === updatedCourse.uuid ? updatedCourse : course
        )
      );
      toast.success("Course updated successfully");
      resetForm();
      setIsDialogOpen(false);
    } catch (err) {
      toast.error("Error updating course: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle deactivate status
  const handleDeactivate = async (courseUuid) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/courses/${courseUuid}`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ isActive: false }),
        }
      );
      const data = await res.json();
      setCourses((prev) => prev.map((c) => (c.uuid === courseUuid ? data : c)));
      toast.success("Course deactivated successfully");
    } catch (err) {
      toast.error("Error updating course status: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle course status
  const handleActivate = async (courseUuid) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/courses/${courseUuid}`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ isActive: true }),
        }
      );
      const data = await res.json();
      setCourses((prev) => prev.map((c) => (c.uuid === courseUuid ? data : c)));
      toast.success("Course activated successfully");
    } catch (err) {
      toast.error("Error updating course status: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // New Import to Excel
  const importToExcel = async () => {
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

      // Validate Excel headers
      const requiredHeaders = [
        "Course Name",
        "Code",
        "Stream",
        "Degree",
        "Academic Year",
        "Semester",
        "Number of Semesters",
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
        const numSemesters = parseInt(row["Number of Semesters"]);
        if (isNaN(numSemesters) || numSemesters <= 0 || numSemesters > 8) {
          throw new Error(
            `Invalid number of semesters at row ${
              index + 2
            }: must be a number between 1 and 8`
          );
        }
        return {
          name: row["Course Name"]?.toString().trim() || "",
          code: row["Code"]?.toString().trim() || "",
          stream: row["Stream"]?.toString().trim() || "",
          degree: row["Degree"]?.toString().trim() || "",
          academicYear: row["Academic Year"]?.toString().trim() || "",
          semester: row["Semester"]?.toString().trim() || "",
          numSemesters: numSemesters,
          uuid: generateUUID(),
          isActive: true,
        };
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/courses/bulk`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Import failed");
      }

      if (result.created > 0) {
        await fetchData(); // Refresh courses
        toast.success(`Imported ${result.created} courses`);
      }

      if (result.skipped > 0) {
        toast.info(`Skipped ${result.skipped} existing courses`);
      }

      setInputDialog(false);
      setSelectedFile(null);
    } catch (error) {
      toast.error(`Import failed: ${error.message}`);
      console.error("Import error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Excel export
  const exportToExcel = () => {
    const dataToExport = filteredCourses.map((course) => ({
      "Course Name": course.name,
      Code: course.code,
      Stream: getStreamName(course.stream),
      Degree: getDegreeName(course.degree),
      "Academic Year": getAcademicYearName(course.academicYear),
      Semester: course.semester,
      "Number of Semesters": course.numSemesters,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Courses");
    XLSX.writeFile(workbook, "Courses.xlsx");
  };

  // Download template
  const downloadTemplate = () => {
    const template = [
      {
        "Course Name": "",
        Code: "",
        Stream: "",
        Degree: "",
        "Academic Year": "",
        Semester: "",
        "Number of Semesters": "1-8",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "Course_Template.xlsx");
  };

  // Helper functions
  const getStreamName = (streamId) => {
    return streams.find((s) => s.uuid === streamId)?.name || "Unknown";
  };

  const getDegreeName = (degreeId) => {
    // Debug Log
    console.log(degreeId, degrees);

    return degrees.find((d) => d.uuid === degreeId)?.name || "Unknown";
  };

  const getAcademicYearName = (yearId) => {
    return academicYears.find((y) => y.uuid === yearId)?.year || "Unknown";
  };

  const resetForm = () => {
    setCourseName("");
    setCourseCode("");
    setNumSemesters("");
    setSelectedStream(null);
    setSelectedDegree(null);
    setSelectedAcademicYear(null);
    setSelectedSemester("");
    setEditingCourse(null);
    setDialogMode("add");
    setIsDialogOpen(false);
  };

  const openEditDialog = (course) => {
    setEditingCourse(course);
    setCourseName(course.name);
    setCourseCode(course.code);
    setNumSemesters(course.numSemesters?.toString());
    setSelectedStream(streams.find((s) => s.uuid === course.stream));
    setSelectedDegree(degrees.find((d) => d.uuid === course.degree));
    setSelectedAcademicYear(
      academicYears.find((y) => y.uuid === course.academicYear)
    );
    setSelectedSemester(course.semester);
    setDialogMode("edit");
    setIsDialogOpen(true);
  };

  const semesterOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];

  return (
    <div className="flex flex-col h-screen w-full gap-6 bg-gray-50 p-6">
      {/* Create/Edit Course Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) resetForm();
          setIsDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {dialogMode === "add" ? "Create New Course" : "Edit Course"}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {dialogMode === "add"
                ? "Add a new course to the system"
                : "Update the selected course"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Stream <span className="text-red-500">*</span>
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex justify-between w-full"
                    >
                      {selectedStream ? selectedStream.name : "Select Stream"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuGroup>
                      {streams.map((stream) => (
                        <DropdownMenuItem
                          key={stream.uuid}
                          onSelect={() => setSelectedStream(stream)}
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
                  Degree <span className="text-red-500">*</span>
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
                <Label className="text-sm font-medium">
                  Academic Year <span className="text-red-500">*</span>
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex justify-between w-full"
                      disabled={!selectedDegree}
                    >
                      {selectedAcademicYear
                        ? selectedAcademicYear.year
                        : "Select Academic Year"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuGroup>
                      {academicYears.length > 0 ? (
                        academicYears.map((year) => (
                          <DropdownMenuItem
                            key={year.uuid}
                            onSelect={() => setSelectedAcademicYear(year)}
                          >
                            {year.year}
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <DropdownMenuItem disabled>
                          No academic years available
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Course Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Enter course name"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="focus-visible:ring-1 focus-visible:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Course Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Enter course code"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="focus-visible:ring-1 focus-visible:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Semester <span className="text-red-500">*</span>
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex justify-between w-full"
                    >
                      {selectedSemester || "Select Semester"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuGroup>
                      {semesterOptions.map((semester) => (
                        <DropdownMenuItem
                          key={semester}
                          onSelect={() => setSelectedSemester(semester)}
                        >
                          {semester}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Number of Semesters <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Enter number of semesters"
                  value={numSemesters}
                  onChange={(e) => setNumSemesters(e.target.value)}
                  className="focus-visible:ring-1 focus-visible:ring-blue-500"
                  type="number"
                  min="1"
                  max="8"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                className="hover:bg-gray-100"
                disabled={isLoading}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={
                dialogMode === "add" ? handleAddCourse : handleEditCourse
              }
              className="bg-blue-600 hover:bg-blue-700"
              disabled={
                isLoading ||
                !courseName.trim() ||
                !courseCode.trim() ||
                !selectedStream ||
                !selectedDegree ||
                !selectedAcademicYear ||
                !selectedSemester ||
                !numSemesters ||
                isNaN(numSemesters) ||
                parseInt(numSemesters) <= 0
              }
            >
              {isLoading
                ? "Processing..."
                : dialogMode === "add"
                ? "Create Course"
                : "Update Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={inputDialog} onOpenChange={setInputDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Courses</DialogTitle>
            <DialogDescription>
              Upload an Excel file to import courses
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
            <Button
              variant="outline"
              onClick={() => setInputDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={importToExcel}
              disabled={!selectedFile || isLoading}
            >
              {isLoading ? "Importing..." : "Import Excel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-semibold text-gray-800">
          Question Paper Management
        </h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                asChild
                className="text-sm font-medium text-gray-600 hover:text-blue-600"
              >
                <Link href="/admin">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-gray-400">
              <ChevronDown className="h-3 w-3 rotate-90" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink
                asChild
                className="text-sm font-medium text-gray-600 hover:text-blue-600"
              >
                <Link href="/admin/qp">QP Management</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-gray-400" />
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/admin/qp/courses"
                className="text-sm font-medium text-blue-600"
              >
                Courses
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search courses..."
              className="pl-9 bg-white focus-visible:ring-1 focus-visible:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="w-full sm:w-64">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {selectedStream ? selectedStream.name : "All Streams"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={() => setSelectedStream(null)}>
                    All Streams
                  </DropdownMenuItem>
                  {streams.map((stream) => (
                    <DropdownMenuItem
                      key={stream.uuid}
                      onSelect={() => setSelectedStream(stream)}
                    >
                      {stream.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {selectedStream && (
            <div className="w-full sm:w-64">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedDegree ? selectedDegree.name : "All Degrees"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onSelect={() => setSelectedDegree(null)}>
                      All Degrees
                    </DropdownMenuItem>
                    {degrees.map((degree) => (
                      <DropdownMenuItem
                        key={degree.uuid}
                        onSelect={() => setSelectedDegree(degree)}
                      >
                        {degree.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          {selectedDegree && (
            <div className="w-full sm:w-64">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedAcademicYear
                      ? selectedAcademicYear.year
                      : "All Academic Years"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onSelect={() => setSelectedAcademicYear(null)}
                    >
                      All Academic Years
                    </DropdownMenuItem>
                    {academicYears.map((year) => (
                      <DropdownMenuItem
                        key={year.uuid}
                        onSelect={() => setSelectedAcademicYear(year)}
                      >
                        {year.year}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
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
                onClick={() => {
                  setDialogMode("add");
                  setIsDialogOpen(true);
                }}
                className="flex items-center gap-2 cursor-pointer"
                disabled={isLoading}
              >
                <CirclePlusIcon className="h-4 w-4" />
                <span>New Course</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setInputDialog(true)}
                className="flex items-center gap-2 cursor-pointer"
                disabled={isLoading}
              >
                <FileUp className="h-4 w-4" />
                <span>Import</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={exportToExcel}
                className="flex items-center gap-2 cursor-pointer"
                disabled={isLoading || filteredCourses.length === 0}
              >
                <FileDown className="h-4 w-4" />
                <span>Export</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeactivated(!showDeactivated)}
                className="flex items-center gap-2 cursor-pointer"
                disabled={isLoading}
              >
                <Eye className="h-4 w-4" />
                <span>{showDeactivated ? "Hide" : "View"} Deactivated</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Courses Table */}
      <Card className="flex-1 overflow-hidden">
        <div className="p-6 py-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">
              Courses{" "}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredCourses.length} {showDeactivated ? "found" : "active"}
                )
              </span>
            </h2>
          </div>
          <div className="rounded-md border min-h-[50vh]">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox disabled={isLoading} />
                  </TableHead>
                  <TableHead className="font-medium">UUID</TableHead>
                  <TableHead className="font-medium">Course Name</TableHead>
                  <TableHead className="font-medium">Course Code</TableHead>
                  <TableHead className="font-medium">Stream</TableHead>
                  <TableHead className="font-medium">Degree</TableHead>
                  <TableHead className="font-medium">Semester</TableHead>
                  <TableHead className="font-medium">Year</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <TableRow key={course.uuid} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox disabled={isLoading} />
                      </TableCell>
                      <TableCell className="font-medium">
                        {course.uuid}
                      </TableCell>
                      <TableCell>{course.name}</TableCell>
                      <TableCell>{course.code}</TableCell>
                      <TableCell>{getStreamName(course.stream)}</TableCell>
                      <TableCell>{getDegreeName(course.degree)}</TableCell>
                      <TableCell>{course.semester}</TableCell>
                      <TableCell>
                        {getAcademicYearName(course.academicYear)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            course.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {course.isActive ? "Active" : "Deactivated"}
                        </span>
                      </TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-gray-700 hover:bg-gray-100"
                          onClick={() => openEditDialog(course)}
                          disabled={isLoading}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </Button>
                        {course.isActive ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className={`h-8 gap-1 text-red-600 hover:bg-red-50`}
                            onClick={() => handleDeactivate(course.uuid)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Deactivate</span>
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className={`h-8 gap-1 text-green-600 hover:bg-green-50`}
                            onClick={() => handleActivate(course.uuid)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Activate</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      No courses found
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
