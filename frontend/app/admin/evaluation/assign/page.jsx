"use client";

import React, { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogHeader,
  DialogFooter,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  BookImage,
  ChevronDown,
  TrashIcon,
  UploadCloud,
  X,
  Search,
  Filter,
  Download,
  UserCheck,
  Loader2,
  CheckCircle2,
  CalendarIcon,
  File,
  FileIcon,
} from "lucide-react";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
} from "@/components/ui/select";
import { toast } from "sonner";
import Cookies from "js-cookie";

export default function EvaluationPage() {
  // === State ===
  const [streams, setStreams] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [years, setYears] = useState([]);
  const [courses, setCourses] = useState([]);
  const [combineds, setCombineds] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [users, setUsers] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [targetDate, setTargetDate] = useState("");

  // Filters
  const [selectedAssignedCombined, setSelectedAssignedCombined] =
    useState(null);
  const [selectedAssignedCourse, setSelectedAssignedCourse] = useState(null);
  const [selectedAssignedSemester, setSelectedAssignedSemester] =
    useState(null);
  const [selectedAssignedSubject, setSelectedAssignedSubject] = useState(null);

  const [selectedCombined, setSelectedCombined] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [assignedCandidates, setAssignedCandidates] = useState([]);

  // Modals
  const [assignSubjectModal, setAssignSubjectModal] = useState(false);
  const [assignedSubject, setAssignedSubject] = useState(null);

  const token = Cookies.get("token");
  const role = Cookies.get("role");

  // === Responsive Detection ===
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // === Data Fetch ===
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [
          streamsRes,
          degreesRes,
          yearsRes,
          coursesRes,
          combinedsRes,
          subjectsRes,
          candidatesRes,
          userRes,
          sheetRes,
        ] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/stream`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degree`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/course`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/combined`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subject`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/answer-sheet`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [
          streamsData,
          degreesData,
          yearsData,
          coursesData,
          combinedsData,
          subjectsData,
          candidatesData,
          userData,
          sheetData,
        ] = await Promise.all([
          streamsRes.json(),
          degreesRes.json(),
          yearsRes.json(),
          coursesRes.json(),
          combinedsRes.json(),
          subjectsRes.json(),
          candidatesRes.json(),
          userRes.json(),
          sheetRes.json(),
        ]);

        setStreams(streamsData);
        setDegrees(degreesData);
        setYears(yearsData);
        setCourses(coursesData);
        setCombineds(combinedsData);
        setSubjects(subjectsData);
        setCandidates(candidatesData);
        setFilteredCandidates(candidatesData);
        setSheets(sheetData);

        const examiners = userData.filter((u) =>
          ["Examiner", "Moderator"].includes(u.Role)
        );
        setUsers(examiners);
      } catch (err) {
        toast.error(err.message || "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  // === Filtering Logic ===
  useEffect(() => {
    let data = candidates;

    if (search) {
      const q = search.toLowerCase();
      data = data.filter((c) => {
        const name =
          `${c.FirstName} ${c.MiddleName} ${c.LastName}`.toLowerCase();
        return name.includes(q);
      });
    }

    if (selectedCombined)
      data = data.filter((c) => c.combined === selectedCombined.uuid);
    if (selectedCourse)
      data = data.filter((c) => c.course === selectedCourse.uuid);
    if (selectedSemester) data = data.filter((c) => c.sem === selectedSemester);
    if (selectedSubject)
      data = data.filter((c) => c.subjects?.includes(selectedSubject.uuid));

    setFilteredCandidates(data);
    setSelectedRows([]);
    setSelectAll(false);
  }, [
    candidates,
    search,
    selectedCombined,
    selectedCourse,
    selectedSemester,
    selectedSubject,
  ]);

  useEffect(() => {
    let data = candidates;

    if (search) {
      const q = search.toLowerCase();
      data = data.filter((c) => {
        const name =
          `${c.FirstName} ${c.MiddleName} ${c.LastName}`.toLowerCase();
        return name.includes(q);
      });
    }

    if (selectedAssignedCombined)
      data = data.filter((c) => c.combined === selectedAssignedCombined.uuid);
    if (selectedAssignedCourse)
      data = data.filter((c) => c.course === selectedAssignedCourse.uuid);
    if (selectedAssignedSemester)
      data = data.filter((c) => c.sem === selectedAssignedSemester);
    if (selectedAssignedSubject)
      data = data.filter((c) =>
        c.subjects?.includes(selectedAssignedSubject.uuid)
      );

    setFilteredCandidates(data);
    setSelectedRows([]);
    setSelectAll(false);
  }, [
    candidates,
    search,
    selectedAssignedCombined,
    selectedAssignedCourse,
    selectedAssignedSemester,
    selectedAssignedSubject,
  ]);

  useEffect(() => {
    let data = candidates;

    if (search) {
      const q = search.toLowerCase();
      data = data.filter((c) => {
        const name =
          `${c.FirstName} ${c.MiddleName} ${c.LastName}`.toLowerCase();
        return name.includes(q);
      });
    }

    if (selectedCombined)
      data = data.filter((c) => c.combined === selectedCombined.uuid);
    if (selectedCourse)
      data = data.filter((c) => c.course === selectedCourse.uuid);
    if (selectedSemester) data = data.filter((c) => c.sem === selectedSemester);
    if (selectedSubject)
      data = data.filter((c) => c.subjects?.includes(selectedSubject.uuid));

    setFilteredCandidates(data);
    setSelectedRows([]);
    setSelectAll(false);
  }, [
    candidates,
    search,
    selectedCombined,
    selectedCourse,
    selectedSemester,
    selectedSubject,
  ]);

  // === Selection Helpers ===
  const getUploadedCandidates = () => {
    if (!selectedSubject) return [];
    return filteredCandidates.filter((c) =>
      c.bookletNames?.[selectedSubject.uuid]?.trim()
    );
  };

  const uploadedCandidates = getUploadedCandidates();

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(uploadedCandidates.map((c) => c._id));
    }
    setSelectAll(!selectAll);
  };

  const handleRowSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setSelectedCombined(null);
    setSelectedCourse(null);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setSelectedRows([]);
    setSelectAll(false);
  };

  // === Export ===
  const exportToExcel = () => {
    const data = filteredCandidates.map((c) => ({
      RollNo: c.RollNo,
      PRN: c.PRNNumber,
      Name: `${c.FirstName} ${c.MiddleName} ${c.LastName}`,
      Email: c.Email,
      Stream: combineds.find((cb) => cb.uuid === c.combined)?.name || "N/A",
      Course: courses.find((co) => co.uuid === c.course)?.name || "N/A",
      Subject: selectedSubject?.name || "N/A",
      Booklet: c.bookletNames?.[selectedSubject?.uuid] || "N/A",
      Uploaded: c.sheetUploaded ? "Yes" : "No",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Candidates");
    XLSX.writeFile(
      wb,
      `Candidates_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  function format(date) {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d)) return "";

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    // Add suffix to day (st, nd, rd, th)
    const suffix =
      day % 10 === 1 && day !== 11
        ? "st"
        : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
        ? "rd"
        : "th";

    return `${month} ${day}${suffix}, ${year}`;
  }

  // === Assign Examiner ===
  const handleAssignExaminer = async () => {
    if (!selectedUser || selectedRows.length === 0) {
      toast.error("Select examiner and candidates");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        sheets: selectedRows
          .map((id) => {
            const c = candidates.find((x) => x._id === id);
            return c
              ? {
                  assignmentId: c.assignmentId,
                  status: "Pending",
                  isChecked: "Not Evaluated",
                  marks: 0,
                  attendance: "Present",
                }
              : null;
          })
          .filter(Boolean),
        name: selectedSubject.name,
        course: selectedCourse.uuid,
        subject: selectedSubject.uuid,
        examiners: [selectedUser._id],
        endDate: targetDate,
        semester: selectedSemester,
        iid: Cookies.get("iid"),
        progress: { uploaded: sheets.length, checked: 0 },
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/eval`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        toast.success("Assigned successfully");
        setSelectedRows([]);
        setSelectAll(false);
      } else throw new Error("Failed");
    } catch (err) {
      toast.error("Assignment failed");
    } finally {
      setIsLoading(false);
    }
  };

  // === Render ===
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="h-8 w-8" />
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Evaluation Management
          </h1>
          <p className="text-sm text-gray-600">
            Assign examiners and track answer sheets
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Search + Actions */}
        <div className="flex flex-col md:flex-row gap-3 justify-between">
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" className="gap-2 cursor-pointer">
                  <Download className="h-4 w-4" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToExcel} className="gap-2">
                  <Download className="h-4 w-4" /> Candidates (Excel)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="default" className="gap-2 cursor-pointer">
                  <FileIcon className="h-4 w-4" /> View Assigned
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl w-auto">
                <DialogHeader>
                  <DialogTitle>Assigned Evaluations</DialogTitle>
                  <DialogDescription>
                    View Candidates with Evaluations assigned
                  </DialogDescription>
                </DialogHeader>
                <main className="flex flex-col gap-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Stream/Degree/Year */}
                    <div>
                      <label className="text-xs font-medium text-gray-700">
                        Stream | Degree | Year
                      </label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between text-left font-normal"
                          >
                            <span className="truncate">
                              {selectedAssignedCombined?.name || "Select"}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="max-h-60 overflow-auto w-full">
                          {combineds.map((c) => (
                            <DropdownMenuItem
                              key={c.uuid}
                              onSelect={() => setSelectedAssignedCombined(c)}
                            >
                              {c.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {selectedAssignedCombined && (
                      <div>
                        <label className="text-xs font-medium text-gray-700">
                          Course
                        </label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between text-left font-normal"
                            >
                              <span className="truncate">
                                {selectedAssignedCourse?.name || "Select"}
                              </span>
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="max-h-60 overflow-auto">
                            {courses
                              .filter((c) =>
                                selectedAssignedCombined.course.includes(c.uuid)
                              )
                              .map((c) => (
                                <DropdownMenuItem
                                  key={c.uuid}
                                  onSelect={() => setSelectedAssignedCourse(c)}
                                >
                                  {c.name}
                                </DropdownMenuItem>
                              ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}

                    {selectedAssignedCourse && (
                      <div>
                        <label className="text-xs font-medium text-gray-700">
                          Semester
                        </label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between text-left font-normal"
                            >
                              <span className="truncate">
                                {selectedAssignedSemester
                                  ? `Sem ${selectedAssignedSemester}`
                                  : "Select"}
                              </span>
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {Array.from(
                              {
                                length: Number(selectedAssignedCourse.semCount),
                              },
                              (_, i) => (
                                <DropdownMenuItem
                                  key={i + 1}
                                  onSelect={() =>
                                    setSelectedAssignedSemester(`${i + 1}`)
                                  }
                                >
                                  Semester {i + 1}
                                </DropdownMenuItem>
                              )
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}

                    {selectedAssignedSemester && (
                      <div>
                        <label className="text-xs font-medium text-gray-700">
                          Subject
                        </label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between text-left font-normal"
                            >
                              <span className="truncate">
                                {selectedAssignedSubject?.name || "Select"}
                              </span>
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="max-h-60 overflow-auto">
                            {subjects
                              .filter(
                                (s) =>
                                  s.course === selectedAssignedCourse?.uuid &&
                                  s.semester === selectedAssignedSemester
                              )
                              .map((s) => (
                                <DropdownMenuItem
                                  key={s.uuid}
                                  onSelect={() => setSelectedAssignedSubject(s)}
                                >
                                  {s.name}
                                </DropdownMenuItem>
                              ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 overflow-auto max-h-96">
                    <Table>
                      <TableHeader className="sticky top-0 bg-gray-50 z-10">
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Roll No</TableHead>
                          <TableHead>PRN</TableHead>
                          <TableHead>Course</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Booklet</TableHead>
                          <TableHead>Evaluation Assigned</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {assignedCandidates.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={8}
                              className="text-center py-8 text-gray-500"
                            >
                              {selectedAssignedSubject
                                ? "No assigned answer-sheets for this subject"
                                : "Select filters to see assigned candidates"}
                            </TableCell>
                          </TableRow>
                        ) : (
                          assignedCandidates.map((c, i) => {
                            const booklet =
                              selectedAssignedSubject?.uuid &&
                              c.bookletNames?.[selectedAssignedSubject.uuid]
                                ? c.bookletNames[selectedAssignedSubject.uuid]
                                : "—";

                            return (
                              <TableRow
                                key={c._id}
                                className="hover:bg-gray-50"
                              >
                                <TableCell>{i + 1}</TableCell>
                                <TableCell className="font-medium">
                                  {c.FirstName} {c.LastName}
                                </TableCell>
                                <TableCell className="font-mono">
                                  {c.RollNo}
                                </TableCell>
                                <TableCell className="font-mono">
                                  {c.PRNNumber}
                                </TableCell>
                                <TableCell>
                                  {courses.find((co) => co.uuid === c.course)
                                    ?.name ?? "—"}
                                </TableCell>
                                <TableCell>
                                  {selectedAssignedSubject?.name ?? "—"}
                                </TableCell>
                                <TableCell>
                                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                    {booklet}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="font-mono text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    Assigned
                                  </span>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </main>
              </DialogContent>
            </Dialog>

            {(selectedCombined ||
              selectedCourse ||
              selectedSemester ||
              selectedSubject) && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Stream/Degree/Year */}
          <div>
            <label className="text-xs font-medium text-gray-700">
              Stream | Degree | Year
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-left font-normal"
                >
                  <span className="truncate">
                    {selectedCombined?.name || "Select"}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-60 overflow-auto w-full">
                {combineds.map((c) => (
                  <DropdownMenuItem
                    key={c.uuid}
                    onSelect={() => setSelectedCombined(c)}
                  >
                    {c.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {selectedCombined && (
            <div>
              <label className="text-xs font-medium text-gray-700">
                Course
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between text-left font-normal"
                  >
                    <span className="truncate">
                      {selectedCourse?.name || "Select"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-60 overflow-auto">
                  {courses
                    .filter((c) => selectedCombined.course.includes(c.uuid))
                    .map((c) => (
                      <DropdownMenuItem
                        key={c.uuid}
                        onSelect={() => setSelectedCourse(c)}
                      >
                        {c.name}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {selectedCourse && (
            <div>
              <label className="text-xs font-medium text-gray-700">
                Semester
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between text-left font-normal"
                  >
                    <span className="truncate">
                      {selectedSemester ? `Sem ${selectedSemester}` : "Select"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {Array.from(
                    { length: Number(selectedCourse.semCount) },
                    (_, i) => (
                      <DropdownMenuItem
                        key={i + 1}
                        onSelect={() => setSelectedSemester(`${i + 1}`)}
                      >
                        Semester {i + 1}
                      </DropdownMenuItem>
                    )
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {selectedSemester && (
            <div>
              <label className="text-xs font-medium text-gray-700">
                Subject
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between text-left font-normal"
                  >
                    <span className="truncate">
                      {selectedSubject?.name || "Select"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-60 overflow-auto">
                  {subjects
                    .filter(
                      (s) =>
                        s.course === selectedCourse?.uuid &&
                        s.semester === selectedSemester
                    )
                    .map((s) => (
                      <DropdownMenuItem
                        key={s.uuid}
                        onSelect={() => setSelectedSubject(s)}
                      >
                        {s.name}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Examiner Assignment */}
        {role === "Admin" && selectedSubject && selectedRows.length > 0 && (
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Select Examiner */}
              <Select
                value={selectedUser?._id}
                onValueChange={(v) =>
                  setSelectedUser(users.find((u) => u._id === v))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Examiner" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u._id} value={u._id}>
                      {u.FirstName} {u.LastName} ({u.Role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Target Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !targetDate && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {targetDate ? (
                      format(targetDate)
                    ) : (
                      <span>Select target date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={targetDate}
                    onSelect={setTargetDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Assign Button */}
              <Button
                onClick={handleAssignExaminer}
                disabled={!selectedUser || !targetDate || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Assign {selectedRows.length} Candidate(s)
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Table / Cards */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600">Loading candidates...</p>
            </div>
          </div>
        ) : uploadedCandidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <BookImage className="h-12 w-12 mb-3 text-gray-400" />
            <p className="text-sm">
              {selectedSubject
                ? "No uploaded answer sheets found"
                : "Apply filters to view candidates"}
            </p>
          </div>
        ) : isMobile ? (
          /* Mobile Card View */
          <div className="p-4 space-y-3 max-h-full overflow-y-auto">
            {uploadedCandidates.map((c, i) => (
              <div
                key={c._id}
                className={`p-4 rounded-lg border ${
                  selectedRows.includes(c._id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(c._id)}
                      onChange={() => handleRowSelect(c._id)}
                      className="rounded border-gray-300"
                    />
                    <div>
                      <p className="font-medium">
                        {c.FirstName} {c.LastName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {c.RollNo} • {c.PRNNumber}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                    {c.bookletNames[selectedSubject.uuid]}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {courses.find((co) => co.uuid === c.course)?.name} •{" "}
                  {selectedSubject.name}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Desktop Table */
          <div className="overflow-auto h-full">
            <Table>
              <TableHeader className="sticky top-0 bg-gray-50 z-10">
                <TableRow>
                  <TableHead className="w-12 text-center">
                    {selectedSubject && uploadedCandidates.length > 0 && (
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    )}
                  </TableHead>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>PRN</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Booklet</TableHead>
                  <TableHead>Evaluation Assigned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadedCandidates
                  .filter((c) => c.isEvaluationAssigned === false)
                  .map((c, i) => (
                    <TableRow key={c._id} className="hover:bg-gray-50">
                      {c.isEvaluationAssigned === false && (
                        <TableCell className="text-center">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(c._id)}
                            onChange={() => handleRowSelect(c._id)}
                            className="rounded border-gray-300"
                          />
                        </TableCell>
                      )}
                      <TableCell>{i + 1}</TableCell>
                      <TableCell className="font-medium">
                        {c.FirstName} {c.LastName}
                      </TableCell>
                      <TableCell className="font-mono">{c.RollNo}</TableCell>
                      <TableCell className="font-mono">{c.PRNNumber}</TableCell>
                      <TableCell>
                        {courses.find((co) => co.uuid === c.course)?.name}
                      </TableCell>
                      <TableCell>{selectedSubject.name}</TableCell>
                      <TableCell>
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {c.bookletNames[selectedSubject.uuid]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {c.isEvaluationAssigned === true
                            ? "Assigned"
                            : "Not Assigned"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Floating Selection Bar */}
      {selectedRows.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">{selectedRows.length} selected</span>
        </div>
      )}
    </div>
  );
}
