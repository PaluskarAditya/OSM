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
    const combined = combineds.find((el) => el.uuid === id);
    const course = courses.find((el) => combined?.course.includes(el.name));
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

  const handleAttendanceMark = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate/attendance`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: selectedRows, mark: attendance }),
        }
      );

      if (res.ok) {
        let data = candidates.map((el) =>
          selectedRows.includes(el._id) ? { ...el, attendance } : el
        );

        setCandidates(data);
        setFilteredCandidates(data);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-white p-6 max-w-4/5 flex flex-col gap-5">
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

      <div className="p-5 bg-white flex flex-col gap-0 rounded-lg shadow-lg shadow-gray-200">
        <h1 className="text-lg font-semibold">Candidates</h1>
        <p className="text-sm text-gray-500">
          Assign and Remove Subjects to Candidates
        </p>
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
              {selectedSubject && selectedRows.length > 0 && (
                <>
                  <Select
                    value={attendance}
                    onValueChange={(value) => setAttendance(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Mark Attendance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="unfair">Unfair</SelectItem>
                        <SelectItem value="debared">Debared</SelectItem>
                        <SelectItem value="approved absent">
                          Approved Absent
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAttendanceMark}
                    disabled={!attendance}
                    className="cursor-pointer"
                  >
                    Mark
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
                Attendance (Present/Absent)
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
                        {el.attendance}
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
