"use client";

import React, { useState } from "react";
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
  Pencil,
  Trash2,
  Search,
  FileUp,
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

export default function CourseManagementPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStreamId, setSelectedStreamId] = useState(null);
  const [selectedDegreeId, setSelectedDegreeId] = useState(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [showDeactivated, setShowDeactivated] = useState(false);

  // Form state
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [numSemesters, setNumSemesters] = useState("");

  // Sample data
  const [streams] = useState([
    { id: 1, name: "March 2025 Exams" },
    { id: 2, name: "July 2025 Exams" },
    { id: 3, name: "August 2025 Exams" },
  ]);

  const [degrees] = useState([
    { id: 1, streamId: 1, name: "BCA 1st Year" },
    { id: 2, streamId: 2, name: "BBA 2nd Year" },
    { id: 3, streamId: 3, name: "MBA 1st Year" },
  ]);

  const [academicYears] = useState([
    { id: 1, name: "2023-24" },
    { id: 2, name: "2024-25" },
    { id: 3, name: "2025-26" },
  ]);

  const semesterOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];

  const [courses, setCourses] = useState([
    {
      id: 1,
      streamId: 1,
      degreeId: 1,
      academicYear: "2024-25",
      semester: "1",
      courseName: "Introduction to Programming",
      courseCode: "CS101",
      numSemesters: "6",
      isActive: true,
    },
    {
      id: 2,
      streamId: 2,
      degreeId: 2,
      academicYear: "2024-25",
      semester: "2",
      courseName: "Business Management",
      courseCode: "BM201",
      numSemesters: "4",
      isActive: true,
    },
  ]);

  // Filter courses based on search term, selected stream, and active status
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStream = selectedStreamId
      ? course.streamId === selectedStreamId
      : true;
    const matchesActiveStatus = showDeactivated ? true : course.isActive;
    return matchesSearch && matchesStream && matchesActiveStatus;
  });

  const handleAddCourse = () => {
    if (
      courseName.trim() &&
      courseCode.trim() &&
      selectedStreamId &&
      selectedDegreeId &&
      selectedAcademicYear &&
      selectedSemester &&
      numSemesters
    ) {
      const newId =
        courses.length > 0 ? Math.max(...courses.map((c) => c.id)) + 1 : 1;
      setCourses([
        ...courses,
        {
          id: newId,
          streamId: selectedStreamId,
          degreeId: selectedDegreeId,
          academicYear: selectedAcademicYear,
          semester: selectedSemester,
          courseName: courseName.trim(),
          courseCode: courseCode.trim(),
          numSemesters,
          isActive: true,
        },
      ]);
      // Reset form
      setCourseName("");
      setCourseCode("");
      setSelectedStreamId(null);
      setSelectedDegreeId(null);
      setSelectedAcademicYear("");
      setSelectedSemester("");
      setNumSemesters("");
      setIsDialogOpen(false);
    }
  };

  const handleToggleCourseStatus = (courseId) => {
    setCourses(
      courses.map((course) =>
        course.id === courseId
          ? { ...course, isActive: !course.isActive }
          : course
      )
    );
  };

  const getStreamName = (streamId) => {
    return (
      streams.find((stream) => stream.id === streamId)?.name || "Unknown Stream"
    );
  };

  const getDegreeName = (degreeId) => {
    return (
      degrees.find((degree) => degree.id === degreeId)?.name || "Unknown Degree"
    );
  };

  const getDegreesByStream = (streamId) => {
    return degrees.filter((degree) => degree.streamId === streamId);
  };

  return (
    <div className="flex flex-col h-screen w-full gap-6 bg-gray-50 p-6">
      {/* Dialog for adding new course */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Create New Specialization
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Add a new specialization to the system
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4">
            {/* First Column */}
            <div className="space-y-4">
              {/* Stream */}
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
                      {selectedStreamId
                        ? streams.find((s) => s.id === selectedStreamId)?.name
                        : "Select Stream"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuGroup>
                      {streams.map((stream) => (
                        <DropdownMenuItem
                          key={stream.id}
                          onSelect={() => {
                            setSelectedStreamId(stream.id);
                            setSelectedDegreeId(null);
                          }}
                        >
                          {stream.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* No. Of Semester/Trimester */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  No. Of Semester/Trimester{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Enter number of semesters"
                  value={numSemesters}
                  onChange={(e) => setNumSemesters(e.target.value)}
                  className="focus-visible:ring-1 focus-visible:ring-blue-500"
                />
              </div>

              {/* Course Code */}
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

              {/* Select Semester/Trimester */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Select Semester/Trimester{" "}
                  <span className="text-red-500">*</span>
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
            </div>

            {/* Second Column */}
            <div className="space-y-4">
              {/* Degree Name */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Degree Name <span className="text-red-500">*</span>
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex justify-between w-full"
                      disabled={!selectedStreamId}
                    >
                      {selectedDegreeId
                        ? degrees.find((d) => d.id === selectedDegreeId)?.name
                        : "Select Degree"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuGroup>
                      {selectedStreamId ? (
                        getDegreesByStream(selectedStreamId).map((degree) => (
                          <DropdownMenuItem
                            key={degree.id}
                            onSelect={() => setSelectedDegreeId(degree.id)}
                          >
                            {degree.name}
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <DropdownMenuItem disabled>
                          Select a stream first
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Course Name */}
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

              {/* Academic Year */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Academic Year <span className="text-red-500">*</span>
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex justify-between w-full"
                    >
                      {selectedAcademicYear || "Select Academic Year"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuGroup>
                      {academicYears.map((year) => (
                        <DropdownMenuItem
                          key={year.id}
                          onSelect={() => setSelectedAcademicYear(year.name)}
                        >
                          {year.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
              onClick={handleAddCourse}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={
                !courseName.trim() ||
                !courseCode.trim() ||
                !selectedStreamId ||
                !selectedDegreeId ||
                !selectedAcademicYear ||
                !selectedSemester ||
                !numSemesters
              }
            >
              Create Specialization
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
                href="/admin/qp/specialization"
                className="text-sm font-medium text-blue-600"
              >
                Specialization
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
                    ? streams.find((s) => s.id === selectedStreamId)?.name
                    : "All Streams"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={() => setSelectedStreamId(null)}>
                    All Streams
                  </DropdownMenuItem>
                  {streams.map((stream) => (
                    <DropdownMenuItem
                      key={stream.id}
                      onSelect={() => setSelectedStreamId(stream.id)}
                    >
                      {stream.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search courses..."
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
                onClick={() => setIsDialogOpen(true)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <CirclePlusIcon className="h-4 w-4" />
                <span>New Specialization</span>
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
              Specializations{" "}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredCourses.length} {showDeactivated ? "found" : "active"}
                )
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
                  <TableHead className="font-medium">Course Name</TableHead>
                  <TableHead className="font-medium">Course Code</TableHead>
                  <TableHead className="font-medium">Stream</TableHead>
                  <TableHead className="font-medium">Degree</TableHead>
                  <TableHead className="font-medium">Semester</TableHead>
                  <TableHead className="font-medium">Year</TableHead>
                  <TableHead className="font-medium text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <TableRow key={course.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell className="font-medium">{course.id}</TableCell>
                      <TableCell>{course.courseName}</TableCell>
                      <TableCell>{course.courseCode}</TableCell>
                      <TableCell>{getStreamName(course.streamId)}</TableCell>
                      <TableCell>{getDegreeName(course.degreeId)}</TableCell>
                      <TableCell>{course.semester}</TableCell>
                      <TableCell>{course.academicYear}</TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-gray-700 hover:bg-gray-100"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={`h-8 gap-1 ${
                            course.isActive
                              ? "text-red-600 hover:bg-red-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          onClick={() => handleToggleCourseStatus(course.id)}
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
                    <TableCell colSpan={9} className="h-24 text-center">
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
