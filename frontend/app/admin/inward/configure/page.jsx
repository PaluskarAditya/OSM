"use client";

import React from "react";
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
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "@/components/ui/table";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectItem
} from '@/components/ui/select'
import { useEffect } from "react";
import { toast } from "sonner";
import { useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import Cookies from "js-cookie";

export default function InwardPage() {
  const [degrees, setDegrees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [inwards, setInwards] = useState([]);
  const [users, setUsers] = useState([]);

  const [selectedDegree, setSelectedDegree] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [mainBookletCount, setMainCount] = useState("");
  const [supplementBookletCount, setSupplementCount] = useState("");
  const [mainBookletBarcode, setMainBarcode] = useState("");
  const [supplementBookletBarcode, setSupplementBarcode] = useState("");
  const [examDate, setExamDate] = useState("");
  const token = Cookies.get("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [degreeRes, courseRes, subjectRes, inwardRes, userRes] =
          await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degree`, {
              headers: {
                "content-type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }),
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/course`, {
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
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/inward`, {
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

        const [degreeData, courseData, subjectData, inwardData, userData] =
          await Promise.all([
            degreeRes.json(),
            courseRes.json(),
            subjectRes.json(),
            inwardRes.json(),
            userRes.json()
          ]);

        setDegrees(degreeData);
        setCourses(courseData);
        setSubjects(subjectData);
        setInwards(inwardData);

        const examiners = userData.filter(
          (el) => el.Role === "Examiner" || el.Role === "Moderator"
        );
        setUsers(examiners);
      } catch (error) {
        toast.error(error.message);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    if (selectedUser) console.log(selectedUser)
  }, [selectedUser])

  const generateUUID = () =>
    [...Array(6)]
      .map(() => Math.random().toString(36)[2].toUpperCase())
      .join("");

  const handleCreateInward = async () => {
    if (!selectedDegree || !selectedCourse || !selectedSubject || !examDate) {
      toast.error("Please fill all required fields");
      return;
    }

    const inward = {
      mainCount: mainBookletCount,
      supplementCount: supplementBookletCount,
      mainBarcode: mainBookletBarcode,
      supplementBarcode: supplementBookletBarcode,
      examDate,
      degree: selectedDegree.uuid,
      course: selectedCourse.uuid,
      subject: selectedSubject.uuid,
      examiner: selectedUser._id,
      uuid: generateUUID(),
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/inward`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(inward),
        }
      );

      if (res.ok) {
        setInwards([...inwards, inward]);
        resetState();
        toast.success("Inward created successfully");
      } else {
        toast.error("Failed to create inward");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const resetState = () => {
    setSelectedDegree(null);
    setSelectedCourse(null);
    setSelectedSubject(null);
    setMainCount("");
    setSupplementCount("");
    setMainBarcode("");
    setSupplementBarcode("");
    setExamDate("");
  };

  const getDegreeName = (id) => {
    const degree = degrees.find((el) => el.uuid === id);
    return degree?.name || "N/A";
  };

  const getCourseName = (id) => {
    const course = courses.find((el) => el.uuid === id);
    return course?.name || "N/A";
  };

  const getSubjectName = (id) => {
    const subject = subjects.find((el) => el.uuid === id);
    return subject?.name || "N/A";
  };

  const truncateText = (text, maxLength = 20) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <div className="bg-white p-5 md:p-5 gap-4 w-full flex flex-col">
      <div className="bg-white flex gap-5 flex-col">
        <div className="flex flex-col">
          <h1 className="text-base md:text-lg font-medium">
            Inward Management
          </h1>
          <p className="text-xs md:text-sm text-gray-500">
            Create inwards to manage records
          </p>
        </div>

        {/* Form Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm">
              <span className="text-red-500">*&nbsp;</span>Exam Date
            </label>
            <Input
              value={examDate}
              type="date"
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm">
              <span className="text-red-500">*&nbsp;</span>Degrees
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="w-full">
                <Button
                  className="flex cursor-pointer w-full justify-between font-normal items-center gap-2 truncate"
                  variant="outline"
                >
                  <span className="truncate text-left">
                    {selectedDegree
                      ? truncateText(selectedDegree.name)
                      : "Select Degree"}
                  </span>
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto">
                {degrees.length > 0 ? (
                  degrees.map((el) => (
                    <DropdownMenuItem
                      className="cursor-pointer truncate"
                      onClick={() => setSelectedDegree(el)}
                      key={el.uuid}
                    >
                      {el.name}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No degrees found</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {selectedDegree && (
            <div className="flex flex-col gap-1">
              <label className="text-sm">
                <span className="text-red-500">*&nbsp;</span>Courses
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="flex cursor-pointer justify-between font-normal items-center gap-2 truncate w-full"
                    variant="outline"
                  >
                    <span className="truncate text-left">
                      {selectedCourse
                        ? truncateText(selectedCourse.name)
                        : "Select Course"}
                    </span>
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto">
                  {courses.filter((el) => selectedDegree.uuid === el.degree)
                    .length > 0 ? (
                    courses
                      .filter((el) => selectedDegree.uuid === el.degree)
                      .map((el) => (
                        <DropdownMenuItem
                          className="cursor-pointer truncate"
                          onClick={() => setSelectedCourse(el)}
                          key={el.uuid}
                        >
                          {el.name}
                        </DropdownMenuItem>
                      ))
                  ) : (
                    <DropdownMenuItem disabled>
                      No courses found
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {selectedCourse && (
            <div className="flex flex-col gap-1">
              <label className="text-sm">
                <span className="text-red-500">*&nbsp;</span>Subjects
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="flex cursor-pointer justify-between font-normal items-center gap-2 truncate w-full"
                    variant="outline"
                  >
                    <span className="truncate text-left">
                      {selectedSubject
                        ? truncateText(selectedSubject.name)
                        : "Select Subject"}
                    </span>
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto">
                  {subjects.filter((el) => selectedCourse.uuid === el.course)
                    .length > 0 ? (
                    subjects
                      .filter((el) => selectedCourse.uuid === el.course)
                      .map((el) => (
                        <DropdownMenuItem
                          className="cursor-pointer truncate"
                          onClick={() => setSelectedSubject(el)}
                          key={el.uuid}
                        >
                          {el.name}
                        </DropdownMenuItem>
                      ))
                  ) : (
                    <DropdownMenuItem disabled>
                      No subjects found
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm">
              <span className="text-red-500">*&nbsp;</span>No. of pages in Main
              Booklet
            </label>
            <Input
              type="number"
              min="0"
              value={mainBookletCount}
              onChange={(e) => setMainCount(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm">
              <span className="text-red-500">*&nbsp;</span>No. of pages in
              Supplement
            </label>
            <Input
              type="number"
              min="0"
              value={supplementBookletCount}
              onChange={(e) => setSupplementCount(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm">
              <span className="text-red-500">*&nbsp;</span>Length of Main
              Booklet Barcode No.
            </label>
            <Input
              type="text"
              value={mainBookletBarcode}
              onChange={(e) => setMainBarcode(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm">
              <span className="text-red-500">*&nbsp;</span>Length of Supplement
              Barcode No.
            </label>
            <Input
              type="number"
              min="0"
              value={supplementBookletBarcode}
              onChange={(e) => setSupplementBarcode(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm">
              Supplement Barcode Generation Logic
            </label>
            <Input
              placeholder="Add alphabet after main booklet barcode"
              disabled={true}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <lable>Assign Examiner</lable>
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
                      <SelectItem className="w-full" value={el} key={el}>
                        {el.FirstName + " " + el.LastName}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 items-center justify-start col-span-1 md:col-span-2 lg:col-span-4 mt-2">
            <Button
              className="cursor-pointer min-w-[100px]"
              onClick={handleCreateInward}
            >
              Add
            </Button>
            <Button
              className="cursor-pointer min-w-[100px]"
              variant="outline"
              onClick={resetState}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>

        {/* Table Section */}
        <div className="gap-3 flex flex-col mt-6">
          <h1 className="text-sm md:text-base">
            Total Inward Configuration Count: {inwards.length}
          </h1>

          {inwards.length === 0 ? (
            <div className="bg-gray-100 text-sm rounded-md p-4 text-center">
              No records found
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-md">
              <Table className="min-w-[800px] lg:min-w-full">
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="border-r p-2 text-xs md:text-sm">
                      Sr no
                    </TableHead>
                    <TableHead className="border-r p-2 text-xs md:text-sm">
                      Degree
                    </TableHead>
                    <TableHead className="border-r p-2 text-xs md:text-sm">
                      Course
                    </TableHead>
                    <TableHead className="border-r p-2 text-xs md:text-sm">
                      Subject
                    </TableHead>
                    <TableHead className="border-r p-2 text-xs md:text-sm">
                      Main Booklet Pages
                    </TableHead>
                    <TableHead className="border-r p-2 text-xs md:text-sm">
                      Supplement Pages
                    </TableHead>
                    <TableHead className="border-r p-2 text-xs md:text-sm">
                      Main Booklet Barcode Length
                    </TableHead>
                    <TableHead className="border-r p-2 text-xs md:text-sm">
                      Supplement Barcode Length
                    </TableHead>
                    <TableHead className="p-2 text-xs md:text-sm">
                      Exam Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inwards.map((el, i) => (
                    <TableRow key={el.uuid} className="border-b">
                      <TableCell className="border-r p-2 text-xs md:text-sm">
                        {i + 1}
                      </TableCell>
                      <TableCell
                        className="border-r p-2 text-xs md:text-sm truncate max-w-[120px]"
                        title={getDegreeName(el.degree)}
                      >
                        {truncateText(getDegreeName(el.degree))}
                      </TableCell>
                      <TableCell
                        className="border-r p-2 text-xs md:text-sm truncate max-w-[120px]"
                        title={getCourseName(el.course)}
                      >
                        {truncateText(getCourseName(el.course))}
                      </TableCell>
                      <TableCell
                        className="border-r p-2 text-xs md:text-sm truncate max-w-[120px]"
                        title={getSubjectName(el.subject)}
                      >
                        {truncateText(getSubjectName(el.subject))}
                      </TableCell>
                      <TableCell className="border-r p-2 text-xs md:text-sm">
                        {el.mainCount}
                      </TableCell>
                      <TableCell className="border-r p-2 text-xs md:text-sm">
                        {el.supplementCount}
                      </TableCell>
                      <TableCell className="border-r p-2 text-xs md:text-sm">
                        {el.mainBarcode}
                      </TableCell>
                      <TableCell className="border-r p-2 text-xs md:text-sm">
                        {el.supplementBarcode}
                      </TableCell>
                      <TableCell className="p-2 text-xs md:text-sm">
                        {el.examDate}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
