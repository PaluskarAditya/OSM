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
  FilterIcon,
  UsersIcon,
  SidebarIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Page() {
  const [streams, setStreams] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [years, setYears] = useState([]);
  const [courses, setCourses] = useState([]);
  const [combineds, setCombineds] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [campus, setCampus] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [viewType, setViewType] = useState("activated");

  const [importDialog, setImportDialog] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importDialogCombined, setImportDialogCombined] = useState(null);
  const [importDialogCourse, setImportDialogCourse] = useState(null);
  const [importDialogSemester, setImportDialogSemester] = useState(null);

  const [exportDialog, setExportDialog] = useState(false);
  const [exportDialogCombined, setExportDialogCombined] = useState(null);
  const [exportDialogCourse, setExportDialogCourse] = useState(null);
  const [exportDialogSemester, setExportDialogSemester] = useState(null);

  const [selectedCombined, setSelectedCombined] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [assignSubjectModal, setAssignSubjectModal] = useState(false);
  const [assignedSubject, setAssignedSubject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tableKey, setTableKey] = useState(0);

  const token = Cookies.get("token");

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      const visibleCandidates = getVisibleCandidates();
      setSelectedRows(visibleCandidates.map((row) => row._id));
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

  const fileInputRef = useRef(null);

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
        ]);

        const [
          streamsData,
          degreesData,
          yearsData,
          coursesData,
          combinedsData,
          subjectsData,
          candidatesData,
        ] = await Promise.all([
          streamsRes.json(),
          degreesRes.json(),
          yearsRes.json(),
          coursesRes.json(),
          combinedsRes.json(),
          subjectsRes.json(),
          candidatesRes.json(),
        ]);

        setStreams(streamsData);
        setDegrees(degreesData);
        setYears(yearsData);
        setCourses(coursesData);
        setCombineds(combinedsData);
        setSubjects(subjectsData);
        setCandidates(candidatesData);
        setFilteredCandidates(candidatesData);
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
    setSearch("");
    setSelectedRows([]);
    setSelectAll(false);
  };

  const getStreamName = (id) => {
    const combined = combineds.find((el) => el.uuid === id);
    const stream = streams.find((el) => el.uuid === combined?.stream);
    return stream?.name || "N/A";
  };

  const getCourseName = (id) => {
    const combined = combineds.find((el) => el.uuid === id);
    const course = courses.find((el) => combined?.course.includes(el.uuid));
    return course?.name || "N/A";
  };

  const getVisibleCandidates = () => {
    return filteredCandidates.filter((candidate) =>
      viewType === "activated"
        ? candidate.isActive !== false
        : candidate.isActive === false
    );
  };

  const excelCandidate = () => {
    if (!selectedSubject) {
      toast.error("Please select a subject first");
      return;
    }

    if (filteredCandidates.length === 0) {
      toast.error("No candidates to export");
      return;
    }

    const mappedData = getVisibleCandidates().map((el) => ({
      RollNo: el.RollNo || "N/A",
      PRNNumber: el.PRNNumber || "N/A",
      StudentId: el.uuid || "N/A",
      Name: `${el.FirstName || ""} ${el.MiddleName || ""} ${
        el.LastName || ""
      }`.trim(),
      EmailId: el.Email || "N/A",
      IsPHCandidate: el.IsPHCandidate || "No",
      Stream: getStreamName(el.combined),
      Course: getCourseName(el.combined),
      Subject: selectedSubject.name,
      BookletNames: el.bookletNames || "N/A",
      CampusName: el.CampusName || "N/A",
      ExamAssignmentId: "",
      AnswerSheetUploaded: el.sheetUploaded ? "Yes" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(mappedData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `Candidates_${selectedSubject.name}.xlsx`);
  };

  useEffect(() => {
    let data = candidates;

    if (search) {
      const lowerSearch = search.toLowerCase();
      data = data.filter((el) => {
        const name = `${el.FirstName?.toLowerCase() ?? ""} ${
          el.MiddleName?.toLowerCase() ?? ""
        } ${el.LastName?.toLowerCase() ?? ""}`;
        return (
          name.includes(lowerSearch) ||
          el.RollNo?.toLowerCase().includes(lowerSearch) ||
          el.Email?.toLowerCase().includes(lowerSearch)
        );
      });
    }

    if (selectedCombined) {
      data = data.filter((el) => el.combined === selectedCombined.uuid);
    }

    if (selectedCourse) {
      data = data.filter((el) => el.course === selectedCourse.uuid);
    }

    if (selectedSemester) {
      data = data.filter((el) => el.sem == selectedSemester);
    }

    if (selectedSubject) {
      data = data.filter((el) =>
        el.subjects?.find((sub) => selectedSubject.uuid === sub)
      );
    }

    setFilteredCandidates(data);
    setSelectedRows([]);
    setSelectAll(false);
    setTableKey((prev) => prev + 1);
  }, [
    candidates,
    search,
    selectedCombined,
    selectedCourse,
    selectedSemester,
    selectedSubject,
  ]);

  const handleRemoveSubjects = async () => {
    if (selectedRows.length === 0) {
      toast.error("Please select at least one candidate");
      return;
    }

    const selectedCandidates = candidates.filter((el) =>
      selectedRows.includes(el._id)
    );

    const hasUploaded = selectedCandidates.some((el) => el.sheetUploaded);

    if (hasUploaded) {
      toast.error("Cannot remove subjects after answer sheets are uploaded");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate/subjects`,
        {
          method: "PUT",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ids: selectedRows,
            subjects: [],
          }),
        }
      );

      if (res.ok) {
        const updated = candidates.map((candidate) =>
          selectedRows.includes(candidate._id)
            ? { ...candidate, subjects: [] }
            : candidate
        );

        setCandidates(updated);
        setFilteredCandidates(updated);
        setSelectedRows([]);
        toast.success("Subjects removed successfully");
      } else {
        throw new Error("Failed to remove subjects");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const visibleCandidates = getVisibleCandidates();
  const hasActiveFilters =
    selectedCombined ||
    selectedCourse ||
    selectedSemester ||
    selectedSubject ||
    search;

  return (
    <div className="bg-white p-4 lg:p-6 flex flex-col min-h-screen gap-4 lg:gap-5 overflow-hidden">
      {/* Assign Subject Modal */}
      <Dialog open={assignSubjectModal} onOpenChange={setAssignSubjectModal}>
        <DialogContent className="max-w-md lg:max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign Subject to Candidates</DialogTitle>
            <DialogDescription>
              Assign subject to selected candidates
            </DialogDescription>
          </DialogHeader>
          <main className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Select Subject</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex justify-between items-center gap-2"
                  >
                    <span className="truncate">
                      {assignedSubject
                        ? assignedSubject.name
                        : "Select Subject"}
                    </span>
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
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
                        className="truncate"
                      >
                        {el.name}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {selectedRows.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  This will assign the subject to {selectedRows.length} selected
                  candidate(s)
                </p>
              </div>
            )}
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

                if (selectedRows.length === 0) {
                  toast.error("Please select at least one candidate");
                  return;
                }

                setIsLoading(true);
                try {
                  const selectedCandidates = candidates.filter((el) =>
                    selectedRows.includes(el._id)
                  );

                  const alreadyAssigned = selectedCandidates.some((candidate) =>
                    candidate.subjects?.includes(assignedSubject.uuid)
                  );

                  if (alreadyAssigned) {
                    toast.error(
                      "One or more candidates already have this subject!"
                    );
                    return;
                  }

                  const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate/subjects`,
                    {
                      method: "PUT",
                      headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        ids: selectedRows,
                        subjects: [
                          ...(selectedCandidates[0]?.subjects || []),
                          assignedSubject.uuid,
                        ],
                      }),
                    }
                  );

                  if (res.ok) {
                    const updated = candidates.map((candidate) =>
                      selectedRows.includes(candidate._id)
                        ? {
                            ...candidate,
                            subjects: [
                              ...(candidate.subjects || []),
                              assignedSubject.uuid,
                            ],
                          }
                        : candidate
                    );

                    setCandidates(updated);
                    setFilteredCandidates(updated);
                    setAssignSubjectModal(false);
                    setAssignedSubject(null);
                    setSelectedRows([]);
                    toast.success("Subject assigned successfully");
                  } else {
                    throw new Error("Failed to assign subject");
                  }
                } catch (error) {
                  toast.error(error.message);
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? "Assigning..." : "Assign Subject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header Section */}
      <div className="bg-white flex flex-col gap-1">
        <div className="flex gap-2 items-center">
          <SidebarTrigger className="cursor-pointer flex-shrink-0" />
          <h1 className="text-lg lg:text-xl font-semibold">Candidates</h1>
        </div>
        <p className="text-sm text-gray-500">
          Assign and Remove Subjects to Candidates
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white flex flex-col gap-4 lg:gap-6">
        {/* Controls Section */}
        <div className="flex flex-col lg:flex-row gap-3 justify-between items-start lg:items-center">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates by name, roll no, or email"
            className="w-full lg:w-80"
          />
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex justify-between items-center w-full sm:w-auto"
                >
                  <span>Actions</span>
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={excelCandidate}>
                  Export Candidate Data
                </DropdownMenuItem>
                <DropdownMenuItem>Export Barcode Details</DropdownMenuItem>
                {viewType === "activated" ? (
                  <DropdownMenuItem onClick={() => setViewType("deactivated")}>
                    View Deactivated
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => setViewType("activated")}>
                    View Activated
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={clearFilters}
              variant="outline"
              disabled={!hasActiveFilters}
              className="flex cursor-pointer bg-red-50 hover:bg-red-100 transition-all border border-red-300 text-red-600 hover:text-red-700 justify-center items-center w-full sm:w-auto"
            >
              <span>Clear Filters</span>
              <XIcon className="h-4 w-4 ml-2" />
            </Button>

            {selectedSubject && selectedRows.length > 0 && (
              <>
                <Button
                  onClick={() => setAssignSubjectModal(true)}
                  className="flex cursor-pointer bg-green-50 hover:bg-green-100 transition-all border border-green-300 text-green-600 hover:text-green-700 justify-center items-center w-full sm:w-auto"
                  variant="outline"
                >
                  <span>Assign Subject</span>
                  <BookImage className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  onClick={handleRemoveSubjects}
                  disabled={isLoading}
                  className="flex cursor-pointer bg-red-50 hover:bg-red-100 transition-all border border-red-300 text-red-600 hover:text-red-700 justify-center items-center w-full sm:w-auto"
                  variant="outline"
                >
                  <span>{isLoading ? "Removing..." : "Remove Subjects"}</span>
                  <TrashIcon className="h-4 w-4 ml-2" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
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
                  <ChevronDown className="h-4 w-4 flex-shrink-0 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                {combineds.length > 0 ? (
                  combineds.map((comb) => (
                    <DropdownMenuItem
                      onClick={() => setSelectedCombined(comb)}
                      key={comb.uuid}
                      className="truncate"
                    >
                      {comb.name}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>
                    No options available
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {selectedCombined && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Course</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center w-full text-left"
                  >
                    <span className="truncate">
                      {selectedCourse ? selectedCourse.name : "Select"}
                    </span>
                    <ChevronDown className="h-4 w-4 flex-shrink-0 ml-2" />
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
              <label className="text-sm font-medium">Semester/Trimester</label>
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
                    <ChevronDown className="h-4 w-4 flex-shrink-0 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {Array.from(
                    { length: Number(selectedCourse.semCount) },
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
              <label className="text-sm font-medium">Subject</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center w-full text-left"
                  >
                    <span className="truncate">
                      {selectedSubject ? selectedSubject.name : "Select"}
                    </span>
                    <ChevronDown className="h-4 w-4 flex-shrink-0 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                  {subjects
                    .filter(
                      (el) =>
                        el.course === selectedCourse.uuid &&
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

        {/* Data Display Section */}
        {!selectedSubject ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 lg:p-12 text-center">
            <FilterIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Select a Subject to View Candidates
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Please select a subject from the filters above to view and manage
              candidate data. You need to select Stream, Course, Semester, and
              then Subject to see the candidate list.
            </p>
          </div>
        ) : (
          <>
            {/* Table Section */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table key={tableKey}>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="w-12 border-r font-semibold whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          disabled={visibleCandidates.length === 0}
                          className="w-4 h-4"
                        />
                      </TableHead>
                      <TableHead className="border-r font-semibold whitespace-nowrap">
                        Sr no
                      </TableHead>
                      <TableHead className="border-r font-semibold whitespace-nowrap">
                        Candidate ID
                      </TableHead>
                      <TableHead className="border-r font-semibold whitespace-nowrap">
                        Name
                      </TableHead>
                      <TableHead className="border-r font-semibold whitespace-nowrap">
                        Email ID
                      </TableHead>
                      <TableHead className="border-r font-semibold whitespace-nowrap">
                        Roll Number
                      </TableHead>
                      <TableHead className="border-r font-semibold whitespace-nowrap">
                        PH Candidate
                      </TableHead>
                      <TableHead className="border-r font-semibold whitespace-nowrap">
                        Course
                      </TableHead>
                      <TableHead className="border-r font-semibold whitespace-nowrap">
                        Subject
                      </TableHead>
                      <TableHead className="border-r font-semibold whitespace-nowrap">
                        Booklet Name
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">
                        Answer Sheet Uploaded
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={14} className="text-center py-8">
                          <div className="flex justify-center items-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                            <span className="ml-2">Loading candidates...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : visibleCandidates.length > 0 ? (
                      visibleCandidates.map((el, i) => (
                        <TableRow
                          key={el._id || i}
                          className="hover:bg-gray-50"
                        >
                          <TableCell className="border border-r">
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(el._id)}
                              onChange={() => handleRowSelect(el._id)}
                              className="w-4 h-4"
                            />
                          </TableCell>
                          <TableCell className="border border-r whitespace-nowrap">
                            {i + 1}
                          </TableCell>
                          <TableCell className="border border-r whitespace-nowrap font-mono text-xs">
                            {el._id?.slice(0, 10)}...
                          </TableCell>
                          <TableCell className="border border-r whitespace-nowrap">
                            {`${el.FirstName || ""} ${el.MiddleName || ""} ${
                              el.LastName || ""
                            }`.trim() || "N/A"}
                          </TableCell>
                          <TableCell className="border border-r whitespace-nowrap">
                            {el.Email || "N/A"}
                          </TableCell>
                          <TableCell className="border border-r whitespace-nowrap">
                            {el.RollNo || "N/A"}
                          </TableCell>
                          <TableCell className="border border-r whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                el.IsPHCandidate === "Yes"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {el.IsPHCandidate || "No"}
                            </span>
                          </TableCell>
                          <TableCell className="border border-r whitespace-nowrap">
                            {getCourseName(el.combined)}
                          </TableCell>
                          <TableCell className="border border-r whitespace-nowrap">
                            {selectedSubject.name}
                          </TableCell>
                          <TableCell className="border border-r whitespace-nowrap">
                            {el.BookletName ? el.BookletName : "Not Uploaded"}
                          </TableCell>
                          <TableCell className="border border-r whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                el.sheetUploaded
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {el.sheetUploaded ? "Yes" : "No"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={14}
                          className="text-center py-8 text-gray-500"
                        >
                          <UsersIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                          <p>
                            No candidates found
                            {hasActiveFilters ? " matching your filters" : ""}.
                          </p>
                          {hasActiveFilters && (
                            <p className="text-sm mt-2">
                              Try adjusting your filters or search terms.
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Selection Info */}
            {selectedRows.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  {selectedRows.length} candidate(s) selected for bulk
                  operations
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
