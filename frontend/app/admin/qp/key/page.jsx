"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoaderIcon, Upload, X, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Cookies from "js-cookie";

export default function Page() {
  // ---------- PDF upload states ----------
  const [qpFile, setQpFile] = useState(null);
  const [keyFile, setKeyFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [keyOpen, setKeyOpen] = useState(false);
  const [viewType, setViewType] = useState("");
  const [search, setSearch] = useState("");

  const [combined, setCombined] = useState([]);
  const [course, setCourse] = useState([]);
  const [semester, setSemester] = useState([]);
  const [subject, setSubject] = useState([]);
  const [qpKeys, setQpKeys] = useState([]);
  const [filtereQpKeys, setFilteredQpKeys] = useState([]);
  const [selectedQpKey, setSelectedQpKey] = useState(null);

  const [addDialogCombined, SetAddDialogCombined] = useState(null);
  const [addDialogCourse, SetAddDialogCourse] = useState(null);
  const [addDialogSemester, SetAddDialogSemester] = useState(null);
  const [addDialogSubject, SetAddDialogSubject] = useState(null);

  const [selectedCombined, setSelectedCombined] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const token = Cookies.get("token");

  const qpInputRef = useRef(null);
  const keyInputRef = useRef(null);

  useEffect(() => {
    document.title = "NEXA - Exams / Question Papers";

    const getData = async () => {
      setLoading(true);
      const [combinedRes, courseRes, subjectRes, qpKeyRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/combined`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/course`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subject`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/qp-key`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (
        (combinedRes.ok && combinedRes.status !== 302) ||
        (courseRes.ok && courseRes.status !== 302) ||
        (subjectRes.ok && subjectRes.status !== 302) ||
        (qpKeyRes.ok && qpKeyRes.status !== 302)
      ) {
        const [combinedData, courseData, subjectData, qpKeyData] =
          await Promise.all([
            combinedRes.json(),
            courseRes.json(),
            subjectRes.json(),
            qpKeyRes.json(),
          ]);

        setCombined(combinedData);
        setCourse(courseData);
        setSubject(subjectData);
        setQpKeys(qpKeyData.data);
      }
      setLoading(false);
    };

    getData();
  }, []);

  useEffect(() => {
    let data = qpKeys;

    if (selectedCombined) {
      data = qpKeys.filter((qp) => qp.combined === selectedCombined.uuid);
    }

    if (selectedCourse) {
      data = qpKeys.filter((qp) => qp.course === selectedCourse.uuid);
    }

    if (selectedSemester) {
      data = qpKeys.filter((qp) => qp.semester === String(selectedSemester));
    }

    if (selectedSubject) {
      data = qpKeys.filter((qp) => qp.subject === selectedSubject.uuid);
    }

    // if (search) {
    //   data = qpKeys.filter((qp) =>
    //     qp.qpPdfId.toLowerCase().includes(search?.toLowerCase())
    //   );
    // }

    setFilteredQpKeys(data);
  }, [
    selectedCombined,
    selectedCourse,
    selectedSemester,
    selectedSubject,
    search,
  ]);

  const handleQpChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setQpFile(file);
  };

  const handleKeyChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setKeyFile(file);
  };

  const clearQp = () => {
    setQpFile(null);
    if (qpInputRef.current) qpInputRef.current.value = "";
  };
  const clearKey = () => {
    setKeyFile(null);
    if (keyInputRef.current) keyInputRef.current.value = "";
  };

  const getCourseName = (id) => course.find((c) => c.uuid === id)?.name;
  const getSubjectName = (id) => subject.find((c) => c.uuid === id)?.name;

  // ---------- Drag & Drop ----------
  const preventDefault = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleQpKeyUpload = async () => {
    try {
      if (!qpFile || !keyFile)
        return toast.error("Both Question Paper and Key PDFs are required!");

      if (
        !addDialogCombined ||
        !addDialogCourse ||
        !addDialogSemester ||
        !addDialogSubject
      )
        return toast.error("All fields are required!");

      // ✅ Create composite key
      const newKey = `${addDialogCombined.uuid}-${addDialogCourse.uuid}-${addDialogSemester}-${addDialogSubject.uuid}`;

      // ✅ Check duplication
      const duplicate = qpKeys.some(
        (item) =>
          `${item.combined}-${item.course}-${item.semester}-${item.subject}` ===
          newKey
      );

      if (duplicate) {
        return toast.error(
          "Duplicate entry! QP/Key for this subject already exists."
        );
      }

      // ✅ If not duplicate, proceed
      const formData = new FormData();
      formData.append("qp", qpFile);
      formData.append("key", keyFile);
      formData.append("combined", addDialogCombined.uuid);
      formData.append("course", addDialogCourse.uuid);
      formData.append("semester", addDialogSemester);
      formData.append("subject", addDialogSubject.uuid);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/qp-key`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (res.ok) {
        const data = await res.json();
        setOpen(false);
        setQpKeys((prev) => [...prev, data.data]);
        toast.success("PDF / Key Uploaded Successfully!");
      } else {
        const errData = await res.text();
        toast.error(errData || "Upload failed.");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  function QpKeyTable({ data }) {
    return (
      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle>Question Paper Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>List of Uploaded QP & Key Files</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>UUID</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>PDF / Key</TableHead>
                <TableHead>Exam Title</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-6 text-sm text-gray-500"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <LoaderIcon className="h-4 w-4 animate-spin" />
                      <span>Loading data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-6 text-sm text-gray-500"
                  >
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                selectedSubject &&
                data?.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.uuid}</TableCell>
                    <TableCell>{getCourseName(item.course)}</TableCell>
                    <TableCell>Semester {item.semester}</TableCell>
                    <TableCell>{getSubjectName(item.subject)}</TableCell>
                    <TableCell>
                      <a
                        onClick={() => {
                          setKeyOpen(true);
                          setViewType("Pdf");
                          setSelectedQpKey(item);
                        }}
                        className="text-blue-500 hover:underline cursor-pointer"
                      >
                        View Pdf / Key
                      </a>
                    </TableCell>
                    <TableCell>{item.qpPdfId}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  const handleReset = () => {
    setSelectedCombined(null);
    setSelectedCourse(null);
    setSelectedSemester(null);
    setSelectedSubject(null);
  };

  return (
    <div className="p-6 bg-white flex flex-col gap-6">
      {/* QP PDF & Key view dialog */}
      <Dialog open={keyOpen} onOpenChange={setKeyOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>View {viewType}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="pdf" className="w-full h-full min-h-[70vh]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pdf">Question Paper</TabsTrigger>
              <TabsTrigger value="key">Answer Key</TabsTrigger>
            </TabsList>

            <TabsContent value="pdf" className="flex justify-center h-full">
              <iframe
                src={`${
                  process.env.NEXT_PUBLIC_BACKEND_URL
                }/api/v1/qp-key/view/qp/${selectedQpKey?.qpPdfPath
                  .split("/")
                  .pop()}`}
                title="Question Paper"
                className="w-full h-full border rounded-lg"
              />
            </TabsContent>

            <TabsContent value="key" className="flex justify-center">
              <iframe
                src={`${
                  process.env.NEXT_PUBLIC_BACKEND_URL
                }/api/v1/qp-key/view/qp/${selectedQpKey?.qpKeyPath
                  .split("/")
                  .pop()}`}
                title="Answer Key"
                className="w-full h-full border rounded-lg"
              />
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <DialogClose asChild>
              <Button className="cursor-pointer">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col">
        <div className="flex justify-start items-center gap-2">
          <SidebarTrigger className="cursor-pointer" />
          <h1 className="text-sm font-medium text-gray-800">QP / Key</h1>
        </div>
        <p className="text-sm text-gray-500">
          Upload PDF and Key for created Question Papers
        </p>
      </div>

      {/* Search + Upload button */}
      <div className="flex justify-between items-center">
        <div>
          <Input
            value={search}
            onChange={(value) => setSearch(value)}
            placeholder="Search"
          />
        </div>

        <div className="flex justify-between items-center gap-2">
          {(selectedCombined !== null ||
            selectedCourse !== null ||
            selectedSemester !== null ||
            selectedSubject !== null) && (
            <Button
              className="cursor-pointer flex justify-center items-center"
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              Clear Filters <XIcon className="h-3 w-3" />
            </Button>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="cursor-pointer">
                Upload
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>QP / Key</DialogTitle>
                <DialogDescription>Upload QP & Key</DialogDescription>
              </DialogHeader>

              <main className="flex flex-col gap-4">
                {/* Stream | Degree | Year */}
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 w-full">
                    <p className="text-sm font-medium">
                      Stream | Degree | Year
                    </p>
                    <Select
                      onValueChange={(value) => SetAddDialogCombined(value)}
                    >
                      <SelectTrigger className="w-full cursor-pointer">
                        <SelectValue placeholder="Select Stream" />
                      </SelectTrigger>
                      <SelectContent>
                        {loading === true ? (
                          <SelectItem className="flex justify-center items-center">
                            Loading{" "}
                            <LoaderIcon className="h-3 w-3 animate-spin" />
                          </SelectItem>
                        ) : combined.length < 1 ? (
                          <SelectItem>
                            No Stream | Degree | Year available
                          </SelectItem>
                        ) : (
                          combined
                            .filter((c) => c.isActive === true)
                            .map((c) => (
                              <SelectItem key={c.uuid} value={c}>
                                {c.name}
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Course */}
                  <div className="flex flex-col gap-1 w-full">
                    <p className="text-sm font-medium">Course</p>
                    <Select
                      onValueChange={(value) => SetAddDialogCourse(value)}
                    >
                      <SelectTrigger className="w-full cursor-pointer">
                        <SelectValue placeholder="Select Course" />
                      </SelectTrigger>
                      <SelectContent>
                        {loading === true ? (
                          <SelectItem className="flex justify-center items-center">
                            Loading{" "}
                            <LoaderIcon className="h-3 w-3 animate-spin" />
                          </SelectItem>
                        ) : course.length < 1 ? (
                          <SelectItem>No Courses available</SelectItem>
                        ) : (
                          course
                            .filter(
                              (c) =>
                                c.isActive === true &&
                                addDialogCombined &&
                                addDialogCombined.course.includes(c.uuid)
                            )
                            .map((c) => (
                              <SelectItem key={c.uuid} value={c}>
                                {c.name}
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Semester */}
                  <div className="flex flex-col gap-1 w-full">
                    <p className="text-sm font-medium">Semester</p>
                    <Select
                      onValueChange={(value) => SetAddDialogSemester(value)}
                    >
                      <SelectTrigger className="w-full cursor-pointer">
                        <SelectValue placeholder="Select Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {loading === true ? (
                          <SelectItem className="flex justify-center items-center">
                            Loading{" "}
                            <LoaderIcon className="h-3 w-3 animate-spin" />
                          </SelectItem>
                        ) : course.length < 1 ? (
                          <SelectItem>No Semester's available</SelectItem>
                        ) : (
                          course
                            .filter((c) => c.isActive === true)
                            .flatMap((c) =>
                              Array.from(
                                { length: parseInt(c.semCount) },
                                (_, i) => (
                                  <SelectItem
                                    key={`${c.uuid}-${i + 1}`}
                                    value={i + 1}
                                  >
                                    {`Semester ${i + 1}`}
                                  </SelectItem>
                                )
                              )
                            )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Subject */}
                  <div className="flex flex-col gap-1 w-full">
                    <p className="text-sm font-medium">Subject</p>
                    <Select
                      onValueChange={(value) => SetAddDialogSubject(value)}
                    >
                      <SelectTrigger className="w-full cursor-pointer">
                        <SelectValue placeholder="Select Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {loading === true ? (
                          <SelectItem className="flex justify-center items-center">
                            Loading{" "}
                            <LoaderIcon className="h-3 w-3 animate-spin" />
                          </SelectItem>
                        ) : subject.length < 1 ? (
                          <SelectItem>No Subjects available</SelectItem>
                        ) : (
                          subject
                            .filter(
                              (c) =>
                                c.isActive === true &&
                                addDialogSemester &&
                                String(addDialogSemester) === c.semester
                            )
                            .map((c) => (
                              <SelectItem key={c.uuid} value={c}>
                                {c.name}
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* ---------- PDF Uploads ---------- */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Question Paper PDF */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                      Question Paper PDF
                    </label>

                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-gray-400 transition-colors"
                      onClick={() => qpInputRef.current?.click()}
                      onDragOver={preventDefault}
                      onDrop={(e) => {
                        preventDefault(e);
                        const file = e.dataTransfer.files[0];
                        if (file?.type === "application/pdf") {
                          setQpFile(file);
                          if (qpInputRef.current)
                            qpInputRef.current.files = e.dataTransfer.files;
                        }
                      }}
                    >
                      {qpFile ? (
                        <div className="flex items-center gap-2 w-full justify-between">
                          <span className="truncate text-sm">
                            {qpFile.name}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearQp();
                            }}
                            className="text-red-600 cursor-pointer hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-gray-400" />
                          <p className="text-xs text-gray-500">
                            Drag & drop or click to select PDF
                          </p>
                        </>
                      )}
                    </div>

                    <input
                      ref={qpInputRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleQpChange}
                    />
                  </div>

                  {/* Question Paper Key */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                      Question Paper Key
                    </label>

                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-gray-400 transition-colors"
                      onClick={() => keyInputRef.current?.click()}
                      onDragOver={preventDefault}
                      onDrop={(e) => {
                        preventDefault(e);
                        const file = e.dataTransfer.files[0];
                        if (file?.type === "application/pdf") {
                          setKeyFile(file);
                          if (keyInputRef.current)
                            keyInputRef.current.files = e.dataTransfer.files;
                        }
                      }}
                    >
                      {keyFile ? (
                        <div className="flex items-center gap-2 w-full justify-between">
                          <span className="truncate text-sm">
                            {keyFile.name}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearKey();
                            }}
                            className="text-red-600 cursor-pointer hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-gray-400" />
                          <p className="text-xs text-gray-500">
                            Drag & drop or click to select PDF
                          </p>
                        </>
                      )}
                    </div>

                    <input
                      ref={keyInputRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleKeyChange}
                    />
                  </div>
                </div>
              </main>

              <DialogFooter>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="cursor-pointer"
                >
                  <DialogClose>Close</DialogClose>
                </Button>
                <Button
                  onClick={handleQpKeyUpload}
                  size="sm"
                  disabled={loading === true}
                  className="cursor-pointer"
                >
                  {loading === true ? (
                    <span>
                      Uploading <LoaderIcon className="h-3 w-3 animate-spin" />
                    </span>
                  ) : (
                    "Upload"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters (unchanged) */}
      <div className="grid lg:grid-cols-4 gap-4">
        {/* ... same as your original code ... */}
        <div className="flex flex-col gap-1 w-full">
          <p className="text-sm font-medium">Stream | Degree | Year</p>
          <Select
            onValueChange={(value) => setSelectedCombined(value)}
            value={selectedCombined || ""}
          >
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue placeholder="Select Stream | Degree | Year" />
            </SelectTrigger>
            <SelectContent>
              {loading === true ? (
                <SelectItem className="flex justify-center items-center">
                  Loading <LoaderIcon className="h-3 w-3 animate-spin" />
                </SelectItem>
              ) : combined.length < 1 ? (
                <SelectItem>No Stream | Degree | Year available</SelectItem>
              ) : (
                combined
                  .filter((c) => c.isActive === true)
                  .map((c) => (
                    <SelectItem key={c.uuid} value={c}>
                      {c.name}
                    </SelectItem>
                  ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1 w-full">
          <p className="text-sm font-medium">Course</p>
          <Select
            onValueChange={(value) => setSelectedCourse(value)}
            value={selectedCourse || ""}
            disabled={selectedCombined === null}
          >
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent>
              {loading === true ? (
                <SelectItem className="flex justify-center items-center">
                  Loading <LoaderIcon className="h-3 w-3 animate-spin" />
                </SelectItem>
              ) : course.length < 1 ? (
                <SelectItem>No Courses available</SelectItem>
              ) : (
                course
                  .filter(
                    (c) =>
                      c.isActive === true &&
                      selectedCombined &&
                      selectedCombined.course.includes(c.uuid)
                  )
                  .map((c) => (
                    <SelectItem key={c.uuid} value={c}>
                      {c.name}
                    </SelectItem>
                  ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1 w-full">
          <p className="text-sm font-medium">Semester</p>
          <Select
            onValueChange={(value) => setSelectedSemester(value)}
            value={selectedSemester || ""}
            disabled={selectedCourse === null}
          >
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue placeholder="Select Semester" />
            </SelectTrigger>
            <SelectContent>
              {loading === true ? (
                <SelectItem className="flex justify-center items-center">
                  Loading <LoaderIcon className="h-3 w-3 animate-spin" />
                </SelectItem>
              ) : course.length < 1 ? (
                <SelectItem>No Semester's available</SelectItem>
              ) : (
                course
                  .filter((c) => c.isActive === true)
                  .flatMap((c) =>
                    Array.from({ length: parseInt(c.semCount) }, (_, i) => (
                      <SelectItem
                        className="cursor-pointer"
                        key={`${c.uuid}-${i + 1}`}
                        value={i + 1}
                      >
                        {`Semester ${i + 1}`}
                      </SelectItem>
                    ))
                  )
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1 w-full">
          <p className="text-sm font-medium">Subject</p>
          <Select
            onValueChange={(value) => setSelectedSubject(value)}
            value={selectedSubject || ""}
            disabled={!selectedSemester}
          >
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              {loading === true ? (
                <SelectItem className="flex justify-center items-center">
                  Loading <LoaderIcon className="h-3 w-3 animate-spin" />
                </SelectItem>
              ) : subject.length < 1 ? (
                <SelectItem>No Subjects available</SelectItem>
              ) : (
                subject
                  .filter(
                    (c) =>
                      c.isActive === true &&
                      selectedSemester &&
                      String(selectedSemester) === c.semester
                  )
                  .map((c) => (
                    <SelectItem key={c.uuid} value={c}>
                      {c.name}
                    </SelectItem>
                  ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* QP / Key Data */}
      <QpKeyTable data={filtereQpKeys} />
    </div>
  );
}
