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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ChevronDown,
  XIcon,
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  Users,
  BookOpen,
  Calendar,
} from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { saveAs } from "file-saver";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Fix for SSR - Move PDF.js initialization to useEffect
const Document = dynamic(
  () => import("react-pdf").then((mod) => mod.Document),
  {
    ssr: false,
    loading: () => (
      <div className="text-center py-8">
        <p>Loading PDF viewer...</p>
      </div>
    ),
  }
);

const Page = dynamic(() => import("react-pdf").then((mod) => mod.Page), {
  ssr: false,
  loading: () => (
    <div className="text-center py-4">
      <p>Loading page...</p>
    </div>
  ),
});

// PDF.js worker configuration
const pdfjs = await import("pdfjs-dist");
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function AnswerSheetsPage() {
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetLoading, setIsSheetLoading] = useState(false);
  const router = useRouter();
  const auth_token = Cookies.get("token");
  const canvasRef = useRef(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [windowWidth, setWindowWidth] = useState(1200); // Default width for SSR

  useEffect(() => {
    if (selectedRow) {
      const sheet = answers.find((sheet) => sheet._id === selectedRow);
      if (!sheet) return toast.error("Sheet not found");
      setSelectedAnswer(sheet);
    }
  }, [selectedAnswer, selectedRow]);

  // Handle window resize for responsive PDF display
  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);

      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    if (!auth_token) {
      router.push("/");
      return;
    }
  }, [auth_token, router]);

  useEffect(() => {
    const getSheet = async () => {
      if (!selectedRow) return;

      setIsSheetLoading(true);
      try {
        const [res, blobres] = await Promise.all([
          fetch(
            `${API_URL}/api/v1/answer-sheet/full/${
              answers.find((answer) => answer._id === selectedRow)?.assignmentId
            }`,
            {
              headers: {
                Authorization: `Bearer ${auth_token}`,
              },
            }
          ),
          fetch(
            `${API_URL}/api/v1/answer-sheet/${
              answers.find((answer) => answer._id === selectedRow)?.assignmentId
            }`,
            {
              headers: {
                Authorization: `Bearer ${auth_token}`,
              },
            }
          ),
        ]);

        if (res.ok && blobres.ok) {
          const [data, blobdata] = await Promise.all([
            res.json(),
            blobres.json(),
          ]);
          setSheetBlob(blobdata);
          setEvaluatedAnswer(data);
        }
      } catch (error) {
        toast.error("Failed to load answer sheet");
      } finally {
        setIsSheetLoading(false);
      }
    };

    getSheet();
  }, [selectedRow, tabValue, API_URL, auth_token, answers]);

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
        setIsLoading(true);
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
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, [API_URL, auth_token]);

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

  const clearFilters = () => {
    setSelectedCombined(null);
    setSelectedCourse(null);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setSelectedCampus(null);
    setSearch("");
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
    if (!id) return "Not Mapped";
    const candidate = candidates.find((el) => el.RollNo === id);
    if (candidate) {
      return `${candidate.FirstName} ${candidate.MiddleName} ${candidate.LastName}`.trim();
    } else {
      return "Not Mapped";
    }
  };

  useEffect(() => {
    const data = answers.filter((el) => {
      const name = getCandidateName(el.candidateId);
      return name.toLowerCase().includes(search.toLowerCase());
    });
    setFilteredAnswers(data);
  }, [search, answers]);

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
  }, [
    selectedCombined,
    selectedSubject,
    selectedCourse,
    selectedSemester,
    answers,
  ]);

  const excelAnswers = () => {
    if (filteredAnswers.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      const mappedData = filteredAnswers.map((el) => ({
        RollNo: el.candidateId,
        Name: getCandidateName(el.candidateId),
        Stream: getStreamName(el.combined),
        Course: getCourseName(el.combined),
        "Subject (Code)": `${selectedSubject?.name || "N/A"} (${
          selectedSubject?.code || "N/A"
        })`,
        ExamAssignmentId: el.uuid,
        CandidateAttendance: el.attendance ? "PRESENT" : "ABSENT",
        AnswerSheetUploaded: el.sheetUploaded ? "Yes" : "No",
        AnswerSheetPath: el.path,
      }));
      const worksheet = XLSX.utils.json_to_sheet(mappedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Answer Sheets");
      XLSX.writeFile(
        workbook,
        `AnswerSheets_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      toast.success("Data exported successfully");
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  const getFileName = () => {
    const file = filteredAnswers.find((el) => el._id === selectedRow);
    return file?.path?.split("\\").pop() || file?.path?.split("/").pop();
  };

  const handleDownloadScanned = async () => {
    try {
      const fileName = getFileName();
      if (!fileName) {
        toast.error("No file available for download");
        return;
      }

      const res = await fetch(`${API_URL}/api/v1/answer-sheet/${fileName}`, {
        headers: { Authorization: `Bearer ${auth_token}` },
      });

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      saveAs(blob, fileName || "answer-sheet.pdf");
      toast.success("File downloaded successfully");
    } catch (err) {
      toast.error("Failed to download scanned sheet");
    }
  };

  const handleDownloadEvaluated = () => {
    if (!canvasRef.current) {
      toast.error("No evaluated sheet available");
      return;
    }

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        saveAs(
          blob,
          `evaluated-${
            getFileName()?.replace(".pdf", "") || "answer-sheet"
          }.png`
        );
        toast.success("Evaluated sheet downloaded");
      }
    });
  };

  const hasActiveFilters =
    selectedCombined ||
    selectedCourse ||
    selectedSubject ||
    selectedSemester ||
    selectedCampus ||
    search;

  // Calculate PDF width based on window size - safe for SSR
  const getPdfWidth = () => {
    return Math.min(600, windowWidth - 100);
  };

  // Loading skeleton component
  const TableSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 w-full p-4 lg:p-6 gap-4 lg:gap-6 flex flex-col">
      {/* Answer Sheet Viewer Dialog */}
      <Dialog
        open={viewAnswerSheetModal}
        onOpenChange={setViewAnswerSheetModal}
      >
        <DialogContent className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Answer Sheet Viewer
            </DialogTitle>
            <DialogDescription>
              View scanned and evaluated answer sheets for{" "}
              {getCandidateName(
                filteredAnswers.find((el) => el._id === selectedRow)
                  ?.candidateId
              )}
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={tabValue}
            onValueChange={setTabValue}
            className="flex-1 flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="scanned" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Scanned Copy
              </TabsTrigger>
              {selectedAnswer && selectedAnswer.isEvaluated === true && (
                <TabsTrigger
                  value="evaluated"
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Evaluated Copy
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent
              value="scanned"
              className="flex-1 flex flex-col gap-4 m-0"
            >
              {isSheetLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Skeleton className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Loading document...
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-h-[400px] border rounded-lg overflow-hidden bg-gray-50">
                    <iframe
                      src={`${API_URL}/api/v1/answer-sheet/iframe/${selectedAnswer?.path}`}
                      title="Scanned Answer Sheet"
                      width="100%"
                      height="100%"
                      className="border-0 h-full min-h-[400px]"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <Button
                      onClick={handleDownloadScanned}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Scanned
                    </Button>
                    <div className="flex-1" />
                    <Badge variant="secondary" className="px-3 py-1">
                      File: {getFileName()}
                    </Badge>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent
              value="evaluated"
              className="flex-1 flex flex-col gap-4 m-0"
            >
              {isSheetLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Skeleton className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Loading evaluated document...
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-auto border rounded-lg bg-gray-50 p-4 flex justify-center">
                    <div className="relative">
                      <Document
                        file={`${API_URL}/api/v1/answer-sheet/${getFileName()}`}
                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                        loading={
                          <div className="text-center py-8">
                            <p>Loading PDF document...</p>
                          </div>
                        }
                      >
                        <Page
                          pageNumber={pageNumber}
                          width={getPdfWidth()}
                          loading={
                            <div className="text-center py-4">
                              <p>Loading page {pageNumber}...</p>
                            </div>
                          }
                        />
                      </Document>
                      <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 pointer-events-none"
                        width={600}
                        height={800}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={pageNumber <= 1}
                          onClick={() => setPageNumber((p) => p - 1)}
                        >
                          Previous
                        </Button>
                        <span className="text-sm font-medium min-w-[120px] text-center">
                          Page {pageNumber} of {numPages || 0}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={pageNumber >= (numPages || 1)}
                          onClick={() => setPageNumber((p) => p + 1)}
                        >
                          Next
                        </Button>
                      </div>

                      <Button
                        onClick={handleDownloadEvaluated}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Evaluated
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex-shrink-0 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setViewAnswerSheetModal(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rest of your component remains the same */}
      {/* Header Section */}
      <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Answer Sheets Management
              </CardTitle>
              <CardDescription className="text-base mt-2">
                View and manage all answer sheets in one place
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{filteredAnswers.length} answer sheets</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters and Actions Section */}
      <Card className="shadow-sm border-0">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6">
            {/* Search and Actions Row */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
              <div className="relative w-full lg:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by candidate name..."
                  className="pl-10 w-full lg:w-80 bg-white/50 backdrop-blur-sm"
                />
              </div>

              <div className="flex flex-wrap gap-3 w-full lg:w-auto justify-start">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 shadow-sm"
                    >
                      <Filter className="h-4 w-4" />
                      Actions
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={excelAnswers}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export to Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Export Coursewise Data
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                {hasActiveFilters && (
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="flex items-center gap-2 bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800 shadow-sm"
                  >
                    <XIcon className="h-4 w-4" />
                    Clear Filters
                  </Button>
                )}

                {selectedRow && (
                  <Button
                    onClick={() => setViewAnswerSheetModal(true)}
                    className="flex items-center gap-2 shadow-sm bg-blue-600 hover:bg-blue-700"
                  >
                    <Eye className="h-4 w-4" />
                    View Answer Sheet
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stream | Degree | Year */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Stream | Degree | Year
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-white/50 backdrop-blur-sm"
                    >
                      <span className="truncate">
                        {selectedCombined
                          ? selectedCombined.name
                          : "Select stream"}
                      </span>
                      <ChevronDown className="h-4 w-4 flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full max-w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-auto">
                    {combineds.length > 0 ? (
                      combineds.map((comb) => (
                        <DropdownMenuItem
                          key={comb.uuid}
                          onClick={() => setSelectedCombined(comb)}
                          className="truncate"
                        >
                          {comb.name}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled>
                        No streams available
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Course */}
              {selectedCombined && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Course
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between bg-white/50 backdrop-blur-sm"
                      >
                        <span className="truncate">
                          {selectedCourse
                            ? selectedCourse.name
                            : "Select course"}
                        </span>
                        <ChevronDown className="h-4 w-4 flex-shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full max-w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-auto">
                      {courses
                        .filter((course) =>
                          selectedCombined.course.includes(course.uuid)
                        )
                        .map((course) => (
                          <DropdownMenuItem
                            key={course.uuid}
                            onClick={() => setSelectedCourse(course)}
                            className="truncate"
                          >
                            {course.name}
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {/* Semester */}
              {selectedCourse && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Semester
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between bg-white/50 backdrop-blur-sm"
                      >
                        <span className="truncate">
                          {selectedSemester
                            ? `Semester ${selectedSemester}`
                            : "Select semester"}
                        </span>
                        <ChevronDown className="h-4 w-4 flex-shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full max-w-[var(--radix-dropdown-menu-trigger-width)]">
                      {Array.from(
                        { length: Number(selectedCourse.semCount) || 0 },
                        (_, i) => (
                          <DropdownMenuItem
                            key={i + 1}
                            onClick={() => setSelectedSemester(`${i + 1}`)}
                          >
                            Semester {i + 1}
                          </DropdownMenuItem>
                        )
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {/* Subject */}
              {selectedSemester && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Subject
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between bg-white/50 backdrop-blur-sm"
                      >
                        <span className="truncate">
                          {selectedSubject
                            ? selectedSubject.name
                            : "Select subject"}
                        </span>
                        <ChevronDown className="h-4 w-4 flex-shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full max-w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-auto">
                      {subjects
                        .filter(
                          (subject) =>
                            subject.course === selectedCourse.uuid &&
                            subject.semester === selectedSemester
                        )
                        .map((subject) => (
                          <DropdownMenuItem
                            key={subject.uuid}
                            onClick={() => setSelectedSubject(subject)}
                            className="truncate"
                          >
                            {subject.name}
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            {/* Active Filters Badges */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <span className="text-sm text-muted-foreground">
                  Active filters:
                </span>
                {selectedCombined && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Stream: {selectedCombined.name}
                    <XIcon
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedCombined(null)}
                    />
                  </Badge>
                )}
                {selectedCourse && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Course: {selectedCourse.name}
                    <XIcon
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedCourse(null)}
                    />
                  </Badge>
                )}
                {selectedSemester && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Semester: {selectedSemester}
                    <XIcon
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedSemester(null)}
                    />
                  </Badge>
                )}
                {selectedSubject && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Subject: {selectedSubject.name}
                    <XIcon
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedSubject(null)}
                    />
                  </Badge>
                )}
                {search && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Search: {search}
                    <XIcon
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSearch("")}
                    />
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Table Section */}
      <Card className="shadow-sm border-0 flex-1">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton />
            </div>
          ) : selectedSubject ? (
            <div className="overflow-hidden rounded-lg">
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-12 border-r font-semibold text-gray-700"></TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        #
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Assignment ID
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Candidate Name
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Roll No
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Attendance
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Sheet Uploaded
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAnswers.length > 0 ? (
                      filteredAnswers.map((el, i) => (
                        <TableRow
                          key={el.uuid}
                          className={`cursor-pointer transition-colors ${
                            selectedRow === el._id
                              ? "bg-blue-50 border-l-4 border-l-blue-500"
                              : "hover:bg-gray-50/80"
                          }`}
                          onClick={() => handleRowSelect(el._id)}
                        >
                          <TableCell className="border-r">
                            <div className="flex items-center justify-center">
                              <input
                                type="radio"
                                checked={selectedRow === el._id}
                                onChange={() => handleRowSelect(el._id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-gray-900">
                            {i + 1}
                          </TableCell>
                          <TableCell className="font-mono text-sm text-gray-600">
                            {el.uuid}
                          </TableCell>
                          <TableCell className="font-medium">
                            {getCandidateName(el.candidateId)}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {el.rollPRN?.split(".")[0] || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                el.attendance ? "default" : "destructive"
                              }
                              className={
                                el.attendance
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : ""
                              }
                            >
                              {el.attendance ? "PRESENT" : "ABSENT"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                el.sheetUploaded ? "default" : "secondary"
                              }
                              className={
                                el.sheetUploaded
                                  ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                  : ""
                              }
                            >
                              {el.sheetUploaded ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="h-8 w-8 text-gray-300" />
                            <p>No answer sheets found</p>
                            <p className="text-sm">
                              Try adjusting your filters or search term
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Filter className="h-12 w-12 text-gray-300" />
                <h3 className="text-lg font-medium">
                  Select filters to view answer sheets
                </h3>
                <p className="text-sm max-w-md">
                  Choose a stream, course, semester, and subject to display the
                  relevant answer sheets.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
