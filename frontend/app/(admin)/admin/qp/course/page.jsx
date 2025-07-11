"use client";

import React, { useState, useEffect } from "react";
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
import { toast } from "sonner";

export default function CourseManagementPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStream, setSelectedStream] = useState(null);
  const [selectedDegree, setSelectedDegree] = useState(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [showDeactivated, setShowDeactivated] = useState(false);

  // Form state
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [numSemesters, setNumSemesters] = useState("");
  const [streams, setStreams] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/courses`);
        if (!res.ok) throw new Error("Failed to fetch courses");
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        toast.error("Error loading courses: " + err.message);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (isDialogOpen) {
      const fetchStreams = async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams`);
          if (!res.ok) throw new Error("Failed to fetch streams");
          const data = await res.json();
          setStreams(data);
        } catch (err) {
          toast.error("Error loading streams: " + err.message);
        }
      };

      fetchStreams();
    }
  }, [isDialogOpen]);

  useEffect(() => {
    if (selectedStream) {
      const fetchDegrees = async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams/${selectedStream.uuid}/degrees`
          );
          if (!res.ok) throw new Error("Failed to fetch degrees");
          const data = await res.json();
          setDegrees(data);
        } catch (err) {
          toast.error("Error loading degrees: " + err.message);
        }
      };

      fetchDegrees();
    }
  }, [selectedStream]);

  useEffect(() => {
    if (selectedDegree) {
      const fetchAcademicYears = async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees/${selectedDegree.uuid}/academic-years`
          );
          if (!res.ok) throw new Error("Failed to fetch academic years");
          const data = await res.json();
          setAcademicYears(data);
        } catch (err) {
          toast.error("Error loading academic years: " + err.message);
        }
      };

      fetchAcademicYears();
    }
  }, [selectedDegree]);

  const semesterOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStream = selectedStream ? course.streamId === selectedStream.uuid : true;
    const matchesActiveStatus = showDeactivated ? true : course.isActive;
    return matchesSearch && matchesStream && matchesActiveStatus;
  });

  const handleAddCourse = async () => {
    if (
      courseName.trim() &&
      courseCode.trim() &&
      selectedStream &&
      selectedDegree &&
      selectedAcademicYear &&
      selectedSemester &&
      numSemesters &&
      !isNaN(numSemesters) && 
      parseInt(numSemesters) > 0
    ) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/courses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            streamId: selectedStream.uuid,
            degreeId: selectedDegree.uuid,
            academicYear: selectedAcademicYear,
            semester: selectedSemester,
            courseName: courseName.trim(),
            courseCode: courseCode.trim(),
            numSemesters: parseInt(numSemesters),
            isActive: true,
          }),
        });
        if (!res.ok) throw new Error("Failed to create course");
        const newCourse = await res.json();
        setCourses([...courses, newCourse]);
        setCourseName("");
        setCourseCode("");
        setSelectedStream(null);
        setSelectedDegree(null);
        setSelectedAcademicYear("");
        setSelectedSemester("");
        setNumSemesters("");
        setIsDialogOpen(false);
        toast.success("Course created successfully");
      } catch (err) {
        toast.error("Error creating course: " + err.message);
      }
    } else {
      toast.error("Please fill all required fields with valid data");
    }
  };

  const handleToggleCourseStatus = async (courseUuid) => {
    try {
      const course = courses.find((c) => c.uuid === courseUuid);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/courses/${courseUuid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...course, isActive: !course.isActive }),
      });
      if (!res.ok) throw new Error("Failed to update course status");
      const updatedCourse = await res.json();
      setCourses(courses.map((c) => (c.uuid === courseUuid ? updatedCourse : c)));
      toast.success(`Course ${updatedCourse.isActive ? "activated" : "deactivated"} successfully`);
    } catch (err) {
      toast.error("Error updating course status: " + err.message);
    }
  };

  const getStreamName = (streamId) => {
    return streams.find((stream) => stream.uuid === streamId)?.name || "Unknown Stream";
  };

  const getDegreeName = (degreeId) => {
    return degrees.find((degree) => degree.uuid === degreeId)?.name || "Unknown Degree";
  };

  return (
    <div className="flex flex-col h-screen w-full gap-6 bg-gray-50 p-6">
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
                            setAcademicYears([]);
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
                            onSelect={() => setSelectedDegree(degree)}
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
                    <Button variant="outline" className="flex justify-between w-full">
                      {selectedAcademicYear || "Select Academic Year"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuGroup>
                      {academicYears.length > 0 ? (
                        academicYears.map((year) => (
                          <DropdownMenuItem
                            key={year.uuid}
                            onSelect={() => setSelectedAcademicYear(year.name)}
                          >
                            {year.name}
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
                !selectedStream ||
                !selectedDegree ||
                !selectedAcademicYear ||
                !selectedSemester ||
                !numSemesters ||
                isNaN(numSemesters) ||
                parseInt(numSemesters) <= 0
              }
            >
              Create Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-semibold text-gray-800">Question Paper Management</h1>
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
                href="/admin/qp/courses"
                className="text-sm font-medium text-blue-600"
              >
                Courses
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
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
                <span>New Course</span>
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
                    <Checkbox />
                  </TableHead>
                  <TableHead className="font-medium">ID</TableHead>
                  <TableHead className="font-medium">Course Name</TableHead>
                  <TableHead className="font-medium">Course Code</TableHead>
                  <TableHead className="font-medium">Stream</TableHead>
                  <TableHead className="font-medium">Degree</TableHead>
                  <TableHead className="font-medium">Semester</TableHead>
                  <TableHead className="font-medium">Year</TableHead>
                  <TableHead className="font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <TableRow key={course.uuid} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell className="font-medium">{course.uuid}</TableCell>
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
                          onClick={() => handleToggleCourseStatus(course.uuid)}
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