"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownGroup,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "@/components/ui/table";
import { useEffect } from "react";
import { toast } from "sonner";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function page() {
  const [degrees, setDegrees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [inwards, setInwards] = useState([]);

  const [selectedDegree, setSelectedDegree] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // 1. Main Booklet Pages
  // 2. Supplement Booklet Pages
  // 3. Length of Main Booklet Barcode
  // 4. Lenght of Supplement Barcode
  // 4. Exam Date

  const [mainBookletCount, setMainCount] = useState("");
  const [supplementBookletCount, setSupplementCount] = useState("");
  const [mainBookletBarcode, setMainBarcode] = useState("");
  const [supplementBookletBarcode, setSupplementBarcode] = useState("");
  const [examDate, setExamDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [degreeRes, courseRes, subjectRes, inwardRes] = await Promise.all(
          [
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degrees`),
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/courses`),
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subjects`),
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/inwards`),
          ]
        );

        const [degreeData, courseData, subjectData, inwardData] =
          await Promise.all([
            degreeRes.json(),
            courseRes.json(),
            subjectRes.json(),
            inwardRes.json(),
          ]);

        setDegrees(degreeData);
        setCourses(courseData);
        setSubjects(subjectData);
        setInwards(inwardData);
      } catch (error) {
        toast.error(error.message);
      }
    };

    fetchData();
  }, []);

  const generateUUID = () =>
    [...Array(6)]
      .map(() => Math.random().toString(36)[2].toUpperCase())
      .join("");

  const handleCreateInward = async () => {
    const inward = {
      mainCount: mainBookletCount,
      supplementCount: supplementBookletCount,
      mainBarcode: mainBookletBarcode,
      supplementBarcode: supplementBookletBarcode,
      examDate,
      degree: selectedDegree.uuid,
      course: selectedCourse.uuid,
      subject: selectedSubject.uuid,
      uuid: generateUUID(),
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/inwards`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(inward),
        }
      );

      if (res.ok) {
        setInwards([...inwards, inward]);
        toast.success("Inward created successfully");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getDegreeName = (id) => {
    const degree = degrees.find((el) => el.uuid === id);
    return degree?.name;
  };

  const getCourseName = (id) => {
    const course = courses.find((el) => el.uuid === id);
    return course?.name;
  };

  const getSubjectName = (id) => {
    const subject = subjects.find((el) => el.uuid === id);
    return subject?.name;
  };

  const resetState = () => {
    
  }

  return (
    <div className="bg-gray-100 p-6 w-full flex-col">
      <div className="bg-white flex flex-col rounded-lg shadow-xl shadow-gray-200">
        <div className="p-5 border-b border-gray-200">
          <h1 className="text-xl font-medium">Inward</h1>
        </div>
        <div className="grid grid-cols-4 border-b border-gray-200 gap-5 p-5">
          <div className="flex flex-col gap-1">
            <label className="text-sm">Exam Date</label>
            <Input
              value={examDate}
              type={"date"}
              placeholder="03/02/2025"
              onChange={(e) => setExamDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm">Degrees</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="w-full">
                <Button
                  className="flex cursor-pointer w-full justify-between font-normal items-center gap-2"
                  variant="outline"
                >
                  <span>
                    {selectedDegree ? selectedDegree.name : "Select Degree"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {degrees.length > 0 &&
                  degrees.map((el) => (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => setSelectedDegree(el)}
                      key={el.uuid}
                    >
                      {el.name}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {selectedDegree && (
            <div className="flex flex-col gap-1">
              <label className="text-sm">Courses</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="flex cursor-pointer justify-between font-normal items-center gap-2"
                    variant="outline"
                  >
                    <span>
                      {selectedCourse ? selectedCourse.name : "Select Course"}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {courses.length > 0 &&
                    courses
                      .filter((el) => selectedDegree.uuid === el.degree)
                      .map((el) => (
                        <DropdownMenuItem
                          className="cursor-pointer"
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
            <div className="flex flex-col gap-1">
              <label className="text-sm">Subjects</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="flex cursor-pointer justify-between font-normal items-center gap-2"
                    variant="outline"
                  >
                    <span>
                      {selectedSubject ? selectedSubject.name : "Select Course"}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {subjects.length > 0 &&
                    subjects
                      .filter((el) => selectedCourse.uuid === el.course)
                      .map((el) => (
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => setSelectedSubject(el)}
                          key={el.uuid}
                        >
                          {el.name}
                        </DropdownMenuItem>
                      ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-sm">
              <sup className="text-red-500">*&nbsp;</sup>No. of pages in Main
              Booklet
            </label>
            <Input
              type="number"
              value={mainBookletCount}
              onChange={(e) => setMainCount(e.target.value)}
              className=""
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm">
              <sup className="text-red-500">*&nbsp;</sup>No. of pages in
              Supplement
            </label>
            <Input
              type="number"
              value={supplementBookletCount}
              onChange={(e) => setSupplementCount(e.target.value)}
              className=""
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm">
              <sup className="text-red-500">*&nbsp;</sup>Length of Main Booklet
              Barcode No.
            </label>
            <Input
              type="text"
              value={mainBookletBarcode}
              onChange={(e) => setMainBarcode(e.target.value)}
              className=""
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm">
              <sup className="text-red-500">*&nbsp;</sup>Length of Supplement
              Barcode No.
            </label>
            <Input
              type="number"
              value={supplementBookletBarcode}
              onChange={(e) => setSupplementBarcode(e.target.value)}
              className=""
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm">
              <sup className="text-red-500">*&nbsp;</sup>Supplement Barcode
              Generation Logic
            </label>
            <Input
              placeholder="Add alphabet after main booklet barcode"
              disabled={true}
            />
          </div>
          <div className="flex gap-3 justify-center items-center">
            <Button
              className="cursor-pointer w-1/4"
              onClick={handleCreateInward}
            >
              Add
            </Button>
            <Button className="cursor-pointer w-1/4" variant="destructive">
              Clear
            </Button>
          </div>
        </div>
        <div className="p-5 gap-3 flex flex-col">
          <h1 className="text-sm">
            Total Inward Configuration Count: {inwards.length}
          </h1>
          {inwards.length > 1 ? (
            <div className="bg-gray-200 text-sm rounded-md p-3 text-center">
              No records found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border bg-gray-100">
                  <TableHead className="border-r">Sr no</TableHead>
                  <TableHead className="border-r">Degree</TableHead>
                  <TableHead className="border-r">Course</TableHead>
                  <TableHead className="border-r">Subject</TableHead>
                  <TableHead className="border-r">Main Booklet Pages</TableHead>
                  <TableHead className="border-r">Supplement Pages</TableHead>
                  <TableHead className="border-r">
                    Main Booklet <br /> Barcode Length
                  </TableHead>
                  <TableHead className="border-r">
                    Supplement <br /> Barcode Length
                  </TableHead>
                  <TableHead className="">Exam Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="border">
                {inwards.map((el, i) => (
                  <TableRow key={el.uuid} className="border">
                    <TableCell className="border-r">{i + 1}</TableCell>
                    <TableCell className="border-r">
                      {getDegreeName(el.degree)}
                    </TableCell>
                    <TableCell className="border-r">
                      {getCourseName(el.course)}
                    </TableCell>
                    <TableCell className="border-r">
                      {getSubjectName(el.subject)}
                    </TableCell>
                    <TableCell className="border-r">{el.mainCount}</TableCell>
                    <TableCell className="border-r">
                      {el.supplementCount}
                    </TableCell>
                    <TableCell className="border-r">{el.mainBarcode}</TableCell>
                    <TableCell className="border-r">
                      {el.supplementBarcode}
                    </TableCell>
                    <TableCell className="border-r">
                      {el.examDate}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
