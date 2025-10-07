"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FileText,
  Filter,
  CheckCircle,
  XCircle,
  ChevronDown,
} from "lucide-react";
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
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const QuestionPaperMasterPage = () => {
  const [questionPapers, setQuestionPapers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = Cookies.get("token");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [filterCourse, setFilterCourse] = useState("");
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const auth_token = Cookies.get("token");

    if (!auth_token) {
      router.push("/");
      return;
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const [courseRes, subjectRes, papersRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/course`, {
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/api/v1/subject`, {
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/api/v1/qp`, {
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!courseRes.ok) throw new Error("Failed to fetch courses");
        if (!subjectRes.ok) throw new Error("Failed to fetch subjects");
        if (!papersRes.ok) throw new Error("Failed to fetch question papers");

        const [courseData, subjectData, papersData] = await Promise.all([
          courseRes.json(),
          subjectRes.json(),
          papersRes.json(),
        ]);

        setCourses(courseData);
        setSubjects(subjectData);
        setQuestionPapers(papersData);
      } catch (error) {
        setError(error.message);
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Memoized functions for getting course and subject names
  const getCourseName = useCallback(
    (uuid) => courses.find((course) => course.uuid === uuid)?.name || "Unknown",
    [courses]
  );

  const getSubjectName = useCallback(
    (uuid) =>
      subjects.find((subject) => subject.uuid === uuid)?.name || "Unknown",
    [subjects]
  );

  // Sorting logic
  const sortPapers = (papers, key, direction) => {
    return [...papers].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      if (key === "course") {
        aValue = getCourseName(a[key]);
        bValue = getCourseName(b[key]);
      } else if (key === "subject") {
        aValue = getSubjectName(a[key]);
        bValue = getSubjectName(b[key]);
      }

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  // Filtered and sorted papers
  const filteredAndSortedPapers = useMemo(() => {
    let filtered = questionPapers.filter(
      (paper) =>
        (paper.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getSubjectName(paper.subject)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          getCourseName(paper.course)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) &&
        (!filterCourse || paper.course === filterCourse)
    );

    return sortPapers(filtered, sortConfig.key, sortConfig.direction);
  }, [
    questionPapers,
    searchTerm,
    filterCourse,
    sortConfig,
    getCourseName,
    getSubjectName,
  ]);

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Handle view paper
  const handleViewPaper = useCallback((paper) => {
    setSelectedPaper(paper);
    setIsModalOpen(true);
  }, []);

  // Handle verify paper
  const handleVerifyPaper = useCallback(async () => {
    if (!selectedPaper) return;

    try {
      console.log(selectedPaper);
      const response = await fetch(
        `${API_URL}/api/v1/qp/${selectedPaper._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ validated: true }),
        }
      );

      if (!response.ok) throw new Error("Failed to verify paper");

      const updatedPaper = await response.json();
      setQuestionPapers((prev) =>
        prev.map((paper) =>
          paper._id === updatedPaper._id ? updatedPaper : paper
        )
      );
      toast.success("Question paper verified successfully!");
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.message);
    }
  }, [selectedPaper]);

  // Handle delete paper
  const handleDeletePaper = useCallback(async (uuid) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/qp/${uuid}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete paper");

      setQuestionPapers((prev) => prev.filter((paper) => paper.uuid !== uuid));
      toast.success("Question paper deleted successfully!");
    } catch (error) {
      toast.error(error.message);
    }
  }, []);

  // Render question hierarchy
  const renderQuestionHierarchy = useCallback((data) => {
    const questionData = Array.isArray(data) ? data[0] : data;

    return Object.values(questionData).map((question) => (
      <div
        key={question.QuestionNo}
        className="mb-6 border-l-2 border-gray-200 pl-4"
      >
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg">
            {question.QuestionNo}. {question.QuestionText || "No question text"}
          </h3>
          {question.Marks && (
            <p className="text-sm text-gray-600 mt-1">
              Marks: {question.Marks}
            </p>
          )}
          {question.Notes && (
            <p className="text-sm text-gray-600 mt-1">{question.Notes}</p>
          )}

          {/* Render direct actual questions if they exist (main→actual) */}
          {question.actualQuestions &&
            Object.values(question.actualQuestions).map((actualQuestion) => (
              <div
                key={actualQuestion.QuestionNo}
                className="mt-2 ml-4 pl-4 border-l-2 border-gray-300"
              >
                <h4 className="font-medium">
                  {actualQuestion.QuestionNo}.{" "}
                  {actualQuestion.QuestionText || "No question text"}
                </h4>
                {actualQuestion.Marks && (
                  <p className="text-sm text-gray-600 mt-1">
                    Marks: {actualQuestion.Marks}
                  </p>
                )}
              </div>
            ))}

          {/* Render sub-questions and their actual questions (main→sub→actual) */}
          {question.subQuestions &&
            Object.values(question.subQuestions).map((subQuestion) => (
              <div
                key={subQuestion.QuestionNo}
                className="mt-4 ml-4 pl-4 border-l-2 border-gray-300"
              >
                <h4 className="font-medium">
                  {subQuestion.QuestionNo}.{" "}
                  {subQuestion.QuestionText || "No sub-question text"}
                </h4>
                {subQuestion.Marks && (
                  <p className="text-sm text-gray-600 mt-1">
                    Marks: {subQuestion.Marks} | Answer any{" "}
                    {subQuestion.Optional} out of {subQuestion.TotalQuestions}
                  </p>
                )}
                {subQuestion.Notes && (
                  <p className="text-sm text-gray-600 mt-1">
                    {subQuestion.Notes}
                  </p>
                )}

                {subQuestion.actualQuestions &&
                  Object.values(subQuestion.actualQuestions).map(
                    (actualQuestion) => (
                      <div
                        key={actualQuestion.QuestionNo}
                        className="mt-2 ml-4 pl-4 border-l-2 border-gray-400"
                      >
                        <h5 className="font-medium">
                          {actualQuestion.QuestionNo}.{" "}
                          {actualQuestion.QuestionText ||
                            "No actual question text"}
                        </h5>
                        {actualQuestion.Marks && (
                          <p className="text-sm text-gray-600 mt-1">
                            Marks: {actualQuestion.Marks}
                          </p>
                        )}
                      </div>
                    )
                  )}
              </div>
            ))}
        </div>
      </div>
    ));
  }, []);

  return (
    <div className="min-h-screen bg-white p-6 sm:p-6 lg:p-6">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-0">
          <h1 className="font-medium text-sm text-gray-900">
            Question Paper Management
          </h1>
          <p className="text-gray-600 text-sm">
            Efficiently view and manage all question papers
          </p>
        </header>
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-6 w-1/2">
            <div className="flex justify-start items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg h-full w-1/4">
                <div className="text-2xl font-bold text-blue-600">
                  {questionPapers.length}
                </div>
                <div className="text-xs text-blue-500">
                  Total Question Papers
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-lg h-full w-1/4">
                <div className="text-2xl font-bold text-green-600">
                  {questionPapers.filter((s) => s.isActive).length}
                </div>
                <div className="text-xs text-green-500">
                  Active Question Papers
                </div>
              </div>
            </div>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search by exam name, subject, or course..."
                className="pl-10 w-full text-sm bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 text-sm">
                    <Filter className="h-4 w-4" />
                    Filter by Course
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterCourse("")}>
                    All Courses
                  </DropdownMenuItem>
                  {courses.map((course) => (
                    <DropdownMenuItem
                      key={course.uuid}
                      onClick={() => setFilterCourse(course.uuid)}
                    >
                      {course.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 p-6 bg-red-50 rounded-lg">
            {error}
          </div>
        ) : (
          <div className="rounded-lg border overflow-x-auto">
            <Table className="bg-white">
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="w-[60px] cursor-pointer"
                    onClick={() => handleSort("index")}
                  >
                    Sr No
                    {sortConfig.key === "index" && (
                      <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    Exam Name
                    {sortConfig.key === "name" && (
                      <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("course")}
                  >
                    Course
                    {sortConfig.key === "course" && (
                      <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("subject")}
                  >
                    Subject
                    {sortConfig.key === "subject" && (
                      <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("semester")}
                  >
                    Semester
                    {sortConfig.key === "semester" && (
                      <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </TableHead>
                  <TableHead
                    className="text-center cursor-pointer"
                    onClick={() => handleSort("totalMarks")}
                  >
                    Total Marks
                    {sortConfig.key === "totalMarks" && (
                      <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Version</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedPapers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-10 text-gray-500"
                    >
                      No question papers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedPapers.map((paper, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          {paper.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getCourseName(paper.course).slice(0, 20)}
                      </TableCell>
                      <TableCell>{getSubjectName(paper.subject)}</TableCell>
                      <TableCell>{paper.semester}</TableCell>
                      <TableCell className="text-center">
                        {paper.totalMarks}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={paper.validated ? "success" : "secondary"}
                          className={cn(
                            "w-24 justify-center",
                            paper.validated
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          )}
                        >
                          {paper.validated ? "Verified" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        v{paper.version}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewPaper(paper)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDeletePaper(paper.uuid)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col rounded-lg">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                {selectedPaper?.name}
                {selectedPaper?.validated && (
                  <Badge
                    variant="success"
                    className="gap-1 bg-green-100 text-green-800"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Verified
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>

            {selectedPaper && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Course
                      </h3>
                      <p className="font-semibold">
                        {getCourseName(selectedPaper.course)}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Subject
                      </h3>
                      <p className="font-semibold">
                        {getSubjectName(selectedPaper.subject)}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Semester
                      </h3>
                      <p className="font-semibold">{selectedPaper.semester}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Total Marks
                      </h3>
                      <p className="font-semibold">
                        {selectedPaper.totalMarks}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4">
                  <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h2 className="text-xl font-bold mb-6 pb-2 border-b border-gray-200">
                      Question Paper
                    </h2>
                    <div className="space-y-6">
                      {renderQuestionHierarchy(selectedPaper.data)}
                    </div>
                  </div>
                </div>

                {!selectedPaper.validated && (
                  <div className="pt-4 border-t">
                    <Button
                      onClick={handleVerifyPaper}
                      className="w-full cursor-pointer sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Verify Question Paper
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default QuestionPaperMasterPage;
