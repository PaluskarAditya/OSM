"use client";

import Link from "next/link";
import Cookies from "js-cookie";
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
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";

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
    return <FileText className="h-5 w-5" />;
  }
  if (type?.includes("excel") || type?.includes("spreadsheet")) {
    return <FileSpreadsheet className="h-5 w-5" />;
  }
  return <FileIconBase className="h-5 w-5" />;
};

const FileListItem = memo(({ file, index, removeFile, isUploading }) => {
  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
    >
      <div className="flex items-center gap-3">
        <FileIcon type={file.type} />
        <div className="flex flex-col">
          <p className="text-sm font-medium truncate max-w-[200px]">
            {file.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => removeFile(index)}
        className="h-7 w-7"
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
      className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors
        ${
          isDragActive
            ? "border-primary bg-muted"
            : "border-border hover:border-primary/50 bg-muted/50"
        }
        ${isUploading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      role="region"
      aria-live={isDragActive ? "polite" : "off"}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-3">
        <UploadCloudIcon
          className={`w-10 h-10 transition-colors ${
            isDragActive ? "text-primary" : "text-muted-foreground"
          }`}
        />
        <p className="text-sm font-medium">
          {isDragActive
            ? "Drop the files here..."
            : "Drag & drop files here, or click to select"}
        </p>
        <p className="text-xs text-muted-foreground">
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
  const router = useRouter();
  const token = Cookies.get('token');

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
        process.env.NEXT_PUBLIC_BACKEND_URL;
      const [combinedsRes, coursesRes, subjectsRes] = await Promise.all([
        fetch(`${backendUrl}/api/v1/combined`, {
          headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch(`${backendUrl}/api/v1/course`, {
          headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch(`${backendUrl}/api/v1/subject`, {
          headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }),
      ]);

      if (!combinedsRes.ok || !coursesRes.ok || !subjectsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const [combinedsData, coursesData, subjectsData] = await Promise.all([
        combinedsRes.json(),
        coursesRes.json(),
        subjectsRes.json(),
      ]);

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

  useEffect(() => {
    const auth_token = Cookies.get("token");

    if (!auth_token) {
      router.push("/");
      return;
    }
  }, []);

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
      formData.append("semester", selectedCourse.semester);

      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL;
      const res = await fetch(
        `${backendUrl}/api/v1/answer-sheet/multiple`,
        {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

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
      <DialogContent className="p-6 max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg font-semibold">
            <UploadCloudIcon className="w-5 h-5" />
            <span>{dialogTitle}</span>
          </DialogTitle>
          <DialogDescription className="mt-2">
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
            <label className="text-sm font-medium">Stream | Degree | Year</label>
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
            <label className="text-sm font-medium">Course</label>
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
            <label className="text-sm font-medium">Subject</label>
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
              className="border rounded-lg p-4 mt-4 max-h-60 overflow-y-auto"
            >
              <h4 className="text-sm font-semibold mb-3">
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
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={handleCloseDialog}
            disabled={isUploading}
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
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ActionCard = ({ title, description, icon: Icon, children }) => (
  <Card className="h-full">
    <CardHeader className="p-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-muted">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent className="flex flex-col gap-3 p-6 pt-0">
      {children}
    </CardContent>
  </Card>
);

const CardItem = ({ onClick, icon: Icon, title, description }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors duration-200 border hover:bg-muted/50"
  >
    <div className="flex items-center gap-4">
      <div className="p-2 rounded-md bg-muted">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
    <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <UploadDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        dialogType={dialogType}
      />

      <div className="container mx-auto max-w-6xl">
        <header className="p-6 mb-8 bg-card rounded-lg border">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Answer Sheets Management
          </h1>
          <p className="mt-2 text-muted-foreground">
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
              title="Bulk Upload (PDF)"
              description="Single PDF with all sheets"
            />
            <CardItem
              onClick={() => {
                setDialogType("Multiple PDF");
                setDialogOpen(true);
              }}
              icon={FileText}
              title="Multiple PDFs"
              description="Individual answer sheets"
            />
            <CardItem
              onClick={() => {
                setDialogType("Excel");
                setDialogOpen(true);
              }}
              icon={FileSpreadsheet}
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
                title="View Answer Sheets"
                description="Browse all uploaded sheets"
              />
            </Link>
            <CardItem
              onClick={() => {}}
              icon={Download}
              title="Download All"
              description="Get all sheets as ZIP"
            />
            <CardItem
              onClick={() => {}}
              icon={Send}
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
              title="Verify Answer Sheet"
              description="Validate student answers"
            />
            <CardItem
              onClick={() => {}}
              icon={CheckCircle}
              title="Verification Status"
              description="Check verification progress"
            />
            <CardItem
              onClick={() => {}}
              icon={Plus}
              title="Generate Booklet"
              description="Create answer booklets"
            />
          </ActionCard>
        </div>
      </div>
    </div>
  );
}
