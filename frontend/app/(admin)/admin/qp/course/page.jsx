"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from 'next/link';
import * as XLSX from 'xlsx';
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
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function CourseManagementPage() {
  // State management
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inputDialog, setInputDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStream, setSelectedStream] = useState(null);
  const [selectedDegree, setSelectedDegree] = useState(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [numSemesters, setNumSemesters] = useState("");

  // Data state
  const [streams, setStreams] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);

  // Helper functions
  const generateUUID = useCallback(() => {
    return [...Array(6)].map(() => Math.random().toString(36)[2].toUpperCase()).join("");
  }, []);

  // Fetch all necessary data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [coursesRes, streamsRes, degreesRes, academicYearsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/courses`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years`)
        ]);

        if (!coursesRes.ok || !streamsRes.ok || !degreesRes.ok || !academicYearsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [coursesData, streamsData, degreesData, academicYearsData] = await Promise.all([
          coursesRes.json(),
          streamsRes.json(),
          degreesRes.json(),
          academicYearsRes.json()
        ]);

        setCourses(coursesData);
        setStreams(streamsData);
        setDegrees(degreesData);
        setAcademicYears(academicYearsData);
        setFilteredCourses(coursesData);
      } catch (err) {
        toast.error("Error loading data: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters whenever dependencies change
  useEffect(() => {
    let results = courses.filter(course =>
      showDeactivated ? true : course.isActive !== false
    );

    if (searchTerm) {
      results = results.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStream) {
      results = results.filter(course => course.stream === selectedStream.uuid);
    }

    setFilteredCourses(results);
  }, [courses, searchTerm, selectedStream, showDeactivated]);

  // Fetch degrees when stream is selected
  const fetchDegrees = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams/${selectedStream.uuid}/degrees`
      );
      if (!res.ok) throw new Error("Failed to fetch degrees");
      const data = await res.json();
      setDegrees(data);
    } catch (err) {
      toast.error("Error loading degrees: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStream]);

  // Fetch academic years when degree is selected
  const fetchAcademicYears = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees/${selectedAcademicYear.uuid}/academic-years`
      );
      if (!res.ok) throw new Error("Failed to fetch academic years");
      const data = await res.json();
      setAcademicYears(data);
    } catch (err) {
      toast.error("Error loading academic years: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDegree]);

  const handleAddCourse = async () => {
    if (!courseName.trim() || !courseCode.trim() || !selectedStream ||
      !selectedDegree || !selectedAcademicYear || !selectedSemester ||
      !numSemesters || isNaN(numSemesters) || parseInt(numSemesters) <= 0) {
      return toast.error("Please fill all required fields with valid data");
    }

    try {
      setIsLoading(true);
      const newCourse = {
        name: courseName.trim(),
        code: courseCode.trim(),
        stream: selectedStream.uuid,
        degree: selectedDegree.uuid,
        academicYear: selectedAcademicYear.uuid,
        semester: selectedSemester,
        numSemesters: parseInt(numSemesters),
        uuid: generateUUID(),
        isActive: true
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCourse)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create course");
      }

      const createdCourse = await res.json();
      setCourses(prev => [...prev, createdCourse]);
      resetForm();
      setIsDialogOpen(false);
      toast.success("Course created successfully");
    } catch (err) {
      toast.error("Error creating course: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCourseStatus = async (courseUuid) => {
    try {
      setIsLoading(true);
      const course = courses.find(c => c.uuid === courseUuid);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/courses/${courseUuid}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !course.isActive })
      });

      if (!res.ok) throw new Error("Failed to update course status");

      const updatedCourse = await res.json();
      setCourses(prev => prev.map(c => c.uuid === courseUuid ? updatedCourse : c));
      toast.success(`Course ${updatedCourse.isActive ? "activated" : "deactivated"} successfully`);
    } catch (err) {
      toast.error("Error updating course status: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Excel Import/Export Functions
  const downloadTemplate = () => {
    const template = [{
      'Course Name': '',
      'Code': '',
      'Stream': '',
      'Degree': '',
      'Academic Year': '',
      'Semester': '',
      'Number of Semesters': '1-8'
    }];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "Course_Template.xlsx");
  };

  const importToExcel = async () => {
    if (!selectedFile) {
      toast.error("No file selected");
      return;
    }

    try {
      setIsLoading(true);
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.error("The file is empty");
        return;
      }

      // Prepare data for backend
      const importedCourses = jsonData.map(row => ({
        name: row['Course Name']?.toString().trim() || '',
        code: row['Code']?.toString().trim() || '',
        stream: row['Stream']?.toString().trim() || '',
        degree: row['Degree']?.toString().trim() || '',
        academicYear: row['Academic Year']?.toString().trim() || '',
        semester: row['Semester']?.toString().trim() || '',
        numSemesters: parseInt(row['Number of Semesters']) || 1,
        uuid: generateUUID(),
        isActive: true
      }));

      // Send to backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/courses/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(importedCourses)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Import failed');
      }

      // Refresh courses after import
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/courses`);
      const newCourses = await res.json();
      setCourses(newCourses);

      toast.success(`Imported ${result.created} courses`);
      setInputDialog(false);
      setSelectedFile(null);
    } catch (error) {
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredCourses.map(course => {
      const stream = streams.find(s => s.uuid === course.stream)?.name || 'Unknown';
      const degree = degrees.find(d => d.uuid === course.degree)?.name || 'Unknown';
      const year = academicYears.find(y => y.uuid === course.academicYear)?.year || 'Unknown';

      return {
        'Course Name': course.name,
        'Code': course.code,
        'Stream': stream,
        'Degree': degree,
        'Academic Year': year,
        'Semester': course.semester,
        'Number of Semesters': course.numSemesters,
        'Status': course.isActive ? 'Active' : 'Inactive'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Courses");
    XLSX.writeFile(workbook, "Courses.xlsx");
  };

  const resetForm = () => {
    setCourseName('');
    setCourseCode('');
    setNumSemesters('');
    setSelectedStream(null);
    setSelectedDegree(null);
    setSelectedAcademicYear(null);
    setSelectedSemester('');
  };

  const getStreamName = (streamId) => {
    return streams.find(s => s.uuid === streamId)?.name || 'Unknown';
  };

  const getDegreeName = (degreeId) => {
    return degrees.find(d => d.uuid === degreeId)?.name || 'Unknown';
  };

  const getAcademicYearName = (yearId) => {
    return academicYears.find(y => y.uuid === yearId)?.year || 'Unknown';
  };

  const semesterOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];

  return (
    <div className="flex flex-col h-screen w-full gap-6 bg-gray-50 p-6">
      {/* Create Course Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Create New Course</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Add a new course to the system
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
                            setSelectedAcademicYear(null);
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
                  No. Of Semester/Trimester <span className="text-red-500">*</span>
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
                  Select Semester/Trimester <span className="text-red-500">*</span>
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex justify-between w-full">
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
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Degree Name <span className="text-red-500">*</span>
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
                            onSelect={() => {
                              setSelectedDegree(degree);
                              fetchAcademicYears(degree.uuid);
                            }}
                          >
                            {degree.name}
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <DropdownMenuItem disabled>No degrees available</DropdownMenuItem>
                      )}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
                  Academic Year <span className="text-red-500">*</span>
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex justify-between w-full"
                      disabled={!selectedDegree}
                    >
                      {selectedAcademicYear ? selectedAcademicYear.year : "Select Academic Year"}
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
                            <span>{year.year}</span>
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <DropdownMenuItem disabled>No academic years available</DropdownMenuItem>
                      )}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="hover:bg-gray-100" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleAddCourse}
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
              {isLoading ? "Creating..." : "Create Course"}
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
        <h1 className="text-2xl font-semibold text-gray-800">Question Paper Management</h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                asChild
                className="text-sm font-medium text-gray-600 hover:text-blue-600"
              >
                <Link href='/admin'>
                  Home
                </Link>
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
                <Link href='/admin/qp'>
                  QP Management
                </Link>
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
          {selectedStream && <div className="w-full sm:w-64">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {selectedDegree ? selectedDegree.name : "All Degrees"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={() => setSelectedStream(null)}>
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
          </div>}
          {selectedDegree && <div className="w-full sm:w-64">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {selectedAcademicYear ? selectedAcademicYear.year : "All Academic Years"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={() => setSelectedStream(null)}>
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
          </div>}
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
                onClick={() => setIsDialogOpen(true)}
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
                ({filteredCourses.length} {showDeactivated ? "found" : "active"})
              </span>
            </h2>
          </div>
          <div className="rounded-md border">
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
                  <TableHead className="font-medium text-right">Actions</TableHead>
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
                      <TableCell className="font-medium">{course.uuid}</TableCell>
                      <TableCell>{course.name}</TableCell>
                      <TableCell>{course.code}</TableCell>
                      <TableCell>{getStreamName(course.stream)}</TableCell>
                      <TableCell>{getDegreeName(course.degree)}</TableCell>
                      <TableCell>{course.semester}</TableCell>
                      <TableCell>{getAcademicYearName(course.academicYear)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${course.isActive === false
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                          }`}>
                          {course.isActive === false ? 'Deactivated' : 'Active'}
                        </span>
                      </TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-gray-700 hover:bg-gray-100"
                          disabled={isLoading}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant={'outline'}
                          className={`h-8 gap-1 ${course.isActive
                            ? "text-red-600 hover:bg-red-50"
                            : "text-green-600 hover:bg-green-50"
                            }`}
                          onClick={() => handleToggleCourseStatus(course.uuid)}
                          disabled={isLoading}
                        >
                          {course.isActive ? (
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