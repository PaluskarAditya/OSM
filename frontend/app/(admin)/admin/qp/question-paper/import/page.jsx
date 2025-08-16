"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, UploadCloud, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ImportQuestionPaperPage() {
  // State declarations
  const [uploadedFile, setUploadedFile] = useState(null);
  const [combineds, setCombineds] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [examDate, setExamDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [version, setVersion] = useState(1);
  const [examinerAssigned, setExaminerAssigned] = useState(false);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [questionPaper, setQuestionPaper] = useState(null);
  const [questionPaperLoading, setQuestionPaperLoading] = useState(false);
  const [selectedCombineds, setSelectedCombineds] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedExaminer, setSelectedExaminer] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [examName, setExamName] = useState("");
  const [fileUploadStatus, setFileUploadStatus] = useState("idle");
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  const router = useRouter();

  // Monitor questionPaper changes
  useEffect(() => {
    if (questionPaper) {
      console.log("Question Paper Updated:", questionPaper);
    }
  }, [questionPaper]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [combinedsRes, coursesRes, subjectsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/combineds`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/courses`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subjects`),
        ]);

        if (!combinedsRes.ok) throw new Error("Failed to fetch combineds");
        if (!coursesRes.ok) throw new Error("Failed to fetch courses");
        if (!subjectsRes.ok) throw new Error("Failed to fetch subjects");

        const [combinedsData, coursesData, subjectsData] = await Promise.all([
          combinedsRes.json(),
          coursesRes.json(),
          subjectsRes.json(),
        ]);

        setCombineds(combinedsData);
        setCourses(coursesData);
        setSubjects(subjectsData);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFileUpload = async () => {
    try {
      if (!uploadedFile) {
        setFileUploadStatus("error");
        setError("Please select a file to upload.");
        return;
      }

      if (!selectedSubject || !selectedCourse || !selectedSemester) {
        setFileUploadStatus("error");
        setError("Please complete all required fields before uploading.");
        return;
      }

      setError(null);
      setFileUploadStatus("uploading");
      setQuestionPaperLoading(true);

      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("subject", selectedSubject.uuid);
      formData.append("course", selectedCourse.uuid);
      formData.append("semester", selectedSemester);
      formData.append("examName", examName);
      formData.append("combined", selectedCombineds.uuid);
      formData.append("stream", selectedCombineds?.stream || "");
      formData.append("degree", selectedCombineds?.degree || "");
      formData.append("year", selectedCombineds?.year || "");

      setFileUploadProgress(0);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/import/qp`,
        {
          method: "POST",
          body: formData,
        }
      );

      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress <= 90) {
          setFileUploadProgress(progress);
        }
      }, 300);

      if (!response.ok) {
        clearInterval(interval);
        throw new Error("File upload failed");
      }

      const result = await response.json();
      console.log("File uploaded successfully:", result);

      clearInterval(interval);
      setFileUploadProgress(100);
      setFileUploadStatus("success");
      setQuestionPaper(result?.data);
      setQuestionPaperLoading(false);

      setTimeout(() => {
        setStep(2);
        setFileUploadStatus("idle");
        setFileUploadProgress(0);
      }, 1000);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError(error.message || "Failed to upload question paper");
      setFileUploadStatus("error");
      setFileUploadProgress(0);
      setQuestionPaperLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (
        file.type !==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        setError("Please upload an Excel file (.xlsx)");
        return;
      }
      setUploadedFile(file);
      setFileUploadStatus("idle");
      setFileUploadProgress(0);
      setError(null);
      setQuestionPaper(null);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        "Question No": "Q1",
        "Question Type": "Main",
        "Question Format": "Subjective",
        "Question Text": "Answer and Written",
        Marks: "30",
        Optional: "",
        "Total Questions": "",
        Answer1: "",
        Answer2: "",
        Answer3: "",
        Answer4: "",
        "Correct Option": "",
        "Difficulty Level": "3",
        "Image Path": "",
        "Audio Path": "",
        "Video Path": "",
        Notes: "",
      },
      {
        "Question No": "Q1.a",
        "Question Type": "Sub",
        "Question Format": "Subjective",
        "Question Text": "Answer the following",
        Marks: "15",
        Optional: "3",
        "Total Questions": "4",
        Answer1: "",
        Answer2: "",
        Answer3: "",
        Answer4: "",
        "Correct Option": "",
        "Difficulty Level": "",
        "Image Path": "",
        "Audio Path": "",
        "Video Path": "",
        Notes: "",
      },
      {
        "Question No": "Q1.a1",
        "Question Type": "Actual",
        "Question Format": "Subjective",
        "Question Text": "Who is ShakeSpeare?",
        Marks: "5",
        Optional: "",
        "Total Questions": "",
        Answer1: "",
        Answer2: "",
        Answer3: "",
        Answer4: "",
        "Correct Option": "",
        "Difficulty Level": "",
        "Image Path": "",
        "Audio Path": "",
        "Video Path": "",
        Notes: "",
      },
      {
        "Question No": "Q1.a2",
        "Question Type": "Actual",
        "Question Format": "Subjective",
        "Question Text": "What are conjuctions?",
        Marks: "5",
        Optional: "",
        "Total Questions": "",
        Answer1: "",
        Answer2: "",
        Answer3: "",
        Answer4: "",
        "Correct Option": "",
        "Difficulty Level": "",
        "Image Path": "",
        "Audio Path": "",
        "Video Path": "",
        Notes: "",
      },
      {
        "Question No": "Q2",
        "Question Type": "Main",
        "Question Format": "Subjective",
        "Question Text": "Grammar",
        Marks: "40",
        Optional: "",
        "Total Questions": "",
        Answer1: "",
        Answer2: "",
        Answer3: "",
        Answer4: "",
        "Correct Option": "",
        "Difficulty Level": "1",
        "Image Path": "",
        "Audio Path": "",
        "Video Path": "",
        Notes: "",
      },
      {
        "Question No": "Q2.a",
        "Question Type": "Sub",
        "Question Format": "Subjective",
        "Question Text": "Answer the grammar",
        Marks: "40",
        Optional: "2",
        "Total Questions": "3",
        Answer1: "",
        Answer2: "",
        Answer3: "",
        Answer4: "",
        "Correct Option": "",
        "Difficulty Level": "",
        "Image Path": "",
        "Audio Path": "",
        "Video Path": "",
        Notes: "",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    worksheet["!cols"] = [
      { wch: 12 }, // Question No
      { wch: 12 }, // Question Type
      { wch: 15 }, // Question Format
      { wch: 25 }, // Question Text
      { wch: 8 }, // Marks
      { wch: 10 }, // Optional
      { wch: 12 }, // Total Questions
      { wch: 10 }, // Answer1
      { wch: 10 }, // Answer2
      { wch: 10 }, // Answer3
      { wch: 10 }, // Answer4
      { wch: 12 }, // Correct Option
      { wch: 15 }, // Difficulty Level
      { wch: 15 }, // Image Path
      { wch: 15 }, // Audio Path
      { wch: 15 }, // Video Path
      { wch: 20 }, // Notes
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Question Paper");
    XLSX.writeFile(workbook, "QuestionPaper_Template.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 w-full">
      <div className="w-full">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Import Question Paper
          </h1>
          <p className="text-gray-600 mb-6">
            Upload and configure question papers for your courses
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <div
              className={`flex items-center gap-3 py-2 px-4 sm:py-3 sm:px-6 rounded-lg font-medium w-full sm:w-auto ${
                step === 1
                  ? "bg-blue-50 border-2 border-blue-500 text-blue-700"
                  : step > 1
                  ? "bg-green-50 border-2 border-green-500 text-green-700"
                  : "bg-gray-50 border-2 border-gray-200 text-gray-400"
              }`}
            >
              <span
                className={`flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full text-white text-sm ${
                  step === 1
                    ? "bg-blue-500"
                    : step > 1
                    ? "bg-green-500"
                    : "bg-gray-200"
                }`}
              >
                {step > 1 ? "✓" : "1"}
              </span>
              <span className="text-sm sm:text-base">Select Subject</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 hidden sm:block" />
            <div
              className={`flex items-center gap-3 py-2 px-4 sm:py-3 sm:px-6 rounded-lg font-medium w-full sm:w-auto ${
                step === 2
                  ? "bg-blue-50 border-2 border-blue-500 text-blue-700"
                  : step > 2
                  ? "bg-green-50 border-2 border-green-500 text-green-700"
                  : "bg-gray-50 border-2 border-gray-200 text-gray-400"
              }`}
            >
              <span
                className={`flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full text-white text-sm ${
                  step === 2
                    ? "bg-blue-500"
                    : step > 2
                    ? "bg-green-500"
                    : "bg-gray-200"
                }`}
              >
                {step > 2 ? "✓" : "2"}
              </span>
              <span className="text-sm sm:text-base">Configure Paper</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 hidden sm:block" />
            <div
              className={`flex items-center gap-3 py-2 px-4 sm:py-3 sm:px-6 rounded-lg font-medium w-full sm:w-auto ${
                step === 3
                  ? "bg-blue-50 border-2 border-blue-500 text-blue-700"
                  : step > 3
                  ? "bg-green-50 border-2 border-green-500 text-green-700"
                  : "bg-gray-50 border-2 border-gray-200 text-gray-400"
              }`}
            >
              <span
                className={`flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full text-white text-sm ${
                  step === 3
                    ? "bg-blue-500"
                    : step > 3
                    ? "bg-green-500"
                    : "bg-gray-200"
                }`}
              >
                {step > 3 ? "✓" : "3"}
              </span>
              <span className="text-sm sm:text-base">Paper Check Settings</span>
            </div>
          </div>
        </header>

        <div className="space-y-8">
          {step === 1 && (
            <>
              <Card className="mb-8">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Paper Details
                  </h2>
                  <p className="text-sm text-gray-500">
                    Fill in the details about the question paper
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="flex flex-col gap-3">
                      <Label>Stream | Degree | Year</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full flex justify-between items-center"
                            disabled={isLoading}
                          >
                            <span className="truncate">
                              {selectedCombineds
                                ? selectedCombineds.name
                                : "Select Stream"}
                            </span>
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full min-w-[200px]">
                          <DropdownMenuGroup>
                            {isLoading ? (
                              <DropdownMenuItem disabled>
                                Loading...
                              </DropdownMenuItem>
                            ) : error ? (
                              <DropdownMenuItem disabled>
                                Error: {error}
                              </DropdownMenuItem>
                            ) : combineds.length > 0 ? (
                              combineds.map((combined) => (
                                <DropdownMenuItem
                                  key={combined.uuid}
                                  onClick={() => setSelectedCombineds(combined)}
                                  className="truncate"
                                >
                                  {combined.name}
                                </DropdownMenuItem>
                              ))
                            ) : (
                              <DropdownMenuItem disabled>
                                No streams available
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex flex-col gap-3 md:col-span-2">
                      <Label>Course</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full md:w-1/2 flex justify-between items-center"
                            disabled={isLoading || !selectedCombineds}
                          >
                            <span className="truncate">
                              {selectedCourse
                                ? selectedCourse.name
                                : "Select Course"}
                            </span>
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full min-w-[200px]">
                          <DropdownMenuGroup>
                            {isLoading ? (
                              <DropdownMenuItem disabled>
                                Loading...
                              </DropdownMenuItem>
                            ) : error ? (
                              <DropdownMenuItem disabled>
                                Error: {error}
                              </DropdownMenuItem>
                            ) : courses.length > 0 ? (
                              courses
                                .filter(
                                  (course) =>
                                    !selectedCombineds ||
                                    course.name === selectedCombineds.course
                                )
                                .map((course) => (
                                  <DropdownMenuItem
                                    key={course.uuid}
                                    onClick={() => {
                                      setSelectedCourse(course);
                                      setSelectedSemester("");
                                      setSelectedSubject("");
                                    }}
                                    className="truncate"
                                  >
                                    {course.name}
                                  </DropdownMenuItem>
                                ))
                            ) : (
                              <DropdownMenuItem disabled>
                                No courses available
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Label>Semester/Trimester</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full flex justify-between items-center"
                            disabled={isLoading || !selectedCourse}
                          >
                            <span className="truncate">
                              {selectedSemester || "Select Semester"}
                            </span>
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full min-w-[200px]">
                          <DropdownMenuGroup>
                            {isLoading ? (
                              <DropdownMenuItem disabled>
                                Loading...
                              </DropdownMenuItem>
                            ) : error ? (
                              <DropdownMenuItem disabled>
                                Error: {error}
                              </DropdownMenuItem>
                            ) : selectedCourse ? (
                              Array.from(
                                { length: selectedCourse.semester },
                                (_, i) => i + 1
                              ).map((semesterNum) => (
                                <DropdownMenuItem
                                  key={semesterNum}
                                  onClick={() => {
                                    setSelectedSemester(
                                      `Semester ${semesterNum}`
                                    );
                                    setSelectedSubject("");
                                  }}
                                >
                                  Semester {semesterNum}
                                </DropdownMenuItem>
                              ))
                            ) : (
                              <DropdownMenuItem disabled>
                                Please select a course first
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Label>
                        Subject <span className="text-red-500">*</span>
                      </Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full flex justify-between items-center"
                            disabled={
                              isLoading || !selectedCourse || !selectedSemester
                            }
                          >
                            <span className="truncate">
                              {selectedSubject
                                ? selectedSubject.name
                                : "Select Subject"}
                            </span>
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full min-w-[200px]">
                          <DropdownMenuGroup>
                            {isLoading ? (
                              <DropdownMenuItem disabled>
                                Loading...
                              </DropdownMenuItem>
                            ) : error ? (
                              <DropdownMenuItem disabled>
                                Error: {error}
                              </DropdownMenuItem>
                            ) : selectedCourse && selectedSemester ? (
                              subjects
                                .filter(
                                  (subject) =>
                                    subject.course === selectedCourse.uuid
                                )
                                .map((subject) => (
                                  <DropdownMenuItem
                                    key={subject.uuid}
                                    onClick={() => setSelectedSubject(subject)}
                                    className="truncate"
                                  >
                                    {subject.name}
                                  </DropdownMenuItem>
                                ))
                            ) : (
                              <DropdownMenuItem disabled>
                                {!selectedCourse
                                  ? "Select course first"
                                  : "Select semester first"}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Label>Exam Name</Label>
                      <Input
                        type="text"
                        placeholder="e.g. Mid-Term Exam 2023"
                        value={examName}
                        onChange={(e) => setExamName(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Download Template
                  </h2>
                  <p className="text-sm text-gray-500">
                    Download the Excel template file to ensure correct format
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-4">
                      <FileText className="h-8 w-8 text-blue-500 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium text-blue-800 mb-1">
                          Excel Template Format
                        </h3>
                        <p className="text-sm text-blue-600 mb-4">
                          Download and use this template to ensure your question
                          paper follows the required format. The template
                          includes example questions and formatting guidelines.
                        </p>
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={downloadTemplate}
                        >
                          <FileText className="h-4 w-4" />
                          Download Template
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Upload Question Paper
                  </h2>
                  <p className="text-sm text-gray-500">
                    Select an Excel file (.xlsx) containing the question paper
                    following the template format
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <label
                      htmlFor="file-upload"
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        uploadedFile
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center gap-3">
                        <UploadCloud
                          className={`h-10 w-10 ${
                            uploadedFile ? "text-green-500" : "text-gray-400"
                          }`}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {uploadedFile ? (
                              <>
                                <span className="text-green-600">
                                  {uploadedFile.name}
                                </span>{" "}
                                selected
                              </>
                            ) : (
                              "Click to select or drag and drop your file"
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {uploadedFile
                              ? `${(uploadedFile.size / 1024).toFixed(2)} KB`
                              : "Excel files only (.xlsx)"}
                          </p>
                        </div>
                      </div>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".xlsx"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>

                    {fileUploadStatus === "uploading" && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Uploading...</span>
                          <span>{fileUploadProgress}%</span>
                        </div>
                        <Progress value={fileUploadProgress} className="h-2" />
                      </div>
                    )}

                    {fileUploadStatus === "success" && (
                      <div className="p-3 bg-green-50 text-green-700 rounded-md flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        <span>File uploaded successfully!</span>
                      </div>
                    )}

                    {(error || fileUploadStatus === "error") && (
                      <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                        {error}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t pt-4">
                  <Button
                    onClick={handleFileUpload}
                    className="gap-2"
                    disabled={
                      (!uploadedFile && fileUploadStatus !== "success") ||
                      !selectedSubject ||
                      fileUploadStatus === "uploading"
                    }
                  >
                    {fileUploadStatus === "uploading" ? (
                      "Uploading..."
                    ) : fileUploadStatus === "success" ? (
                      <>
                        <UploadCloud className="h-4 w-4" />
                        Upload Another
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-4 w-4" />
                        Upload Question Paper
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {selectedSubject && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-800 mb-2">
                    Selected Details
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-white">
                      Course: {selectedCourse?.name}
                    </Badge>
                    <Badge variant="outline" className="bg-white">
                      Semester: {selectedSemester}
                    </Badge>
                    <Badge variant="outline" className="bg-white">
                      Subject: {selectedSubject?.name}
                    </Badge>
                    {examName && (
                      <Badge variant="outline" className="bg-white">
                        Exam: {examName}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <Card className="mb-8">
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-800">
                  Configure Question Paper
                </h2>
                <p className="text-sm text-gray-500">
                  Review and configure the uploaded question paper
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-blue-500" />
                      <div>
                        <h3 className="font-medium">Uploaded File</h3>
                        <p className="text-sm text-gray-600">
                          {uploadedFile?.name}
                        </p>
                      </div>
                    </div>
                    {questionPaperLoading ? (
                      <Badge variant="secondary">Processing...</Badge>
                    ) : questionPaper ? (
                      <Badge variant="secondary">Processing Complete</Badge>
                    ) : (
                      <Badge variant="destructive">Error Loading Data</Badge>
                    )}
                  </div>

                  {questionPaperLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="space-y-4 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-gray-500">
                          Loading question paper details...
                        </p>
                      </div>
                    </div>
                  ) : questionPaper ? (
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-medium mb-2">
                          Question Paper Details
                        </h3>
                        <dl className="space-y-2">
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Exam Name:</dt>
                            <dd className="font-medium">
                              {questionPaper.name}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Course:</dt>
                            <dd className="font-medium">
                              {selectedCourse.name}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Subject:</dt>
                            <dd className="font-medium">
                              {selectedSubject.name}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Semester:</dt>
                            <dd className="font-medium">
                              {selectedCourse.semester}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Created:</dt>
                            <dd className="font-medium">
                              {new Date().toLocaleDateString()}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h3 className="font-medium mb-2">
                          Question Paper Structure
                        </h3>
                        <dl className="space-y-2">
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Status:</dt>
                            <dd className="font-medium">
                              <Badge
                                variant={
                                  questionPaper.isActive ? "success" : "danger"
                                }
                              >
                                {questionPaper.isActive ? "active" : "inactive"}
                              </Badge>
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Version:</dt>
                            <Badge variant="secondary">
                              <dd className="font-medium">
                                {questionPaper.version
                                  ? questionPaper.version
                                  : "1.0.0"}
                              </dd>
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-600">
                              Examiner Assigned:
                            </dt>
                            <dd className="font-medium">
                              <Badge
                                variant={
                                  questionPaper.examinerAssigned
                                    ? "success"
                                    : "secondary"
                                }
                              >
                                {questionPaper.examinerAssigned ? "Yes" : "No"}
                              </Badge>
                            </dd>
                          </div>
                          {questionPaper.examinerAssigned &&
                            questionPaper.examiner && (
                              <div className="flex justify-between">
                                <dt className="text-gray-600">Examiner:</dt>
                                <dd className="font-medium">
                                  {questionPaper.examiner}
                                </dd>
                              </div>
                            )}
                          <div className="flex justify-between">
                            <dt className="text-gray-600">
                              Total Main Questions:
                            </dt>
                            <dd className="font-medium">
                              <Badge variant="success">
                                {questionPaper.questionsCount}
                              </Badge>
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-600">
                              Total Sub-Questions:
                            </dt>
                            <dd className="font-medium">
                              <Badge variant="success">
                                {questionPaper.subQuestionsCount}
                              </Badge>
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Total Marks:</dt>
                            <dd className="font-medium">
                              <Badge variant="success">
                                {questionPaper.totalMarks}
                              </Badge>
                            </dd>
                          </div>
                        </dl>
                      </div>

                      {questionPaper.error && (
                        <div className="md:col-span-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <h3 className="font-medium mb-2 text-red-700">
                            Import Errors
                          </h3>
                          <p className="text-sm text-red-600">
                            {questionPaper.error}
                          </p>
                        </div>
                      )}

                      {questionPaper.sections &&
                        questionPaper.sections.length > 0 && (
                          <div className="md:col-span-2 p-4 border rounded-lg">
                            <h3 className="font-medium mb-4">
                              Question Paper Preview
                            </h3>
                            <div className="grid gap-4">
                              {questionPaper.sections.map((section, index) => (
                                <div
                                  key={index}
                                  className="p-4 bg-gray-50 rounded-lg"
                                >
                                  <h4 className="font-medium mb-2">
                                    Section {index + 1}
                                  </h4>
                                  <div className="space-y-1 text-sm">
                                    {section.questions.map(
                                      (question, qIndex) => (
                                        <div
                                          key={qIndex}
                                          className="flex justify-between items-center"
                                        >
                                          <span>
                                            Q{qIndex + 1}. {question.text}
                                          </span>
                                          <Badge>{question.marks} marks</Badge>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="text-center p-4 text-red-500">
                      Failed to load question paper details. Please try again.
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-4 border-t">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)}>Continue to Settings</Button>
              </CardFooter>
            </Card>
          )}

          {step === 3 && (
            <Card className="mb-8">
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-800">
                  Paper Check Settings
                </h2>
                <p className="text-sm text-gray-500">
                  Configure settings for paper checking
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-4">Checking Parameters</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Enable Auto-checking</Label>
                        <Input type="checkbox" className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Require Examiner Approval</Label>
                        <Input
                          type="checkbox"
                          className="w-5 h-5"
                          defaultChecked
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Marking Scheme Strictness</Label>
                        <Input
                          type="range"
                          min="1"
                          max="5"
                          defaultValue="3"
                          className="w-32"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-4 border-t">
                <Button variant="outline">Back</Button>
                <Button
                  onClick={() => router.push("/admin/qp/question-paper/master")}
                >
                  Complete Import
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
