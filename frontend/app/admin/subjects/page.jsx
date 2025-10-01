"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { toast } from "sonner";
import { useState } from "react";
import Cookies from "js-cookie";
import {
  Loader2,
  Search,
  Plus,
  Download,
  Edit,
  Power,
  ImportIcon,
  XIcon,
  UploadCloud,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useRef } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function SubjectsPage() {
  const [streams, setStreams] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [years, setYears] = useState([]);
  const [courses, setCourses] = useState([]);
  const [combineds, setCombineds] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState(subjects);
  const [viewMode, setViewMode] = useState("active");
  const [search, setSearch] = useState("");
  const [dialogAction, setDialogAction] = useState("");
  const [addDialogName, setAddDialogName] = useState("");
  const [addDialogCode, setAddDialogCode] = useState("");
  const [addDialogSemester, setAddDialogSemester] = useState("");
  const [addDialogExam, setAddDialogExam] = useState("");
  const [addDialogType, setAddDialogType] = useState("");
  const [editDialogName, setEditDialogName] = useState("");
  const [editDialogCode, setEditDialogCode] = useState("");
  const [editDialogSemester, setEditDialogSemester] = useState("");
  const [editDialogExam, setEditDialogExam] = useState("");
  const [editDialogType, setEditDialogType] = useState("");
  const token = Cookies.get("token");
  const [loading, setLoading] = useState(false);
  const [selectedStream, setSelectedStream] = useState(null);
  const [selectedDegree, setSelectedDegree] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedCombined, setSelectedCombined] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [filterCombined, setFilterCombined] = useState(null);
  const [filterCourse, setFilterCourse] = useState(null);
  const [filterSemester, setFilterSemester] = useState(null);
  const [file, setFile] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setLoading(true);
    try {
      const [
        streamRes,
        degreeRes,
        yearRes,
        courseRes,
        combinedRes,
        subjectRes,
      ] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/stream`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degree`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/course`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/combined`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subject`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (streamRes.ok && degreeRes.ok && yearRes.ok) {
        const [
          streamData,
          degreeData,
          yearData,
          courseData,
          combinedData,
          subjectData,
        ] = await Promise.all([
          streamRes.json(),
          degreeRes.json(),
          yearRes.json(),
          courseRes.json(),
          combinedRes.json(),
          subjectRes.json(),
        ]);

        const activeStreams = streamData.filter((el) => el.isActive);
        const activeDegrees = degreeData.filter((el) => el.isActive);
        const activeYears = yearData.filter((el) => el.isActive);
        setStreams(activeStreams);
        setDegrees(activeDegrees);
        setYears(activeYears);
        setCourses(courseData);
        setCombineds(combinedData);

        if (subjectData.err) {
          setSubjects([]);
          setFilteredSubjects([]);
          setLoading(false);
          return;
        }

        setSubjects(subjectData);
        setFilteredSubjects(subjectData);
        setLoading(false);
      } else {
        toast.error("Failed to fetch one or more resources");
      }
      setLoading(false);
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dialogAction === "export") handleExport();
  }, [dialogAction]);

  useEffect(() => {
    if (search.trim().length < 1) {
      setFilteredSubjects(subjects);
      return;
    }

    const data = subjects.filter((el) =>
      el.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredSubjects(data);
  }, [search, subjects]);

  useEffect(() => {
    let data = subjects;

    if (filterCombined) {
      data = data.filter((el) => el.combined === filterCombined?.uuid);
    }

    if (filterCourse) {
      data = data.filter((el) => el.course === filterCourse?.uuid);
    }

    if (filterSemester) {
      data = data.filter((el) => el.semester === filterSemester);
    }

    setFilteredSubjects(data);
  }, [filterCombined, filterCourse, filterSemester, subjects]);

  useEffect(() => {
    if (dialogAction === "edit" && selectedSubject) {
      setEditDialogName(selectedSubject.name);
      setEditDialogCode(selectedSubject.code);
      setEditDialogSemester(selectedSubject.semester);
      setEditDialogExam(selectedSubject.exam);
      setEditDialogType(selectedSubject.type);
      setSelectedCourse(selectedSubject.course);
      setSelectedCombined(selectedSubject.combined);
    }
  }, [dialogAction, selectedSubject]);

  const clearFilters = () => {
    setFilterCombined(null);
    setFilterCourse(null);
    setFilterSemester(null);
  };

  const handleCreate = async () => {
    try {
      if (!selectedCombined || !selectedCourse) {
        toast.error("Please select all required fields");
        return;
      }

      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subject`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: addDialogName,
            code: addDialogCode,
            semester: addDialogSemester,
            combined: selectedCombined.uuid,
            type: addDialogType,
            course: selectedCourse.uuid,
            exam: addDialogExam,
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setSubjects([...subjects, data.subject]);
        setFilteredSubjects([...subjects, data.subject]);
        toast.success("Subject added successfully");
        setLoading(false);
        setDialogAction("");
        setSelectedCombined(null);
        setSelectedCourse(null);

        // Reset form fields
        setAddDialogName("");
        setAddDialogCode("");
        setAddDialogSemester("");
        setAddDialogExam("");
        setAddDialogType("");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add subject");
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const payload = {
        name: editDialogName,
        code: editDialogCode,
        semester: editDialogSemester,
        combined: selectedCombined,
        type: editDialogType,
        course: selectedCourse,
        exam: editDialogExam,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subject/${selectedSubject.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        await getData();
        toast.success("Subject updated successfully 🎉");
        setDialogAction("");
        setLoading(false);
      } else {
        const err = await res.json();
        toast.error(err.err || "Update failed");
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (filteredSubjects.length < 1) {
      toast.error("No data to export");
      return;
    }

    // prepare cleaned export data
    const cleaned_data = filteredSubjects.map((el) => ({
      UUID: el.uuid,
      "Subject Name": el.name,
      "Subject Code": el.code,
      "Stream Name": getStreamName(el.combined),
      "Degree Name": getDegreeName(el.combined),
      "Academic Year": getYear(el.combined),
      "Course Name": getCourseName(el.course),
      Semester: el.semester,
      "Exam Type": el.exam,
      "Subject Type": el.type,
    }));

    try {
      const worksheet = XLSX.utils.json_to_sheet(cleaned_data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Subjects");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Subjects.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Export successful 🎉");
      setDialogAction("");
    } catch (error) {
      toast.error("Export failed: " + error.message);
    }
  };

  const handleChangeStatus = async (subject) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subject/${subject.uuid}/status`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: !subject.isActive }),
        }
      );

      if (res.ok) {
        await getData();
        toast.success(
          `Subject ${
            !subject.isActive ? "activated" : "deactivated"
          } successfully`
        );
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const handleExcelTemplate = async () => {
    try {
      const headers = [
        "Subject Name",
        "Subject Code",
        "Semester",
        "Academic Year",
        "Stream Name",
        "Degree Name",
        "Course Name",
        "Course Code",
        "Exam",
        "Subject Type",
      ];

      const worksheet = XLSX.utils.aoa_to_sheet([
        headers,
        [
          "Test Subject",
          "SUB101",
          "1",
          "2023-2024",
          "Test Stream",
          "Test Degree",
          "Test Course",
          "Test Course Code",
          "24-04-2025",
          "Compulsory",
        ],
      ]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Subjects Template");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Subjects_Template.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Template downloaded 🎉");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getStreamName = (combinedId) => {
    const combined = combineds.find((el) => el.uuid === combinedId);
    const stream = streams.find((el) => el.uuid === combined?.stream);
    return stream?.name || "N/A";
  };

  const getDegreeName = (combinedId) => {
    const combined = combineds.find((el) => el.uuid === combinedId);
    const degree = degrees.find((el) => el.uuid === combined?.degree);
    return degree?.name || "N/A";
  };

  const getYear = (combinedId) => {
    const combined = combineds.find((el) => el.uuid === combinedId);
    const year = years.find((el) => el.uuid === combined?.year);
    return year?.year || "N/A";
  };

  const getCourseName = (courseId) => {
    const course = courses.find((el) => el.uuid === courseId);
    return course?.name.slice(0, 10) || "N/A";
  };

  const handleExcelImport = async () => {
    try {
      setLoading(true);
      const buffer_data = await file.arrayBuffer();
      const workbook = XLSX.read(buffer_data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json_data = XLSX.utils.sheet_to_json(worksheet);

      const seen = new Set();
      const sanitized_data = [];

      json_data.forEach((row, index) => {
        const name = (row["Subject Name"] || "").toString().trim();
        const code = (row["Subject Code"] || "").toString().trim();
        const semester = (row["Semester"] || "").toString().trim();
        let stream = (row["Stream Name"] || "").toString().trim();
        let degree = (row["Degree Name"] || "").toString().trim();
        let year = (row["Academic Year"] || "").toString().trim();
        let course = (row["Course Name"] || "").toString().trim();
        let exam = (row["Exam"] || "").toString().trim();
        let type = (row["Subject Type"] || "").toString().trim();
        let course_code = (row["Course Code"] || "").toString().trim();

        stream = stream.replace(/\s+/g, " ");
        degree = degree.replace(/\s+/g, " ");
        year = year.replace(/\s+/g, " ");
        course = course.replace(/\s+/g, " ");

        if (
          !name ||
          !code ||
          !semester ||
          !stream ||
          !degree ||
          !year ||
          !course ||
          !exam ||
          !type ||
          !course_code
        )
          return;

        const key = `${name}-${code}-${stream}-${degree}-${year}-${course}-${course_code}`;

        if (!seen.has(key)) {
          seen.add(key);
          sanitized_data.push({
            name,
            code,
            semester,
            stream,
            degree,
            year,
            course,
            exam,
            type,
            course_code,
          });
        } else {
          console.warn(`Duplicate row at index ${index + 2}:`, row);
        }
      });

      if (sanitized_data.length === 0) {
        toast.error("No valid rows found to import");
        setLoading(false);
        return;
      }

      // POST to backend
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subject/bulk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(sanitized_data),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to import subjects");
      }

      const data = await res.json();
      toast.success(`${sanitized_data.length} subjects imported successfully`);

      // Update frontend state
      setSubjects((prev) => [...prev, ...data.data.subjects]);
      setFilteredSubjects((prev) => [...prev, ...data.data.subjects]);

      setDialogAction("");
      setLoading(false);
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const newFiltered = subjects.filter((sub) => {
      const combined = combineds.find((el) => el.uuid === sub.combined);

      const hasActiveStream = streams.some(
        (stream) => stream.uuid === combined.stream && stream.isActive
      );

      const hasActiveDegree = degrees.some(
        (degree) => degree.uuid === combined.degree && degree.isActive
      );

      const hasActiveYear = years.some(
        (year) => year.uuid === combined.year && year.isActive
      );

      const hasActiveCourse = courses.some(
        (course) => course.uuid === sub.course && course.isActive
      );

      return (
        hasActiveStream && hasActiveDegree && hasActiveYear && hasActiveCourse
      );
    });

    setFilteredSubjects(newFiltered);
  }, [streams, degrees, years, courses, subjects]);

  const displayedSubjects = filteredSubjects.filter((subject) =>
    viewMode === "active" ? subject.isActive : !subject.isActive
  );

  return (
    <div className="flex flex-col h-full bg-white p-4 sm:p-6 text-sm">
      {/* Header */}
      <div className="flex flex-col mb-6">
        <div className="flex gap-2 justify-start items-center">
          <SidebarTrigger className="cursor-pointer" />
          <h1 className="text-sm font-medium text-gray-800">
            Subjects Management
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          Create and manage evaluation subjects
        </p>
      </div>
      {/* Stats and Actions Section */}
      <div className="bg-white rounded-lg mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {subjects.length}
              </div>
              <div className="text-xs text-blue-500">Total Subjects</div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {subjects.filter((s) => s.isActive).length}
              </div>
              <div className="text-xs text-green-500">Active Subjects</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              onClick={() => setDialogAction("new")}
              className="flex items-center gap-2 cursor-pointer text-sm"
              size="sm"
            >
              <Plus size={16} />
              Add Subject
            </Button>

            <Button
              onClick={() => setDialogAction("import")}
              className="flex items-center gap-2 cursor-pointer text-sm"
              size="sm"
            >
              <ImportIcon size={16} />
              Import Subjects
            </Button>

            <Button
              variant="outline"
              onClick={() => setDialogAction("export")}
              className="flex items-center gap-2 cursor-pointer text-sm"
              size="sm"
            >
              <Download size={16} />
              Export
            </Button>

            {(filterCombined || filterCourse || filterSemester) && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-2 cursor-pointer text-sm"
                size="sm"
              >
                <XIcon size={16} />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>
      {/* Filters and Search Section */}
      <div className="bg-white rounded-lg mb-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex gap-2 justify-between items-center flex-wrap">
            <div className="relative w-full sm:w-80">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search subjects..."
                className="pl-10"
              />
            </div>
            <Select
              value={filterCombined || ""}
              onValueChange={(value) => setFilterCombined(value)}
            >
              <SelectTrigger className="text-sm cursor-pointer w-60">
                <SelectValue placeholder="Select Stream | Degree | Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {combineds
                    .filter((el) => el.isActive === true)
                    .map((opt) => (
                      <SelectItem
                        key={opt.uuid}
                        value={opt}
                        className="text-sm cursor-pointer"
                      >
                        {opt.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {filterCombined && (
              <Select
                value={filterCourse || ""}
                onValueChange={(value) => setFilterCourse(value)}
              >
                <SelectTrigger className="text-sm cursor-pointer w-40">
                  <SelectValue placeholder="Select Course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {courses
                      .filter(
                        (el) =>
                          el.isActive && filterCombined.course.includes(el.uuid)
                      )
                      .map((opt) => (
                        <SelectItem
                          key={opt.uuid}
                          value={opt}
                          className="text-sm cursor-pointer"
                        >
                          {opt.name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
            {filterCourse && (
              <Select
                value={filterSemester || ""}
                onValueChange={(value) => setFilterSemester(value)}
              >
                <SelectTrigger className="text-sm cursor-pointer w-40">
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Array.from(
                      { length: Number(filterCourse.semCount) },
                      (_, i) => (
                        <SelectItem
                          key={i + 1}
                          value={(i + 1).toString()}
                          className="text-sm cursor-pointer"
                        >
                          Semester {i + 1}
                        </SelectItem>
                      )
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === "active" ? "default" : "outline"}
              onClick={() => setViewMode("active")}
              className="cursor-pointer text-sm"
              size="sm"
            >
              Active
            </Button>
            <Button
              variant={viewMode === "inactive" ? "default" : "outline"}
              onClick={() => setViewMode("inactive")}
              className="cursor-pointer text-sm"
              size="sm"
            >
              Inactive
            </Button>
          </div>
        </div>
      </div>
      {/* Subjects Table Section */}
      <div className="bg-white rounded-lg flex-1 overflow-hidden">
        <div className="max-h-[calc(100vh-300px)] overflow-auto">
          <Table className="border w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={13} className="h-24 text-center">
                    <div className="flex justify-center items-center gap-1">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : displayedSubjects.length > 0 ? (
                displayedSubjects.map((subject, i) => (
                  <TableRow key={subject.uuid}>
                    <TableCell className="font-medium">{i + 1}</TableCell>
                    <TableCell className="font-medium text-sm">
                      {subject.name}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500 font-mono">
                      {subject.uuid}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500 font-mono">
                      {subject.code}
                    </TableCell>
                    <TableCell className="font-medium text-sm w-max">
                      {getCourseName(subject.course)}...
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {subject.semester}
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {subject.type}
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {subject.exam}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={subject.isActive ? "default" : "secondary"}
                      >
                        {subject.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSubject(subject);
                            setDialogAction("edit");
                          }}
                          className="h-8 cursor-pointer"
                        >
                          <Edit size={14} className="mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant={subject.isActive ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleChangeStatus(subject)}
                          disabled={loading}
                          className="h-8 cursor-pointer"
                        >
                          <Power size={14} className="mr-1" />
                          {subject.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={13} className="h-24 text-center">
                    No {viewMode} subjects found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* Create Subject Dialog */}
      <Dialog
        open={dialogAction === "new"}
        onOpenChange={(open) => !open && setDialogAction("")}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Subject</DialogTitle>
            <DialogDescription>
              Add a new subject to the system.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            {/* Combined Select */}
            <div className="flex flex-col gap-1">
              <label>Combined</label>
              <Select
                value={selectedCombined || ""}
                onValueChange={(value) => setSelectedCombined(value)}
              >
                <SelectTrigger className="text-sm cursor-pointer w-full">
                  <SelectValue placeholder="Select Combined" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {combineds
                      .filter((el) => el.isActive === true)
                      .map((opt) => (
                        <SelectItem
                          key={opt.uuid}
                          value={opt}
                          className="text-sm cursor-pointer"
                        >
                          {opt.name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Course Select */}
            <div className="flex flex-col gap-1">
              <label>Course</label>
              <Select
                value={selectedCourse || ""}
                disabled={!selectedCombined}
                onValueChange={(value) => setSelectedCourse(value)}
              >
                <SelectTrigger className="text-sm cursor-pointer w-full">
                  <SelectValue placeholder="Select Course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {courses
                      .filter(
                        (el) =>
                          el.isActive === true &&
                          selectedCombined?.course?.includes(el.uuid)
                      )
                      .map((opt) => (
                        <SelectItem
                          key={opt.uuid}
                          value={opt}
                          className="text-sm cursor-pointer"
                        >
                          {opt.name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Name input */}
            <div className="flex flex-col gap-1">
              <label>Subject Name</label>
              <Input
                placeholder="Subject Name"
                value={addDialogName}
                onChange={(e) => setAddDialogName(e.target.value)}
              />
            </div>

            {/* Code input */}
            <div className="flex flex-col gap-1">
              <label>Subject Code</label>
              <Input
                placeholder="Subject Code"
                value={addDialogCode}
                onChange={(e) => setAddDialogCode(e.target.value)}
              />
            </div>

            {/* Semester input */}
            <div className="flex flex-col gap-1">
              <label>Semester</label>
              <Select
                value={addDialogSemester || ""}
                onValueChange={(value) => setAddDialogSemester(value)}
              >
                <SelectTrigger className="text-sm cursor-pointer w-40">
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Array.from(
                      { length: Number(selectedCourse?.semCount) },
                      (_, i) => (
                        <SelectItem
                          key={i + 1}
                          value={(i + 1).toString()}
                          className="text-sm cursor-pointer"
                        >
                          Semester {i + 1}
                        </SelectItem>
                      )
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Exam Type Select */}
            <div className="flex flex-col gap-1">
              <label>Exam Date</label>
              <Input
                type="date"
                value={addDialogExam}
                onChange={(e) => setAddDialogExam(e.target.value)}
              />
            </div>

            {/* Subject Type Select */}
            <div className="flex flex-col gap-1">
              <label>Subject Type</label>
              <Select
                value={addDialogType}
                onValueChange={(value) => setAddDialogType(value)}
              >
                <SelectTrigger className="text-sm cursor-pointer w-full">
                  <SelectValue placeholder="Select Subject Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Compulsory">Compulsory</SelectItem>
                    <SelectItem value="Elective / Optional">
                      Elective / Optional
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAction("")}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                loading ||
                !addDialogName ||
                !addDialogCode ||
                !addDialogSemester ||
                !addDialogExam ||
                !addDialogType ||
                !selectedCombined ||
                !selectedCourse
              }
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Subject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subject Dialog */}
      <Dialog
        open={dialogAction === "edit"}
        onOpenChange={(open) => !open && setDialogAction("")}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
            <DialogDescription>Edit subject details.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            {/* Combined Select */}
            <div className="flex flex-col gap-1">
              <label>Combined</label>
              <Select
                value={selectedCombined || ""}
                onValueChange={(value) => setSelectedCombined(value)}
              >
                <SelectTrigger className="text-sm cursor-pointer w-full">
                  <SelectValue placeholder="Select Combined" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {combineds
                      .filter((el) => el.isActive === true)
                      .map((opt) => (
                        <SelectItem
                          key={opt.uuid}
                          value={opt}
                          className="text-sm cursor-pointer"
                        >
                          {opt.name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Course Select */}
            <div className="flex flex-col gap-1">
              <label>Course</label>
              <Select
                value={selectedCourse || ""}
                disabled={!selectedCombined}
                onValueChange={(value) => setSelectedCourse(value)}
              >
                <SelectTrigger className="text-sm cursor-pointer w-full">
                  <SelectValue placeholder="Select Course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {courses
                      .filter(
                        (el) =>
                          el.isActive === true &&
                          selectedCombined &&
                          selectedCombined.course?.includes(el.uuid)
                      )
                      .map((opt) => (
                        <SelectItem
                          key={opt.uuid}
                          value={opt.uuid}
                          className="text-sm cursor-pointer"
                        >
                          {opt.name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Name input */}
            <div className="flex flex-col gap-1">
              <label>Subject Name</label>
              <Input
                placeholder="Subject Name"
                value={editDialogName}
                onChange={(e) => setEditDialogName(e.target.value)}
              />
            </div>

            {/* Code input */}
            <div className="flex flex-col gap-1">
              <label>Subject Code</label>
              <Input
                placeholder="Subject Code"
                value={editDialogCode}
                onChange={(e) => setEditDialogCode(e.target.value)}
              />
            </div>

            {/* Semester input */}
            <div className="flex flex-col gap-1">
              <label>Semester</label>
              <Input
                placeholder="Semester"
                value={editDialogSemester}
                onChange={(e) => setEditDialogSemester(e.target.value)}
              />
            </div>

            {/* Exam Type Select */}
            <div className="flex flex-col gap-1">
              <label>Exam Date</label>
              <Input
                type="date"
                value={editDialogExam}
                onChange={(e) => setAddDialogExam(e.target.value)}
              />
            </div>

            {/* Subject Type Select */}
            <div className="flex flex-col gap-1">
              <label>Subject Type</label>
              <Select
                value={editDialogType}
                onValueChange={(value) => setEditDialogType(value)}
              >
                <SelectTrigger className="text-sm cursor-pointer w-full">
                  <SelectValue placeholder="Select Subject Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Compulsory">Compulsory</SelectItem>
                    <SelectItem value="Elective / Optional">
                      Elective / Optional
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAction("")}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={
                loading ||
                !editDialogName ||
                !editDialogCode ||
                !editDialogSemester ||
                !editDialogExam ||
                !editDialogType ||
                !selectedCombined ||
                !selectedCourse
              }
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Subject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Import Subjects Dialog */}
      <Dialog
        open={dialogAction === "import"}
        onOpenChange={(open) => !open && setDialogAction("")}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subject</DialogTitle>
            <DialogDescription>Import subjects through excel</DialogDescription>
          </DialogHeader>
          <main className="flex flex-col gap-3">
            <div className="flex justify-between items-center p-3 border">
              <p className="text-sm">Download template to import</p>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm cursor-pointer"
                onClick={handleExcelTemplate}
              >
                download <Download className="h-4 w-4" />
              </Button>
            </div>
            <div className="border border-dashed p-3 flex flex-col justify-center items-center">
              {file ? (
                <span className="flex w-full justify-between items-center gap-2">
                  <h1 className="text-sm text-blue-500">{file.name}</h1>
                  <Button
                    onClick={() => setFile(null)}
                    className="cursor-pointer p-0"
                    variant="outline"
                    size="icon"
                  >
                    <XIcon className="h-2 w-2" />
                  </Button>
                </span>
              ) : (
                <h1 className="text-sm flex justify-center items-center gap-1">
                  Upload Excel <UploadCloud className="h-4 w-4" />
                </h1>
              )}
              <input
                onChange={(e) => {
                  const selectedFile = e.target.files[0];
                  if (selectedFile) {
                    setFile(selectedFile);
                  }
                  e.target.value = null;
                }}
                type="file"
                accept=".xlsx"
                ref={ref}
                className="hidden"
              />
              {!file && (
                <p
                  className="text-blue-500 cursor-pointer underline"
                  onClick={() => ref.current.click()}
                >
                  Browse
                </p>
              )}
            </div>
          </main>
          <DialogFooter>
            <Button
              size="sm"
              className="text-sm cursor-pointer"
              variant="outline"
              onClick={() => setDialogAction("")}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExcelImport}
              size="sm"
              disabled={!file || loading}
              className="text-sm cursor-pointer"
            >
              {loading ? (
                <span className="flex gap-1 justify-center items-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p>Importing...</p>
                </span>
              ) : (
                "Import Subjects"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
