"use client";

import React, { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogHeader,
  DialogFooter,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import * as pdfjs from "pdfjs-dist";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronDown, XIcon } from "lucide-react";
import dynamic from 'next/dynamic'
import { toast } from "sonner";
import { saveAs } from "file-saver";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

if (typeof window !== "undefined") {
  const pdfjs = require("react-pdf").pdfjs;
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

const Document = dynamic(
  () => import("react-pdf").then((mod) => mod.Document),
  { ssr: false }
);
const Page = dynamic(() => import("react-pdf").then((mod) => mod.Page), {
  ssr: false,
});

export default function page() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [combineds, setCombineds] = useState([]);
  const [tabValue, setTabValue] = useState("scanned");
  const [streams, setStreams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedCombined, setSelectedCombined] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [evaluatedAnswer, setEvaluatedAnswer] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [filteredAnswers, setFilteredAnswers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [viewType, setViewType] = useState("activated");
  const [search, setSearch] = useState("");
  const [sheetBlob, setSheetBlob] = useState(null);
  const [viewAnswerSheetModal, setViewAnswerSheetModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const router = useRouter();
  const auth_token = Cookies.get("token");
  const canvasRef = useRef(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    if (!auth_token) {
      router.push("/");
      return;
    }
  }, []);

  useEffect(() => {
    const getSheet = async () => {
      const res = await fetch(
        `${API_URL}/api/v1/answer-sheet/full/${
          answers.find((answer) => answer._id === selectedRow)?.assignmentId
        }`,
        {
          headers: {
            Authorization: `Bearer ${auth_token}`,
          },
        }
      );
      const blobres = await fetch(
        `${API_URL}/api/v1/answer-sheet/${
          answers.find((answer) => answer._id === selectedRow)?.assignmentId
        }`,
        {
          headers: {
            Authorization: `Bearer ${auth_token}`,
          },
        }
      );
      if (res.ok && blobres.ok) {
        const data = await res.json();
        const blobdata = await blobres.json();
        setSheetBlob(blobdata);
        setEvaluatedAnswer(data);
      }
    };
    if (selectedRow) {
      getSheet();
    }
  }, [selectedRow, tabValue]);

  useEffect(() => {
    if (!evaluatedAnswer || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    evaluatedAnswer.annotations?.forEach((ann) => {
      ctx.strokeStyle = ann.color || "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);

      if (ann.text) {
        ctx.fillStyle = ann.color || "red";
        ctx.font = "14px Arial";
        ctx.fillText(ann.text, ann.x, ann.y - 4);
      }
    });
  }, [evaluatedAnswer, pageNumber]);

  useEffect(() => {
    const getData = async () => {
      try {
        const [
          streamRes,
          combinedRes,
          courseRes,
          subjectRes,
          answerRes,
          candidateRes,
        ] = await Promise.all([
          fetch(`${API_URL}/api/v1/stream`, {
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${auth_token}`,
            },
          }),
          fetch(`${API_URL}/api/v1/combined`, {
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${auth_token}`,
            },
          }),
          fetch(`${API_URL}/api/v1/course`, {
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${auth_token}`,
            },
          }),
          fetch(`${API_URL}/api/v1/subject`, {
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${auth_token}`,
            },
          }),
          fetch(`${API_URL}/api/v1/answer-sheet`, {
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${auth_token}`,
            },
          }),
          fetch(`${API_URL}/api/v1/candidate`, {
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${auth_token}`,
            },
          }),
        ]);
        const [
          streamsData,
          combinedData,
          courseData,
          subjectData,
          answerData,
          candidateData,
        ] = await Promise.all([
          streamRes.json(),
          combinedRes.json(),
          courseRes.json(),
          subjectRes.json(),
          answerRes.json(),
          candidateRes.json(),
        ]);
        setStreams(streamsData);
        setCombineds(combinedData);
        setCourses(courseData);
        setSubjects(subjectData);
        setAnswers(answerData);
        setFilteredAnswers(answerData);
        setCandidates(candidateData);
      } catch (error) {
        toast.error(error.message);
      }
    };
    getData();
  }, []);

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

  const clearFilters = () => {
    setSelectedCombined(null);
    setSelectedCourse(null);
    setSelectedSemester(null);
    setSelectedSubject(null);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredAnswers.map((row) => row._id));
    }
    setSelectAll(!selectAll);
  };

  const handleRowSelect = (id) => {
    if (selectedRow === id) {
      setSelectedRow(null);
    } else {
      setSelectedRow(id);
    }
  };

  const getCandidateName = (id) => {
    const candidate = candidates.find((el) => el.RollNo === id);
    if (candidate) {
      return `${candidate.FirstName} ${candidate.MiddleName} ${candidate.LastName}`;
    } else {
      return "Not Mapped";
    }
  };

  useEffect(() => {
    const data = answers.filter((el) => {
      const name = getCandidateName(el.name);
      if (name.toLowerCase().includes(search.toLowerCase())) {
        return el;
      }
    });
    setFilteredAnswers(data);
  }, [search]);

  useEffect(() => {
    let data = answers;
    if (selectedCombined) {
      data = data.filter((el) => el.combined === selectedCombined.uuid);
    }
    if (selectedCourse) {
      data = data.filter((el) => el.course === selectedCourse.uuid);
    }
    if (selectedSubject) {
      data = data.filter((el) => el.subject === selectedSubject.uuid);
    }
    setFilteredAnswers(data);
  }, [selectedCombined, selectedSubject, selectedCourse, selectedSemester]);

  const excelAnswers = () => {
    const mappedData = filteredAnswers.map((el) => ({
      RollNo: el.candidateId,
      Name: getCandidateName(el.name),
      Stream: getStreamName(el.combined),
      Course: getCourseName(el.combined),
      "Subject (Code)": `${selectedSubject.name} (${selectedSubject.code})`,
      ExamAssignmentId: el.uuid,
      CandidateAttendance: el.attendance ? "PRESENT" : "ABSENT",
      AnswerSheetUploaded: el.sheetUploaded ? "Yes" : "No",
      AnswerSheetPath: el.path,
    }));
    const worksheet = XLSX.utils.json_to_sheet(mappedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "Candidates.xlsx");
  };

  const getFileName = () => {
    const file = filteredAnswers.find((el) => el._id === selectedRow);
    return file?.path.split("\\").pop();
  };

  const handleDownloadScanned = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/v1/answer-sheet/${getFileName()}`,
        {
          headers: { Authorization: `Bearer ${auth_token}` },
        }
      );
      const blob = await res.blob();
      saveAs(blob, getFileName() || "answer-sheet.pdf");
    } catch (err) {
      toast.error("Failed to download scanned sheet");
    }
  };

  const handleDownloadEvaluated = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      saveAs(blob, "evaluated-answer-sheet.png");
    });
  };

  return (
    <div className="bg-gray-100 w-full p-6 gap-6 flex flex-col">
      <Dialog open={viewAnswerSheetModal}>
        <DialogContent className="w-3/4 min-h-[90vh]">
          <DialogHeader className="h-max">
            <DialogTitle>Answer Sheet</DialogTitle>
            <DialogDescription>
              View scanned and evaluated answer sheets
            </DialogDescription>
          </DialogHeader>
          <Tabs
            defaultValue={tabValue}
            value={tabValue}
            onValueChange={(val) => setTabValue(val)}
            className="w-full h-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scanned">Scanned</TabsTrigger>
              <TabsTrigger value="evaluated">Evaluated</TabsTrigger>
            </TabsList>
            <TabsContent
              value="scanned"
              className="flex flex-col gap-2 min-h-[70vh]"
            >
              <Document
                file={`${API_URL}/api/v1/answer-sheet/${getFileName()}`}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              >
                <Page pageNumber={pageNumber} width={600} />
              </Document>
              <div className="flex gap-4 items-center">
                <Button
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber((p) => p - 1)}
                >
                  Prev
                </Button>
                <span>
                  Page {pageNumber} of {numPages}
                </span>
                <Button
                  disabled={pageNumber >= numPages}
                  onClick={() => setPageNumber((p) => p + 1)}
                >
                  Next
                </Button>
                <Button onClick={handleDownloadScanned}>Download</Button>
              </div>
            </TabsContent>
            <TabsContent
              value="evaluated"
              className="flex flex-col gap-2 min-h-[70vh]"
            >
              <div className="relative">
                <Document
                  file={`${API_URL}/api/v1/answer-sheet/${getFileName()}`}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                >
                  <Page pageNumber={pageNumber} width={600} />
                </Document>
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 pointer-events-none"
                  width={600}
                  height={800}
                />
              </div>
              <div className="flex gap-4 items-center">
                <Button
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber((p) => p - 1)}
                >
                  Prev
                </Button>
                <span>
                  Page {pageNumber} of {numPages}
                </span>
                <Button
                  disabled={pageNumber >= numPages}
                  onClick={() => setPageNumber((p) => p + 1)}
                >
                  Next
                </Button>
                <Button onClick={handleDownloadEvaluated}>Download</Button>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter className="h-max">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setViewAnswerSheetModal(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex flex-col gap-1 bg-white p-6 shadow-lg shadow-black/5 rounded-lg">
        <h1 className="text-xl font-medium">View Answer Sheets</h1>
        <p className="text-sm text-gray-500">view and manage answer sheets</p>
      </div>
      <div className="p-6 bg-white rounded-lg shadow-lg shadow-black/5 flex flex-col gap-6">
        <div className="flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-1 w-full">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="enter search term"
                className="w-max"
              />
            </div>
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
                {selectedRow && (
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => setViewAnswerSheetModal(true)}
                  >
                    View Answer Sheet
                  </Button>
                )}
              </div>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={excelAnswers}>
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem>Export Coursewise Data</DropdownMenuItem>
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
                      <span>
                        {selectedCampus ? selectedCampus : "Selected"}
                      </span>
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
        </div>
        <div>
          <Table className="border-collapse border border-gray-200 w-full rounded-lg">
            <TableHeader>
              <TableRow>
                <TableHead className="border-r font-semibold"></TableHead>
                <TableHead className="border border-gray-200 p-2 text-center">
                  Sr no
                </TableHead>
                <TableHead className="border border-gray-200 p-2 text-center">
                  Assignment ID
                </TableHead>
                <TableHead className="border border-gray-200 p-2 text-center">
                  Candidate Name
                </TableHead>
                <TableHead className="border border-gray-200 p-2 text-center">
                  Roll No[PRN Number]
                </TableHead>
                <TableHead className="border border-gray-200 p-2 text-center">
                  Attendance
                </TableHead>
                <TableHead className="border border-gray-200 p-2 text-center">
                  Answer Sheet Uploaded
                </TableHead>
              </TableRow>
            </TableHeader>
            {selectedSubject && (
              <TableBody>
                {filteredAnswers.map((el, i) => (
                  <TableRow key={el.uuid}>
                    <TableCell className="border border-r">
                      <input
                        type="checkbox"
                        checked={selectedRow === el._id}
                        onChange={() => handleRowSelect(el._id)}
                      />
                    </TableCell>
                    <TableCell className="border border-gray-200 p-2 text-center align-middle">
                      {i + 1}
                    </TableCell>
                    <TableCell className="border border-gray-200 p-2 text-center align-middle">
                      {el.uuid}
                    </TableCell>
                    <TableCell className="border border-gray-200 p-2 text-center align-middle">
                      {el.candidateId
                        ? getCandidateName(
                            el.candidateId.split(" ")[0],
                            el.candidateId.split(" ")[1]
                          )
                        : "Not Mapped"}
                    </TableCell>
                    <TableCell className="border border-gray-200 p-2 text-center align-middle">
                      {el.rollPRN?.split(".")[0]}
                    </TableCell>
                    <TableCell className="border border-gray-200 p-2 text-center align-middle">
                      {el.attendance === true ? "PRESENT" : "ABSENT"}
                    </TableCell>
                    <TableCell className="border border-gray-200 p-2 text-center align-middle">
                      {el.sheetUploaded === true ? "Yes" : "No"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </div>
      </div>
    </div>
  );
}
