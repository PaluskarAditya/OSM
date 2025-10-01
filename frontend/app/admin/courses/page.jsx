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
import { SidebarTrigger } from "@/components/ui/sidebar";
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

export default function StreamsPage() {
  const [streams, setStreams] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [years, setYears] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState(courses);
  const [viewMode, setViewMode] = useState("active");
  const [search, setSearch] = useState("");
  const [dialogAction, setDialogAction] = useState("");
  const [addDialogName, setAddDialogName] = useState("");
  const [addDialogCode, setAddDialogCode] = useState("");
  const [addDialogCount, setAddDialogCount] = useState("");
  const [editDialogName, setEditDialogName] = useState("");
  const [editDialogCode, setEditDialogCode] = useState("");
  const [editDialogCount, setEditDialogCount] = useState("");
  const token = Cookies.get("token");
  const [loading, setLoading] = useState(false);
  const [selectedStream, setSelectedStream] = useState(null);
  const [selectedDegree, setSelectedDegree] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filterStream, setFilterStream] = useState(null);
  const [filterDegree, setFilterDegree] = useState(null);
  const [filterCourse, setFilterCourse] = useState(null);
  const [filterYear, setFilterYear] = useState(null);
  const [newStream, setNewStream] = useState("");
  const [newDegree, setNewDegree] = useState("");
  const [file, setFile] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setLoading(true);
    try {
      const [streamRes, degreeRes, yearRes, courseRes] = await Promise.all([
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
      ]);

      if (streamRes.ok && degreeRes.ok && yearRes.ok) {
        const [streamData, degreeData, yearData, courseData] =
          await Promise.all([
            streamRes.json(),
            degreeRes.json(),
            yearRes.json(),
            courseRes.json(),
          ]);

        const activeStreams = streamData.filter((el) => el.isActive);
        const activeDegrees = degreeData.filter((el) => el.isActive);
        const activeYears = yearData.filter((el) => el.isActive);
        setStreams(activeStreams);
        setDegrees(activeDegrees);
        setYears(activeYears);

        if (courseData.err) {
          setCourses([]);
          setFilteredCourses([]);
          setLoading(false);
          return;
        }

        setCourses(courseData);
        setFilteredCourses(courseData);
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
      setFilteredCourses(courses);
      return;
    }

    const data = filteredCourses.filter((el) =>
      el.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredCourses(data);
  }, [search, courses]);

  useEffect(() => {
    let data = courses;

    if (filterStream) {
      data = data.filter((el) => el.stream === filterStream);
    }

    if (filterDegree) {
      data = data.filter((el) => el.degree === filterDegree);
    }

    if (filterYear) {
      data = data.filter((el) => el.year === filterYear);
    }

    setFilteredCourses(data);
  }, [filterStream, filterDegree, filterYear]);

  useEffect(() => {
    if (dialogAction === "edit") {
      setEditDialogName(selectedCourse.name);
      setEditDialogCode(selectedCourse.code);
      setEditDialogCount(selectedCourse.semCount);
      setSelectedStream(selectedCourse.stream);
      setSelectedDegree(selectedCourse.degree);
      setSelectedYear(selectedCourse.year);
    }
  }, [dialogAction]);

  const clearFilters = () => {
    setFilterStream(null);
    setFilterDegree(null);
    setFilterYear(null);
  };

  const handleCreate = async () => {
    try {
      if (!selectedStream || !selectedDegree || !selectedYear) {
        toast.error("Please select year, stream(s), and degree(s)");
        return;
      }

      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/course`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: addDialogName,
            code: addDialogCode,
            semCount: addDialogCount,
            stream: selectedStream,
            degree: selectedDegree,
            year: selectedYear,
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setCourses([...courses, data.course]);
        setFilteredCourses([...courses, data.course]);
        toast.success("Course added successfully");
        setLoading(false);
        setDialogAction("");
        setSelectedStream(null);
        setSelectedDegree(null);
        setSelectedYear(null);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add academic year");
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    setFilteredCourses(courses);
  }, [courses]);

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const payload = {
        year: selectedYear,
        stream: selectedStream,
        degree: selectedDegree,
        name: editDialogName,
        code: editDialogCode,
        semCount: editDialogCount,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/course/${selectedCourse.uuid}`,
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
        toast.success("Academic year updated successfully 🎉");
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
    if (filteredCourses.length < 1) {
      toast.error("No data to export");
      return;
    }

    // prepare cleaned export data
    const cleaned_data = filteredCourses.map((el) => ({
      UUID: el.uuid,
      "Academic Year": getYear(el.year),
      Degree: getDegreeName(el.degree),
      Stream: getStreamName(el.stream),
      "Course Code": el.code,
      "Course Name": el.name,
      "Semester Count": el.semCount,
    }));

    try {
      const worksheet = XLSX.utils.json_to_sheet(cleaned_data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Courses");

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
      link.setAttribute("download", "Courses.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Export successful 🎉");
      setDialogAction("");
    } catch (error) {
      toast.error("Export failed: " + error.message);
    }
  };

  const handleChangeStatus = async (year) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/course/${year.uuid}/status`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: !year.isActive }),
        }
      );

      if (res.ok) {
        await getData();
        toast.success(
          `Year ${!year.isActive ? "activated" : "deactivated"} successfully`
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
        "Course Name",
        "Course Code",
        "Semester Count",
        "Academic Year",
        "Stream Name",
        "Degree Name",
      ];

      const worksheet = XLSX.utils.aoa_to_sheet([
        headers,
        [
          "Test Course",
          "Test Course Code",
          "Test Count",
          "Test Year",
          "Test Stream",
          "Test Degree",
        ],
      ]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Courses Template");

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
      link.setAttribute("download", "Courses_Template.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Template downloaded 🎉");
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const newFiltered = courses.filter((course) => {
      const hasActiveStream = streams.some(
        (s) => s.uuid === course.stream && s.isActive
      );
      const hasActiveDegree = degrees.some(
        (d) => d.uuid === course.degree && d.isActive
      );
      const hasActiveYear = years.some(
        (y) => y.uuid === course.year && y.isActive // Compare with y.uuid, not y.year
      );
      console.log("Course Filter Result:", {
        course: course.name,
        stream: course.stream,
        degree: course.degree,
        year: course.year,
        hasActiveStream,
        hasActiveDegree,
        hasActiveYear,
      });
      return hasActiveStream && hasActiveDegree && hasActiveYear;
    });
    console.log("Filtered Courses:", newFiltered);
    setFilteredCourses(newFiltered);
  }, [years, streams, degrees, courses]);

  const displayedCourses = filteredCourses.filter((course) =>
    viewMode === "active" ? course.isActive : !course.isActive
  );

  console.log(displayedCourses, filteredCourses);

  const getStreamName = (id) => {
    const stream = streams.find((el) => el.uuid === id);
    return stream?.name;
  };

  const getDegreeName = (id) => {
    const degree = degrees.find((el) => el.uuid === id);
    return degree?.name;
  };

  const getYear = (id) => {
    const year = years.find((el) => el.uuid === id);
    return year?.year;
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
        const name = (row["Course Name"] || "").toString().trim();
        const code = (row["Course Code"] || "").toString().trim();
        const semCount = (row["Semester Count"] || "").toString().trim();
        let stream = (row["Stream Name"] || "").toString().trim();
        let degree = (row["Degree Name"] || "").toString().trim();
        let year = (row["Academic Year"] || "").toString().trim();

        stream = stream.replace(/\s+/g, " ");
        degree = degree.replace(/\s+/g, " ");
        year = year.replace(/\s+/g, " ");

        if (!name || !code || !semCount || !stream || !degree || !year) return;

        const key = `${name}-${code}-${stream}-${degree}-${year}`;

        if (!seen.has(key)) {
          seen.add(key);
          sanitized_data.push({
            name,
            code,
            semCount,
            stream,
            degree,
            year,
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/course/bulk`,
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
        throw new Error(err.error || "Failed to import courses");
      }

      const data = await res.json();
      toast.success(`${sanitized_data.length} courses imported successfully`);

      // Update frontend state
      setStreams((prev) => [...prev, ...data.data.streams]);
      setDegrees((prev) => [...prev, ...data.data.degrees]);
      setYears((prev) => [...prev, ...data.data.years]);
      setCourses((prev) => [...prev, ...data.data.courses]);
      setFilteredCourses((prev) => [...prev, ...data.data.courses]);

      setDialogAction("");
      setLoading(false);
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 text-sm flex-1 border-0">
      {/* Header */}
      <div className="flex flex-col mb-6">
        <div className="flex gap-2 justify-start items-center">
          <SidebarTrigger className="cursor-pointer" />
          <h1 className="text-sm font-medium text-gray-800">
            Courses Management
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          Create and manage evaluation courses
        </p>
      </div>
      {/* Stats and Actions Section */}
      <div className="bg-white rounded-lg mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {courses.length}
              </div>
              <div className="text-xs text-blue-500">Total Courses</div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {courses.filter((s) => s.isActive).length}
              </div>
              <div className="text-xs text-green-500">Active Courses</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              onClick={() => setDialogAction("new")}
              className="flex items-center gap-2 cursor-pointer text-sm"
              size="sm"
            >
              <Plus size={16} />
              Add Course
            </Button>

            <Button
              onClick={() => setDialogAction("import")}
              className="flex items-center gap-2 cursor-pointer text-sm"
              size="sm"
            >
              <ImportIcon size={16} />
              Import Courses
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

            {(filterStream || filterDegree) && (
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
          <div className="flex gap-2 justify-between items-center">
            <div className="relative w-full sm:w-80">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="pl-10"
              />
            </div>
            <Select
              value={filterStream || ""}
              onValueChange={(value) => setFilterStream(value)}
            >
              <SelectTrigger className="text-sm cursor-pointer">
                <SelectValue placeholder="Select Stream" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {streams.map((opt, idx) => (
                    <SelectItem
                      key={idx}
                      value={opt.uuid}
                      className="text-sm cursor-pointer"
                    >
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {filterStream && (
              <Select
                value={filterDegree || ""}
                onValueChange={(value) => setFilterDegree(value)}
              >
                <SelectTrigger className="text-sm cursor-pointer">
                  <SelectValue placeholder="Select Stream" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {degrees
                      .filter((el) => el.isActive && el.stream === filterStream)
                      .map((opt, idx) => (
                        <SelectItem
                          key={idx}
                          value={opt.uuid}
                          className="text-sm cursor-pointer"
                        >
                          {opt.name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
            {filterDegree && (
              <Select
                value={filterYear || ""}
                onValueChange={(value) => setFilterYear(value)}
              >
                <SelectTrigger className="text-sm cursor-pointer">
                  <SelectValue placeholder="Select Stream" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {years
                      .filter(
                        (el) =>
                          el.isActive &&
                          el.streams?.includes(filterStream) &&
                          el.degrees?.includes(filterDegree)
                      )
                      .map((opt, idx) => (
                        <SelectItem
                          key={idx}
                          value={opt.uuid}
                          className="text-sm cursor-pointer"
                        >
                          {opt.year}
                        </SelectItem>
                      ))}
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
      {/* Streams Table Section */}
      <div className="bg-white rounded-lg">
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Stream</TableHead>
              <TableHead>Degree</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="flex justify-center items-center gap-1">
                <TableCell className="flex justify-center items-center gap-1">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </TableCell>
              </TableRow>
            ) : displayedCourses.length > 0 ? (
              displayedCourses.map((course, i) => (
                <TableRow key={course.uuid}>
                  <TableCell className="font-medium">{i + 1}</TableCell>
                  <TableCell className="font-medium text-sm">
                    {course.name}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500 font-mono">
                    {course.uuid}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500 font-mono">
                    {course.code}
                  </TableCell>
                  <TableCell className="font-medium text-sm w-max">
                    {getStreamName(course.stream)}
                  </TableCell>
                  <TableCell className="font-medium text-sm w-max">
                    {getDegreeName(course.degree)}
                  </TableCell>
                  <TableCell className="font-medium text-sm w-max">
                    {getYear(course.year)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={course.isActive ? "default" : "secondary"}>
                      {course.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCourse(course);
                          setDialogAction("edit");
                        }}
                        className="h-8 cursor-pointer"
                      >
                        <Edit size={14} className="mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant={course.isActive ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleChangeStatus(course)}
                        disabled={loading}
                        className="h-8 cursor-pointer"
                      >
                        <Power size={14} className="mr-1" />
                        {course.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No {viewMode} courses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Create Degree Dialog */}
      <Dialog
        open={dialogAction === "new"}
        onOpenChange={(open) => !open && setDialogAction("")}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              Add a new course to the system.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-3">
            {/* Stream Select */}
            <div className="flex flex-col gap-1">
              <label>Stream</label>
              <Select
                value={selectedStream || ""}
                onValueChange={(value) => setSelectedStream(value)}
              >
                <SelectTrigger className="text-sm cursor-pointer w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {streams
                      .filter((el) => el.isActive === true)
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
            {/* Degree Select */}
            <div className="flex flex-col gap-1">
              <label>Degree</label>
              <Select
                value={selectedDegree || ""}
                disabled={!selectedStream}
                onValueChange={(value) => setSelectedDegree(value)}
              >
                <SelectTrigger className="text-sm cursor-pointer w-full">
                  <SelectValue placeholder="Select Degree" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {degrees
                      .filter(
                        (el) =>
                          el.isActive === true && el.stream === selectedStream
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
            {/* Year Select */}
            <div className="flex flex-col gap-1">
              <label>Year</label>
              <Select
                value={selectedYear || ""}
                disabled={!selectedDegree}
                onValueChange={(value) => setSelectedYear(value)}
              >
                <SelectTrigger className="text-sm cursor-pointer w-full">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {years
                      .filter(
                        (el) =>
                          el.isActive === true &&
                          el.streams.includes(selectedStream) &&
                          el.degrees.includes(selectedDegree)
                      )
                      .map((opt) => (
                        <SelectItem
                          key={opt.uuid}
                          value={opt.uuid}
                          className="text-sm cursor-pointer"
                        >
                          {opt.year}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Name input */}
            <div className="flex flex-col gap-1">
              <label>Course Name</label>
              <Input
                placeholder="Course Name"
                value={addDialogName}
                onChange={(e) => setAddDialogName(e.target.value)}
              />
            </div>

            {/* Code input */}
            <div className="flex flex-col gap-1">
              <label>Course Code</label>
              <Input
                placeholder="Course Code"
                value={addDialogCode}
                onChange={(e) => setAddDialogCode(e.target.value)}
              />
            </div>

            {/* SemCount input */}
            <div className="flex flex-col gap-1">
              <label>Semester Count</label>
              <Input
                placeholder="Semester Count"
                value={addDialogCount}
                onChange={(e) => setAddDialogCount(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAction("")}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                loading || !addDialogName || !addDialogCode || !addDialogCount
              }
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Course"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Degree Dialog */}
      <Dialog
        open={dialogAction === "edit"}
        onOpenChange={(open) => !open && setDialogAction("")}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>edit course here.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-3">
            {/* Stream Select */}
            <div className="flex flex-col gap-1">
              <label>Stream</label>
              <Select
                value={selectedStream || ""}
                onValueChange={(value) => setSelectedStream(value)}
              >
                <SelectTrigger className="text-sm cursor-pointer w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {streams
                      .filter((el) => el.isActive === true)
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
            {/* Degree Select */}
            <div className="flex flex-col gap-1">
              <label>Degree</label>
              <Select
                value={selectedDegree || ""}
                disabled={!selectedStream}
                onValueChange={(value) => setSelectedDegree(value)}
              >
                <SelectTrigger className="text-sm cursor-pointer w-full">
                  <SelectValue placeholder="Select Degree" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {degrees
                      .filter(
                        (el) =>
                          el.isActive === true && el.stream === selectedStream
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
            {/* Year Select */}
            <div className="flex flex-col gap-1">
              <label>Year</label>
              <Select
                value={selectedYear || ""}
                disabled={!selectedDegree}
                onValueChange={(value) => setSelectedYear(value)}
              >
                <SelectTrigger className="text-sm cursor-pointer w-full">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {years
                      .filter(
                        (el) =>
                          el.isActive === true &&
                          el.streams.includes(selectedStream) &&
                          el.degrees.includes(selectedDegree)
                      )
                      .map((opt) => (
                        <SelectItem
                          key={opt.uuid}
                          value={opt.uuid}
                          className="text-sm cursor-pointer"
                        >
                          {opt.year}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Name input */}
            <div className="flex flex-col gap-1">
              <label>Course Name</label>
              <Input
                placeholder="Course Name"
                value={editDialogName}
                onChange={(e) => setEditDialogName(e.target.value)}
              />
            </div>

            {/* Code input */}
            <div className="flex flex-col gap-1">
              <label>Course Code</label>
              <Input
                placeholder="Course Code"
                value={editDialogCode}
                onChange={(e) => setEditDialogCode(e.target.value)}
              />
            </div>

            {/* SemCount input */}
            <div className="flex flex-col gap-1">
              <label>Semester Count</label>
              <Input
                placeholder="Semester Count"
                value={editDialogCount}
                onChange={(e) => setEditDialogCount(e.target.value)}
              />
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
                !editDialogCount
              }
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Course"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Import Degrees Dialog */}
      <Dialog
        open={dialogAction === "import"}
        onOpenChange={(open) => !open && setDialogAction("")}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Course</DialogTitle>
            <DialogDescription>Import courses through excel</DialogDescription>
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
                "Import Courses"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
