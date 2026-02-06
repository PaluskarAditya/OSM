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
  DialogClose,
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
  FilterIcon,
  XIcon,
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
  const [evaluations, setEvaluations] = useState([]);
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
  // const [currEval, setCurrEval] = useState(null); // Removed as unused/buggy

  // Filters for main view
  const [selectedCombined, setSelectedCombined] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Filters for assigned view
  const [selectedAssignedCombined, setSelectedAssignedCombined] =
    useState(null);
  const [selectedAssignedCourse, setSelectedAssignedCourse] = useState(null);
  const [selectedAssignedSemester, setSelectedAssignedSemester] =
    useState(null);
  const [selectedAssignedSubject, setSelectedAssignedSubject] = useState(null);

  const [assignedCandidates, setAssignedCandidates] = useState([]);

  // Modals - unused, but kept for now
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
        evalRes,
      ] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/stream`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degree`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
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
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/eval`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (
        !streamsRes.ok ||
        !degreesRes.ok ||
        !yearsRes.ok ||
        !coursesRes.ok ||
        !combinedsRes.ok ||
        !subjectsRes.ok ||
        !candidatesRes.ok ||
        !userRes.ok ||
        !sheetRes.ok ||
        !evalRes.ok
      ) {
        throw new Error("One or more API calls failed");
      }

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
        evalData,
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
        evalRes.json(),
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
      setEvaluations(evalData);

      const examiners = userData.filter((u) =>
        ["Examiner", "Moderator"].includes(u.Role),
      );
      setUsers(examiners);
    } catch (err) {
      toast.error(err.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  // === Helper Functions ===
  const isCandidateAssignedForSubject = (candidate, subjectUuid) => {
    if (!candidate?.assignmentId || !subjectUuid) return false;

    return evaluations.some((evaluation) => {
      if (evaluation.subject !== subjectUuid) return false;

      return evaluation.sheets.some(
        (sheet) => sheet.assignmentId === candidate.assignmentId,
      );
    });
  };

  const formatDateForBackend = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

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

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    const suffix =
      day % 10 === 1 && day !== 11
        ? "st"
        : day % 10 === 2 && day !== 12
          ? "nd"
          : day % 10 === 3 && day !== 13
            ? "rd"
            : "th";

    return `${month} ${day}${suffix}, ${year}`;
  };

  // === Filtering Logic (Merged duplicates) ===
  useEffect(() => {
    let result = [...candidates];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((c) => {
        const fullName =
          `${c.FirstName || ""} ${c.MiddleName || ""} ${c.LastName || ""}`.toLowerCase();
        return fullName.includes(q);
      });
    }

    if (selectedCombined)
      result = result.filter((c) => c.combined === selectedCombined.uuid);
    if (selectedCourse)
      result = result.filter((c) => c.course === selectedCourse.uuid);
    if (selectedSemester)
      result = result.filter((c) => c.sem === selectedSemester);
    if (selectedSubject)
      result = result.filter((c) => c.subjects?.includes(selectedSubject.uuid));

    setFilteredCandidates(result);
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
    let result = [...candidates];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((c) => {
        const fullName =
          `${c.FirstName || ""} ${c.MiddleName || ""} ${c.LastName || ""}`.toLowerCase();
        return fullName.includes(q);
      });
    }

    if (selectedAssignedCombined)
      result = result.filter(
        (c) => c.combined === selectedAssignedCombined.uuid,
      );
    if (selectedAssignedCourse)
      result = result.filter((c) => c.course === selectedAssignedCourse.uuid);
    if (selectedAssignedSemester)
      result = result.filter((c) => c.sem === selectedAssignedSemester);
    if (selectedAssignedSubject) {
      result = result.filter((c) =>
        c.subjects?.includes(selectedAssignedSubject.uuid),
      );
      // For "View Assigned", filter only assigned
      result = result.filter((c) =>
        isCandidateAssignedForSubject(c, selectedAssignedSubject.uuid),
      );
    }

    setAssignedCandidates(result);
  }, [
    candidates,
    search,
    selectedAssignedCombined,
    selectedAssignedCourse,
    selectedAssignedSemester,
    selectedAssignedSubject,
  ]);

  // === Selection Helpers ===
  const getUploadedCandidates = () => {
    if (!selectedSubject) return [];
    return filteredCandidates.filter((c) =>
      c.bookletNames?.[selectedSubject.uuid]?.trim(),
    );
  };

  const uploadedCandidates = getUploadedCandidates();

  const handleSelectAll = () => {
    const assignable = uploadedCandidates
      .filter((c) => !isCandidateAssignedForSubject(c, selectedSubject?.uuid))
      .map((c) => c._id);

    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(assignable);
    }
    setSelectAll(!selectAll);
  };

  const handleRowSelect = (id) => {
    const candidate = uploadedCandidates.find((c) => c._id === id);
    if (
      !candidate ||
      isCandidateAssignedForSubject(candidate, selectedSubject?.uuid)
    )
      return;

    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
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
    if (!filteredCandidates.length) {
      toast.error("No data to export");
      return;
    }

    const data = filteredCandidates.map((c) => ({
      RollNo: c.RollNo,
      PRN: c.PRNNumber,
      Name: `${c.FirstName || ""} ${c.MiddleName || ""} ${c.LastName || ""}`,
      Email: c.Email,
      Stream: combineds.find((cb) => cb.uuid === c.combined)?.name || "N/A",
      Course: courses.find((co) => co.uuid === c.course)?.name || "N/A",
      Subject: selectedSubject?.name || "N/A",
      Booklet: c.bookletNames?.[selectedSubject?.uuid] || "N/A",
      Uploaded: c.bookletNames?.[selectedSubject?.uuid] ? "Yes" : "No",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Candidates");
    XLSX.writeFile(
      wb,
      `Candidates_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  // === Assign Examiner ===
  const handleAssignExaminer = async () => {
    if (!selectedUser || selectedRows.length === 0 || !targetDate) {
      toast.error("Select examiner, candidates, and target date");
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
        endDate: formatDateForBackend(targetDate),
        semester: selectedSemester,
        iid: Cookies.get("iid"),
        progress: { uploaded: selectedRows.length, checked: 0 },
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
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Assignment failed");
      }

      const newEval = await res.json(); // Assume backend returns the created evaluation object

      toast.success(
        `Assigned ${selectedRows.length} candidate(s) successfully`,
      );

      // Update evaluations
      setEvaluations((prev) => [...prev, newEval]);

      // Optimistically update candidates
      setCandidates((prev) =>
        prev.map((cand) => {
          if (selectedRows.includes(cand._id)) {
            return {
              ...cand,
              assignedEvaluations: [
                ...(cand.assignedEvaluations || []),
                newEval.uuid,
              ],
            };
          }
          return cand;
        }),
      );

      setSelectedRows([]);
      setSelectAll(false);
      setTargetDate("");
      setSelectedUser(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedAssignedCombined(null);
    setSelectedAssignedCourse(null);
    setSelectedAssignedSemester(null);
    setSelectedAssignedSubject(null);
    setAssignedCandidates([]);
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
                <Button
                  size="sm"
                  variant="default"
                  className="gap-2 cursor-pointer"
                >
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
                <Button
                  size="sm"
                  variant="default"
                  className="gap-2 cursor-pointer"
                >
                  <Filter className="h-4 w-4" /> View Assigned
                </Button>
              </DialogTrigger>
              <DialogContent className="lg:min-w-[80vw] md:min-w-[80vw]">
                <DialogHeader>
                  <div className="flex w-full items-center justify-between mt-3">
                    {/* LEFT SIDE (Title + Description) */}
                    <div className="flex flex-col">
                      <DialogTitle className="flex items-center gap-2">
                        <FilterIcon className="h-5 w-5" />
                        Filters
                      </DialogTitle>
                      <DialogDescription>
                        View candidates assigned for evaluation
                      </DialogDescription>
                    </div>

                    {/* RIGHT SIDE (Clear button) */}
                    <Button
                      onClick={handleReset}
                      size="sm"
                      variant="outline"
                      className="flex items-center cursor-pointer gap-1 text-xs"
                    >
                      clear filters
                      <XIcon className="h-3 w-3" />
                    </Button>
                  </div>
                </DialogHeader>
                <div className="mt-4 flex flex-col gap-4 w-full">
                  {/* FILTER GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    {/* Combined */}
                    <div className="flex flex-col gap-1">
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

                    {/* Course */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-700">
                        Course
                      </label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            disabled={!selectedAssignedCombined}
                            className="w-full justify-between text-left font-normal"
                          >
                            <span className="truncate">
                              {selectedAssignedCourse?.name || "Select"}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="max-h-60 overflow-auto w-full">
                          {courses
                            .filter(
                              (c) =>
                                c.isActive &&
                                selectedAssignedCombined?.course.includes(
                                  c.uuid,
                                ),
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

                    {/* Semester */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-700">
                        Semester
                      </label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            disabled={!selectedAssignedCourse}
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
                        <DropdownMenuContent className="max-h-60">
                          {Array.from(
                            {
                              length:
                                Number(selectedAssignedCourse?.semCount) || 0,
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
                            ),
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Subject */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-700">
                        Subject
                      </label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            disabled={!selectedAssignedSemester}
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
                                s.semester === selectedAssignedSemester,
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
                  </div>

                  {/* TABLE HEADER */}
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Roll No</TableHead>
                        <TableHead>Stream | Degree | Year</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Subject</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="max-h-[40vh] overflow-y-auto">
                      {assignedCandidates.length > 0 ? (
                        assignedCandidates.map((c, i) => (
                          <TableRow key={c._id} className="hover:bg-gray-50">
                            <TableCell>{i + 1}</TableCell>
                            <TableCell>
                              {`${c.FirstName || ""} ${c.MiddleName || ""} ${c.LastName || ""}`}
                            </TableCell>
                            <TableCell>{c.RollNo}</TableCell>
                            <TableCell>
                              {combineds.find(
                                (combined) => combined.uuid === c.combined,
                              )?.name || "N/A"}
                            </TableCell>
                            <TableCell>
                              {courses.find(
                                (course) => course.uuid === c.course,
                              )?.name || "N/A"}
                            </TableCell>
                            <TableCell>
                              {subjects.find(
                                (subject) =>
                                  subject.uuid ===
                                  selectedAssignedSubject?.uuid,
                              )?.name || "N/A"}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-4 text-gray-500"
                          >
                            No assigned candidates found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      size="sm"
                      variant="default"
                      className="cursor-pointer text-xs"
                    >
                      Close
                    </Button>
                  </DialogClose>
                </DialogFooter>
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
                    .filter((c) => selectedCombined.course?.includes(c.uuid))
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
                    { length: Number(selectedCourse.semCount) || 0 },
                    (_, i) => (
                      <DropdownMenuItem
                        key={i + 1}
                        onSelect={() => setSelectedSemester(`${i + 1}`)}
                      >
                        Semester {i + 1}
                      </DropdownMenuItem>
                    ),
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
                        s.semester === selectedSemester,
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
                value={selectedUser?._id || ""}
                onValueChange={(v) =>
                  setSelectedUser(users.find((u) => u._id === v) || null)
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
                      formatDateDisplay(targetDate)
                    ) : (
                      <span>Select target date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={targetDate ? new Date(targetDate) : undefined}
                    onSelect={(date) =>
                      setTargetDate(date?.toISOString().split("T")[0] || "")
                    }
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
                      disabled={isCandidateAssignedForSubject(
                        c,
                        selectedSubject?.uuid,
                      )}
                      className="rounded border-gray-300"
                    />
                    <div>
                      <p className="font-medium">
                        {`${c.FirstName || ""} ${c.MiddleName || ""} ${c.LastName || ""}`}
                      </p>
                      <p className="text-xs text-gray-600">
                        {c.RollNo} • {c.PRNNumber}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                    {c.bookletNames?.[selectedSubject?.uuid] || "N/A"}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {courses.find((co) => co.uuid === c.course)?.name || "N/A"} •{" "}
                  {selectedSubject?.name || "N/A"}
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
                  .filter(
                    (c) =>
                      !isCandidateAssignedForSubject(c, selectedSubject?.uuid),
                  )
                  .map((c, i) => (
                    <TableRow key={c._id} className="hover:bg-gray-50">
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(c._id)}
                          onChange={() => handleRowSelect(c._id)}
                          disabled={isCandidateAssignedForSubject(
                            c,
                            selectedSubject?.uuid,
                          )}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell className="font-medium">
                        {`${c.FirstName || ""} ${c.MiddleName || ""} ${c.LastName || ""}`}
                      </TableCell>
                      <TableCell className="font-mono">{c.RollNo}</TableCell>
                      <TableCell className="font-mono">{c.PRNNumber}</TableCell>
                      <TableCell>
                        {courses.find((co) => co.uuid === c.course)?.name ||
                          "N/A"}
                      </TableCell>
                      <TableCell>{selectedSubject?.name || "N/A"}</TableCell>
                      <TableCell>
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {c.bookletNames?.[selectedSubject?.uuid] || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-mono text-xs px-2 py-1 rounded ${
                            isCandidateAssignedForSubject(
                              c,
                              selectedAssignedSubject?.uuid,
                            )
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {isCandidateAssignedForSubject(
                            c,
                            selectedAssignedSubject?.uuid,
                          )
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
