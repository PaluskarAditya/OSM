"use client";

import React from "react";

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
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { toast } from "sonner";

export default function page() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [combineds, setCombineds] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedCombined, setSelectedCombined] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const [combinedRes, courseRes, subjectRes, answerRes, candidateRes] =
          await Promise.all([
            fetch(`${API_URL}/api/v1/combineds`),
            fetch(`${API_URL}/api/v1/courses`),
            fetch(`${API_URL}/api/v1/subjects`),
            fetch(`${API_URL}/api/v1/answer-sheets`),
            fetch(`${API_URL}/api/v1/candidates`),
          ]);

        const [
          combinedData,
          courseData,
          subjectData,
          answerData,
          candidateData,
        ] = await Promise.all([
          combinedRes.json(),
          courseRes.json(),
          subjectRes.json(),
          answerRes.json(),
          candidateRes.json(),
        ]);

        setCombineds(combinedData);
        setCourses(courseData);
        setSubjects(subjectData);
        setAnswers(answerData);
        setCandidates(candidateData);
      } catch (error) {
        toast.error(error.message);
      }
    };

    getData();
  }, []);

  const getCandidateName = (roll, prn) => {
    console.log("Data:", roll, prn);
    
    const candidate = candidates.find(
      (el) => el.RollNo === roll
    );

    if (candidate) {
      return `${candidate.FirstName} ${candidate.MiddleName} ${candidate.LastName}`;
    } else {
      return 'Not Mapped';
    }
  };

  return (
    <div className="bg-gray-100 w-full p-6 gap-6 flex flex-col">
      <div className="flex flex-col gap-1 bg-white p-6 shadow-lg shadow-black/5 rounded-lg">
        <h1 className="text-xl font-medium">View Answer Sheets</h1>
        <p className="text-sm text-gray-500">view and manage answer sheets</p>
      </div>
      <div className="p-6 bg-white rounded-lg shadow-lg shadow-black/5 flex flex-col gap-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1 w-full">
            <label>Search</label>
            <Input placeholder="enter search term" className="w-full" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label>Stream | Degree | Year</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center"
                  >
                    <span>
                      {selectedCombined
                        ? selectedCombined.name
                        : "Select Stream | Degree | Year"}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-60 overflow-y-auto w-[var(--radix-dropdown-menu-trigger-width)]">
                  <DropdownMenuGroup>
                    {combineds.map((el) => (
                      <DropdownMenuItem
                        onClick={() => setSelectedCombined(el)}
                        key={el.uuid}
                      >
                        {el.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {selectedCombined && (
              <div className="flex flex-col gap-2">
                <label>Course</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex justify-between items-center"
                    >
                      <span>
                        {selectedCourse ? selectedCourse.name : "Select Course"}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="max-h-60 overflow-y-auto w-[var(--radix-dropdown-menu-trigger-width)]">
                    <DropdownMenuGroup>
                      {courses
                        .filter((el) => el.name === selectedCombined.course)
                        .map((el) => (
                          <DropdownMenuItem
                            onClick={() => setSelectedCourse(el)}
                            key={el.uuid}
                          >
                            {el.name}
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            {selectedCourse && (
              <div className="flex flex-col gap-2">
                <label>Subject</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex justify-between items-center"
                    >
                      <span>
                        {selectedSubject
                          ? selectedSubject.name
                          : "Select Subject"}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="max-h-60 overflow-y-auto w-[var(--radix-dropdown-menu-trigger-width)]">
                    <DropdownMenuGroup>
                      {subjects
                        .filter((el) => el.course === selectedCourse.uuid)
                        .map((el) => (
                          <DropdownMenuItem
                            onClick={() => setSelectedSubject(el)}
                            key={el.uuid}
                          >
                            {el.name}
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>
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
            <TableBody>
              {answers.map((el, i) => (
                <TableRow key={el.uuid}>
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
                    {el.rollPRN.split(".")[0]}
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
          </Table>
        </div>
      </div>
    </div>
  );
}
