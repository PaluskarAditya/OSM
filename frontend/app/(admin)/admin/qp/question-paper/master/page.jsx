"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Filter, CheckCircle, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
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

export default function QuestionPaperMasterPage() {
  const [questionPapers, setQuestionPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [course, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, subjectRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/courses`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subjects`),
        ]);

        if (!courseRes.ok) throw new Error("Failed to fetch courses");
        if (!subjectRes.ok) throw new Error("Failed to fetch subjects");

        const [courseData, subjectData] = await Promise.all([
          courseRes.json(),
          subjectRes.json(),
        ]);

        setCourses(courseData);
        setSubjects(subjectData);
      } catch (error) {
        toast.error(error.message);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchQuestionPapers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/qp`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch question papers");
        }

        const data = await response.json();
        setQuestionPapers(data);
        setFilteredPapers(data);
      } catch (err) {
        console.error("Error fetching question papers:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestionPapers();
  }, []);

  useEffect(() => {
    const filtered = questionPapers.filter(
      (paper) =>
        paper.examName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.course?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPapers(filtered);
  }, [searchTerm, questionPapers]);

  const getSubjectName = (uuid) => {
    const sub = subjects.find((subject) => subject.uuid === uuid);
    return sub?.name;
  };

  const getCourseName = (uuid) => {
    const cour = course.find((course) => course.uuid === uuid);
    return cour?.name;
  };

  const handleViewPaper = (paper) => {
    setSelectedPaper(paper);
    setIsModalOpen(true);
  };

  const handleVerifyPaper = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/qp/${selectedPaper.uuid}/verify`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to verify paper");
      }

      const updatedPaper = await response.json();
      setQuestionPapers((prev) =>
        prev.map((paper) =>
          paper.uuid === updatedPaper.uuid ? updatedPaper : paper
        )
      );
      setFilteredPapers((prev) =>
        prev.map((paper) =>
          paper.uuid === updatedPaper.uuid ? updatedPaper : paper
        )
      );
      toast.success("Question paper verified successfully!");
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const renderQuestionHierarchy = (data) => {
    // Extract the first item if data is an array
    const questionData = Array.isArray(data) ? data[0] : data;

    return Object.values(questionData).map((question) => (
      <div
        key={question.QuestionNo}
        className="mb-6 border-l-2 border-gray-200 pl-4"
      >
        <div className="bg-gray-50 p-3 rounded-md">
          <h3 className="font-medium">
            {question.QuestionNo} -{" "}
            {question.QuestionText || "No question text"}
          </h3>
          {question.Marks && (
            <p className="text-sm text-gray-500">Marks: {question.Marks}</p>
          )}
          {question.Notes && (
            <p className="text-sm text-gray-500 mt-1">{question.Notes}</p>
          )}

          {question.subQuestions &&
            Object.values(question.subQuestions).map((subQuestion) => (
              <div
                key={subQuestion.QuestionNo}
                className="mt-3 ml-4 pl-4 border-l-2 border-gray-300"
              >
                <h4 className="font-medium">
                  {subQuestion.QuestionNo} -{" "}
                  {subQuestion.QuestionText || "No sub-question text"}
                </h4>
                {subQuestion.Marks && (
                  <p className="text-sm text-gray-500">
                    Marks: {subQuestion.Marks} | Answer any{" "}
                    {subQuestion.Optional} out of {subQuestion.TotalQuestions}
                  </p>
                )}
                {subQuestion.Notes && (
                  <p className="text-sm text-gray-500 mt-1">
                    {subQuestion.Notes}
                  </p>
                )}

                {/* Fixed: Access actualQuestions object directly */}
                {subQuestion.actualQuestions &&
                  Object.values(subQuestion.actualQuestions).map(
                    (actualQuestion) => (
                      <div
                        key={actualQuestion.QuestionNo}
                        className="mt-2 ml-4 pl-4 border-l-2 border-gray-400"
                      >
                        <h5 className="font-medium">
                          {actualQuestion.QuestionNo} -{" "}
                          {actualQuestion.QuestionText ||
                            "No actual question text"}
                        </h5>
                        {actualQuestion.Marks && (
                          <p className="text-sm text-gray-500">
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
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Question Paper Master
          </h1>
          <p className="text-gray-600">View and manage all question papers</p>
        </header>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by exam name, subject, or course..."
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 p-4">{error}</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Sr No</TableHead>
                      <TableHead>Exam Name</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead className="w-[100px] text-center">
                        Total Marks
                      </TableHead>
                      <TableHead className="w-[100px] text-center">
                        Status
                      </TableHead>
                      <TableHead className="w-[100px] text-center">
                        Version
                      </TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPapers.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="text-center py-8 text-gray-500"
                        >
                          No question papers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPapers.map((paper, index) => (
                        <TableRow key={paper._id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-gray-400" />
                              {paper.name}
                            </div>
                          </TableCell>
                          <TableCell>{getCourseName(paper.course)}</TableCell>
                          <TableCell>{getSubjectName(paper.subject)}</TableCell>
                          <TableCell>{paper.semester}</TableCell>
                          <TableCell className="text-center">
                            {paper.totalMarks}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={
                                paper.isVerified ? "success" : "secondary"
                              }
                              className="w-20"
                            >
                              {paper.isVerified ? "Verified" : "Pending"}
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
                              <Button size="sm" variant="destructive">
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
          </CardContent>
        </Card>
      </div>

      {/* Question Paper View Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col rounded-lg">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-2 text-2xl">
              {selectedPaper?.name}
              {selectedPaper?.isVerified && (
                <Badge variant="success" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedPaper && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header with paper details */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    <p className="font-semibold">{selectedPaper.totalMarks}</p>
                  </div>
                </div>
              </div>

              {/* Questions section with proper scrolling */}
              <div className="flex-1 overflow-y-auto px-1">
                {" "}
                {/* Added px-1 to prevent clipping */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h2 className="text-xl font-bold mb-6 pb-2 border-b border-gray-200">
                    Question Paper
                  </h2>

                  {/* Render questions with proper spacing */}
                  <div className="space-y-6">
                    {renderQuestionHierarchy(selectedPaper.data)}
                  </div>
                </div>
              </div>

              {/* Verify button fixed at bottom */}
              {!selectedPaper.isVerified && (
                <div className="pt-4 border-t">
                  <Button
                    onClick={handleVerifyPaper}
                    className="w-full md:w-auto gap-2"
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
  );
}
