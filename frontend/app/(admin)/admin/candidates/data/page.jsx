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
import { ChevronDown, EyeClosedIcon, UploadCloud, XIcon } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";

export default function page() {
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

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]); // clear selection
    } else {
      // add all row IDs
      setSelectedRows(filteredCandidates.map((row) => row._id));
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
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/courses`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/combineds`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subjects`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidates`),
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
        toast.error(error.message);
      }
    };

    fetchData();
  }, []);

  const clearFilters = () => {
    setSelectedCombined(null);
    setSelectedCourse(null);
    setSelectedSemester(null);
    setSelectedSubject(null);
  };

  const handleCandidateImport = async () => {
    try {
      const buffer = await importFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json_data = XLSX.utils.sheet_to_json(worksheet);

      // console.log("Excel Data:", json_data);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidates/import`,
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            data: json_data,
            course: importDialogCourse.uuid,
            combined: importDialogCombined.uuid,
            sem: importDialogSemester,
          }),
        }
      );

      if (res.ok) {
        const data = res.json();
        toast.success(`Import ${data.length} candidates successfully`);
        setCandidates(json_data);
      }

      setImportDialog(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getStreamName = (id) => {
    const combined = combineds.find((el) => el.uuid === id);
    const stream = streams.find((el) => el.uuid === combined?.stream);
    return stream?.name;
  };

  const getCourseName = (id) => {
    const combined = combineds.find((el) => el.uuid === id);
    const course = courses.find((el) => combined?.course.includes(el.name));
    return course?.name;
  };

  const excelTemplate = () => {
    const candidate_subjects = subjects.filter(
      (sub) =>
        sub.combined === exportDialogCombined.uuid &&
        sub.course === exportDialogCourse.uuid &&
        sub.semester === String(exportDialogSemester)
    );

    const name_map = candidate_subjects.map((sub) => sub.name);

    console.log(
      "Query Data:",
      exportDialogCombined.uuid,
      exportDialogCourse.uuid,
      String(exportDialogSemester),
      "Subjects:",
      name_map
    );

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
    ];

    const worksheetData = [data, data_row];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(
      workbook,
      `Candidate_Template_Semesteer-${exportDialogSemester}.xlsx`
    );

    setExportDialog(false);
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
      Subject: selectedSubject.name,
      BookletName: el.BookletName,
      CampusName: el.CampusName,
      ExamAssignmentId: "",
      AnswerSheetUploaded: el.sheetUploaded ? "Yes" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(mappedData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "Candidates.xlsx");
  };

  useEffect(() => {
    const data = candidates.filter((el) => {
      const name = `${el.FirstName?.toLowerCase()} ${el.MiddleName?.toLowerCase()} ${el.LastName?.toLowerCase()}`;

      if (name.includes(search)) {
        return el;
      }
    });
    setFilteredCandidates(data);
  }, [search]);

  useEffect(() => {
    let data = candidates;

    if (selectedCombined) {
      data = data.filter((el) => el.combined === selectedCombined.uuid);
    }

    if (selectedCourse) {
      data = data.filter((el) => el.course === selectedCourse.uuid);
    }

    if (selectedSubject) {
      data = data.filter((el) =>
        el.subjects.filter((sub) => sub.includes(selectedSubject.uuid))
      );
    }

    if (selectedSemester) {
      data = data.filter((el) => el.sem === selectedSemester);
    }

    setFilteredCandidates(data);
  }, [selectedCombined, selectedSubject, selectedCourse, selectedSemester]);

  return (
    <div className="bg-gray-100 p-6 max-w-4/5 flex flex-col gap-5">
      {/* Import Candidate Dialog */}
      <Dialog open={importDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import</DialogTitle>
            <DialogDescription>
              Import candiates through Excel
            </DialogDescription>
          </DialogHeader>
          <main className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm">Stream | Degree | Year</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center"
                  >
                    <span>
                      {importDialogCombined
                        ? importDialogCombined.name
                        : "Select"}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {combineds.map((el) => (
                    <DropdownMenuItem
                      onClick={() => setImportDialogCombined(el)}
                      key={el.uuid}
                    >
                      {el.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm">Course</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center"
                    disabled={importDialogCombined === null}
                  >
                    <span>
                      {importDialogCourse ? importDialogCourse.name : "Select"}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {importDialogCombined &&
                    courses
                      .filter((el) =>
                        importDialogCombined.course.includes(el.name)
                      )
                      .map((el) => (
                        <DropdownMenuItem
                          onClick={() => setImportDialogCourse(el)}
                          key={el.uuid}
                        >
                          {el.name}
                        </DropdownMenuItem>
                      ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm">Semester</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center"
                    disabled={importDialogCourse === null}
                  >
                    <span>
                      {importDialogSemester ? importDialogSemester : "Select"}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuContent>
                    {importDialogCourse &&
                      Array.from(
                        { length: Number(importDialogCourse.semester) },
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
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div
              onClick={() => ref.current.click()}
              className="bg-gray-100 border-dashed flex flex-col gap-1 justify-center items-center border-gray-300 rounded-lg p-5"
            >
              <span className="flex gap-1 justify-center items-center">
                <UploadCloud className="w-6 h-6" />
                <p>Upload Excel</p>
              </span>
              <span className="text-blue-500">
                {importFile && importFile.name}
              </span>
            </div>
            <input
              onChange={(e) => setImportFile(e.target.files[0])}
              type="file"
              className="hidden"
              ref={ref}
              accept=".xlsx"
            />
          </main>
          <DialogFooter>
            <Button onClick={() => setImportDialog(false)} variant="outline">
              cancel
            </Button>
            <Button onClick={handleCandidateImport}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Template Dialog */}
      <Dialog open={exportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export</DialogTitle>
            <DialogDescription>
              Export Candidate template for selected filters
            </DialogDescription>
          </DialogHeader>
          <main className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm">Stream | Degree | Year</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center"
                  >
                    <span>
                      {exportDialogCombined
                        ? exportDialogCombined.name
                        : "Select"}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {combineds.map((el) => (
                    <DropdownMenuItem
                      onClick={() => setExportDialogCombined(el)}
                      key={el.uuid}
                    >
                      {el.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm">Course</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center"
                    disabled={exportDialogCombined === null}
                  >
                    <span>
                      {exportDialogCourse ? exportDialogCourse.name : "Select"}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {exportDialogCombined &&
                    courses
                      .filter((el) =>
                        exportDialogCombined.course.includes(el.name)
                      )
                      .map((el) => (
                        <DropdownMenuItem
                          onClick={() => setExportDialogCourse(el)}
                          key={el.uuid}
                        >
                          {el.name}
                        </DropdownMenuItem>
                      ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm">Semester</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center"
                    disabled={exportDialogCourse === null}
                  >
                    <span>
                      {exportDialogSemester ? exportDialogSemester : "Select"}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuContent>
                    {exportDialogCourse &&
                      Array.from(
                        { length: Number(exportDialogCourse.semester) },
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
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </main>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setExportDialog(false)}>
              cancel
            </Button>
            <Button onClick={excelTemplate}>Export</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="p-5 bg-white flex flex-col gap-0 rounded-lg shadow-lg shadow-gray-200">
        <h1 className="text-lg font-semibold">Candidates</h1>
        <p className="text-sm text-gray-500">Import and Manage Candidates</p>
      </div>
      <div className="p-5 bg-white flex flex-col gap-6 rounded-lg shadow-lg shadow-gray-200">
        <div className="flex justify-between items-center">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates"
            className="w-max"
          />
          <DropdownMenu>
            <div className="flex gap-3 justify-center items-center">
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex justify-end items-center"
                >
                  <span>Actions</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <Button
                onClick={clearFilters}
                variant="outline"
                disabled={selectedCombined === null}
                className="flex cursor-pointer bg-red-50 hover:bg-red-100 transition-all border border-red-300 text-red-400 hover:text-red-500 justify-between items-center"
              >
                <span>Clear Filters</span>
                <XIcon className="h-4 w-4" />
              </Button>
              {selectedRows.length > 0 &&
                (viewType === "activated" ? (
                  <Button
                    onClick={async () => {
                      // Example: Update all selected rows isActive = false
                      const updated = filteredCandidates.map((row) =>
                        selectedRows.includes(row._id)
                          ? { ...row, isActive: false }
                          : row
                      );
                      setCandidates(updated);
                      setSelectedRows([]);
                      setSelectAll(false);
                      const res = await fetch(
                        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidates/bulk-update`,
                        {
                          method: "PUT",
                          headers: {
                            "Content-type": "application/json",
                          },
                          body: JSON.stringify({
                            ids: selectedRows,
                            isActive: false,
                          }),
                        }
                      );

                      if (res.ok) toast.success("Deactivated Successfully");
                    }}
                    className="flex cursor-pointer bg-red-50 hover:bg-red-100 transition-all border border-red-300 text-red-400 hover:text-red-500 justify-between items-center"
                    variant="outline"
                  >
                    <span>Deactivate</span>
                    <EyeClosedIcon className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={async () => {
                      // Example: Update all selected rows isActive = false
                      const updated = filteredCandidates.map((row) =>
                        selectedRows.includes(row._id)
                          ? { ...row, isActive: true }
                          : row
                      );
                      setCandidates(updated);
                      setSelectedRows([]);
                      setSelectAll(false);
                      setViewType("activated");
                      const res = await fetch(
                        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidates/bulk-update`,
                        {
                          method: "PUT",
                          headers: {
                            "Content-type": "application/json",
                          },
                          body: JSON.stringify({
                            ids: selectedRows,
                            isActive: true,
                          }),
                        }
                      );

                      if (res.ok) toast.success("Activated Successfully");
                    }}
                    className="flex cursor-pointer bg-green-50 hover:bg-green-100 transition-all border border-green-300 text-green-400 hover:text-green-500 justify-between items-center"
                    variant="outline"
                  >
                    <span>Activate</span>
                    <EyeClosedIcon className="h-4 w-4" />
                  </Button>
                ))}
            </div>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setImportDialog(true)}>
                Import Candidate Data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setExportDialog(true)}>
                Export Template
              </DropdownMenuItem>
              <DropdownMenuItem onClick={excelCandidate}>
                Export Candidate Data
              </DropdownMenuItem>
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
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm">Stream | Degree | Year</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex justify-between items-center cursor-pointer"
                >
                  <span>
                    {selectedCombined ? selectedCombined.name : "Select"}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {combineds.length > 0 &&
                  combineds.map((comb) => (
                    <DropdownMenuItem
                      onClick={() => setSelectedCombined(comb)}
                      key={comb.uuid}
                    >
                      <span>{comb.name}</span>
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {selectedCombined && (
            <div className="flex flex-col gap-2">
              <label className="text-sm">Course</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center cursor-pointer"
                  >
                    <span>
                      {selectedCourse ? selectedCourse.name : "Select"}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {courses
                    .filter((course) =>
                      selectedCombined.course.includes(course.name)
                    )
                    .map((el) => (
                      <DropdownMenuItem
                        onClick={() => setSelectedCourse(el)}
                        key={el.uuid}
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
              <label className="text-sm">Semester/Trimester</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center cursor-pointer"
                  >
                    <span>
                      {selectedSemester ? selectedSemester : "Select"}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {Array.from(
                    { length: Number(selectedCourse.semester) },
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
              <label className="text-sm">Subject</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center cursor-pointer"
                  >
                    <span>
                      {selectedSubject ? selectedSubject.name : "Selected"}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
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
                      >
                        {sub.name}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          {selectedSubject && (
            <div className="flex flex-col gap-2">
              <label className="text-sm">Campus</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center cursor-pointer"
                  >
                    <span>{selectedCampus ? selectedCampus : "Selected"}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>All</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border bg-gray-100">
              <TableHead className="border-r font-semibold">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="border-r font-semibold">Sr no</TableHead>
              <TableHead className="border-r font-semibold">
                Candidate ID
              </TableHead>
              <TableHead className="border-r font-semibold">Name</TableHead>
              <TableHead className="border-r font-semibold">Email ID</TableHead>
              <TableHead className="border-r font-semibold">
                Roll Number
              </TableHead>
              <TableHead className="border-r font-semibold">
                PRN Number
              </TableHead>
              <TableHead className="border-r font-semibold">
                PH Candidate
              </TableHead>
              <TableHead className="border-r font-semibold">Stream</TableHead>
              <TableHead className="border-r font-semibold">Course</TableHead>
              <TableHead className="border-r font-semibold">Subject</TableHead>
              <TableHead className="border-r font-semibold">
                Booklet Name
              </TableHead>
              <TableHead className="border-r font-semibold">
                Campus Name
              </TableHead>
              <TableHead className="font-semibold">
                Answer Sheet Uploaded (Yes/No)
              </TableHead>
            </TableRow>
          </TableHeader>
          {viewType === "activated" ? (
            <TableBody className="border">
              {selectedSubject &&
                filteredCandidates.length > 0 &&
                filteredCandidates
                  .filter((el) => el.isActive !== false)
                  .map((el, i) => (
                    <TableRow key={el.RollNo}>
                      <TableCell className="border border-r">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(el._id)}
                          onChange={() => handleRowSelect(el._id)}
                        />
                      </TableCell>
                      <TableCell className="border border-r">{i + 1}</TableCell>
                      <TableCell className="border border-r">
                        {el._id}
                      </TableCell>
                      <TableCell className="border border-r">
                        {el.FirstName} {el.MiddleName} {el.LastName}
                      </TableCell>
                      <TableCell className="border border-r">
                        {el.Email}
                      </TableCell>
                      <TableCell className="border border-r">
                        {el.RollNo}
                      </TableCell>
                      <TableCell className="border border-r">
                        {el.PRNNumber}
                      </TableCell>
                      <TableCell className="border border-r">
                        {el.IsPHCandidate}
                      </TableCell>
                      <TableCell className="border border-r">
                        {getStreamName(el.combined)}
                      </TableCell>
                      <TableCell className="border border-r">
                        {getCourseName(el.combined)}
                      </TableCell>
                      <TableCell className="border border-r">
                        {selectedSubject.name}
                      </TableCell>
                      <TableCell className="border border-r">
                        {el.BookletName ? el.BookletName : "Not Uploaded"}
                      </TableCell>
                      <TableCell className="border border-r">
                        {el.CampusName}
                      </TableCell>
                      <TableCell className="border border-r">
                        {el.sheetUploaded === true ? "Yes" : "No"}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          ) : (
            <TableBody className="border">
              {selectedSubject &&
                filteredCandidates.length > 0 &&
                filteredCandidates
                  .filter((el) => el.isActive === false)
                  .map((el, i) => (
                    <TableRow key={el.RollNo}>
                      <TableCell className="border border-r">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(el._id)}
                          onChange={() => handleRowSelect(el._id)}
                        />
                      </TableCell>
                      <TableCell className="border border-r">{i + 1}</TableCell>
                      <TableCell className="border border-r">
                        {el._id}
                      </TableCell>
                      <TableCell className="border border-r">
                        {el.FirstName} {el.MiddleName} {el.LastName}
                      </TableCell>
                      <TableCell className="border border-r">
                        {el.Email}
                      </TableCell>
                      <TableCell className="border border-r">
                        {el.RollNo}
                      </TableCell>
                      <TableCell className="border border-r">
                        {el.PRNNumber}
                      </TableCell>
                      <TableCell className="border border-r">
                        {el.IsPHCandidate}
                      </TableCell>
                      <TableCell className="border border-r">
                        {getStreamName(el.combined)}
                      </TableCell>
                      <TableCell className="border border-r">
                        {getCourseName(el.combined)}
                      </TableCell>
                      <TableCell className="border border-r">
                        {selectedSubject.name}
                      </TableCell>
                      <TableCell className="border border-r">
                        {el.BookletName ? el.BookletName : "Not Uploaded"}
                      </TableCell>
                      <TableCell className="border border-r">
                        {el.CampusName}
                      </TableCell>
                      <TableCell className="border border-r">
                        {el.sheetUploaded === true ? "Yes" : "No"}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          )}
        </Table>
      </div>
    </div>
  );
}
