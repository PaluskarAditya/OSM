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
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  BookImage,
  ChevronDown,
  Eye,
  EyeClosedIcon,
  RemoveFormattingIcon,
  TrashIcon,
  UploadCloud,
  XIcon,
  Search,
  Filter,
  Download,
  UserCheck,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Users,
  BookOpen,
  GraduationCap,
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
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [sheetDetailsModal, setSheetDetailsModal] = useState(false);

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
          evalsRes,
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
            },
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
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/eval`, {
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
          evalsData,
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
          evalsRes.json(),
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
        setEvals(evalsData);

        const examiners = userData.filter(
          (el) => el.Role === "Examiner" || el.Role === "Moderator",
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
    setSearch("");
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

  const getSubjectName = (id) => {
    const subject = subjects.find((el) => el.uuid === id);
    return subject?.name || "N/A";
  };

  const getUserName = (id) => {
    const user = users.find((el) => el._id === id);
    return user ? `${user.FirstName} ${user.LastName}` : "N/A";
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
      },
      Completed: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
      },
      "In Progress": {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Clock,
      },
      Evaluated: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
      },
      "Not Evaluated": {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: AlertCircle,
      },
      Rejected: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XIcon,
      },
    };

    const config = statusConfig[status] || statusConfig["Pending"];
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        <IconComponent className="h-3 w-3" />
        {status}
      </span>
    );
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
        el.subjects?.find((sub) => selectedSubject.uuid === sub),
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
        },
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
        el.bookletNames[selectedSubject.uuid].trim() !== "",
    );
  };

  const uploadedCandidates = getUploadedCandidates();
  const hasActiveFilters =
    selectedCombined || selectedCourse || selectedSemester || selectedSubject;

  // Calculate statistics
  const totalEvaluations = evals.length;
  const completedEvaluations = evals.filter(
    (e) => e.status === "Completed",
  ).length;
  const pendingEvaluations = evals.filter((e) => e.status === "Pending").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 w-full flex flex-col gap-4 md:gap-6 overflow-hidden">
      {/* Sheet Details Modal */}
      <Dialog open={sheetDetailsModal} onOpenChange={setSheetDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Evaluation Details - {selectedEvaluation?.name}
            </DialogTitle>
            <DialogDescription>
              Detailed view of answer sheets and evaluation progress
            </DialogDescription>
          </DialogHeader>

          {selectedEvaluation && (
            <div className="space-y-6">
              {/* Evaluation Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-900">
                      Total Sheets
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedEvaluation.sheets.length}
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-900">
                      Evaluated
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {selectedEvaluation.progress.checked}
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="font-semibold text-orange-900">
                      Pending
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {selectedEvaluation.progress.uploaded -
                      selectedEvaluation.progress.checked}
                  </div>
                </div>
              </div>

              {/* Evaluation Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">
                    Evaluation Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Course:</span>
                      <span className="font-medium">
                        {getCourseName(selectedEvaluation.course)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subject:</span>
                      <span className="font-medium">
                        {getSubjectName(selectedEvaluation.subject)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Semester:</span>
                      <span className="font-medium">
                        Semester {selectedEvaluation.semester}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      {getStatusBadge(selectedEvaluation.status)}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">
                    Assigned Examiners
                  </h4>
                  <div className="space-y-2">
                    {selectedEvaluation.examiners.map((examinerId, index) => (
                      <div
                        key={examinerId}
                        className="flex justify-between items-center"
                      >
                        <span className="text-gray-600">
                          Examiner {index + 1}:
                        </span>
                        <span className="font-medium">
                          {getUserName(examinerId)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sheets List */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Answer Sheets</h4>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold">
                          Assignment ID
                        </TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Marks</TableHead>
                        <TableHead className="font-semibold">
                          Attendance
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedEvaluation.sheets.map((sheet, index) => (
                        <TableRow key={sheet._id} className="hover:bg-gray-50">
                          <TableCell className="font-mono text-sm">
                            {sheet.assignmentId}
                          </TableCell>
                          <TableCell>{getStatusBadge(sheet.status)}</TableCell>
                          <TableCell className="font-semibold">
                            {sheet.marks}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                sheet.attendance === "Present"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {sheet.attendance}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Subject Modal */}
      <Dialog open={assignSubjectModal} onOpenChange={setAssignSubjectModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Assign Subject
            </DialogTitle>
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
                        el.semester === selectedSemester,
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
                    (el) => selectedRows[0] === el._id,
                  );

                  if (!all_subs) {
                    toast.error("No candidate selected");
                    return;
                  }

                  const isExist = candidates.some(
                    (el) =>
                      selectedRows.includes(el._id) &&
                      el.subjects?.includes(assignedSubject.uuid),
                  );

                  if (isExist) {
                    toast.error(
                      "Subject already exists in candidate's subjects!",
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
                    },
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
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 justify-start items-center">
          <SidebarTrigger className="cursor-pointer" />
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Evaluation Results
              </h1>
              <p className="text-sm text-gray-600">
                View evaluations and their results performed by Examiner's
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Evaluations
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalEvaluations}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {completedEvaluations}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {pendingEvaluations}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Evaluations List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Evaluations
          </h2>
        </div>
        <div className="overflow-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-semibold text-gray-700">
                  Evaluation Name
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Course
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Subject
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Progress
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evals.slice(0, 5).map((evalItem) => (
                <TableRow key={evalItem._id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{evalItem.name}</TableCell>
                  <TableCell>{getCourseName(evalItem.course)}</TableCell>
                  <TableCell>{getSubjectName(evalItem.subject)}</TableCell>
                  <TableCell>{getStatusBadge(evalItem.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(evalItem.progress.checked / evalItem.progress.uploaded) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {evalItem.progress.checked}/{evalItem.progress.uploaded}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedEvaluation(evalItem);
                        setSheetDetailsModal(true);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Selection Summary */}
      {selectedRows.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50">
          <UserCheck className="h-5 w-5" />
          <span className="font-medium">
            {selectedRows.length} candidate(s) selected
          </span>
        </div>
      )}
    </div>
  );
}
