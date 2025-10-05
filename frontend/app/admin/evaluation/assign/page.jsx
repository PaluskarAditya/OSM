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

export default function page() {
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

  const token = Cookies.get("token");

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
          userRes,
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
        ] = await Promise.all([
          streamsRes.json(),
          degreesRes.json(),
          yearsRes.json(),
          coursesRes.json(),
          combinedsRes.json(),
          subjectsRes.json(),
          candidatesRes.json(),
          userRes.json(),
        ]);

        setStreams(streamsData);
        setDegrees(degreesData);
        setYears(yearsData);
        setCourses(coursesData);
        setCombineds(combinedsData);
        setSubjects(subjectsData);
        setCandidates(candidatesData);
        setFilteredCandidates(candidatesData);

        const examiners = userData.filter(
          (el) => el.Role === "Examiner" || el.Role === "Moderator"
        );
        setUsers(examiners);
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

  const getStreamName = (id) => {
    const combined = combineds.find((el) => el.uuid === id);
    const stream = streams.find((el) => el.uuid === combined?.stream);
    return stream?.name;
  };

  const getCourseName = (id) => {
    const course = courses.find((el) => el.uuid === id);
    return course?.name;
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
      BookletNames: el.bookletNames,
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

    // Apply search filter if search is present
    if (search) {
      const lowerSearch = search.toLowerCase();
      data = data.filter((el) => {
        const name = `${el.FirstName?.toLowerCase() ?? ""} ${
          el.MiddleName?.toLowerCase() ?? ""
        } ${el.LastName?.toLowerCase() ?? ""}`;
        return name.includes(lowerSearch);
      });
    }

    // Apply selector filters
    if (selectedCombined) {
      data = data.filter((el) => el.combined === selectedCombined.uuid);
    }

    if (selectedCourse) {
      data = data.filter((el) => el.course === selectedCourse.uuid);
    }

    if (selectedSemester) {
      data = data.filter((el) => el.sem === selectedSemester); // Convert string '1' to number 1
    }

    if (selectedSubject) {
      data = candidates;
      console.log("Before filtering:", selectedSubject.uuid, data);
      data = data.filter((el) =>
        el.subjects?.find((sub) => selectedSubject.uuid === sub)
      );
      console.log("After filtering:", selectedSubject.uuid, data);
    }

    setFilteredCandidates(data);
  }, [
    candidates,
    search,
    selectedCombined,
    selectedCourse,
    selectedSemester,
    selectedSubject,
  ]);

  const handleAssignExaminer = async () => {
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
            sheets: selectedRows.map(
              (el) =>
                candidates.find((candidate) => candidate._id === el)
                  .assignmentId
            ),
            name: selectedSubject.name,
            course: selectedCourse.uuid,
            subject: selectedSubject.uuid,
            examiners: [selectedUser._id],
            endDate: selectedSubject.exam,
            semester: selectedSemester,
          }),
        }
      );

      if (res.ok) {
        toast.success("Examiner assigned successfully");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-white p-5 max-h-screen w-full   h-screen flex flex-col gap-5">
      {/* Assign Subject Modal */}
      <Dialog open={assignSubjectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Candidates</DialogTitle>
            <DialogDescription>
              Mark bulk attendance for candiates
            </DialogDescription>
          </DialogHeader>
          <main>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full flex justify-between items-center gap-2"
                >
                  <span>
                    {assignedSubject ? assignedSubject.name : "Select"}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
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
          </main>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignSubjectModal(false)}
            >
              close
            </Button>
            <Button
              onClick={async () => {
                const all_subs = candidates.find(
                  (el) => selectedRows[0] === el._id
                );

                console.log(assignedSubject.name);

                const isExist = candidates.some((el) =>
                  el.subjects.includes(assignedSubject.uuid)
                );

                console.log(isExist);

                if (isExist) {
                  toast.error(
                    "Subject already exists in candidate’s subjects!"
                  );
                  return;
                }

                const res = await fetch(
                  `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidates/subjects/bulk-update`,
                  {
                    method: "PUT",
                    headers: {
                      "Content-type": "application/json",
                    },
                    body: JSON.stringify({
                      ids: selectedRows,
                      subjects: all_subs.subjects,
                    }),
                  }
                );

                if (res.ok) {
                  selectedRows.map((id) => {
                    candidates.map(
                      (candidate) =>
                        candidate._id === id && {
                          ...candidate,
                          subjects: [
                            ...candidate.subjects,
                            assignedSubject.uuid,
                          ],
                        }
                    );
                  });
                  toast.success("Subject assigned successfully");
                }

                setAssignSubjectModal(true);
              }}
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className=" bg-white flex flex-col gap-0">
        <h1 className="text-sm font-medium">Evaluation</h1>
        <p className="text-sm text-gray-500">
          Assign Examiner to complete evaluation
        </p>
      </div>
      <div className="bg-white flex flex-col gap-6">
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
              {selectedSubject && selectedRows.length > 0 && (
                <>
                  <Select
                    value={selectedUser || ""}
                    onValueChange={(value) => setSelectedUser(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Examiner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {users.length > 0 &&
                          users.map((el) => (
                            <SelectItem value={el} key={el}>
                              {el.FirstName + " " + el.LastName}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAssignExaminer}
                    disabled={!selectedUser}
                    className="cursor-pointer"
                  >
                    Assign
                  </Button>
                </>
              )}
            </div>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={excelCandidate}>
                Export Candidate Data
              </DropdownMenuItem>
              <DropdownMenuItem>Export Barcode Details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="grid lg:grid-cols-4 md:grid-cols-3 gap-4">
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
                {combineds.map((comb) => (
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
                      selectedCombined.course.includes(course.uuid)
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
                {selectedSubject && (
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                )}
              </TableHead>
              <TableHead className="border-r font-semibold">Sr no</TableHead>
              <TableHead className="border-r font-semibold">Name</TableHead>
              <TableHead className="border-r font-semibold">
                Roll Number
              </TableHead>
              <TableHead className="border-r font-semibold">
                PRN Number
              </TableHead>
              <TableHead className="border-r font-semibold">Course</TableHead>
              <TableHead className="border-r font-semibold">Subject</TableHead>
              <TableHead className="border-r font-semibold">
                Booklet Name
              </TableHead>
            </TableRow>
          </TableHeader>
          {viewType === "activated" && selectedSubject
            ? (() => {
                // Filter candidates who are active and have uploaded sheet for the subject
                const uploadedCandidates = filteredCandidates.filter(
                  (el) =>
                    el.isActive !== false &&
                    el.bookletNames &&
                    el.bookletNames[selectedSubject.uuid] &&
                    el.bookletNames[selectedSubject.uuid].trim() !== ""
                );

                // If no candidates uploaded, render nothing
                if (uploadedCandidates.length === 0) return null;

                return (
                  <TableBody className="border">
                    {uploadedCandidates.map((el, i) => (
                      <TableRow key={el.RollNo}>
                        <TableCell className="border border-r">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(el._id)}
                            onChange={() => handleRowSelect(el._id)}
                          />
                        </TableCell>
                        <TableCell className="border border-r">
                          {i + 1}
                        </TableCell>
                        <TableCell className="border border-r">
                          {el.FirstName} {el.MiddleName} {el.LastName}
                        </TableCell>
                        <TableCell className="border border-r">
                          {el.RollNo}
                        </TableCell>
                        <TableCell className="border border-r">
                          {el.PRNNumber}
                        </TableCell>
                        <TableCell className="border border-r">
                          {getCourseName(el.course).slice(0, 25)}
                        </TableCell>
                        <TableCell className="border border-r">
                          {selectedSubject.name}
                        </TableCell>
                        <TableCell className="border border-r">
                          {el.bookletNames[selectedSubject.uuid]}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                );
              })()
            : null}
        </Table>
      </div>
    </div>
  );
}
