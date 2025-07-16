"use client";

import {
<<<<<<< HEAD
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
=======
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
>>>>>>> 1a0c944 (Degree Module working properly)
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import {
<<<<<<< HEAD
  ChevronDown,
  CirclePlusIcon,
  Eye,
  FileDown,
  FileUp,
  Search,
  Pencil,
  Trash2,
  CalendarIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
=======
	ChevronDown,
	CirclePlusIcon,
	Eye,
	FileDown,
	FileUp,
	Search,
	Pencil,
	Trash2,
	CalendarIcon
} from "lucide-react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
>>>>>>> 1a0c944 (Degree Module working properly)
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import {
<<<<<<< HEAD
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
=======
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
>>>>>>> 1a0c944 (Degree Module working properly)
} from "@/components/ui/dialog";
import * as XLSX from "xlsx";

export default function SubjectManagementPage() {
<<<<<<< HEAD
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inputDialog, setInputDialog] = useState(false);
  const [combined, setCombined] = useState([]);
  const [streams, setStreams] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedCombined, setSelectedCombined] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectType, setSubjectType] = useState("");
  const [semester, setSemester] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [date, setDate] = useState(new Date("2025-06-01"));
  const [month, setMonth] = useState(date);
  const [value, setValue] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Format date for display
  const formatDate = useCallback((date) => {
    if (!date || !isValidDate(date)) return "";
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }, []);

  // Helper function for UUID generation
  const generateUUID = () =>
    [...Array(6)]
      .map(() => Math.random().toString(36)[2].toUpperCase())
      .join("");

  // Validate date
  const isValidDate = (date) => {
    return date && !isNaN(date?.getTime());
  };

  // Fetch all subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subjects`
        );
        const data = await res.json();
        if (res.ok) {
          setSubjects(data);
          setFilteredSubjects(data);
        } else {
          toast.error("Failed to load subjects.");
        }
      } catch (err) {
        toast.error(err.message);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch initial data (combined, streams, degrees, years, courses)
  useEffect(() => {
    const getData = async () => {
      try {
        const [combinedRes, streamRes, degreeRes, yearRes, courseRes] =
          await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/combineds`),
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams`),
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees`),
            fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years`
            ),
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/courses`),
          ]);

        if (combinedRes.ok && streamRes.ok && degreeRes.ok && yearRes.ok) {
          const [combinedData, streamData, degreeData, yearData, courseData] =
            await Promise.all([
              combinedRes.json(),
              streamRes.json(),
              degreeRes.json(),
              yearRes.json(),
              courseRes.json(),
            ]);

          setCombined(combinedData);
          setStreams(streamData);
          setDegrees(degreeData);
          setYears(yearData);
          setCourses(courseData);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };
    getData();
  }, []);

  // Fetch courses when combined is selected
  useEffect(() => {
    const getCourseByCombinedData = async () => {
      if (!selectedCombined?.course) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/courses/${selectedCombined.course}/combineds`
        );
        if (res.ok) {
          const data = await res.json();
          setCourses(Array.isArray(data) ? data : []);
        } else {
          toast.error("Failed to fetch courses");
        }
      } catch (error) {
        toast.error(error.message);
      }
    };
    getCourseByCombinedData();
  }, [selectedCombined]);

  // Apply filters whenever dependencies change
  useEffect(() => {
    let results = subjects;

    // Apply search filter
    if (searchTerm) {
      results = results.filter(
        (subject) =>
          subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subject.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply combined filter
    if (selectedCombined) {
      results = results.filter(
        (subject) => subject.combined === selectedCombined.uuid
      );
    }

    // Apply course filter
    if (selectedCourse) {
      results = results.filter(
        (subject) => subject.course === selectedCourse.uuid
      );
    }

    // Apply semester filter
    if (selectedSemester) {
      results = results.filter(
        (subject) => subject.semester === selectedSemester
      );
    }

    // Apply deactivated filter
    if (!showDeactivated) {
      results = results.filter((subject) => subject.isActive !== false);
    }

    setFilteredSubjects(results);
  }, [
    subjects,
    searchTerm,
    selectedCombined,
    selectedCourse,
    selectedSemester,
    showDeactivated,
  ]);

  // Create new subject
  const createSubject = async () => {
    if (!selectedCombined || !selectedCourse) {
      return toast.error("Please select Combined and Course.");
    }

    if (!subjectName || !subjectCode || !subjectType || !semester || !date) {
      return toast.error("Please fill all fields.");
    }

    try {
      const newSub = {
        name: subjectName,
        code: subjectCode,
        type: subjectType,
        semester: semester,
        exam: date.toISOString(),
        course: selectedCourse.uuid,
        combined: selectedCombined.uuid,
        uuid: [...Array(6)]
          .map(() => Math.random().toString(36)[2].toUpperCase())
          .join(""),
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subjects`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newSub),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success("Subject created successfully!");
        setSubjects((prev) => [...prev, data]);
        setIsDialogOpen(false);
        resetForm();
      } else {
        toast.error(data?.error || "Something went wrong.");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Reset form fields
  const resetForm = () => {
    setSubjectName("");
    setSubjectCode("");
    setSubjectType("");
    setSemester("");
    setSelectedCombined(null);
    setSelectedCourse(null);
    setDate(new Date("2025-06-01"));
    setValue("");
  };

  // New Export to Excel function
  const toExcel = () => {
    const dataToExport = filteredSubjects.map((subject) => {
      // 1. Find the exact combined record that matches this subject's combined reference
      const matchedCombined = combined.find((c) => c.uuid === subject.combined);

      // 2. Split the combined name into components if found
      let stream = "",
        degree = "",
        year = "";
      if (matchedCombined?.name) {
        const parts = matchedCombined.name.split("|").map((p) => p.trim());
        [stream, degree, year] = parts; // Destructure into components
      }

      // 3. Find the course name - check both uuid and _id
      const course = courses.find((c) => c.uuid === subject.course);
      const courseName = course?.name || "Unknown Course";

      // 4. Format the exam date safely
      let examDate = "";
      try {
        examDate = subject.exam
          ? formatDate(new Date(subject.exam))
          : "Not set";
      } catch {
        examDate = "Invalid date";
      }

      return {
        "Subject Name": subject.name,
        Code: subject.code,
        Type: subject.type,
        Semester: subject.semester?.toString() || "",
        "Exam Date": examDate,
        Course: courseName,
        Stream: stream,
        Degree: degree,
        Year: year,
      };
    });

    // Debug
    console.log(dataToExport);

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Subjects");
    XLSX.writeFile(workbook, "Subjects.xlsx");
  };

  // Download template
  const downloadTemplate = () => {
    const template = [
      {
        "Subject Name": "",
        Code: "",
        Type: "Compulsory/Elective / Optional",
        Semester: "",
        "Exam Date": "YYYY-MM-DD",
        Course: "",
        "Course Code": "",
        Stream: "",
        Degree: "",
        Year: "",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "Subject_Template.xlsx");
  };

  // New Import to Excel
  const importToExcel = async () => {
    if (!selectedFile) {
      toast.error("No file selected");
      return;
    }

    try {
      setIsLoading(true);

      // Read and parse Excel
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (!jsonData.length) {
        toast.error("The file is empty");
        return;
      }

      // Transform data
      const payload = jsonData.map((row) => ({
        name: row["Subject Name"]?.toString().trim() || "",
        code: row["Code"]?.toString().trim() || "",
        type: row["Type"]?.toString().trim() || "Compulsory",
        semester: row["Semester"]?.toString().trim() || "",
        exam: row["Exam Date"] ? formatExcelDate(row["Exam Date"]) : null,
        course: row["Course"]?.toString().trim() || "",
        courseCode: row["Course Code"]?.toString().trim() || "",
        stream: row["Stream"]?.toString().trim() || "",
        degree: row["Degree"]?.toString().trim() || "",
        year: row["Year"]?.toString().trim() || "",
        uuid: generateUUID(),
      }));

      // Send to backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subjects/bulk`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Import failed");

      // Update state
      if (result.created > 0) {
        // Refresh subjects instead of merging to avoid duplicates
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subjects`
        );
        const newSubjects = await res.json();
        setSubjects(newSubjects);

        toast.success(`Imported ${result.created} subjects`);
      }

      if (result.skipped > 0) {
        toast.info(`Skipped ${result.skipped} existing subjects`);
      }

      // Close dialog
      setInputDialog(false);
      setSelectedFile(null);
    } catch (error) {
      toast.error(`Import failed: ${error.message}`);
      console.error("Import error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Date formatting helper
  function formatExcelDate(dateValue) {
    if (typeof dateValue === "number") {
      // Excel date number to JS Date
      return new Date((dateValue - 25569) * 86400 * 1000);
    }
    if (typeof dateValue === "string") {
      // Try parsing various date formats
      return new Date(dateValue);
    }
    return null;
  }

  // Toggle subject status
  const handleToggleSubjectStatus = async (uuid) => {
    try {
      const subject = subjects.find((s) => s.uuid === uuid);
      if (!subject) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subjects/${uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: !subject.isActive }),
        }
      );

      if (res.ok) {
        setSubjects((prev) =>
          prev.map((s) =>
            s.uuid === uuid ? { ...s, isActive: !s.isActive } : s
          )
        );
        toast.success(
          `Subject ${
            subject.isActive ? "deactivated" : "activated"
          } successfully`
        );
      } else {
        toast.error("Failed to update subject status");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-100/50 p-6 flex-col gap-5">
      {/* Create Subject Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Subject</DialogTitle>
            <DialogDescription>Add new subject to the system</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {/* Combined dropdown */}
            <div className="space-y-2">
              <Label>Stream | Degree | Year</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedCombined?.name || "Select"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                  <DropdownMenuGroup>
                    {combined.map((el) => (
                      <DropdownMenuItem
                        key={el._id}
                        onSelect={() => setSelectedCombined(el)}
                        className="cursor-pointer"
                      >
                        {el.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Course dropdown */}
            <div className="space-y-2">
              <Label>Course Name</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    disabled={!selectedCombined}
                  >
                    {selectedCourse?.name || "Select"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                  <DropdownMenuGroup>
                    {courses.map((el) => (
                      <DropdownMenuItem
                        key={el._id}
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

            {/* Subject details */}
            <div className="space-y-2">
              <Label>Subject Name</Label>
              <Input
                placeholder="e.g Computer Science"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Subject Code</Label>
              <Input
                placeholder="e.g CS101"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Subject Type</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {subjectType || "Select"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onSelect={() => setSubjectType("Elective / Optional")}
                    >
                      Elective / Optional
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setSubjectType("Compulsory")}
                    >
                      Compulsory
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <Label>Semester/Trimester</Label>
              <Input
                type="number"
                placeholder="e.g 1"
                value={semester}
                min={1}
                max={selectedCourse?.semester}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (value <= 8) {
                    setSemester(e.target.value);
                  }
                }}
              />
            </div>

            {/* Exam date */}
            <div className="space-y-2 col-span-2">
              <Label>Exam Date</Label>
              <div className="relative flex gap-2">
                <Input
                  value={formatDate(date)}
                  placeholder="June 01, 2025"
                  className="bg-background pr-10"
                  readOnly
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                    >
                      <CalendarIcon className="size-3.5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createSubject}>Create Subject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={inputDialog} onOpenChange={setInputDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Subjects</DialogTitle>
            <DialogDescription>
              Upload an Excel file to import subjects
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="w-full gap-2"
            >
              <FileDown className="h-4 w-4" />
              Download Template
            </Button>
            <div className="space-y-2">
              <Label>Select Excel File</Label>
              <Input
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => setSelectedFile(e.target.files[0])} // Store file in state
                id="file-upload"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInputDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={importToExcel}
              disabled={!selectedFile} // Disable if no file selected
            >
              Import Excel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium">Question Paper Management</h1>
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
                <Link href="/admin/qp/subject">Subjects</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center flex-col md:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search subjects..."
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
                  onSelect={() => setIsDialogOpen(true)}
                  className="gap-2"
                >
                  <CirclePlusIcon className="h-4 w-4" />
                  New Subject
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={toExcel} className="gap-2">
                  <FileDown className="h-4 w-4" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setInputDialog(true)}
                  className="gap-2"
                >
                  <FileUp className="h-4 w-4" />
                  Import
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setShowDeactivated(!showDeactivated)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  {showDeactivated ? "Hide" : "Show"} Deactivated
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Advanced Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Stream | Degree | Year</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedCombined?.name || "All"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                  <DropdownMenuItem onSelect={() => setSelectedCombined(null)}>
                    All
                  </DropdownMenuItem>
                  {combined.map((el) => (
                    <DropdownMenuItem
                      key={el._id}
                      onSelect={() => setSelectedCombined(el)}
                    >
                      {el.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {selectedCombined && (
              <div className="space-y-2">
                <Label>Course</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      disabled={!selectedCombined}
                    >
                      {selectedCourse?.name || "All"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                    <DropdownMenuItem onSelect={() => setSelectedCourse(null)}>
                      All
                    </DropdownMenuItem>
                    {courses.map((el) => (
                      <DropdownMenuItem
                        key={el._id}
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
                <Label>Semester</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {selectedSemester || "All"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem onSelect={() => setSelectedSemester("")}>
                      All
                    </DropdownMenuItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <DropdownMenuItem
                        key={num}
                        onSelect={() => setSelectedSemester(num.toString())}
                      >
                        {num}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {selectedSemester && (
              <div className="space-y-2">
                <Label>Status</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
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

      {/* Subjects Table */}
      <Card className="flex-1 overflow-hidden">
        <div className="p-6 py-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">
              Subjects
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredSubjects.length}{" "}
                {showDeactivated ? "found" : "active"})
              </span>
            </h2>
          </div>

          <div className="rounded-md border overflow-y-scroll max-h-1/2 min-h-[90vh]">
            <Table className="">
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox />
                  </TableHead>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Exam Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredSubjects.length > 0 ? (
                  filteredSubjects.map((subject) => (
                    <TableRow key={subject.uuid} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell className="font-medium">
                        {subject.name}
                      </TableCell>
                      <TableCell>{subject.code}</TableCell>
                      <TableCell>{subject.type}</TableCell>
                      <TableCell>{subject.semester}</TableCell>
                      <TableCell>
                        {formatDate(new Date(subject.exam))}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            subject.isActive === false
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {subject.isActive === false
                            ? "Deactivated"
                            : "Active"}
                        </span>
                      </TableCell>
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
                            subject.isActive === false
                              ? "text-green-600 hover:bg-green-50"
                              : "text-red-600 hover:bg-red-50"
                          }`}
                          onClick={() =>
                            handleToggleSubjectStatus(subject.uuid)
                          }
                        >
                          {subject.isActive === false ? (
                            <>
                              <CirclePlusIcon className="h-3.5 w-3.5" />
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
                    <TableCell colSpan={8} className="h-24 text-center">
                      No subjects found
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
=======
	// State management
	const [searchTerm, setSearchTerm] = useState('');
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingSubject, setEditingSubject] = useState(null);
	const [inputDialog, setInputDialog] = useState(false);
	const [combined, setCombined] = useState([]);
	const [streams, setStreams] = useState([]);
	const [degrees, setDegrees] = useState([]);
	const [years, setYears] = useState([]);
	const [selectedCombined, setSelectedCombined] = useState(null);
	const [courses, setCourses] = useState([]);
	const [selectedCourse, setSelectedCourse] = useState(null);
	const [selectedSemester, setSelectedSemester] = useState('');
	const [subjectName, setSubjectName] = useState('');
	const [subjectCode, setSubjectCode] = useState('');
	const [subjectType, setSubjectType] = useState('');
	const [semester, setSemester] = useState('');
	const [subjects, setSubjects] = useState([]);
	const [filteredSubjects, setFilteredSubjects] = useState([]);
	const [showDeactivated, setShowDeactivated] = useState(false);
	const [date, setDate] = useState(new Date("2025-06-01"));
	const [month, setMonth] = useState(date);
	const [value, setValue] = useState('');
	const [selectedFile, setSelectedFile] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	// Format date for display
	const formatDate = useCallback((date) => {
		if (!date || !isValidDate(date)) return "";
		return date.toLocaleDateString("en-US", {
			day: "2-digit",
			month: "long",
			year: "numeric",
		});
	}, []);

	// Helper function for UUID generation
	const generateUUID = () => [...Array(6)].map(() => Math.random().toString(36)[2].toUpperCase()).join("");

	// Validate date
	const isValidDate = (date) => {
		return date && !isNaN(date?.getTime());
	};

	// Fetch all subjects
	useEffect(() => {
		const fetchSubjects = async () => {
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subjects`);
				const data = await res.json();
				if (res.ok) {
					setSubjects(data);
					setFilteredSubjects(data);
				} else {
					toast.error("Failed to load subjects.");
				}
			} catch (err) {
				toast.error(err.message);
			}
		};
		fetchSubjects();
	}, []);

	// Fetch initial data (combined, streams, degrees, years, courses)
	useEffect(() => {
		const getData = async () => {
			try {
				const [combinedRes, streamRes, degreeRes, yearRes, courseRes] = await Promise.all([
					fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/combineds`),
					fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams`),
					fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees`),
					fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years`),
					fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/courses`)
				]);

				if (combinedRes.ok && streamRes.ok && degreeRes.ok && yearRes.ok) {
					const [combinedData, streamData, degreeData, yearData, courseData] = await Promise.all([
						combinedRes.json(),
						streamRes.json(),
						degreeRes.json(),
						yearRes.json(),
						courseRes.json(),
					]);

					setCombined(combinedData);
					setStreams(streamData);
					setDegrees(degreeData);
					setYears(yearData);
					setCourses(courseData);
				}
			} catch (error) {
				toast.error(error.message);
			}
		}
		getData();
	}, []);

	// Fetch courses when combined is selected
	useEffect(() => {
		const getCourseByCombinedData = async () => {
			if (!selectedCombined?.course) return;

			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/courses/${selectedCombined.course}/combineds`);
				if (res.ok) {
					const data = await res.json();
					setCourses(Array.isArray(data) ? data : []);
				} else {
					toast.error("Failed to fetch courses");
				}
			} catch (error) {
				toast.error(error.message);
			}
		};
		getCourseByCombinedData();
	}, [selectedCombined]);

	// Apply filters whenever dependencies change
	useEffect(() => {
		let results = subjects;

		// Apply search filter
		if (searchTerm) {
			results = results.filter(subject =>
				subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				subject.code.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		// Apply combined filter
		if (selectedCombined) {
			results = results.filter(subject => subject.combined === selectedCombined.uuid);
		}

		// Apply course filter
		if (selectedCourse) {
			results = results.filter(subject => subject.course === selectedCourse.uuid);
		}

		// Apply semester filter
		if (selectedSemester) {
			results = results.filter(subject => subject.semester === selectedSemester);
		}

		// Apply deactivated filter
		if (!showDeactivated) {
			results = results.filter(subject => subject.isActive !== false);
		}

		setFilteredSubjects(results);
	}, [subjects, searchTerm, selectedCombined, selectedCourse, selectedSemester, showDeactivated]);

	// Create new subject
	const createSubject = async () => {
		if (!selectedCombined || !selectedCourse) {
			return toast.error("Please select Combined and Course.");
		}

		if (!subjectName || !subjectCode || !subjectType || !semester || !date) {
			return toast.error("Please fill all fields.");
		}

		try {
			const newSub = {
				name: subjectName,
				code: subjectCode,
				type: subjectType,
				semester: semester,
				exam: date.toISOString(),
				course: selectedCourse.uuid,
				combined: selectedCombined.uuid,
				uuid: generateUUID(),
			};

			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subjects`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(newSub),
			});

			const data = await res.json();
			if (res.ok) {
				toast.success("Subject created successfully!");
				setSubjects(prev => [...prev, data]);
				setIsDialogOpen(false);
				resetForm();
			} else {
				toast.error(data?.error || "Something went wrong.");
			}
		} catch (err) {
			toast.error(err.message);
		}
	};

	// Edit subject
	const editSubject = async () => {
		if (!editingSubject) return;

		if (!selectedCombined || !selectedCourse) {
			return toast.error("Please select Combined and Course.");
		}

		if (!subjectName || !subjectCode || !subjectType || !semester || !date) {
			return toast.error("Please fill all fields.");
		}

		try {
			const updatedSubject = {
				name: subjectName,
				code: subjectCode,
				type: subjectType,
				semester: semester,
				exam: date.toISOString(),
				course: selectedCourse.uuid,
				combined: selectedCombined.uuid,
				isActive: editingSubject.isActive
			};

			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subjects/${editingSubject.uuid}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(updatedSubject),
			});

			const data = await res.json();
			if (res.ok) {
				toast.success("Subject updated successfully!");
				setSubjects(prev => prev.map(s => s.uuid === editingSubject.uuid ? { ...s, ...data } : s));
				setIsEditDialogOpen(false);
				resetForm();
			} else {
				toast.error(data?.error || "Something went wrong.");
			}
		} catch (err) {
			toast.error(err.type);
		}
	};

	// Handle edit button click
	const handleEditSubject = (subject) => {
		setEditingSubject(subject);
		setSubjectName(subject.name);
		setSubjectCode(subject.code);
		setSubjectType(subject.type);
		setSemester(subject.semester.toString());
		setDate(new Date(subject.exam));
		setSelectedCombined(combined.find(c => c.uuid === subject.combined) || null);
		setSelectedCourse(courses.find(c => c.uuid === subject.course) || null);
		setIsEditDialogOpen(true);
	};

	// Reset form fields
	const resetForm = () => {
		setSubjectName('');
		setSubjectCode('');
		setSubjectType('');
		setSemester('');
		setSelectedCombined(null);
		setSelectedCourse(null);
		setDate(new Date("2025-06-01"));
		setValue('');
		setEditingSubject(null);
	};

	// New Export to Excel function
	const toExcel = () => {
		const dataToExport = filteredSubjects.map(subject => {
			const matchedCombined = combined.find(c => c.uuid === subject.combined);
			let stream = '', degree = '', year = '';
			if (matchedCombined?.name) {
				const parts = matchedCombined.name.split('|').map(p => p.trim());
				[stream, degree, year] = parts;
			}

			const course = courses.find(c => c.uuid === subject.course);
			const courseName = course?.name || 'Unknown Course';

			let examDate = '';
			try {
				examDate = subject.exam ? formatDate(new Date(subject.exam)) : 'Not set';
			} catch {
				examDate = 'Invalid date';
			}

			return {
				'Subject Name': subject.name,
				'Code': subject.code,
				'Type': subject.type,
				'Semester': subject.semester?.toString() || '',
				'Exam Date': examDate,
				'Course': courseName,
				'Stream': stream,
				'Degree': degree,
				'Year': year
			};
		});

		const worksheet = XLSX.utils.json_to_sheet(dataToExport);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Subjects");
		XLSX.writeFile(workbook, "Subjects.xlsx");
	}

	// Download template
	const downloadTemplate = () => {
		const template = [{
			'Subject Name': '',
			'Code': '',
			'Type': 'Compulsory/Elective / Optional',
			'Semester': '',
			'Exam Date': 'YYYY-MM-DD',
			'Course': '',
			'Course Code': '',
			'Stream': '',
			'Degree': '',
			'Year': ''
		}];

		const worksheet = XLSX.utils.json_to_sheet(template);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
		XLSX.writeFile(workbook, "Subject_Template.xlsx");
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
			const workbook = XLSX.read(data, { type: 'array' });
			const worksheet = workbook.Sheets[workbook.SheetNames[0]];
			const jsonData = XLSX.utils.sheet_to_json(worksheet);

			if (!jsonData.length) {
				toast.error("The file is empty");
				return;
			}

			const payload = jsonData.map(row => ({
				name: row['Subject Name']?.toString().trim() || '',
				code: row['Code']?.toString().trim() || '',
				type: row['Type']?.toString().trim() || 'Compulsory',
				semester: row['Semester']?.toString().trim() || '',
				exam: row['Exam Date'] ? formatExcelDate(row['Exam Date']) : null,
				course: row['Course']?.toString().trim() || '',
				courseCode: row['Course Code']?.toString().trim() || '',
				stream: row['Stream']?.toString().trim() || '',
				degree: row['Degree']?.toString().trim() || '',
				year: row['Year']?.toString().trim() || '',
				uuid: generateUUID()
			}));

			const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subjects/bulk`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			const result = await response.json();

			if (!response.ok) throw new Error(result.error || 'Import failed');

			if (result.created > 0) {
				const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subjects`);
				const newSubjects = await res.json();
				setSubjects(newSubjects);
				toast.success(`Imported ${result.created} subjects`);
			}

			if (result.skipped > 0) {
				toast.info(`Skipped ${result.skipped} existing subjects`);
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

	// Date formatting helper
	function formatExcelDate(dateValue) {
		if (typeof dateValue === 'number') {
			return new Date((dateValue - 25569) * 86400 * 1000);
		}
		if (typeof dateValue === 'string') {
			return new Date(dateValue);
		}
		return null;
	}

	// Toggle subject status
	const handleToggleSubjectStatus = async (uuid) => {
		try {
			const subject = subjects.find(s => s.uuid === uuid);
			if (!subject) return;

			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subjects/${uuid}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ isActive: !subject.isActive }),
			});

			if (res.ok) {
				setSubjects(prev => prev.map(s =>
					s.uuid === uuid ? { ...s, isActive: !s.isActive } : s
				));
				toast.success(`Subject ${subject.isActive ? 'deactivated' : 'activated'} successfully`);
			} else {
				toast.error("Failed to update subject status");
			}
		} catch (error) {
			toast.error(error.message);
		}
	};

	return (
		<div className="flex h-screen w-full bg-gray-100/50 p-6 flex-col gap-5">
			{/* Create Subject Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Create New Subject</DialogTitle>
						<DialogDescription>Add new subject to the system</DialogDescription>
					</DialogHeader>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label>Stream | Degree | Year</Label>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" className="w-full justify-between">
										{selectedCombined?.name || 'Select'}
										<ChevronDown className="ml-2 h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
									<DropdownMenuGroup>
										{combined.map(el => (
											<DropdownMenuItem
												key={el._id}
												onSelect={() => setSelectedCombined(el)}
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
							<Label>Course Name</Label>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										className="w-full justify-between"
										disabled={!selectedCombined}
									>
										{selectedCourse?.name || 'Select'}
										<ChevronDown className="ml-2 h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
									<DropdownMenuGroup>
										{courses.map(el => (
											<DropdownMenuItem
												key={el._id}
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
							<Label>Subject Name</Label>
							<Input
								placeholder="e.g Computer Science"
								value={subjectName}
								onChange={(e) => setSubjectName(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label>Subject Code</Label>
							<Input
								placeholder="e.g CS101"
								value={subjectCode}
								onChange={(e) => setSubjectCode(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label>Subject Type</Label>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" className="w-full justify-between">
										{subjectType || 'Select'}
										<ChevronDown className="ml-2 h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuGroup>
										<DropdownMenuItem onSelect={() => setSubjectType("Elective / Optional")}>
											Elective / Optional
										</DropdownMenuItem>
										<DropdownMenuItem onSelect={() => setSubjectType("Compulsory")}>
											Compulsory
										</DropdownMenuItem>
									</DropdownMenuGroup>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						<div className="space-y-2">
							<Label>Semester/Trimester</Label>
							<Input
								type="number"
								placeholder="e.g 1"
								value={semester}
								min={1}
								max={selectedCourse?.semester}
								onChange={e => {
									const value = parseInt(e.target.value, 10);
									if (value <= 8) {
										setSemester(e.target.value);
									}
								}}
							/>
						</div>

						<div className="space-y-2 col-span-2">
							<Label>Exam Date</Label>
							<div className="relative flex gap-2">
								<Input
									value={formatDate(date)}
									placeholder="June 01, 2025"
									className="bg-background pr-10"
									readOnly
								/>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="ghost"
											className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
										>
											<CalendarIcon className="size-3.5" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="end">
										<Calendar
											mode="single"
											selected={date}
											onSelect={setDate}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
						<Button onClick={createSubject}>Create Subject</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit Subject Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Edit Subject</DialogTitle>
						<DialogDescription>Update subject details</DialogDescription>
					</DialogHeader>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label>Stream | Degree | Year</Label>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" className="w-full justify-between">
										{selectedCombined?.name || 'Select'}
										<ChevronDown className="ml-2 h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
									<DropdownMenuGroup>
										{combined.map(el => (
											<DropdownMenuItem
												key={el._id}
												onSelect={() => setSelectedCombined(el)}
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
							<Label>Course Name</Label>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										className="w-full justify-between"
										disabled={!selectedCombined}
									>
										{selectedCourse?.name || 'Select'}
										<ChevronDown className="ml-2 h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
									<DropdownMenuGroup>
										{courses.map(el => (
											<DropdownMenuItem
												key={el._id}
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
							<Label>Subject Name</Label>
							<Input
								placeholder="e.g Computer Science"
								value={subjectName}
								onChange={(e) => setSubjectName(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label>Subject Code</Label>
							<Input
								placeholder="e.g CS101"
								value={subjectCode}
								onChange={(e) => setSubjectCode(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label>Subject Type</Label>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" className="w-full justify-between">
										{subjectType || 'Select'}
										<ChevronDown className="ml-2 h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuGroup>
										<DropdownMenuItem onSelect={() => setSubjectType("Elective / Optional")}>
											Elective / Optional
										</DropdownMenuItem>
										<DropdownMenuItem onSelect={() => setSubjectType("Compulsory")}>
											Compulsory
										</DropdownMenuItem>
									</DropdownMenuGroup>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						<div className="space-y-2">
							<Label>Semester/Trimester</Label>
							<Input
								type="number"
								placeholder="e.g 1"
								value={semester}
								min={1}
								max={selectedCourse?.semester}
								onChange={e => {
									const value = parseInt(e.target.value, 10);
									if (value <= 8) {
										setSemester(e.target.value);
									}
								}}
							/>
						</div>

						<div className="space-y-2 col-span-2">
							<Label>Exam Date</Label>
							<div className="relative flex gap-2">
								<Input
									value={formatDate(date)}
									placeholder="June 01, 2025"
									className="bg-background pr-10"
									readOnly
								/>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="ghost"
											className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
										>
											<CalendarIcon className="size-3.5" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="end">
										<Calendar
											mode="single"
											selected={date}
											onSelect={setDate}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
						<Button onClick={editSubject}>Update Subject</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Import Dialog */}
			<Dialog open={inputDialog} onOpenChange={setInputDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Import Subjects</DialogTitle>
						<DialogDescription>
							Upload an Excel file to import subjects
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<Button
							variant="outline"
							onClick={downloadTemplate}
							className="w-full gap-2"
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
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setInputDialog(false)}>
							Cancel
						</Button>
						<Button
							onClick={importToExcel}
							disabled={!selectedFile}
						>
							Import Excel
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Header */}
			<div className="flex flex-col gap-2">
				<h1 className="text-2xl font-medium">Question Paper Management</h1>
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
								<Link href="/admin/qp/subject">Subjects</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
			</div>

			{/* Filters and Actions */}
			<div className="flex flex-col gap-4">
				<div className="flex justify-between items-center flex-col md:flex-row gap-4">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
						<Input
							placeholder="Search subjects..."
							className="pl-9 bg-white"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
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
								<DropdownMenuItem onSelect={() => setIsDialogOpen(true)} className="gap-2">
									<CirclePlusIcon className="h-4 w-4" />
									New Subject
								</DropdownMenuItem>
								<DropdownMenuItem onSelect={toExcel} className="gap-2">
									<FileDown className="h-4 w-4" />
									Export
								</DropdownMenuItem>
								<DropdownMenuItem onSelect={() => setInputDialog(true)} className="gap-2">
									<FileUp className="h-4 w-4" />
									Import
								</DropdownMenuItem>
								<DropdownMenuItem
									onSelect={() => setShowDeactivated(!showDeactivated)}
									className="gap-2"
								>
									<Eye className="h-4 w-4" />
									{showDeactivated ? 'Hide' : 'Show'} Deactivated
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<div className="flex flex-col md:flex-row gap-4">
					<div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
						<div className="space-y-2">
							<Label>Stream | Degree | Year</Label>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" className="w-full justify-between">
										{selectedCombined?.name || 'All'}
										<ChevronDown className="ml-2 h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
									<DropdownMenuItem onSelect={() => setSelectedCombined(null)}>
										All
									</DropdownMenuItem>
									{combined.map(el => (
										<DropdownMenuItem
											key={el._id}
											onSelect={() => setSelectedCombined(el)}
										>
											{el.name}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						{selectedCombined && <div className="space-y-2">
							<Label>Course</Label>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										className="w-full justify-between"
										disabled={!selectedCombined}
									>
										{selectedCourse?.name || 'All'}
										<ChevronDown className="ml-2 h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
									<DropdownMenuItem onSelect={() => setSelectedCourse(null)}>
										All
									</DropdownMenuItem>
									{courses.map(el => (
										<DropdownMenuItem
											key={el._id}
											onSelect={() => setSelectedCourse(el)}
										>
											{el.name}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>}

						{selectedCourse && <div className="space-y-2">
							<Label>Semester</Label>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" className="w-full justify-between">
										{selectedSemester || 'All'}
										<ChevronDown className="ml-2 h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-full">
									<DropdownMenuItem onSelect={() => setSelectedSemester('')}>
										All
									</DropdownMenuItem>
									{[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
										<DropdownMenuItem
											key={num}
											onSelect={() => setSelectedSemester(num.toString())}
										>
											{num}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>}

						{selectedSemester && <div className="space-y-2">
							<Label>Status</Label>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" className="w-full justify-between">
										{showDeactivated ? 'All' : 'Active Only'}
										<ChevronDown className="ml-2 h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-full">
									<DropdownMenuItem onSelect={() => setShowDeactivated(false)}>
										Active Only
									</DropdownMenuItem>
									<DropdownMenuItem onSelect={() => setShowDeactivated(true)}>
										Show All
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>}
					</div>
				</div>
			</div>

			{/* Subjects Table */}
			<Card className="flex-1 overflow-hidden">
				<div className="p-6 py-0">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-lg font-semibold">
							Subjects
							<span className="text-sm font-normal text-gray-500 ml-2">
								({filteredSubjects.length} {showDeactivated ? 'found' : 'active'})
							</span>
						</h2>
					</div>

					<div className="rounded-md border overflow-y-scroll min-h-[45vh] max-h-[80vh]">
						<Table>
							<TableHeader className="bg-gray-50">
								<TableRow>
									<TableHead className="w-12">
										<Checkbox />
									</TableHead>
									<TableHead>Subject Name</TableHead>
									<TableHead>Code</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Semester</TableHead>
									<TableHead>Exam Date</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>

							<TableBody>
								{filteredSubjects.length > 0 ? (
									filteredSubjects.map((subject) => (
										<TableRow key={subject.uuid} className="hover:bg-gray-50">
											<TableCell>
												<Checkbox />
											</TableCell>
											<TableCell className="font-medium">{subject.name}</TableCell>
											<TableCell>{subject.code}</TableCell>
											<TableCell>{subject.type}</TableCell>
											<TableCell>{subject.semester}</TableCell>
											<TableCell>{formatDate(new Date(subject.exam))}</TableCell>
											<TableCell>
												<span className={`px-2 py-1 rounded-full text-xs ${subject.isActive === false
													? 'bg-red-100 text-red-800'
													: 'bg-green-100 text-green-800'
													}`}>
													{subject.isActive === false ? 'Deactivated' : 'Active'}
												</span>
											</TableCell>
											<TableCell className="flex justify-end gap-2">
												<Button
													size="sm"
													variant="outline"
													className="h-8 gap-1 text-gray-700 hover:bg-gray-100"
													onClick={() => handleEditSubject(subject)}
												>
													<Pencil className="h-3.5 w-3.5" />
													<span>Edit</span>
												</Button>
												<Button
													size="sm"
													variant="outline"
													className={`h-8 gap-1 ${subject.isActive === false
														? 'text-green-600 hover:bg-green-50'
														: 'text-red-600 hover:bg-red-50'
														}`}
													onClick={() => handleToggleSubjectStatus(subject.uuid)}
												>
													{subject.isActive === false ? (
														<>
															<CirclePlusIcon className="h-3.5 w-3.5" />
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
										<TableCell colSpan={8} className="h-24 text-center">
											No subjects found
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
>>>>>>> 1a0c944 (Degree Module working properly)
