"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  SheetIcon,
  UploadCloudIcon,
  FileText,
  FileSpreadsheet,
  File as FileIconBase,
  CheckCircle,
  Download,
  Eye,
  Send,
  Plus,
  XIcon,
  ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback, memo } from "react";
import { Progress } from "@/components/ui/progress";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// Utility Functions
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Child Components
const FileIcon = ({ type }) => {
  if (type?.includes("pdf")) {
    return <FileText className="h-5 w-5 text-red-500" />;
  }
  if (type?.includes("excel") || type?.includes("spreadsheet")) {
    return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
  }
  return <FileIconBase className="h-5 w-5 text-blue-500" />;
};

const FileListItem = memo(({ file, index, removeFile, isUploading }) => {
  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-3">
        <FileIcon type={file.type} />
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-800 truncate max-w-[200px]">
            {file.name}
          </p>
          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => removeFile(index)}
        className="h-7 w-7 text-gray-400 hover:bg-red-100 hover:text-red-500 transition-colors"
        disabled={isUploading}
        aria-label={`Remove ${file.name}`}
      >
        <XIcon className="w-4 h-4" />
      </Button>
    </motion.li>
  );
});

const Dropzone = ({
  getRootProps,
  getInputProps,
  isDragActive,
  isUploading,
  dialogType,
}) => {
  const fileTypeMessage =
    dialogType === "Excel" ? "Supports .xlsx, .xls" : "Supports .pdf";

  const multipleFilesMessage =
    dialogType !== "Bulk" ? " (multiple files allowed)" : " (single file only)";

  return (
    <div
      {...getRootProps()}
      className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors
        ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-gray-100"
        }
        ${isUploading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      role="region"
      aria-live={isDragActive ? "polite" : "off"}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-3">
        <UploadCloudIcon
          className={`w-12 h-12 text-gray-400 transition-colors ${
            isDragActive ? "text-blue-500" : ""
          }`}
        />
        <p className="text-sm font-medium text-gray-700">
          {isDragActive
            ? "Drop the files here..."
            : "Drag & drop files here, or click to select"}
        </p>
        <p className="text-xs text-gray-500">
          {fileTypeMessage}
          {multipleFilesMessage}
        </p>
      </div>
    </div>
  );
};

const UploadDialog = ({ open, onOpenChange, dialogType }) => {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [combineds, setCombineds] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedCombined, setSelectedCombined] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const intervalRef = useRef(null);

  const onDrop = useCallback(
    (acceptedFiles) => {
      setFiles((prev) => {
        const uniqueFiles = acceptedFiles.filter(
          (file) =>
            !prev.some((f) => f.name === file.name && f.size === file.size)
        );

        if (dialogType === "Bulk" && uniqueFiles.length > 1) {
          toast.error("Bulk upload allows only one file.");
          return prev;
        }

        const newFiles = [...prev, ...uniqueFiles].slice(
          0,
          dialogType === "Bulk" ? 1 : undefined
        );
        return newFiles;
      });
    },
    [dialogType]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: dialogType !== "Bulk",
    disabled: isUploading,
  });

  const removeFile = useCallback((indexToRemove) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  }, []);

  const handleCloseDialog = useCallback(() => {
    setFiles([]);
    setUploadProgress(0);
    setIsUploading(false);
    setSelectedCombined(null);
    setSelectedCourse(null);
    setSelectedSubject(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    onOpenChange(false);
  }, [onOpenChange]);

  const fetchData = useCallback(async () => {
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
      const [combinedsRes, coursesRes, subjectsRes] = await Promise.all([
        fetch(`${backendUrl}/api/v1/combineds`),
        fetch(`${backendUrl}/api/v1/courses`),
        fetch(`${backendUrl}/api/v1/subjects`),
      ]);

      if (!combinedsRes.ok || !coursesRes.ok || !subjectsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const [combinedsData, coursesData, subjectsData] = await Promise.all([
        combinedsRes.json(),
        coursesRes.json(),
        subjectsRes.json(),
      ]);

      // Handle both response structures (data property or direct array)
      setCombineds(combinedsData.data || combinedsData || []);
      setCourses(coursesData.data || coursesData || []);
      setSubjects(subjectsData.data || subjectsData || []);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      toast.error("Failed to fetch selection data");
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, fetchData]);

  const handleUpload = useCallback(async () => {
    if (files.length === 0) return;
    if (!selectedCombined || !selectedCourse || !selectedSubject) {
      toast.error("Please select Combined, Course, and Subject");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    const fileCount = files.length;

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("combined", selectedCombined.uuid || selectedCombined.id);
      formData.append("course", selectedCourse.uuid || selectedCourse.id);
      formData.append("subject", selectedSubject.uuid || selectedSubject.id);

      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
      const res = await fetch(
        `${backendUrl}/api/v1/answer-books/upload/multiple`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // Simulate progress for better UX
      intervalRef.current = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setTimeout(() => {
              setIsUploading(false);
              toast.success(
                data.message || `${fileCount} file(s) uploaded successfully`
              );
              handleCloseDialog();
            }, 500);
            return 100;
          }
          return prev + 10;
        });
      }, 300);
    } catch (error) {
      setIsUploading(false);
      toast.error(error.message || "Failed to upload files");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [
    files,
    selectedCombined,
    selectedCourse,
    selectedSubject,
    handleCloseDialog,
  ]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const dialogTitle =
    dialogType === "Bulk"
      ? "Upload Bulk PDF"
      : dialogType === "Multiple PDF"
      ? "Upload Multiple PDFs"
      : "Upload Excel Data";

  const dialogDescription =
    dialogType === "Bulk"
      ? "Upload a single PDF containing all answer sheets."
      : dialogType === "Multiple PDF"
      ? "Upload multiple individual PDF files for answer sheets."
      : "Upload an Excel file containing answer sheet data.";

  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[500px] p-6 rounded-2xl animate-in fade-in zoom-in-95">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-gray-800">
            <UploadCloudIcon className="w-6 h-6 text-blue-500" />
            <span>{dialogTitle}</span>
          </DialogTitle>
          <DialogDescription className="mt-2 text-gray-600">
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>

        <Dropzone
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          isDragActive={isDragActive}
          isUploading={isUploading}
          dialogType={dialogType}
        />

        <div className="grid grid-cols-1 gap-3 mt-4">
          {/* Combined Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Combined
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex justify-between items-center"
                  disabled={isUploading}
                >
                  <span className="truncate max-w-[180px]">
                    {selectedCombined
                      ? selectedCombined.name
                      : "Select Combined"}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-60 overflow-y-auto w-[var(--radix-dropdown-menu-trigger-width)]">
                <DropdownMenuGroup>
                  {combineds.length > 0 ? (
                    combineds.map((combined) => (
                      <DropdownMenuItem
                        key={combined.uuid || combined.id}
                        onSelect={() => {
                          setSelectedCombined(combined);
                          setSelectedCourse(null);
                          setSelectedSubject(null);
                        }}
                      >
                        {combined.name}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>
                      No combineds found
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Course Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Course</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex justify-between items-center"
                  disabled={!selectedCombined || isUploading}
                >
                  <span className="truncate max-w-[180px]">
                    {selectedCourse ? selectedCourse.name : "Select Course"}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-60 overflow-y-auto w-[var(--radix-dropdown-menu-trigger-width)]">
                <DropdownMenuGroup>
                  {selectedCombined &&
                  courses.filter(
                    (course) =>
                      course.combinedId === selectedCombined.uuid ||
                      course.combinedId === selectedCombined.id
                  ).length > 0 ? (
                    courses
                      .filter(
                        (course) =>
                          course.combinedId === selectedCombined.uuid ||
                          course.combinedId === selectedCombined.id
                      )
                      .map((course) => (
                        <DropdownMenuItem
                          key={course.uuid || course.id}
                          onSelect={() => {
                            setSelectedCourse(course);
                            setSelectedSubject(null);
                          }}
                        >
                          {course.name}
                        </DropdownMenuItem>
                      ))
                  ) : (
                    <DropdownMenuItem disabled>
                      {selectedCombined
                        ? "No courses found"
                        : "Select a combined first"}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Subject Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Subject</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex justify-between items-center"
                  disabled={!selectedCourse || isUploading}
                >
                  <span className="truncate max-w-[180px]">
                    {selectedSubject ? selectedSubject.name : "Select Subject"}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-60 overflow-y-auto w-[var(--radix-dropdown-menu-trigger-width)]">
                <DropdownMenuGroup>
                  {subjects
                    .filter(
                      (el) =>
                        el.isActive !== false &&
                        el.course === selectedCourse?.uuid
                    )
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
        </div>

        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border rounded-xl p-4 mt-4 max-h-60 overflow-y-auto"
            >
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Selected Files ({files.length}):
              </h4>
              <ul className="space-y-2">
                <AnimatePresence>
                  {files.map((file, index) => (
                    <FileListItem
                      key={`${file.name}-${file.size}-${index}`}
                      file={file}
                      index={index}
                      removeFile={removeFile}
                      isUploading={isUploading}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {isUploading && (
          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        <DialogFooter className="mt-4 sm:space-x-2">
          <Button
            variant="outline"
            onClick={handleCloseDialog}
            disabled={isUploading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={
              files.length === 0 ||
              isUploading ||
              !selectedCombined ||
              !selectedCourse ||
              !selectedSubject
            }
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ActionCard = ({ title, description, icon: Icon, children }) => (
  <Card className="h-full border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg rounded-2xl overflow-hidden">
    <CardHeader className="bg-gray-50 p-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-blue-100">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <CardTitle className="text-xl font-semibold text-gray-800">
            {title}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {description}
          </CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent className="flex flex-col gap-3 p-6">{children}</CardContent>
  </Card>
);

const CardItem = ({ onClick, icon: Icon, iconBg, title, description }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors duration-200 border border-gray-200 hover:bg-gray-50"
  >
    <div className="flex items-center gap-4">
      <div className={`p-2 rounded-full ${iconBg}`}>
        <Icon className="w-5 h-5 text-current" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
    </div>
    <ChevronRight className="h-5 w-5 text-gray-400" />
  </motion.div>
);

export default function AnswerSheetsPage() {
  const [dialogType, setDialogType] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDialogOpenChange = useCallback(
    (open) => {
      if (!open && isUploading) {
        toast.warning("Cannot close dialog while uploading.");
        return;
      }
      setDialogOpen(open);
    },
    [isUploading]
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <UploadDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        dialogType={dialogType}
      />

      <div className="container mx-auto max-w-7xl">
        <header className="rounded-2xl p-8 mb-8 bg-white shadow-lg border border-gray-200">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
            Answer Sheets Management
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Efficiently manage and process student answer sheets.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ActionCard
            title="Upload"
            description="Upload answer sheets in various formats."
            icon={UploadCloudIcon}
          >
            <CardItem
              onClick={() => {
                setDialogType("Bulk");
                setDialogOpen(true);
              }}
              icon={FileText}
              iconBg="bg-red-100 text-red-500"
              title="Bulk Upload (PDF)"
              description="Single PDF with all sheets"
            />
            <CardItem
              onClick={() => {
                setDialogType("Multiple PDF");
                setDialogOpen(true);
              }}
              icon={SheetIcon}
              iconBg="bg-blue-100 text-blue-500"
              title="Multiple PDFs"
              description="Individual answer sheets"
            />
            <CardItem
              onClick={() => {
                setDialogType("Excel");
                setDialogOpen(true);
              }}
              icon={FileSpreadsheet}
              iconBg="bg-green-100 text-green-500"
              title="Excel Data"
              description="Student data in spreadsheet"
            />
          </ActionCard>

          <ActionCard
            title="View & Download"
            description="Access and manage answer sheets."
            icon={Eye}
          >
            <Link href="/admin/answer-books/view-sheets">
              <CardItem
                onClick={() => {}}
                icon={Eye}
                iconBg="bg-blue-100 text-blue-500"
                title="View Answer Sheets"
                description="Browse all uploaded sheets"
              />
            </Link>
            <CardItem
              onClick={() => {}}
              icon={Download}
              iconBg="bg-green-100 text-green-500"
              title="Download All"
              description="Get all sheets as ZIP"
            />
            <CardItem
              onClick={() => {}}
              icon={Send}
              iconBg="bg-purple-100 text-purple-500"
              title="Send Photocopy"
              description="Email answer sheets"
            />
          </ActionCard>

          <ActionCard
            title="Verification"
            description="Validate and check answer sheets."
            icon={CheckCircle}
          >
            <CardItem
              onClick={() => {}}
              icon={CheckCircle}
              iconBg="bg-green-100 text-green-500"
              title="Verify Answer Sheet"
              description="Validate student answers"
            />
            <CardItem
              onClick={() => {}}
              icon={CheckCircle}
              iconBg="bg-blue-100 text-blue-500"
              title="Verification Status"
              description="Check verification progress"
            />
            <CardItem
              onClick={() => {}}
              icon={Plus}
              iconBg="bg-orange-100 text-orange-500"
              title="Generate Booklet"
              description="Create answer booklets"
            />
          </ActionCard>
        </div>
      </div>
    </div>
  );
}
