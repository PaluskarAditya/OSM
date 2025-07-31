"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
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
  CalendarIcon,
  CheckCircle2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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

export default function SubjectManagementPage() {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [inputDialog, setInputDialog] = useState(false);
  const [combined, setCombined] = useState([]);
  const [streams, setStreams] = useState([]);
  const [streamMap, setStreamMap] = useState({});
  const [degrees, setDegrees] = useState([]);
  const [degreeMap, setDegreeMap] = useState({});
  const [years, setYears] = useState([]);
  const [academicYearMap, setAcademicYearMap] = useState({});
  const [courses, setCourses] = useState([]);
  const [courseMap, setCourseMap] = useState({});
  const [selectedCombined, setSelectedCombined] = useState(null);
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function for UUID generation
  const generateUUID = () =>
    [...Array(6)]
      .map(() => Math.random().toString(36)[2].toUpperCase())
      .join("");

  // Validate date
  const isValidDate = (date) => date && !isNaN(date?.getTime());

  // Format date for display
  const formatDate = useCallback((date) => {
    if (!isValidDate(date)) return "";
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }, []);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const endpoints = [
        "/subjects",
        "/combineds",
        "/streams",
        "/degrees",
        "/academic-years",
        "/courses",
      ];
      const responses = await Promise.all(
        endpoints.map((endpoint) =>
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1${endpoint}`)
        )
      );

      const [
        subjectsData,
        combinedData,
        streamData,
        degreeData,
        yearData,
        courseData,
      ] = await Promise.all(responses.map((res) => res.json()));

      const newStreamMap = Object.fromEntries(
        streamData.map((stream) => [
          stream.uuid,
          { name: stream.name, isActive: stream.isActive !== false },
        ])
      );
      const newDegreeMap = Object.fromEntries(
        degreeData.map((degree) => [
          degree.uuid,
          { name: degree.name, isActive: degree.isActive !== false },
        ])
      );
      const newAcademicYearMap = Object.fromEntries(
        yearData.map((year) => [
          year.uuid,
          { year: year.year, isActive: year.isActive !== false },
        ])
      );
      const newCourseMap = Object.fromEntries(
        courseData.map((course) => [
          course.uuid,
          {
            name: course.name,
            isActive: course.isActive !== false,
            numSemesters: course.numSemesters || 8,
          },
        ])
      );
      const filteredCombined = combinedData.filter(
        (c) =>
          newStreamMap[c.stream]?.isActive !== false &&
          newDegreeMap[c.degree]?.isActive !== false &&
          newAcademicYearMap[c.academicYear]?.isActive !== false
      );
      const filteredSubjects = subjectsData.filter((subject) => {
        const combinedEntry = combinedData.find(
          (c) => c.uuid === subject.combined
        );
        return (
          combinedEntry &&
          newStreamMap[combinedEntry.stream]?.isActive !== false &&
          newDegreeMap[combinedEntry.degree]?.isActive !== false &&
          newAcademicYearMap[combinedEntry.academicYear]?.isActive !== false &&
          newCourseMap[subject.course]?.isActive !== false
        );
      });
      const filteredCourses = courseData.filter((course) => {
        const courseCombined = combinedData.find(
          (c) => c.course === course.uuid
        );
        return (
          courseCombined &&
          newStreamMap[courseCombined.stream]?.isActive !== false &&
          newDegreeMap[courseCombined.degree]?.isActive !== false &&
          newAcademicYearMap[courseCombined.academicYear]?.isActive !== false
        );
      });
      const filteredYears = yearData.filter(
        (year) =>
          newStreamMap[year.streamUuid]?.isActive !== false &&
          newDegreeMap[year.degree]?.isActive !== false
      );

      setStreamMap(newStreamMap);
      setDegreeMap(newDegreeMap);
      setAcademicYearMap(newAcademicYearMap);
      setCourseMap(newCourseMap);
      setSubjects(filteredSubjects);
      setFilteredSubjects(filteredSubjects);
      setCombined(filteredCombined);
      setStreams(streamData);
      setDegrees(degreeData);
      setYears(filteredYears);
      setCourses(filteredCourses);
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

  // Fetch courses when combined is selected
  const fetchCourses = useCallback(
    async (combinedId, currentSubjectCourse = null, isEditing = false) => {
      if (!combinedId) {
        setCourses([]);
        setSelectedCourse(null);
        return;
      }
      setIsLoading(true);
      try {
        // Fetch courses associated with the combined ID
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/courses?combined=${combinedId}`
        );
        if (res.ok) {
          let data = await res.json();
          let filteredCourses = Array.isArray(data)
            ? data.filter((course) => {
                const courseCombined = combined.find(
                  (c) => c.course === course.uuid && c.uuid === combinedId
                );
                // For editing, include the current subject course even if inactive
                return isEditing && course.uuid === currentSubjectCourse
                  ? true
                  : courseCombined &&
                      streamMap[courseCombined.stream]?.isActive !== false &&
                      degreeMap[courseCombined.degree]?.isActive !== false &&
                      academicYearMap[courseCombined.academicYear]?.isActive !==
                        false &&
                      courseMap[course.uuid]?.isActive !== false;
              })
            : [];

          // If editing and the current course isn't in the filtered list, fetch it directly
          if (
            isEditing &&
            currentSubjectCourse &&
            !filteredCourses.some((c) => c.uuid === currentSubjectCourse)
          ) {
            try {
              const courseRes = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/courses/${currentSubjectCourse}`
              );
              if (courseRes.ok) {
                const courseData = await courseRes.json();
                filteredCourses = [...filteredCourses, courseData];
              }
            } catch (err) {
              console.warn(
                `Could not fetch course ${currentSubjectCourse}: ${err.message}`
              );
            }
          }

          setCourses(filteredCourses);

          // Set selectedCourse to the current subject's course if editing
          if (isEditing && currentSubjectCourse) {
            const matchingCourse = filteredCourses.find(
              (c) => c.uuid === currentSubjectCourse
            );
            setSelectedCourse(matchingCourse || null);
          } else {
            setSelectedCourse(null);
          }
        } else {
          toast.error("Failed to fetch courses");
          setCourses([]);
          setSelectedCourse(null);
        }
      } catch (error) {
        toast.error(error.message);
        setCourses([]);
        setSelectedCourse(null);
      } finally {
        setIsLoading(false);
      }
    },
    [combined, streamMap, degreeMap, academicYearMap, courseMap]
  );

  // Apply filters
  useEffect(() => {
    let results = subjects;
    if (searchTerm) {
      results = results.filter(
        (subject) =>
          subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subject.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCombined) {
      results = results.filter(
        (subject) => subject.combined === selectedCombined.uuid
      );
    }
    if (selectedCourse) {
      results = results.filter(
        (subject) => subject.course === selectedCourse.uuid
      );
    }
    if (selectedSemester) {
      results = results.filter(
        (subject) => subject.semester === selectedSemester
      );
    }
    if (!showDeactivated) {
      results = results.filter((subject) => {
        const combinedEntry = combined.find((c) => c.uuid === subject.combined);
        return (
          subject.isActive !== false &&
          combinedEntry &&
          streamMap[combinedEntry.stream]?.isActive !== false &&
          degreeMap[combinedEntry.degree]?.isActive !== false &&
          academicYearMap[combinedEntry.academicYear]?.isActive !== false &&
          courseMap[subject.course]?.isActive !== false
        );
      });
    }
    setFilteredSubjects(results);
  }, [
    subjects,
    searchTerm,
    selectedCombined,
    selectedCourse,
    selectedSemester,
    showDeactivated,
    combined,
    streamMap,
    degreeMap,
    academicYearMap,
    courseMap,
  ]);

  // Form validation
  const validateForm = () => {
    if (!selectedCombined || !selectedCourse) {
      toast.error("Please select Combined and Course.");
      return false;
    }
    if (!subjectName || !subjectCode || !subjectType || !semester || !date) {
      toast.error("Please fill all fields.");
      return false;
    }
    if (
      parseInt(semester) > (courseMap[selectedCourse?.uuid]?.numSemesters || 8)
    ) {
      toast.error(
        `Semester cannot exceed ${
          courseMap[selectedCourse?.uuid]?.numSemesters || 8
        } for the selected course.`
      );
      return false;
    }
    return true;
  };

  // Create new subject
  const createSubject = async () => {
    if (!validateForm()) return;
    try {
      setIsLoading(true);
      const newSub = {
        name: subjectName.trim(),
        code: subjectCode.trim(),
        type: subjectType,
        semester: semester,
        exam: date.toISOString(),
        course: selectedCourse.uuid,
        combined: selectedCombined.uuid,
        uuid: generateUUID(),
        isActive: true,
      };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subjects`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSub),
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Subject created successfully!");
        setSubjects((prev) => [...prev, data]);
        setFilteredSubjects((prev) => [...prev, data]);
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

  // Edit subject
  const editSubject = async () => {
    if (!editingSubject || !validateForm()) return;
    try {
      setIsLoading(true);
      const updatedSubject = {
        name: subjectName.trim(),
        code: subjectCode.trim(),
        type: subjectType,
        semester: semester,
        exam: date.toISOString(),
        course: selectedCourse.uuid,
        combined: selectedCombined.uuid,
        isActive: editingSubject.isActive,
      };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subjects/${editingSubject.uuid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedSubject),
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Subject updated successfully!");
        setSubjects((prev) =>
          prev.map((s) =>
            s.uuid === editingSubject.uuid ? { ...s, ...data } : s
          )
        );
        setFilteredSubjects((prev) =>
          prev.map((s) =>
            s.uuid === editingSubject.uuid ? { ...s, ...data } : s
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
    setSubjectName("");
    setSubjectCode("");
    setSubjectType("");
    setSemester("");
    setSelectedCombined(null);
    setSelectedCourse(null);
    setDate(new Date("2025-06-01"));
    setMonth(new Date("2025-06-01"));
    setEditingSubject(null);
    setCourses([]);
  };

  // Export to Excel
  const toExcel = () => {
    const dataToExport = filteredSubjects.map((subject) => {
      const matchedCombined = combined.find((c) => c.uuid === subject.combined);
      let stream = "",
        degree = "",
        year = "";
      if (matchedCombined?.name) {
        [stream, degree, year] = matchedCombined.name
          .split("|")
          .map((p) => p.trim());
      }
      const course = courseMap[subject.course] || { name: "Unknown Course" };
      return {
        "Subject Name": subject.name,
        Code: subject.code,
        Type: subject.type,
        Semester: subject.semester?.toString() || "",
        "Exam Date": subject.exam
          ? formatDate(new Date(subject.exam))
          : "Not set",
        Course: course.name,
        Stream: stream,
        Degree: degree,
        Year: year,
      };
    });
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

  // Import to Excel
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
      if (result.created > 0) {
        await fetchData();
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
    if (typeof dateValue === "number") {
      return new Date((dateValue - 25569) * 86400 * 1000);
    }
    if (typeof dateValue === "string") {
      const dateStr = dateValue.trim();
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split("-");
        return new Date(`${year}-${month}-${day}`);
      }
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) return parsedDate;
    }
    return null;
  }

  // Toggle subject status
  const handleToggleSubjectStatus = async (uuid) => {
    try {
      setIsLoading(true);
      const subject = subjects.find((s) => s.uuid === uuid);
      if (!subject) return;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subjects/${uuid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !subject.isActive }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setSubjects((prev) =>
          prev.map((s) => (s.uuid === uuid ? { ...s, ...data } : s))
        );
        setFilteredSubjects((prev) =>
          prev.map((s) => (s.uuid === uuid ? { ...s, ...data } : s))
        );
        toast.success(
          `Subject ${
            subject.isActive ? "deactivated" : "activated"
          } successfully`
        );
      } else {
        const errorData = await res.json();
        toast.error(errorData?.error || "Failed to update subject status");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
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
    const combinedEntry = combined.find((c) => c.uuid === subject.combined);
    setSelectedCombined(combinedEntry || null);
    // Set initial selectedCourse from courseMap if available
    const courseEntry = courseMap[subject.course]
      ? { uuid: subject.course, name: courseMap[subject.course].name }
      : null;
    setSelectedCourse(courseEntry);
    setIsEditDialogOpen(true);
  };

  // Fetch courses whenever selectedCombined changes
  useEffect(() => {
    if (!selectedCombined?.uuid) {
      setCourses([]);
      setSelectedCourse(null);
      return;
    }
    // Pass isEditing: true when editingSubject exists
    fetchCourses(
      selectedCombined.uuid,
      editingSubject?.course,
      !!editingSubject
    );
  }, [selectedCombined, editingSubject, fetchCourses]);

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="flex w-full bg-gray-100/50 p-6 flex-col gap-5">
      {/* Create Subject Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) resetForm();
          setIsDialogOpen(open);
        }}
      >
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
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    disabled={isLoading}
                  >
                    {selectedCombined?.name || "Select"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                  <DropdownMenuGroup>
                    {combined
                      .filter(
                        (c) =>
                          streamMap[c.stream]?.isActive !== false &&
                          degreeMap[c.degree]?.isActive !== false &&
                          academicYearMap[c.academicYear]?.isActive !== false
                      )
                      .map((el) => (
                        <DropdownMenuItem
                          key={el.uuid}
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
                    disabled={!selectedCombined || isLoading}
                  >
                    {selectedCourse?.name || "Select"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                  <DropdownMenuGroup>
                    {courses.length > 0 ? (
                      courses
                        .filter((c) => courseMap[c.uuid]?.isActive !== false)
                        .map((el) => (
                          <DropdownMenuItem
                            key={el.uuid}
                            onSelect={() => setSelectedCourse(el)}
                            className="cursor-pointer"
                          >
                            {el.name}
                          </DropdownMenuItem>
                        ))
                    ) : (
                      <DropdownMenuItem disabled>
                        No courses available
                      </DropdownMenuItem>
                    )}
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
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Subject Code</Label>
              <Input
                placeholder="e.g CS101"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Subject Type</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    disabled={isLoading}
                  >
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
                max={courseMap[selectedCourse?.uuid]?.numSemesters || 8}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (
                    value <=
                    (courseMap[selectedCourse?.uuid]?.numSemesters || 8)
                  )
                    setSemester(e.target.value);
                }}
                disabled={isLoading}
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
                  disabled={isLoading}
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                      disabled={isLoading}
                    >
                      <CalendarIcon className="size-3.5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      month={month}
                      onMonthChange={setMonth}
                      initialFocus
                      disabled={isLoading}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={createSubject}
              disabled={
                isLoading ||
                !subjectName ||
                !subjectCode ||
                !subjectType ||
                !semester ||
                !date ||
                !selectedCombined ||
                !selectedCourse
              }
            >
              {isLoading ? "Creating..." : "Create Subject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subject Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) resetForm();
          setIsEditDialogOpen(open);
        }}
      >
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
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    disabled={isLoading}
                  >
                    {selectedCombined?.name || "Select"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                  <DropdownMenuGroup>
                    {combined
                      .filter(
                        (c) =>
                          streamMap[c.stream]?.isActive !== false &&
                          degreeMap[c.degree]?.isActive !== false &&
                          academicYearMap[c.academicYear]?.isActive !== false
                      )
                      .map((el) => (
                        <DropdownMenuItem
                          key={el.uuid}
                          onSelect={() => setSelectedCombined(el)}
                          className="cursor-pointer"
                        >
                          <span>{el.name}</span>
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
                    disabled={!selectedCombined || isLoading}
                  >
                    {selectedCourse?.name || "Select"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                  <DropdownMenuGroup>
                    {courses.length > 0 ? (
                      courses.map((el) => (
                        <DropdownMenuItem
                          key={el.uuid}
                          onSelect={() => setSelectedCourse(el)}
                          className="cursor-pointer"
                        >
                          {el.name}
                          {courseMap[el.uuid]?.isActive === false && " (Inactive)"}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled>
                        No courses available
                      </DropdownMenuItem>
                    )}
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
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Subject Code</Label>
              <Input
                placeholder="e.g CS101"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Subject Type</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    disabled={isLoading}
                  >
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
                max={courseMap[selectedCourse?.uuid]?.numSemesters || 8}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (
                    value <=
                    (courseMap[selectedCourse?.uuid]?.numSemesters || 8)
                  )
                    setSemester(e.target.value);
                }}
                disabled={isLoading}
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
                  disabled={isLoading}
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                      disabled={isLoading}
                    >
                      <CalendarIcon className="size-3.5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      month={month}
                      onMonthChange={setMonth}
                      initialFocus
                      disabled={isLoading}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={editSubject}
              disabled={
                isLoading ||
                !subjectName ||
                !subjectCode ||
                !subjectType ||
                !semester ||
                !date ||
                !selectedCombined ||
                !selectedCourse
              }
            >
              {isLoading ? "Updating..." : "Update Subject"}
            </Button>
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
              onClick={importToExcel}
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
                <Link href="/admin/qp/subject">Subjects</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Stream, Degree, Academic Year, and Course Activation/Deactivation Buttons */}
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
        {years.map((year) => (
          <Button
            key={year.uuid}
            variant="outline"
            className={year.isActive ? "text-green-600" : "text-red-600"}
            onClick={() =>
              toggleEntityStatus("academic-years", year.uuid, !year.isActive)
            }
            disabled={isLoading}
          >
            {year.year}: {year.isActive ? "Deactivate" : "Activate"}
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
              placeholder="Search subjects..."
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
                  New Subject
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={toExcel}
                  className="gap-2"
                  disabled={isLoading || filteredSubjects.length === 0}
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
              <Label>Stream | Degree | Year</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    disabled={isLoading}
                  >
                    {selectedCombined?.name || "All"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                  <DropdownMenuItem onSelect={() => setSelectedCombined(null)}>
                    All
                  </DropdownMenuItem>
                  {combined
                    .filter(
                      (c) =>
                        streamMap[c.stream]?.isActive !== false &&
                        degreeMap[c.degree]?.isActive !== false &&
                        academicYearMap[c.academicYear]?.isActive !== false
                    )
                    .map((el) => (
                      <DropdownMenuItem
                        key={el.uuid}
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
                      disabled={!selectedCombined || isLoading}
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
                <Label>Semester</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      disabled={isLoading}
                    >
                      {selectedSemester || "All"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem onSelect={() => setSelectedSemester("")}>
                      All
                    </DropdownMenuItem>
                    {[
                      ...Array(
                        courseMap[selectedCourse?.uuid]?.numSemesters || 8
                      ),
                    ].map((_, i) => (
                      <DropdownMenuItem
                        key={i + 1}
                        onSelect={() => setSelectedSemester((i + 1).toString())}
                      >
                        {i + 1}
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
          <div className="rounded-md border bg-white min-h-[40vh] max-h-[60vh] overflow-y-auto overflow-x-auto w-full">
            <Table className="min-w-[700px] relative">
              <TableHeader className="bg-gray-50 sticky left-0 right-0 top-0 z-10">
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox disabled={isLoading} />
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredSubjects.length > 0 ? (
                  filteredSubjects.map((subject) => (
                    <TableRow key={subject.uuid} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox disabled={isLoading} />
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
                          onClick={() => handleEditSubject(subject)}
                          disabled={isLoading}
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
                          disabled={isLoading}
                        >
                          {subject.isActive === false ? (
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