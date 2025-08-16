"use client";

import React, { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  ChevronDown,
  DownloadIcon,
  Eye,
  LucideSquareDashedKanban,
  PencilIcon,
  TrashIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";

export default function page() {
  const [streams, setStreams] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [years, setYears] = useState([]);
  const [courses, setCourses] = useState([]);
  const [combineds, setCombineds] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filteredsubjects, setFilteredSubjects] = useState([]);
  const [search, setSearch] = useState("");

  const [editDialogCombined, setEditCombined] = useState(null);
  const [editDialogCourse, setEditCourse] = useState(null);
  const [editDialogName, setEditName] = useState("");
  const [editDialogCode, setEditCode] = useState("");
  const [editDialogType, setEditType] = useState("");
  const [editDialogDate, setEditDate] = useState("");
  const [editDialogSemester, setEditSemester] = useState("");

  const [newDialogCombined, setNewCombined] = useState(null);
  const [newDialogCourse, setNewCourse] = useState(null);
  const [newDialogName, setNewName] = useState("");
  const [newDialogCode, setNewCode] = useState("");
  const [newDialogType, setNewType] = useState("");
  const [newDialogDate, setNewDate] = useState("");
  const [newDialogSemester, setNewSemester] = useState("");

  const [selectedCombined, setSelectedCombined] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [importDialog, setImportDialog] = useState(false);
  const [subjectEditDialog, setSubjectEditDialog] = useState(false);
  const [newSubjectDialog, setNewSubjectDialog] = useState(false);
  const [importedFile, setImportFile] = useState(null);
  const [viewType, setViewType] = useState("activated");

  const ref = useRef(null);

  useEffect(() => {
    if (!search) {
      setFilteredSubjects(subjects);
      return;
    }

    const results = filteredsubjects.filter((el) =>
      el.name.toLowerCase().includes(search.toLowerCase().trim())
    );

    setFilteredSubjects(results);
  }, [search, subjects]);

  useEffect(() => {
    setEditName(selectedSubject?.name);
  }, [selectedSubject]);

  useEffect(() => {
    setEditCode(selectedSubject?.code);
  }, [selectedSubject]);

  useEffect(() => {
    let data = subjects;

    if (selectedCombined) {
      data = data.filter((sub) => sub.combined === selectedCombined.uuid);
    }

    if (selectedCourse) {
      data = data.filter((sub) => sub.course === selectedCourse.uuid);
    }

    setFilteredSubjects(data);
  }, [selectedCombined, selectedCourse, subjects]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          streamRes,
          degreeRes,
          yearRes,
          courseRes,
          combinedRes,
          subjectRes,
        ] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/courses`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/combineds`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subjects`),
        ]);

        const [
          streamData,
          degreeData,
          yearData,
          courseData,
          combinedData,
          subjectData,
        ] = await Promise.all([
          streamRes.json(),
          degreeRes.json(),
          yearRes.json(),
          courseRes.json(),
          combinedRes.json(),
          subjectRes.json(),
        ]);

        setStreams(streamData);
        setDegrees(degreeData);
        setYears(yearData);
        setCourses(courseData);
        setCombineds(combinedData);
        setSubjects(subjectData);
      } catch (error) {
        toast.error(error.message);
      }
    };

    fetchData();
  }, []);

  const importExcel = async () => {
    try {
      const excelData = await importedFile.arrayBuffer();
      const workbook = XLSX.read(excelData, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsed = XLSX.utils.sheet_to_json(worksheet);
      const jsonData = parsed.map((row) => ({
        name: row["Subject Name"],
        code: row["Code"],
        type: row["Type"],
        courseCode: row["Course Code"],
        course: row["Course"],
        stream: row["Stream"],
        degree: row["Degree"],
        year: row["Year"],
        semester: row["Semester"],
        exam: row["Exam Date"],
      }));
      console.log("Data:", jsonData);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subjects/bulk`,
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(jsonData),
        }
      );

      if (res.ok) {
        const data = await res.json();
        toast.success(`Import ${data.totalProcessed} subjects`);
        console.log(data);
        setSubjects(data.data);
        setImportDialog(false);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getStreamName = (id) => {
    const combined = combineds?.find((el) => el.uuid === id);
    const stream = streams.find((el) => el.uuid === combined.stream);
    return stream?.name;
  };

  const getDegreeName = (id) => {
    const combined = combineds?.find((el) => el.uuid === id);
    const degree = degrees.find((el) => el.uuid === combined.degree);
    return degree?.name;
  };

  const getYear = (id) => {
    const combined = combineds?.find((el) => el.uuid === id);
    const year = years.find((el) => el.uuid === combined.year);
    return year?.year;
  };

  const getCourseName = (id) => {
    const course = courses.find((course) => course.uuid === id);
    return course ? course.name : "undefined";
  };

  const handleClearFilters = () => {
    setSelectedCombined(null);
    setSelectedCourse(null);
  };

  const resetNewSubjectDialogFilters = () => {
    setNewCombined(null);
    setNewCourse(null);
    setNewName("");
    setNewCode("");
    setNewType("");
    setNewDate("");
    setNewSemester("");
  };

  // const resetDialogSubjectDialogFilters = () => {
  //   if (!selectedSubject) return;

  //   setEditCombined(selectedSubject.combined || null);
  //   setEditCourse(selectedSubject.course || null);
  //   setEditName(selectedSubject.name || "");
  //   setEditCode(selectedSubject.code || "");
  //   setEditType(selectedSubject.type || "");
  //   setEditDate(selectedSubject.date || "");
  //   setEditSemester(selectedSubject.semester || "");
  // };

  const handleSubjectDelete = async (id) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subjects/${id}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        const data = await res.json();
        toast.success(data.message);

        const new_data = subjects.filter((el) => el.uuid !== id);
        setFilteredSubjects(new_data);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSubjectEditOpen = (subject) => {
    setSubjectEditDialog(true);
    const sub = subjects.find((el) => el.uuid === subject);
    setSelectedSubject(sub);
  };

  const handleSubjectDeactivate = async (id) => {
    setSubjects((prevSubjects) =>
      prevSubjects.map((el) =>
        el.uuid === id ? { ...el, isActive: false } : el
      )
    );

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subjects/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ isActive: false }),
      }
    );

    if (res.ok) {
      toast.success("Deactivated Successfully");
    }
  };

  const handleSubjectActivate = async (id) => {
    setSubjects((prevSubjects) =>
      prevSubjects.map((el) =>
        el.uuid === id ? { ...el, isActive: true } : el
      )
    );

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subjects/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ isActive: true }),
      }
    );

    if (res.ok) {
      toast.success("Activated Successfully");
    }

    setViewType("activated");
  };

  const exportExcel = () => {
    const exportData = filteredsubjects.map((sub) => ({
      "Subject Name": sub.name,
      Code: sub.code,
      Type: sub.type,
      Semester: sub.semester,
      "Exam Date": sub.exam,
      Course: getCourseName(sub.course),
      Stream: getStreamName(sub.combined),
      Degree: getDegreeName(sub.combined),
      Year: getYear(sub.combined),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "Subjects.xlsx");
  };

  // Helper function for UUID generation
  const generateUUID = () =>
    [...Array(6)]
      .map(() => Math.random().toString(36)[2].toUpperCase())
      .join("");

  const handleNewSubject = async () => {
    try {
      const subject = {
        uuid: generateUUID(),
        name: newDialogName,
        code: newDialogCode,
        combined: newDialogCombined.uuid,
        course: newDialogCourse.uuid,
        semester: newDialogSemester,
        exam: newDialogDate,
        type: newDialogType,
      };

      setSubjects([...subjects, subject]);
      setFilteredSubjects(subjects);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subjects`,
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(subject),
        }
      );

      if (res.ok) {
        toast.success("Subject added successfully");
        setNewSubjectDialog(false);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-gray-100 p-6 flex flex-col gap-6 w-full">
      {/* Excel Import Dialog */}
      <Dialog open={importDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excel Import</DialogTitle>
            <DialogDescription>
              upload bulk data through Excel
            </DialogDescription>
          </DialogHeader>
          <main className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-blue-50 border border-blue-200 rounded-lg p-4 w-full">
              <div className="space-y-1">
                <p className="text-sm text-blue-700">
                  Download our template file to ensure proper formatting
                </p>
              </div>
              <Button
                variant="outline"
                className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800 whitespace-nowrap"
              >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Download Template
              </Button>
            </div>
            <div
              onClick={() => ref.current?.click()}
              className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors duration-200 cursor-pointer p-6 flex flex-col justify-center items-center gap-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-center"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && ref.current?.click()}
            >
              <UploadIcon className="w-10 h-10 text-gray-400" />
              <div className="space-y-1">
                <h3 className="font-medium text-gray-900">Upload Excel File</h3>
                <p className="text-sm text-gray-500">
                  XLS, XLSX or CSV (Max 10MB)
                </p>
              </div>
              {importedFile ? (
                <span className="text-blue-500 text-sm">
                  {importedFile.name}
                </span>
              ) : (
                <span className="text-sm text-blue-600 font-medium">
                  Browse files
                </span>
              )}
              <input
                type="file"
                ref={ref}
                className="hidden"
                accept=".xls,.xlsx,.csv"
              />
            </div>
            <input
              type="file"
              onChange={(e) => setImportFile(e.target.files[0])}
              accept=".xlsx"
              ref={ref}
              className="hidden"
            />
          </main>
          <DialogFooter>
            <Button onClick={() => setImportDialog(false)} variant="outline">
              cancel
            </Button>
            <Button onClick={importExcel}>import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subject Edit Dialog */}
      <Dialog open={subjectEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
            <DialogDescription>Edit the selected Subject</DialogDescription>
          </DialogHeader>
          <main className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label>Name</label>
              <Input
                value={editDialogName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label>Code</label>
              <Input
                value={editDialogCode}
                onChange={(e) => setEditCode(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label>Stream | Degree | Year</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center"
                  >
                    <span>
                      {editDialogCombined ? editDialogCombined.name : "Select"}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {selectedSubject &&
                    combineds
                      .filter((el) => el.uuid === selectedSubject.combined)
                      .map((sub) => (
                        <DropdownMenuItem
                          onClick={() => setEditCombined(sub)}
                          key={sub.uuid}
                        >
                          {sub.name}
                        </DropdownMenuItem>
                      ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col gap-1">
              <label>Course</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center"
                    disabled={editDialogCombined === null}
                  >
                    <span>
                      {editDialogCourse ? editDialogCourse.name : "Select"}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {selectedSubject &&
                    courses
                      .filter((el) =>
                        editDialogCombined?.course.filter((c) =>
                          el.name.includes(c)
                        )
                      )
                      .map((sub) => (
                        <DropdownMenuItem
                          onClick={() => setEditCourse(sub)}
                          key={sub.uuid}
                        >
                          {sub.name}
                        </DropdownMenuItem>
                      ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col gap-1">
              <label>Type</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center"
                    disabled={editDialogCourse === null}
                  >
                    <span>{editDialogType ? editDialogType : "Select"}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setEditType("Compulsory")}>
                    Compulsory
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setEditType("Elective / Optional")}
                  >
                    Elective / Optional
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col gap-1">
              <label>Exam Date</label>
              <Input
                disabled={editDialogType.length < 1}
                onChange={(e) => setEditDate(e.target.value)}
                value={editDialogDate}
                type="date"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label>Semester</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center"
                    disabled={editDialogCourse === null}
                  >
                    <span>
                      {editDialogSemester ? editDialogSemester : "Select"}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {Array.from(
                    { length: Number(selectedSubject?.semester) },
                    (_, i) => (
                      <DropdownMenuItem
                        onClick={() => setEditSemester(`${i + 1}`)}
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
          <DialogFooter>
            <Button
              onClick={() => {
                setSubjectEditDialog(false);
                // resetDialogSubjectDialogFilters();
              }}
              variant="outline"
            >
              cancel
            </Button>
            <Button onClick={importExcel}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Subject Dialog */}
      <Dialog open={newSubjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
            <DialogDescription>Edit the selected Subject</DialogDescription>
          </DialogHeader>
          <main className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label>Name</label>
              <Input
                value={newDialogName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label>Code</label>
              <Input
                value={newDialogCode}
                onChange={(e) => setNewCode(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label>Stream | Degree | Year</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center"
                  >
                    <span>
                      {newDialogCombined ? newDialogCombined.name : "Select"}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {combineds.map((sub) => (
                    <DropdownMenuItem
                      onClick={() => setNewCombined(sub)}
                      key={sub.uuid}
                    >
                      {sub.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col gap-1">
              <label>Course</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center"
                    disabled={newDialogCombined === null}
                  >
                    <span>
                      {newDialogCourse ? newDialogCourse.name : "Select"}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {newDialogCombined &&
                    courses
                      .filter((el) =>
                        newDialogCombined?.course.filter((c) =>
                          el.name.includes(c)
                        )
                      )
                      .map((sub) => (
                        <DropdownMenuItem
                          onClick={() => setNewCourse(sub)}
                          key={sub.uuid}
                        >
                          {sub.name}
                        </DropdownMenuItem>
                      ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col gap-1">
              <label>Type</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center"
                    disabled={newDialogCourse === null}
                  >
                    <span>{newDialogType ? newDialogType : "Select"}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setNewType("Compulsory")}>
                    Compulsory
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setNewType("Elective / Optional")}
                  >
                    Elective / Optional
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col gap-1">
              <label>Exam Date</label>
              <Input
                disabled={newDialogType.length < 1}
                onChange={(e) => setNewDate(e.target.value)}
                value={newDialogDate}
                type="date"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label>Semester</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center"
                    disabled={newDialogDate === null}
                  >
                    <span>
                      {newDialogSemester ? newDialogSemester : "Select"}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {Array.from(
                    { length: Number(newDialogCourse?.semester) },
                    (_, i) => (
                      <DropdownMenuItem
                        onClick={() => setNewSemester(`${i + 1}`)}
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
          <DialogFooter>
            <Button
              onClick={() => {
                setNewSubjectDialog(false);
                resetNewSubjectDialogFilters();
              }}
              variant="outline"
            >
              cancel
            </Button>
            <Button onClick={handleNewSubject}>Create Subject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="rounded-lg bg-white shadow-lg shadow-gray-200 p-5 flex flex-col">
        <h1 className="text-xl font-semibold">Subjects</h1>
        <p className="text-sm text-gray-500">
          Manage operations regarding Subjects
        </p>
      </div>
      <div className="rounded-lg bg-white shadow-lg shadow-gray-200 p-5 gap-5 flex flex-col">
        <div className="flex flex-col gap-5">
          <div className="flex justify-between items-center w-full">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Subjects"
              className="w-max"
            />
            <DropdownMenu>
              <div className="flex gap-2 justify-center items-center">
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center gap-2"
                  >
                    <span>Actions</span>
                    <ChevronDown />
                  </Button>
                </DropdownMenuTrigger>
                {
                  <div className="flex justify-center items-center">
                    <Button
                      disabled={selectedCombined === null}
                      onClick={handleClearFilters}
                      variant="outline"
                      className="border border-red-400 flex bg-red-100/50 hover:bg-red-100 transition-all cursor-pointer justify-between items-center"
                    >
                      <span className="text-red-500">Clear Filters</span>
                      <XIcon className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                }
              </div>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setNewSubjectDialog(true)}>
                  New Subject
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportExcel}>
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setImportDialog(true)}>
                  Import
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
          <div className="grid grid-cols-3 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm">Stream | Degree | Year</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center gap-2"
                  >
                    <span>
                      {selectedCombined ? selectedCombined.name : "Select..."}
                    </span>
                    <ChevronDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {combineds
                    .filter((el) => el.isActive !== false)
                    .map((el) => (
                      <DropdownMenuItem
                        onClick={() => setSelectedCombined(el)}
                        key={el.uuid}
                      >
                        {el.name}
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
                      className="flex justify-between items-center gap-2"
                    >
                      <span>
                        {selectedCourse ? selectedCourse.name : "Select..."}
                      </span>
                      <ChevronDown />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {courses
                      .filter(
                        (el) =>
                          el.isActive !== false &&
                          selectedCombined?.course.map((c) =>
                            c.includes(el.name)
                          )
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
          </div>
        </div>
        <Table>
          <TableHeader className="border rounded-t-lg">
            <TableRow className="bg-gray-100">
              <TableHead className="text-center border-r font-semibold">
                Sr no
              </TableHead>
              <TableHead className="text-center border-r font-semibold">
                ID
              </TableHead>
              <TableHead className="text-center border-r font-semibold">
                Name
              </TableHead>
              <TableHead className="text-center border-r font-semibold">
                Stream
              </TableHead>
              <TableHead className="text-center border-r font-semibold">
                Degree
              </TableHead>
              <TableHead className="text-center border-r font-semibold">
                Year
              </TableHead>
              <TableHead className="text-center border-r font-semibold">
                Course
              </TableHead>
              <TableHead className="text-right w-max">Actions</TableHead>
            </TableRow>
          </TableHeader>
          {viewType === "activated" ? (
            <TableBody className="border">
              {filteredsubjects.length > 0 ? (
                filteredsubjects
                  .filter((sub) => sub.isActive !== false)
                  .map((subject, i) => (
                    <TableRow key={i}>
                      <TableCell className="border-r text-center">
                        {i + 1}
                      </TableCell>
                      <TableCell className="border-r text-center">
                        {subject.uuid}
                      </TableCell>
                      <TableCell className="border-r text-center">
                        {subject.name}
                      </TableCell>
                      <TableCell className="border-r text-center">
                        {getStreamName(subject.combined)}
                      </TableCell>
                      <TableCell className="border-r text-center">
                        {getDegreeName(subject.combined)}
                      </TableCell>
                      <TableCell className="border-r text-center">
                        {getYear(subject.combined)}
                      </TableCell>
                      <TableCell className="border-r text-center">
                        {getCourseName(subject.course)}
                      </TableCell>
                      <TableCell className="border-r flex justify-end items-center gap-2">
                        <Button
                          onClick={() => handleSubjectEditOpen(subject.uuid)}
                          size="sm"
                          variant="outline"
                          className="flex cursor-pointer gap-2 justify-center items-center w-max"
                        >
                          <PencilIcon className="h-3 w-3" />
                          <span className="text-xs">Edit</span>
                        </Button>
                        {/* <Button
                      size="sm"
                      variant="destructive"
                      className="flex cursor-pointer gap-2 justify-center items-center"
                      onClick={() => handleSubjectDelete(subject.uuid)}
                    >
                      <TrashIcon className="h-3 w-3" />
                      <span className="text-xs">Delete</span>
                    </Button> */}
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex cursor-pointer gap-2 justify-center items-center"
                          onClick={() => handleSubjectDeactivate(subject.uuid)}
                        >
                          <Eye className="h-3 w-3" />
                          <span className="text-xs">Deactivate</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell>No Subjects available</TableCell>
                </TableRow>
              )}
            </TableBody>
          ) : viewType === "deactivated" &&
            filteredsubjects.filter((el) => el.isActive === false).length <
              1 ? (
            <TableBody>
              <TableRow>
                <TableCell>No deactivated subjects</TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody className="border">
              {filteredsubjects.length > 0 ? (
                filteredsubjects
                  .filter((sub) => sub.isActive === false)
                  .map((subject, i) => (
                    <TableRow key={i}>
                      <TableCell className="border-r text-center">
                        {i + 1}
                      </TableCell>
                      <TableCell className="border-r text-center">
                        {subject.uuid}
                      </TableCell>
                      <TableCell className="border-r text-center">
                        {subject.name}
                      </TableCell>
                      <TableCell className="border-r text-center">
                        {getStreamName(subject.combined)}
                      </TableCell>
                      <TableCell className="border-r text-center">
                        {getDegreeName(subject.combined)}
                      </TableCell>
                      <TableCell className="border-r text-center">
                        {getYear(subject.combined)}
                      </TableCell>
                      <TableCell className="border-r text-center">
                        {getCourseName(subject.course)}
                      </TableCell>
                      <TableCell className="border-r flex justify-end items-center gap-2">
                        <Button
                          onClick={() => handleSubjectEditOpen(subject.uuid)}
                          size="sm"
                          variant="outline"
                          className="flex cursor-pointer gap-2 justify-center items-center w-max"
                        >
                          <PencilIcon className="h-3 w-3" />
                          <span className="text-xs">Edit</span>
                        </Button>
                        {/* <Button
                      size="sm"
                      variant="destructive"
                      className="flex cursor-pointer gap-2 justify-center items-center"
                      onClick={() => handleSubjectDelete(subject.uuid)}
                    >
                      <TrashIcon className="h-3 w-3" />
                      <span className="text-xs">Delete</span>
                    </Button> */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex cursor-pointer bg-green-100/50 hover:bg-green-100 border border-green-300 gap-2 justify-center items-center"
                          onClick={() => handleSubjectActivate(subject.uuid)}
                        >
                          <Eye className="h-3 w-3" />
                          <span className="text-xs">Activate</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell>No Subjects available</TableCell>
                </TableRow>
              )}
            </TableBody>
          )}
        </Table>
      </div>
    </div>
  );
}
