"use client";

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

  // Fetch initial data (subjects, combined, streams, degrees, years, courses)
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [subjectsRes, combinedRes, streamRes, degreeRes, yearRes, courseRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subjects`),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/combineds`),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams`),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees`),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years`),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/courses`),
      ]);

      if (!subjectsRes.ok || !combinedRes.ok || !streamRes.ok || !degreeRes.ok || !yearRes.ok || !courseRes.ok) {
        throw new Error("Failed to fetch initial data");
      }

      const [subjectsData, combinedData, streamData, degreeData, yearData, courseData] = await Promise.all([
        subjectsRes.json(),
        combinedRes.json(),
        streamRes.json(),
        degreeRes.json(),
        yearRes.json(),
        courseRes.json(),
      ]);

      // Create streamMap
      const newStreamMap = {};
      streamData.forEach((stream) => {
        newStreamMap[stream.uuid] = {
          name: stream.name || "Unknown",
          isActive: stream.isActive !== false,
        };
      });

      // Create degreeMap
      const newDegreeMap = {};
      degreeData.forEach((degree) => {
        newDegreeMap[degree.uuid] = {
          name: degree.name || "Unknown",
          isActive: degree.isActive !== false,
        };
      });

      // Create academicYearMap
      const newAcademicYearMap = {};
      yearData.forEach((year) => {
        newAcademicYearMap[year.uuid] = {
          year: year.year || "Unknown",
          isActive: year.isActive !== false,
        };
      });

      // Filter combined to only include those with active streams, degrees, and academic years
      const filteredCombined = combinedData.filter((c) =>
        newStreamMap[c.stream]?.isActive !== false &&
        newDegreeMap[c.degree]?.isActive !== false &&
        newAcademicYearMap[c.academicYear]?.isActive !== false
      );

      // Filter subjects to only include those with active streams, degrees, and academic years via combined
      const filteredSubjects = subjectsData.filter((subject) => {
        const combinedEntry = combinedData.find((c) => c.uuid === subject.combined);
        return (
          combinedEntry &&
          newStreamMap[combinedEntry.stream]?.isActive !== false &&
          newDegreeMap[combinedEntry.degree]?.isActive !== false &&
          newAcademicYearMap[combinedEntry.academicYear]?.isActive !== false
        );
      });

      // Filter courses to only include those linked to active streams, degrees, and academic years via combined
      const filteredCourses = courseData.filter((course) => {
        const courseCombined = combinedData.find((c) => c.course === course.uuid);
        return (
          courseCombined &&
          newStreamMap[courseCombined.stream]?.isActive !== false &&
          newDegreeMap[courseCombined.degree]?.isActive !== false &&
          newAcademicYearMap[courseCombined.academicYear]?.isActive !== false
        );
      });

      // Filter academic years to only include those with active streams and degrees
      const filteredYears = yearData.filter((year) =>
        newStreamMap[year.streamUuid]?.isActive !== false &&
        newDegreeMap[year.degree]?.isActive !== false
      );

      setStreamMap(newStreamMap);
      setDegreeMap(newDegreeMap);
      setAcademicYearMap(newAcademicYearMap);
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

  // Activate stream
  const activateStream = async (streamUuid) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams/${streamUuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
      if (!res.ok) throw new Error("Failed to activate stream");

      await fetchData();
      toast.success("Stream activated successfully");
    } catch (error) {
      toast.error("Error activating stream: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Deactivate stream
  const deactivateStream = async (streamUuid) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams/${streamUuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      });
      if (!res.ok) throw new Error("Failed to deactivate stream");

      await fetchData();
      toast.success("Stream deactivated successfully");
    } catch (error) {
      toast.error("Error deactivating stream: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Activate degree
  const activateDegree = async (degreeUuid) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees/${degreeUuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
      if (!res.ok) throw new Error("Failed to activate degree");

      await fetchData();
      toast.success("Degree activated successfully");
    } catch (error) {
      toast.error("Error activating degree: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Deactivate degree
  const deactivateDegree = async (degreeUuid) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees/${degreeUuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      });
      if (!res.ok) throw new Error("Failed to deactivate degree");

      await fetchData();
      toast.success("Degree deactivated successfully");
    } catch (error) {
      toast.error("Error deactivating degree: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Activate academic year
  const activateAcademicYear = async (academicYearUuid) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years/${academicYearUuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
      if (!res.ok) throw new Error("Failed to activate academic year");

      await fetchData();
      toast.success("Academic year activated successfully");
    } catch (error) {
      toast.error("Error activating academic year: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Deactivate academic year
  const deactivateAcademicYear = async (academicYearUuid) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years/${academicYearUuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      });
      if (!res.ok) throw new Error("Failed to deactivate academic year");

      await fetchData();
      toast.success("Academic year deactivated successfully");
    } catch (error) {
      toast.error("Error deactivating academic year: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch courses when combined is selected
  useEffect(() => {
    const getCourseByCombinedData = async () => {
      if (!selectedCombined?.uuid) {
        setCourses([]);
        setSelectedCourse(null);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/courses?combined=${selectedCombined.uuid}`
        );
        if (res.ok) {
          const data = await res.json();
          // Filter courses to ensure they are linked to active streams, degrees, and academic years via combined
          const filteredCourses = Array.isArray(data)
            ? data.filter((course) => {
                const courseCombined = combined.find(
                  (c) => c.course === course.uuid && c.uuid === selectedCombined.uuid
                );
                return (
                  courseCombined &&
                  streamMap[courseCombined.stream]?.isActive !== false &&
                  degreeMap[courseCombined.degree]?.isActive !== false &&
                  academicYearMap[courseCombined.academicYear]?.isActive !== false
                );
              })
            : [];
          setCourses(filteredCourses);
        } else {
          toast.error("Failed to fetch courses");
          setCourses([]);
        }
      } catch (error) {
        toast.error(error.message);
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };
    getCourseByCombinedData();
  }, [selectedCombined, combined, streamMap, degreeMap, academicYearMap]);

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
      results = results.filter((subject) => subject.combined === selectedCombined.uuid);
    }

    // Apply course filter
    if (selectedCourse) {
      results = results.filter((subject) => subject.course === selectedCourse.uuid);
    }

    // Apply semester filter
    if (selectedSemester) {
      results = results.filter((subject) => subject.semester === selectedSemester);
    }

    // Apply deactivated filter
    if (!showDeactivated) {
      results = results.filter((subject) => {
        const combinedEntry = combined.find((c) => c.uuid === subject.combined);
        return (
          subject.isActive !== false &&
          combinedEntry &&
          streamMap[combinedEntry.stream]?.isActive !== false &&
          degreeMap[combinedEntry.degree]?.isActive !== false &&
          academicYearMap[combinedEntry.academicYear]?.isActive !== false
        );
      });
    }

    setFilteredSubjects(results);
  }, [subjects, searchTerm, selectedCombined, selectedCourse, selectedSemester, showDeactivated, combined, streamMap, degreeMap, academicYearMap]);

  // Create new subject
  const createSubject = async () => {
    if (!selectedCombined || !selectedCourse) {
      return toast.error("Please select Combined and Course.");
    }

    if (!subjectName || !subjectCode || !subjectType || !semester || !date) {
      return toast.error("Please fill all fields.");
    }

    if (parseInt(semester) > (selectedCourse?.numSemesters || 8)) {
      return toast.error(`Semester cannot exceed ${selectedCourse?.numSemesters || 8} for the selected course.`);
    }

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

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSub),
      });

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
    if (!editingSubject) return;

    if (!selectedCombined || !selectedCourse) {
      return toast.error("Please select Combined and Course.");
    }

    if (!subjectName || !subjectCode || !subjectType || !semester || !date) {
      return toast.error("Please fill all fields.");
    }

    if (parseInt(semester) > (selectedCourse?.numSemesters || 8)) {
      return toast.error(`Semester cannot exceed ${selectedCourse?.numSemesters || 8} for the selected course.`);
    }

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

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subjects/${editingSubject.uuid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSubject),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Subject updated successfully!");
        setSubjects((prev) => prev.map((s) => (s.uuid === editingSubject.uuid ? { ...s, ...data } : s)));
        setFilteredSubjects((prev) => prev.map((s) => (s.uuid === editingSubject.uuid ? { ...s, ...data } : s)));
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

  // Handle edit button click
  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setSubjectName(subject.name);
    setSubjectCode(subject.code);
    setSubjectType(subject.type);
    setSemester(subject.semester.toString());
    setDate(new Date(subject.exam));
    setSelectedCombined(combined.find((c) => c.uuid === subject.combined) || null);
    setSelectedCourse(courses.find((c) => c.uuid === subject.course) || null);
    setIsEditDialogOpen(true);
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
  };

  // Export to Excel
  const toExcel = () => {
    const dataToExport = filteredSubjects.map((subject) => {
      const matchedCombined = combined.find((c) => c.uuid === subject.combined);
      let stream = "",
        degree = "",
        year = "";
      if (matchedCombined?.name) {
        const parts = matchedCombined.name.split("|").map((p) => p.trim());
        [stream, degree, year] = parts;
      }

      const course = courses.find((c) => c.uuid === subject.course);
      const courseName = course?.name || "Unknown Course";

      let examDate = "";
      try {
        examDate = subject.exam ? formatDate(new Date(subject.exam)) : "Not set";
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

      if (!jsonData.length) {
        toast.error("The file is empty");
        return;
      }

      // Validate Excel headers
      const requiredHeaders = [
        "Subject Name",
        "Code",
        "Type",
        "Semester",
        "Exam Date",
        "Course",
        "Course Code",
        "Stream",
        "Degree",
        "Year",
      ];
      const headers = Object.keys(jsonData[0]);
      const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
      if (missingHeaders.length > 0) {
        toast.error(`Missing required headers: ${missingHeaders.join(", ")}`);
        return;
      }

      const payload = jsonData.map((row, index) => {
        const semester = parseInt(row["Semester"]);
        if (isNaN(semester) || semester <= 0 || semester > 8) {
          throw new Error(`Invalid semester at row ${index + 2}: must be a number between 1 and 8`);
        }
        const examDate = row["Exam Date"] ? formatExcelDate(row["Exam Date"]) : null;
        if (!examDate || !isValidDate(examDate)) {
          throw new Error(`Invalid exam date at row ${index + 2}`);
        }
        const course = courses.find((c) => c.name === row["Course"]?.toString().trim() && c.code === row["Course Code"]?.toString().trim());
        const stream = streams.find((s) => s.name === row["Stream"]?.toString().trim());
        const degree = degrees.find((d) => d.name === row["Degree"]?.toString().trim());
        const year = years.find((y) => y.year === row["Year"]?.toString().trim());
        const combinedEntry = combined.find(
          (c) =>
            c.stream === stream?.uuid &&
            c.degree === degree?.uuid &&
            c.academicYear === year?.uuid &&
            c.course === course?.uuid
        );

        return {
          name: row["Subject Name"]?.toString().trim() || "",
          code: row["Code"]?.toString().trim() || "",
          type: row["Type"]?.toString().trim() || "Compulsory",
          semester: semester.toString(),
          exam: examDate.toISOString(),
          course: course?.uuid || "",
          courseCode: row["Course Code"]?.toString().trim() || "",
          stream: stream?.uuid || "",
          degree: degree?.uuid || "",
          year: year?.uuid || "",
          combined: combinedEntry?.uuid || "",
          uuid: generateUUID(),
          isActive: true,
        };
      });

      // Validate required fields and active status
      const missingFields = [];
      payload.forEach((row, index) => {
        if (!row.name) missingFields.push(`Row ${index + 2}: Missing Subject Name`);
        if (!row.code) missingFields.push(`Row ${index + 2}: Missing Code`);
        if (!row.type || !["Compulsory", "Elective / Optional"].includes(row.type)) {
          missingFields.push(`Row ${index + 2}: Invalid Type (must be Compulsory or Elective / Optional)`);
        }
        if (!row.semester) missingFields.push(`Row ${index + 2}: Missing Semester`);
        if (!row.exam) missingFields.push(`Row ${index + 2}: Missing or invalid Exam Date`);
        if (!row.course || !courses.find((c) => c.uuid === row.course)) {
          missingFields.push(`Row ${index + 2}: Invalid or inactive Course`);
        }
        if (!row.combined || !combined.find((c) => c.uuid === row.combined)) {
          missingFields.push(`Row ${index + 2}: Invalid or inactive Combined (Stream/Degree/Year)`);
        }
        if (!row.stream || !streamMap[row.stream]?.isActive) {
          missingFields.push(`Row ${index + 2}: Invalid or inactive Stream`);
        }
        if (!row.degree || !degreeMap[row.degree]?.isActive) {
          missingFields.push(`Row ${index + 2}: Invalid or inactive Degree`);
        }
        if (!row.year || !academicYearMap[row.year]?.isActive) {
          missingFields.push(`Row ${index + 2}: Invalid or inactive Academic Year`);
        }
      });

      if (missingFields.length > 0) {
        toast.error(`Invalid file data:\n${missingFields.join("\n")}`);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subjects/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Import failed");

      if (result.created > 0) {
        await fetchData(); // Refresh subjects
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
      return new Date(dateValue);
    }
    return null;
  }

  // Toggle subject status
  const handleToggleSubjectStatus = async (uuid) => {
    try {
      setIsLoading(true);
      const subject = subjects.find((s) => s.uuid === uuid);
      if (!subject) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subjects/${uuid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !subject.isActive }),
      });

      if (res.ok) {
        const data = await res.json();
        setSubjects((prev) => prev.map((s) => (s.uuid === uuid ? { ...s, ...data } : s)));
        setFilteredSubjects((prev) => prev.map((s) => (s.uuid === uuid ? { ...s, ...data } : s)));
        toast.success(`Subject ${subject.isActive ? "deactivated" : "activated"} successfully`);
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

  return (
    <div className="flex h-screen w-full bg-gray-100/50 p-6 flex-col gap-5">
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
                  <Button variant="outline" className="w-full justify-between" disabled={isLoading}>
                    {selectedCombined?.name || "Select"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                  <DropdownMenuGroup>
                    {combined.filter((c) =>
                      streamMap[c.stream]?.isActive !== false &&
                      degreeMap[c.degree]?.isActive !== false &&
                      academicYearMap[c.academicYear]?.isActive !== false
                    ).map((el) => (
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
                    {courses.map((el) => (
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
                  <Button variant="outline" className="w-full justify-between" disabled={isLoading}>
                    {subjectType || "Select"}
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
                max={selectedCourse?.numSemesters || 8}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (value <= (selectedCourse?.numSemesters || 8)) {
                    setSemester(e.target.value);
                  }
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
                  <Button variant="outline" className="w-full justify-between" disabled={isLoading}>
                    {selectedCombined?.name || "Select"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                  <DropdownMenuGroup>
                    {combined.filter((c) =>
                      streamMap[c.stream]?.isActive !== false &&
                      degreeMap[c.degree]?.isActive !== false &&
                      academicYearMap[c.academicYear]?.isActive !== false
                    ).map((el) => (
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
                    {courses.map((el) => (
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
                  <Button variant="outline" className="w-full justify-between" disabled={isLoading}>
                    {subjectType || "Select"}
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
                max={selectedCourse?.numSemesters || 8}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (value <= (selectedCourse?.numSemesters || 8)) {
                    setSemester(e.target.value);
                  }
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
            <DialogDescription>Upload an Excel file to import subjects</DialogDescription>
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

      {/* Stream, Degree, and Academic Year Activation/Deactivation Buttons */}
      <div className="flex flex-wrap gap-2">
        {streams.map((stream) => (
          <Button
            key={stream.uuid}
            variant="outline"
            className={stream.isActive ? "text-green-600" : "text-red-600"}
            onClick={() => (stream.isActive ? deactivateStream(stream.uuid) : activateStream(stream.uuid))}
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
            onClick={() => (degree.isActive ? deactivateDegree(degree.uuid) : activateDegree(degree.uuid))}
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
            onClick={() => (year.isActive ? deactivateAcademicYear(year.uuid) : activateAcademicYear(year.uuid))}
            disabled={isLoading}
          >
            {year.year}: {year.isActive ? "Deactivate" : "Activate"}
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
                <DropdownMenuItem onSelect={() => setIsDialogOpen(true)} className="gap-2">
                  <CirclePlusIcon className="h-4 w-4" />
                  New Subject
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={toExcel} className="gap-2" disabled={isLoading || filteredSubjects.length === 0}>
                  <FileDown className="h-4 w-4" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => set (true)} className="gap-2" disabled={isLoading}>
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
                  <Button variant="outline" className="w-full justify-between" disabled={isLoading}>
                    {selectedCombined?.name || "All"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                  <DropdownMenuItem onSelect={() => setSelectedCombined(null)}>
                    All
                  </DropdownMenuItem>
                  {combined.filter((c) =>
                    streamMap[c.stream]?.isActive !== false &&
                    degreeMap[c.degree]?.isActive !== false &&
                    academicYearMap[c.academicYear]?.isActive !== false
                  ).map((el) => (
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
                    {courses.map((el) => (
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
                    <Button variant="outline" className="w-full justify-between" disabled={isLoading}>
                      {selectedSemester || "All"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem onSelect={() => setSelectedSemester("")}>
                      All
                    </DropdownMenuItem>
                    {[...Array(selectedCourse?.numSemesters || 8)].map((_, i) => (
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
                    <Button variant="outline" className="w-full justify-between" disabled={isLoading}>
                      {showDeactivated ? "All" : "Active Only"}
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
                ({filteredSubjects.length} {showDeactivated ? "found" : "active"})
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
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>{subject.code}</TableCell>
                      <TableCell>{subject.type}</TableCell>
                      <TableCell>{subject.semester}</TableCell>
                      <TableCell>{formatDate(new Date(subject.exam))}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            subject.isActive === false
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {subject.isActive === false ? "Deactivated" : "Active"}
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
                          onClick={() => handleToggleSubjectStatus(subject.uuid)}
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