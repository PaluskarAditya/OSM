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
  ChevronDown,
  EyeClosedIcon,
  UploadCloud,
  XIcon,
  EyeIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";

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

  const token = Cookies.get("token");

  const [selectedCombined, setSelectedCombined] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [tableKey, setTableKey] = useState(0); // Force table re-render

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      const visibleCandidates = filteredCandidates.filter((candidate) =>
        viewType === "activated"
          ? candidate.isActive !== false
          : candidate.isActive === false
      );
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

  const getSubjectUUID = (name, sem) => {
    const subject = subjects.find(
      (el) => el.name === name && el.semester.includes(sem)
    );
    return subject?.uuid || name;
  };

  const handleCandidateImport = async () => {
    if (!importFile) {
      toast.error("Please select a file to import");
      return;
    }

    if (!importDialogCombined || !importDialogCourse || !importDialogSemester) {
      toast.error("Please select all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const buffer = await importFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json_data = XLSX.utils.sheet_to_json(worksheet);

      const cleaned_data = json_data.map((row) => {
        const filteredRow = {};
        const subjects = [];

        filteredRow.Name = row.Name || "";
        filteredRow.RollNo = row.RollNo || "";
        filteredRow.PRNNumber = row.PRNNumber || "";
        filteredRow.Gender = row.Gender || "";
        filteredRow.Email = row.Email || "";
        filteredRow.MobileNo = row.MobileNo || "";
        filteredRow.IsPHCandidate = row.IsPHCandidate || "";
        filteredRow.CampusName = row.CampusName || "";
        filteredRow.FirstName = row.FirstName || "";
        filteredRow.MiddleName = row.MiddleName || "";
        filteredRow.LastName = row.LastName || "";

        for (let key in row) {
          if (row[key] === 1) {
            subjects.push(getSubjectUUID(key, importDialogSemester));
          }
        }

        filteredRow.subjects = subjects;
        return filteredRow;
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate/upload`,
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            data: cleaned_data,
            course: importDialogCourse?.uuid,
            combined: importDialogCombined?.uuid,
            sem: importDialogSemester,
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        toast.success(
          `Imported ${
            data?.length || cleaned_data.length
          } candidates successfully`
        );
        setCandidates((prev) => [...prev, ...cleaned_data]);
        setImportDialog(false);
        setImportFile(null);
        setImportDialogCombined(null);
        setImportDialogCourse(null);
        setImportDialogSemester(null);
      } else {
        throw new Error("Failed to import candidates");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStreamName = (id) => {
    const combined = combineds.find((el) => el.uuid === id);
    const stream = streams.find((el) => el.uuid === combined?.stream);
    return stream?.name || "N/A";
  };

  const getCourseName = (id) => {
    const combined = combineds.find((el) => el.uuid === id);
    const course = courses.find((el) => combined?.course.includes(el.name));
    return course?.name || "N/A";
  };

  const excelTemplate = () => {
    if (!exportDialogCombined || !exportDialogCourse || !exportDialogSemester) {
      toast.error("Please select all required fields");
      return;
    }

    const candidate_subjects = subjects.filter(
      (sub) =>
        sub.combined === exportDialogCombined.uuid &&
        sub.course === exportDialogCourse.uuid &&
        sub.semester === String(exportDialogSemester)
    );

    const name_map = candidate_subjects.map((sub) => sub.name);

    const data = [
      "RollNo",
      "PRNNumber",
      "Gender",
      "Email",
      "FirstName",
      "MiddleName",
      "LastName",
      "MobileNo",
      "IsPHCandidate",
      "CampusName",
      ...name_map,
    ];

    const data_row = [
      "1234",
      "1234",
      "Male",
      "Johndoe@test.com",
      "John",
      "Test",
      "Doe",
      "1234567890",
      "Yes / No",
      "Test Campus",
      ...Array(name_map.length).fill(1),
    ];

    const worksheetData = [data, data_row];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(
      workbook,
      `Candidate_Template_Semester-${exportDialogSemester}.xlsx`
    );

    setExportDialog(false);
    setExportDialogCombined(null);
    setExportDialogCourse(null);
    setExportDialogSemester(null);
  };

  const excelCandidate = () => {
    if (filteredCandidates.length === 0) {
      toast.error("No candidates to export");
      return;
    }

    const mappedData = filteredCandidates.map((el) => ({
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
      Subject: selectedSubject?.name || "N/A",
      BookletNames: el.bookletNames || "N/A",
      CampusName: el.CampusName || "N/A",
      ExamAssignmentId: "",
      AnswerSheetUploaded: el.sheetUploaded ? "Yes" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(mappedData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "Candidates.xlsx");
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
    setTableKey((prev) => prev + 1); // Force table re-render
  }, [
    candidates,
    search,
    selectedCombined,
    selectedCourse,
    selectedSemester,
    selectedSubject,
  ]);

  const visibleCandidates = filteredCandidates.filter((candidate) =>
    viewType === "activated"
      ? candidate.isActive !== false
      : candidate.isActive === false
  );

  return (
    <div className="bg-white p-4 lg:p-6 flex flex-col min-h-screen gap-4 lg:gap-5 overflow-hidden">
      {/* Import Candidate Dialog */}
      <Dialog open={importDialog} onOpenChange={setImportDialog}>
        <DialogContent className="max-w-md lg:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Candidates</DialogTitle>
            <DialogDescription>
              Import candidates through Excel template
            </DialogDescription>
          </DialogHeader>
          <main className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                Stream | Degree | Year
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center w-full"
                  >
                    <span className="truncate">
                      {importDialogCombined
                        ? importDialogCombined.name
                        : "Select"}
                    </span>
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                  {combineds.map((el) => (
                    <DropdownMenuItem
                      onClick={() => setImportDialogCombined(el)}
                      key={el.uuid}
                      className="truncate"
                    >
                      {el.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Course</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center w-full"
                    disabled={!importDialogCombined}
                  >
                    <span className="truncate">
                      {importDialogCourse ? importDialogCourse.name : "Select"}
                    </span>
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                  {importDialogCombined &&
                    courses
                      .filter((el) =>
                        importDialogCombined.course.includes(el.uuid)
                      )
                      .map((el) => (
                        <DropdownMenuItem
                          onClick={() => setImportDialogCourse(el)}
                          key={el.uuid}
                          className="truncate"
                        >
                          {el.name}
                        </DropdownMenuItem>
                      ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Semester</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center w-full"
                    disabled={!importDialogCourse}
                  >
                    <span className="truncate">
                      {importDialogSemester
                        ? `Semester ${importDialogSemester}`
                        : "Select"}
                    </span>
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {importDialogCourse &&
                    Array.from(
                      { length: Number(importDialogCourse.semCount) },
                      (_, i) => (
                        <DropdownMenuItem
                          onClick={() => setImportDialogSemester(i + 1)}
                          key={i + 1}
                        >
                          Semester {i + 1}
                        </DropdownMenuItem>
                      )
                    )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <UploadCloud className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-medium mb-1">Upload Excel File</p>
              <p className="text-xs text-gray-500 mb-2">
                Click to browse or drag and drop
              </p>
              {importFile && (
                <span className="text-blue-600 text-sm font-medium block truncate">
                  {importFile.name}
                </span>
              )}
            </div>
            <input
              onChange={(e) => setImportFile(e.target.files[0])}
              type="file"
              className="hidden"
              ref={fileInputRef}
              accept=".xlsx,.xls"
            />
          </main>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => {
                setImportDialog(false);
                setImportFile(null);
                setImportDialogCombined(null);
                setImportDialogCourse(null);
                setImportDialogSemester(null);
              }}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCandidateImport}
              disabled={isLoading || !importFile}
              className="w-full sm:w-auto"
            >
              {isLoading ? "Importing..." : "Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Template Dialog */}
      <Dialog open={exportDialog} onOpenChange={setExportDialog}>
        <DialogContent className="max-w-md lg:max-w-lg">
          <DialogHeader>
            <DialogTitle>Export Template</DialogTitle>
            <DialogDescription>
              Export Candidate template for selected filters
            </DialogDescription>
          </DialogHeader>
          <main className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                Stream | Degree | Year
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center w-full"
                  >
                    <span className="truncate">
                      {exportDialogCombined
                        ? exportDialogCombined.name
                        : "Select"}
                    </span>
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                  {combineds.map((el) => (
                    <DropdownMenuItem
                      onClick={() => setExportDialogCombined(el)}
                      key={el.uuid}
                      className="truncate"
                    >
                      {el.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Course</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center w-full"
                    disabled={!exportDialogCombined}
                  >
                    <span className="truncate">
                      {exportDialogCourse ? exportDialogCourse.name : "Select"}
                    </span>
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                  {exportDialogCombined &&
                    courses
                      .filter((el) =>
                        exportDialogCombined.course.includes(el.uuid)
                      )
                      .map((el) => (
                        <DropdownMenuItem
                          onClick={() => setExportDialogCourse(el)}
                          key={el.uuid}
                          className="truncate"
                        >
                          {el.name}
                        </DropdownMenuItem>
                      ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Semester</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center w-full"
                    disabled={!exportDialogCourse}
                  >
                    <span className="truncate">
                      {exportDialogSemester
                        ? `Semester ${exportDialogSemester}`
                        : "Select"}
                    </span>
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {exportDialogCourse &&
                    Array.from(
                      { length: Number(exportDialogCourse.semCount) },
                      (_, i) => (
                        <DropdownMenuItem
                          onClick={() => setExportDialogSemester(i + 1)}
                          key={i + 1}
                        >
                          Semester {i + 1}
                        </DropdownMenuItem>
                      )
                    )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </main>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setExportDialog(false);
                setExportDialogCombined(null);
                setExportDialogCourse(null);
                setExportDialogSemester(null);
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={excelTemplate}
              disabled={
                !exportDialogCombined ||
                !exportDialogCourse ||
                !exportDialogSemester
              }
              className="w-full sm:w-auto"
            >
              Export Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <div className="flex gap-2 items-center">
          <SidebarTrigger className="cursor-pointer flex-shrink-0" />
          <h1 className="text-lg lg:text-xl font-semibold">Candidates</h1>
        </div>
        <p className="text-sm text-gray-500">Import and Manage Candidates</p>
      </div>

      {/* Controls Section */}
      <div className="bg-white flex flex-col gap-4 lg:gap-6">
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
                <DropdownMenuItem onClick={() => setImportDialog(true)}>
                  Import Candidate Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setExportDialog(true)}>
                  Export Template
                </DropdownMenuItem>
                <DropdownMenuItem onClick={excelCandidate}>
                  Export Candidate Data
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    setViewType(
                      viewType === "activated" ? "deactivated" : "activated"
                    )
                  }
                >
                  {viewType === "activated"
                    ? "View Deactivated"
                    : "View Activated"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={clearFilters}
              variant="outline"
              disabled={
                !selectedCombined &&
                !selectedCourse &&
                !selectedSemester &&
                !selectedSubject &&
                !search
              }
              className="flex cursor-pointer bg-red-50 hover:bg-red-100 transition-all border border-red-300 text-red-600 hover:text-red-700 justify-center items-center w-full sm:w-auto"
            >
              <span>Clear Filters</span>
              <XIcon className="h-4 w-4 ml-2" />
            </Button>

            {selectedRows.length > 0 && (
              <Button
                onClick={async () => {
                  const isActivating = viewType === "deactivated";
                  try {
                    const res = await fetch(
                      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate/status`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          ids: selectedRows,
                          isActive: isActivating,
                        }),
                      }
                    );

                    if (res.ok) {
                      const updated = candidates.map((row) =>
                        selectedRows.includes(row._id)
                          ? { ...row, isActive: isActivating }
                          : row
                      );
                      setCandidates(updated);
                      setSelectedRows([]);
                      setSelectAll(false);
                      toast.success(
                        isActivating
                          ? "Activated Successfully"
                          : "Deactivated Successfully"
                      );
                      if (isActivating) {
                        setViewType("activated");
                      }
                    } else {
                      throw new Error("Failed to update candidate status");
                    }
                  } catch (error) {
                    toast.error(error.message);
                  }
                }}
                className={`flex cursor-pointer justify-center items-center w-full sm:w-auto ${
                  viewType === "activated"
                    ? "bg-red-50 hover:bg-red-100 border-red-300 text-red-600 hover:text-red-700"
                    : "bg-green-50 hover:bg-green-100 border-green-300 text-green-600 hover:text-green-700"
                } transition-all border`}
                variant="outline"
              >
                <span>
                  {viewType === "activated" ? "Deactivate" : "Activate"}
                </span>
                {viewType === "activated" ? (
                  <EyeClosedIcon className="h-4 w-4 ml-2" />
                ) : (
                  <EyeIcon className="h-4 w-4 ml-2" />
                )}
              </Button>
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

        {/* Table Section */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table key={tableKey}>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="w-12 border-r font-semibold">
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
                    Roll Number
                  </TableHead>
                  <TableHead className="border-r font-semibold whitespace-nowrap">
                    PRN Number
                  </TableHead>
                  <TableHead className="border-r font-semibold whitespace-nowrap">
                    PH Candidate
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
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                        <span className="ml-2">Loading candidates...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : selectedSubject && visibleCandidates.length > 0 ? (
                  visibleCandidates.map((el, i) => (
                    <TableRow key={el._id || i} className="hover:bg-gray-50">
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
                        {el.RollNo || "N/A"}
                      </TableCell>
                      <TableCell className="border border-r whitespace-nowrap">
                        {el.PRNNumber || "N/A"}
                      </TableCell>
                      <TableCell className="border border-r whitespace-nowrap">
                        {el.IsPHCandidate || "No"}
                      </TableCell>
                      <TableCell className="border border-r whitespace-nowrap">
                        {selectedSubject?.name || "N/A"}
                      </TableCell>
                      <TableCell className="border border-r whitespace-nowrap">
                        {el.bookletNames &&
                        el.bookletNames[selectedSubject?.uuid] &&
                        el.bookletNames[selectedSubject.uuid].trim() !== ""
                          ? el.bookletNames[selectedSubject.uuid]
                          : "Not Uploaded"}
                      </TableCell>
                      <TableCell className="border border-r whitespace-nowrap">
                        {el.bookletNames &&
                        el.bookletNames[selectedSubject?.uuid] &&
                        el.bookletNames[selectedSubject.uuid].trim() !== ""
                          ? "Yes"
                          : "No"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center py-8 text-gray-500"
                    >
                      No candidates found
                      {search ||
                      selectedCombined ||
                      selectedCourse ||
                      selectedSemester ||
                      selectedSubject
                        ? " matching your filters"
                        : ""}
                      .
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
              {selectedRows.length} candidate(s) selected
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
