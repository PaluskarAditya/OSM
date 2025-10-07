"use client";

import React from "react";
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
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  BookImage,
  ChevronDown,
  EyeClosedIcon,
  RemoveFormattingIcon,
  TrashIcon,
  UploadCloud,
  XIcon,
  Search,
  Filter,
  Download,
  UserCheck,
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
import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import Cookies from "js-cookie";

export default function EvaluationPage() {
  const [streams, setStreams] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [evals, setEvals] = useState([]);
  const [years, setYears] = useState([]);
  const [courses, setCourses] = useState([]);
  const [combineds, setCombineds] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [campus, setCampus] = useState([]);
  const [users, setUsers] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [viewType, setViewType] = useState("activated");

  const [importDialog, setImportDialog] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [importDialogCombined, setImportDialogCombined] = useState(null);
  const [importDialogCourse, setImportDialogCourse] = useState(null);
  const [importDialogSemester, setImportDialogSemester] = useState(null);

  const [exportDialog, setExportDialog] = useState(null);
  const [exportDialogCombined, setExportDialogCombined] = useState(null);
  const [exportDialogCourse, setExportDialogCourse] = useState(null);
  const [exportDialogSemester, setExportDialogSemester] = useState(null);

  const [selectedCombined, setSelectedCombined] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [assignSubjectModal, setAssignSubjectModal] = useState(false);
  const [assignedSubject, setAssignedSubject] = useState(null);

  const [attendance, setAttendance] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const token = Cookies.get("token");
  const role = Cookies.get("role");

  // Check screen size for responsiveness
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      const uploadedCandidates = getUploadedCandidates();
      setSelectedRows(uploadedCandidates.map((row) => row._id));
    }
    setSelectAll(!selectAll);
  };

  const handleRowSelect = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const ref = useRef(null);

  useEffect(() => {
    setFilteredCandidates(candidates);
  }, [candidates]);

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
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degree`, {
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years`,
            {
              headers: {
                "content-type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          ),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/course`, {
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/combined`, {
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subject`, {
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate`, {
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`, {
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/answer-sheet`, {
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
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

        const examiners = userData.filter(
          (el) => el.Role === "Examiner" || el.Role === "Moderator"
        );
        setUsers(examiners);
      } catch (error) {
        toast.error(error.message || "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const clearFilters = () => {
    setSelectedCombined(null);
    setSelectedCourse(null);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setSelectedCampus(null);
    setSelectedRows([]);
    setSelectAll(false);
  };

  const getStreamName = (id) => {
    const combined = combineds.find((el) => el.uuid === id);
    const stream = streams.find((el) => el.uuid === combined?.stream);
    return stream?.name || "N/A";
  };

  const getCourseName = (id) => {
    const course = courses.find((el) => el.uuid === id);
    return course?.name || "N/A";
  };

  const excelCandidate = () => {
    const mappedData = filteredCandidates.map((el) => ({
      RollNo: el.RollNo,
      PRNNumber: el.PRNNumber,
      StudentId: el.uuid,
      Name: `${el.FirstName} ${el.MiddleName} ${el.LastName}`,
      EmailId: el.Email,
      IsPHCandidate: el.IsPHCandidate,
      Stream: getStreamName(el.combined),
      Course: getCourseName(el.combined),
      Subject: selectedSubject?.name || "N/A",
      BookletNames: el.bookletNames,
      CampusName: el.CampusName,
      ExamAssignmentId: "",
      AnswerSheetUploaded: el.sheetUploaded ? "Yes" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(mappedData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");
    XLSX.writeFile(workbook, "Candidates.xlsx");
  };

  useEffect(() => {
    const data = candidates.filter((el) => {
      const name = `${el.FirstName?.toLowerCase() || ""} ${
        el.MiddleName?.toLowerCase() || ""
      } ${el.LastName?.toLowerCase() || ""}`;

      return name.includes(search.toLowerCase());
    });
    setFilteredCandidates(data);
  }, [search, candidates]);

  useEffect(() => {
    let data = candidates;

    if (search) {
      const lowerSearch = search.toLowerCase();
      data = data.filter((el) => {
        const name = `${el.FirstName?.toLowerCase() ?? ""} ${
          el.MiddleName?.toLowerCase() ?? ""
        } ${el.LastName?.toLowerCase() ?? ""}`;
        return name.includes(lowerSearch);
      });
    }

    if (selectedCombined) {
      data = data.filter((el) => el.combined === selectedCombined.uuid);
    }

    if (selectedCourse) {
      data = data.filter((el) => el.course === selectedCourse.uuid);
    }

    if (selectedSemester) {
      data = data.filter((el) => el.sem === selectedSemester);
    }

    if (selectedSubject) {
      data = data.filter((el) =>
        el.subjects?.find((sub) => selectedSubject.uuid === sub)
      );
    }

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

  const handleAssignExaminer = async () => {
    if (!selectedUser || selectedRows.length === 0) {
      toast.error("Please select an examiner and at least one candidate");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/eval`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sheets: selectedRows
              .map((el) => {
                const candidate = candidates.find((c) => c._id === el);
                if (!candidate) return null;

                return {
                  assignmentId: candidate.assignmentId,
                  status: "Pending",
                  isChecked: "Not Evaluated",
                  marks: 0,
                  attendance: "Present",
                };
              })
              .filter(Boolean),
            name: selectedSubject.name,
            course: selectedCourse.uuid,
            subject: selectedSubject.uuid,
            examiners: [selectedUser._id],
            endDate: selectedSubject.exam,
            semester: selectedSemester,
            iid: Cookies.get("iid"),
            progress: {
              uploaded: sheets.length,
              checked: 0,
            },
          }),
        }
      );

      if (res.ok) {
        toast.success("Examiner assigned successfully");
        setSelectedRows([]);
        setSelectAll(false);
      } else {
        throw new Error("Failed to assign examiner");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getUploadedCandidates = () => {
    if (!selectedSubject) return [];

    return filteredCandidates.filter(
      (el) =>
        el.isActive !== false &&
        el.bookletNames &&
        el.bookletNames[selectedSubject.uuid] &&
        el.bookletNames[selectedSubject.uuid].trim() !== ""
    );
  };

  const uploadedCandidates = getUploadedCandidates();
  const hasActiveFilters =
    selectedCombined || selectedCourse || selectedSemester || selectedSubject;

  return (
    <div className="bg-white p-4 md:p-6 max-h-screen w-full h-screen flex flex-col gap-4 md:gap-6 overflow-hidden">
      {/* Assign Subject Modal */}
      <Dialog open={assignSubjectModal} onOpenChange={setAssignSubjectModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Subject</DialogTitle>
            <DialogDescription>
              Assign subject to selected candidates
            </DialogDescription>
          </DialogHeader>
          <main className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Subject</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex justify-between items-center gap-2"
                  >
                    <span>
                      {assignedSubject
                        ? assignedSubject.name
                        : "Select Subject"}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                  {subjects
                    .filter(
                      (el) =>
                        el.isActive == true &&
                        el.course === selectedCourse?.uuid &&
                        el.semester === selectedSemester
                    )
                    .map((el) => (
                      <DropdownMenuItem
                        onClick={() => setAssignedSubject(el)}
                        key={el.uuid}
                      >
                        {el.name}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </main>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setAssignSubjectModal(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!assignedSubject) {
                  toast.error("Please select a subject");
                  return;
                }

                try {
                  const all_subs = candidates.find(
                    (el) => selectedRows[0] === el._id
                  );

                  if (!all_subs) {
                    toast.error("No candidate selected");
                    return;
                  }

                  const isExist = candidates.some(
                    (el) =>
                      selectedRows.includes(el._id) &&
                      el.subjects?.includes(assignedSubject.uuid)
                  );

                  if (isExist) {
                    toast.error(
                      "Subject already exists in candidate's subjects!"
                    );
                    return;
                  }

                  const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidates/subjects/bulk-update`,
                    {
                      method: "PUT",
                      headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        ids: selectedRows,
                        subjects: [
                          ...(all_subs.subjects || []),
                          assignedSubject.uuid,
                        ],
                      }),
                    }
                  );

                  if (res.ok) {
                    toast.success("Subject assigned successfully");
                    setAssignSubjectModal(false);
                    setAssignedSubject(null);
                  } else {
                    throw new Error("Failed to assign subject");
                  }
                } catch (error) {
                  toast.error(error.message);
                }
              }}
              className="w-full sm:w-auto"
            >
              Assign Subject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-lg md:text-xl font-semibold text-gray-900">
          Evaluation Management
        </h1>
        <p className="text-sm text-gray-600">
          Assign examiners to complete evaluation process
        </p>
      </div>

      {/* Controls Section */}
      <div className="flex flex-col gap-4">
        {/* Search and Actions Row */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="relative w-full lg:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidates by name..."
              className="w-full lg:w-80 pl-10"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="h-4 w-4" />
                  <span>Actions</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={excelCandidate} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Candidate Data
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <BookImage className="h-4 w-4" />
                  Export Barcode Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}

            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="outline"
                className="flex items-center gap-2 bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800 w-full sm:w-auto"
              >
                <XIcon className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Stream | Degree | Year
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex justify-between items-center w-full text-left"
                >
                  <span className="truncate">
                    {selectedCombined ? selectedCombined.name : "Select"}
                  </span>
                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                {combineds.map((comb) => (
                  <DropdownMenuItem
                    onClick={() => setSelectedCombined(comb)}
                    key={comb.uuid}
                    className="truncate"
                  >
                    {comb.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {selectedCombined && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Course
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center w-full text-left"
                  >
                    <span className="truncate">
                      {selectedCourse ? selectedCourse.name : "Select"}
                    </span>
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                  {courses
                    .filter((course) =>
                      selectedCombined.course.includes(course.uuid)
                    )
                    .map((el) => (
                      <DropdownMenuItem
                        onClick={() => setSelectedCourse(el)}
                        key={el.uuid}
                        className="truncate"
                      >
                        {el.name}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {selectedCourse && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Semester/Trimester
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center w-full text-left"
                  >
                    <span className="truncate">
                      {selectedSemester
                        ? `Semester ${selectedSemester}`
                        : "Select"}
                    </span>
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                  {Array.from(
                    { length: Number(selectedCourse.semCount) || 0 },
                    (_, i) => (
                      <DropdownMenuItem
                        onClick={() => setSelectedSemester(`${i + 1}`)}
                        key={i + 1}
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
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Subject
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center w-full text-left"
                  >
                    <span className="truncate">
                      {selectedSubject ? selectedSubject.name : "Select"}
                    </span>
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                  {subjects
                    .filter(
                      (el) =>
                        el.course === selectedCourse?.uuid &&
                        el.semester === selectedSemester
                    )
                    .map((sub) => (
                      <DropdownMenuItem
                        onClick={() => setSelectedSubject(sub)}
                        key={sub.uuid}
                        className="truncate"
                      >
                        {sub.name}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Examiner Assignment Section */}
        {role === "Admin" && selectedSubject && selectedRows.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3">
              <Select
                value={selectedUser?._id || ""}
                onValueChange={(value) => {
                  const user = users.find((u) => u._id === value);
                  setSelectedUser(user);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Examiner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {users.length > 0 ? (
                      users.map((el) => (
                        <SelectItem value={el._id} key={el._id}>
                          {el.FirstName} {el.LastName} ({el.Role})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-users" disabled>
                        No examiners available
                      </SelectItem>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  onClick={handleAssignExaminer}
                  disabled={!selectedUser || isLoading}
                  className="flex items-center gap-2 flex-1"
                >
                  <UserCheck className="h-4 w-4" />
                  {isLoading
                    ? "Assigning..."
                    : `Assign to ${selectedRows.length} Candidate(s)`}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-hidden border rounded-lg bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">
                Loading candidates...
              </p>
            </div>
          </div>
        ) : uploadedCandidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <BookImage className="h-8 w-8 mb-2" />
            <p className="text-sm">
              {selectedSubject
                ? "No candidates with uploaded answer sheets found"
                : "Please select filters to view candidates"}
            </p>
          </div>
        ) : (
          <div className="overflow-auto h-full">
            <Table className="min-w-full">
              <TableHeader className="sticky top-0 bg-gray-50 z-10">
                <TableRow className="border-b">
                  <TableHead className="w-12 border-r font-semibold text-gray-700">
                    {selectedSubject && (
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    )}
                  </TableHead>
                  <TableHead className="border-r font-semibold text-gray-700">
                    #
                  </TableHead>
                  <TableHead className="border-r font-semibold text-gray-700">
                    Name
                  </TableHead>
                  <TableHead className="border-r font-semibold text-gray-700">
                    Roll No
                  </TableHead>
                  <TableHead className="border-r font-semibold text-gray-700">
                    PRN No
                  </TableHead>
                  {!isMobile && (
                    <>
                      <TableHead className="border-r font-semibold text-gray-700">
                        Course
                      </TableHead>
                      <TableHead className="border-r font-semibold text-gray-700">
                        Subject
                      </TableHead>
                      <TableHead className="border-r font-semibold text-gray-700">
                        Booklet
                      </TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadedCandidates.map((el, i) => (
                  <TableRow key={el._id} className="border-b hover:bg-gray-50">
                    <TableCell className="border-r">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(el._id)}
                        onChange={() => handleRowSelect(el._id)}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell className="border-r font-medium">
                      {i + 1}
                    </TableCell>
                    <TableCell className="border-r">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {el.FirstName} {el.LastName}
                        </span>
                        {isMobile && (
                          <span className="text-xs text-gray-500">
                            {getCourseName(el.course)} • {selectedSubject.name}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="border-r font-mono text-sm">
                      {el.RollNo}
                    </TableCell>
                    <TableCell className="border-r font-mono text-sm">
                      {el.PRNNumber}
                    </TableCell>
                    {!isMobile && (
                      <>
                        <TableCell className="border-r">
                          <span className="text-sm">
                            {getCourseName(el.course)}
                          </span>
                        </TableCell>
                        <TableCell className="border-r">
                          <span className="text-sm">
                            {selectedSubject.name}
                          </span>
                        </TableCell>
                        <TableCell className="border-r">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {el.bookletNames[selectedSubject.uuid]}
                          </span>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Selection Summary */}
      {selectedRows.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          {selectedRows.length} candidate(s) selected
        </div>
      )}
    </div>
  );
}
