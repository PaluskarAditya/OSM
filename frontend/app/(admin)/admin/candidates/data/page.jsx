"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  CirclePlusIcon,
  FileDown,
  UploadCloudIcon,
  DownloadIcon,
  Info as InfoIcon,
  Users2 as UsersIcon,
  Filter,
  X,
  Search,
  FileSpreadsheet,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";

// Constants
const STATUS_FILTERS = {
  ALL: "all",
  ACTIVE: "active",
  INACTIVE: "inactive",
};

// Utility Functions
const normalizeCandidate = (raw) => ({
  candidateId: raw.candidateId || raw.CandidateId || raw.PRNNumber || "",
  rollNumber: raw.rollNumber || raw.RollNo || "",
  prnNumber: raw.prnNumber || raw.PRNNumber || "",
  name:
    raw.name ||
    [raw.FirstName, raw.MiddleName, raw.LastName].filter(Boolean).join(" ") ||
    "",
  emailId: raw.emailId || raw.Email || "",
  gender: raw.gender || raw.Gender || "",
  course: raw.course || raw.Course || "",
  combinedUuid: raw.combinedUuid || raw.CombinedUuid || "",
  mobileNo: raw.mobileNo || raw.MobileNo || "",
  isPHCandidate: raw.isPHCandidate ?? raw.IsPHCandidate ?? false,
  isActive: raw.isActive ?? raw.IsActive ?? true,
  campusName: raw.campusName || raw.CampusName || "",
  subjects: raw.subjects || raw.Subjects || {},
  srNo: raw.srNo || raw.SrNo || "",
  bookletName: raw.BookletName || raw.bookletName || raw.RollNo || "",
  sheetUploaded: raw.sheetUploaded,
});

const StatusBadge = React.memo(({ active }) => (
  <Badge
    variant={active ? "success" : "destructive"}
    className="text-xs px-2 py-1 rounded-full capitalize"
  >
    {active ? "Active" : "Inactive"}
  </Badge>
));

// Dialog Components
const ImportCandidatesDialog = React.memo(
  ({
    open,
    onOpenChange,
    file,
    setFile,
    fileInputRef,
    combineds,
    courses,
    combinedUuid,
    course,
    handleCombinedChange,
    handleCourseChange,
    handleImportExcel,
    selectedCombined,
    loading,
  }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UploadCloudIcon className="h-5 w-5" />
            Import Candidates
          </DialogTitle>
          <DialogDescription>
            Upload an Excel file to import candidate data. Ensure the file
            matches the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Combined</Label>
            <Select onValueChange={handleCombinedChange} value={combinedUuid}>
              <SelectTrigger>
                <SelectValue placeholder="Select combined..." />
              </SelectTrigger>
              <SelectContent>
                {combineds.map((item) => (
                  <SelectItem key={item.uuid} value={item.uuid}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Course</Label>
            <Select
              onValueChange={handleCourseChange}
              value={course}
              disabled={!combinedUuid}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select course..." />
              </SelectTrigger>
              <SelectContent>
                {courses
                  .filter((item) => selectedCombined?.course === item.name)
                  .map((item) => (
                    <SelectItem key={item.uuid} value={item.name}>
                      {item.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Excel File</Label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex flex-col items-center justify-center border-2 border-dashed rounded-lg py-8 text-center cursor-pointer transition-colors min-h-[140px]",
              file
                ? "border-blue-200 bg-blue-50/50"
                : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/30"
            )}
          >
            {file ? (
              <>
                <FileSpreadsheet className="h-10 w-10 text-blue-500 mb-3" />
                <p className="text-sm font-medium text-gray-700">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </>
            ) : (
              <>
                <UploadCloudIcon className="h-10 w-10 text-gray-400 mb-3" />
                <p className="text-sm font-medium text-gray-700">
                  Click or drag file to upload
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Excel files only (.xlsx, .xls)
                </p>
              </>
            )}
            <input
              type="file"
              className="hidden"
              accept=".xlsx,.xls"
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              tabIndex={-1}
            />
          </div>
        </div>

        <div className="rounded-lg border bg-blue-50/50 p-3 flex items-start gap-3 text-sm text-blue-800">
          <InfoIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Import Guidelines</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Ensure column headers match the required format.</li>
              <li>First row should contain column headers.</li>
              <li>Maximum file size: 5MB.</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              file
                ? handleImportExcel(file)
                : toast.warning("Please select a file to import")
            }
            disabled={loading || !file}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Importing...
              </span>
            ) : (
              "Import File"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
);

const ExportDataDialog = React.memo(
  ({
    open,
    onOpenChange,
    combineds,
    courses,
    subjects,
    combinedUuid,
    course,
    semester,
    statusFilter,
    setCombinedUuid,
    setCourse,
    setSemester,
    setStatusFilter,
    selectedCombined,
    selectedCourse,
    filteredCandidates,
    generateExportExcel,
    setSelectedCombined,
    setSelectedCourse,
  }) => {
    const semesterArray = useMemo(
      () =>
        selectedCourse?.semester
          ? Array.from({ length: Number(selectedCourse.semester) }, (_, i) =>
              (i + 1).toString()
            )
          : [],
      [selectedCourse]
    );

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Export Candidate Data
            </DialogTitle>
            <DialogDescription>
              Configure your export settings below. Data will be exported in
              Excel format.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Combined</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center"
                  >
                    <span>
                      {combineds.find((c) => c.uuid === combinedUuid)?.name ||
                        "Select Combined"}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    {combineds.map((el) => (
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedCombined(el);
                          setCombinedUuid(el.uuid);
                        }}
                        key={el.uuid}
                      >
                        {el.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Course</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center"
                    disabled={!combinedUuid}
                  >
                    <span>{course?.name || "Select Course"}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    {courses
                      .filter((el) => el.name === selectedCombined?.course)
                      .map((el) => (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedCourse(el);
                            setCourse(el.name);
                          }}
                          key={el.uuid}
                        >
                          {el.name}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col gap-2 col-span-2">
              <Label>Semester</Label>
              <Select
                onValueChange={setSemester}
                value={semester}
                disabled={!course}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesterArray.map((sem) => (
                    <SelectItem key={sem} value={sem}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border bg-blue-50/50 p-3 flex items-start gap-3 text-sm text-blue-800">
            <InfoIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Export Information</p>
              <p className="mt-1">
                The export will include {filteredCandidates.length} candidates
                based on your current filters. File will be generated with
                today's date in the filename.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={generateExportExcel}>
              <DownloadIcon className="h-4 w-4 mr-2" />
              Download Excel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

const GenerateBookletDialog = React.memo(
  ({
    open,
    onOpenChange,
    selectedCandidates,
    selectedCourse,
    generationDate,
    setGenerationDate,
  }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Generate Booklet
          </DialogTitle>
          <DialogDescription>
            Generate booklets for {selectedCandidates.size} selected candidates.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Selected Candidates</p>
              <p className="text-sm text-muted-foreground">
                {selectedCandidates.size} candidates will receive booklets
              </p>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              {selectedCourse?.name || "No course selected"}
            </Badge>
          </div>

          <div className="space-y-2">
            <Label>Generation Date</Label>
            <Input
              type="date"
              value={generationDate}
              onChange={(e) => setGenerationDate(e.target.value)}
            />
          </div>

          <div className="rounded-lg border bg-yellow-50/50 p-3 flex items-start gap-3 text-sm text-yellow-800">
            <InfoIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Booklet Generation</p>
              <p className="mt-1">
                This will generate PDF booklets for all selected candidates and
                make them available for download.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              toast.success("Booklet generation initiated!");
              onOpenChange(false);
            }}
            disabled={selectedCandidates.size === 0}
          >
            Generate Booklets
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
);

// Main Component
export default function CandidatePage() {
  // State
  const [filters, setFilters] = useState({
    combinedUuid: "",
    course: "",
    semester: "",
    subject: "",
    searchTerm: "",
    statusFilter: STATUS_FILTERS.ALL,
  });
  const [combineds, setCombineds] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState(new Set());
  const [selectedCombined, setSelectedCombined] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogs, setDialogs] = useState({
    import: false,
    generateBooklet: false,
    export: false,
    mobileFilters: false,
  });
  const [file, setFile] = useState(null);
  const [generationDate, setGenerationDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const fileInputRef = useRef(null);

  // Memoized Computations
  const semesterArray = useMemo(
    () =>
      selectedCourse?.semester
        ? Array.from({ length: Number(selectedCourse.semester) }, (_, i) =>
            (i + 1).toString()
          )
        : [],
    [selectedCourse]
  );

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchesCombined =
        !filters.combinedUuid || c.combinedUuid === filters.combinedUuid;
      const matchesCourse =
        !filters.course ||
        c.course === filters.course ||
        c.Course === filters.course;
      const matchesSemester =
        !filters.semester ||
        c.semester === filters.semester ||
        c.Semester === filters.semester;
      const matchesSubject = !filters.subject || c.subjects[filters.subject];
      const matchesSearch =
        !filters.searchTerm ||
        c.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (c.candidateId &&
          c.candidateId
            .toString()
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase())) ||
        c.emailId.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (c.rollNumber &&
          c.rollNumber
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase()));
      const matchesStatus =
        filters.statusFilter === STATUS_FILTERS.ALL ||
        (filters.statusFilter === STATUS_FILTERS.ACTIVE && c.isActive) ||
        (filters.statusFilter === STATUS_FILTERS.INACTIVE && !c.isActive);

      return (
        matchesCombined &&
        matchesCourse &&
        matchesSemester &&
        matchesSubject &&
        matchesSearch &&
        matchesStatus
      );
    });
  }, [candidates, filters]);

  const hasFiltersApplied = useMemo(
    () =>
      Object.values(filters).some(
        (value) => value !== "" && value !== STATUS_FILTERS.ALL
      ),
    [filters]
  );

  // Data Fetching
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const endpoints = [
          "/api/v1/combineds",
          "/api/v1/courses",
          "/api/v1/subjects",
          "/api/v1/candidates",
        ];
        const responses = await Promise.all(
          endpoints.map((endpoint) =>
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${endpoint}`).then(
              (res) => {
                if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
                return res.json();
              }
            )
          )
        );

        setCombineds(responses[0]);
        setCourses(responses[1]);
        setSubjects(responses[2]);
        setCandidates(responses[3].map(normalizeCandidate));
      } catch (error) {
        toast.error(`Error fetching data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handlers
  const handleCombinedChange = useCallback(
    (value) => {
      const selected = combineds.find((item) => item.uuid === value) || null;
      setSelectedCombined(selected);
      setFilters((prev) => ({
        ...prev,
        combinedUuid: selected ? selected.uuid : "",
        course: "",
        semester: "",
        subject: "",
      }));
      setSelectedCourse(null);
    },
    [combineds]
  );

  const handleCourseChange = useCallback(
    (value) => {
      const selected = courses.find((c) => c.name === value) || null;
      setSelectedCourse(selected);
      setFilters((prev) => ({
        ...prev,
        course: selected ? selected.name : "",
        semester: "",
        subject: "",
      }));
    },
    [courses]
  );

  const resetFilters = useCallback(() => {
    setFilters({
      combinedUuid: "",
      course: "",
      semester: "",
      subject: "",
      searchTerm: "",
      statusFilter: STATUS_FILTERS.ALL,
    });
    setSelectedCombined(null);
    setSelectedCourse(null);
  }, []);

  const handleCheckboxChange = useCallback((candidateId) => {
    setSelectedCandidates((prev) => {
      const newSet = new Set(prev);
      newSet.has(candidateId)
        ? newSet.delete(candidateId)
        : newSet.add(candidateId);
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(
    (checked) => {
      setSelectedCandidates(
        checked
          ? new Set(filteredCandidates.map((c) => c.candidateId))
          : new Set()
      );
    },
    [filteredCandidates]
  );

  const handleImportExcel = useCallback(
    async (localFile) => {
      setLoading(true);
      try {
        if (localFile.size > 5 * 1024 * 1024) {
          throw new Error("File size exceeds 5MB limit");
        }

        const data = await localFile.arrayBuffer();
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidates/import`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              course: selectedCourse?.uuid,
              combined: selectedCombined?.uuid,
              data: jsonData,
            }),
          }
        );

        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        const resData = await res.json();
        setCandidates(resData.map(normalizeCandidate));
        toast.success(`${jsonData.length} candidates imported successfully`);
      } catch (error) {
        toast.error(`Import failed: ${error.message}`);
      } finally {
        setLoading(false);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setDialogs((prev) => ({ ...prev, import: false }));
      }
    },
    [selectedCourse, selectedCombined]
  );

  const generateExportExcel = useCallback(() => {
    try {
      const headers = [
        "RollNo",
        "PRNNumber",
        "Gender",
        "Email",
        "FirstName",
        "MiddleName",
        "LastName",
        "MobileNo",
        "IsPHCandidate",
        "CampusName",
        ...subjects.map((s) => s.name),
      ];
      const data = filteredCandidates.map((candidate) => {
        const [firstName, middleName = "", ...otherNames] =
          candidate.name.split(" ");
        const lastName = otherNames.join(" ");
        return [
          candidate.rollNumber,
          candidate.prnNumber,
          candidate.gender,
          candidate.emailId,
          firstName || "",
          middleName,
          lastName,
          candidate.mobileNo,
          candidate.isPHCandidate ? "Yes" : "No",
          candidate.campusName,
          ...subjects.map((s) => candidate.subjects[s.name] || 0),
        ];
      });
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, worksheet, "Sheet1");
      XLSX.writeFile(
        wb,
        `CandidateData_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      setDialogs((prev) => ({ ...prev, export: false }));
      toast.success("Export completed successfully");
    } catch (error) {
      toast.error(`Export failed: ${error.message}`);
    }
  }, [filteredCandidates, subjects]);

  const getCourseName = useCallback(
    (id) => courses.find((item) => item.uuid === id)?.name || "",
    [courses]
  );

  // Render
  return (
    <div className="container max-w-7xl mx-auto py-6 px-2 sm:px-4 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-100">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Candidate Management
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage and organize all candidate records in one place
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-row flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-gray-300"
            onClick={() => setDialogs((prev) => ({ ...prev, export: true }))}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button
            size="sm"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setDialogs((prev) => ({ ...prev, import: true }))}
          >
            <UploadCloudIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Import</span>
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="mb-5 p-4 rounded-xl border bg-white shadow-sm sticky top-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, roll no, or email..."
              className="w-full pl-9 pr-8"
              value={filters.searchTerm}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
              }
            />
            {filters.searchTerm && (
              <X
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, searchTerm: "" }))
                }
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 w-full justify-between md:w-auto"
              onClick={() =>
                setDialogs((prev) => ({
                  ...prev,
                  mobileFilters: !prev.mobileFilters,
                }))
              }
            >
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  dialogs.mobileFilters ? "rotate-180" : ""
                )}
              />
            </Button>
            {hasFiltersApplied && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground h-8 px-2 hidden md:flex"
                onClick={resetFilters}
              >
                Clear
                <X className="ml-1 h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <div
          className={cn(
            "flex gap-3 mt-4 w-full flex-row",
            dialogs.mobileFilters ? "block" : "hidden md:flex"
          )}
        >
          <Select
            value={filters.combinedUuid}
            onValueChange={handleCombinedChange}
          >
            <SelectTrigger className="bg-white w-full">
              <SelectValue placeholder="Combined" />
            </SelectTrigger>
            <SelectContent>
              {combineds.map((item) => (
                <SelectItem key={item.uuid} value={item.uuid}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.course}
            onValueChange={handleCourseChange}
            disabled={!filters.combinedUuid}
          >
            <SelectTrigger className="bg-white w-full">
              <SelectValue placeholder="Course" />
            </SelectTrigger>
            <SelectContent>
              {courses
                .filter((item) => selectedCombined?.course === item.name)
                .map((item) => (
                  <SelectItem key={item.uuid} value={item.name}>
                    {item.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.semester}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, semester: value }))
            }
            disabled={!filters.course}
          >
            <SelectTrigger className="bg-white w-full">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              {semesterArray.map((sem) => (
                <SelectItem key={sem} value={sem}>
                  Semester {sem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.subject}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, subject: value }))
            }
            disabled={!filters.semester}
          >
            <SelectTrigger className="bg-white w-full">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((item) => (
                <SelectItem key={item.uuid} value={item.name}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasFiltersApplied && (
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-8 px-2 flex md:hidden"
              onClick={resetFilters}
            >
              Clear filters
              <X className="ml-1 h-3 w-3" />
            </Button>
            {filters.combinedUuid && (
              <Badge variant="outline" className="h-8">
                Combined:{" "}
                {combineds.find((c) => c.uuid === filters.combinedUuid)?.name}
              </Badge>
            )}
            {filters.course && (
              <Badge variant="outline" className="h-8">
                Course: {filters.course}
              </Badge>
            )}
            {filters.semester && (
              <Badge variant="outline" className="h-8">
                Semester: {filters.semester}
              </Badge>
            )}
            {filters.subject && (
              <Badge variant="outline" className="h-8">
                Subject: {filters.subject}
              </Badge>
            )}
            {filters.searchTerm && (
              <Badge variant="outline" className="h-8">
                Search: {filters.searchTerm}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {filteredCandidates.length}
            </span>{" "}
            {filteredCandidates.length === 1 ? "candidate" : "candidates"} found
          </span>
          <Select
            value={filters.statusFilter}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, statusFilter: value }))
            }
            defaultValue={STATUS_FILTERS.ALL}
          >
            <SelectTrigger className="w-[120px] h-8 bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={STATUS_FILTERS.ALL}>All</SelectItem>
              <SelectItem value={STATUS_FILTERS.ACTIVE}>Active</SelectItem>
              <SelectItem value={STATUS_FILTERS.INACTIVE}>Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {selectedCandidates.size > 0 && (
            <span className="text-sm text-muted-foreground">
              {selectedCandidates.size} selected
            </span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="gap-2 border-gray-300 w-full sm:w-auto"
                disabled={selectedCandidates.size === 0}
              >
                Actions
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() =>
                    setDialogs((prev) => ({ ...prev, generateBooklet: true }))
                  }
                  className="gap-2"
                >
                  <CirclePlusIcon className="h-4 w-4" />
                  Generate Booklet
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-red-600">
                  <X className="h-4 w-4" />
                  Deactivate
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table or Skeleton */}
      <div className="relative bg-white border rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center text-muted-foreground">
            <UsersIcon className="w-10 h-10 text-gray-400 mb-3" />
            <h3 className="font-medium text-lg">No candidates found</h3>
            <p className="text-sm max-w-md mt-1">
              {hasFiltersApplied
                ? "Try adjusting your filters or search term."
                : "No candidates available in the system."}
            </p>
            {hasFiltersApplied ? (
              <Button
                variant="ghost"
                size="sm"
                className="mt-4"
                onClick={resetFilters}
              >
                Clear filters
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="mt-4 bg-blue-600 hover:bg-blue-700"
                onClick={() =>
                  setDialogs((prev) => ({ ...prev, import: true }))
                }
              >
                <UploadCloudIcon className="h-4 w-4 mr-2" />
                Import Candidates
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[1100px]">
              <TableHeader className="bg-gray-50">
                <TableRow className="border-b border-gray-200">
                  <TableHead className="w-[48px]">
                    <Checkbox
                      checked={
                        selectedCandidates.size === filteredCandidates.length &&
                        filteredCandidates.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>PRN Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Booklet Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Answer Sheet Uploaded (Yes/No)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.map((candidate) => (
                  <TableRow
                    key={candidate.uuid}
                    className={cn(
                      "border-b border-gray-100",
                      !candidate.isActive && "bg-gray-50 opacity-80"
                    )}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedCandidates.has(candidate.candidateId)}
                        onCheckedChange={() =>
                          handleCheckboxChange(candidate.candidateId)
                        }
                        aria-label={`Select ${candidate.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {candidate.rollNumber}
                    </TableCell>
                    <TableCell>{candidate.prnNumber}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {candidate.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {candidate.mobileNo}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{candidate.emailId}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {candidate.gender}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{getCourseName(candidate.course)}</span>
                        <span className="text-xs text-muted-foreground">
                          {candidate.campusName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {candidate.bookletName}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusBadge active={candidate.isActive} />
                        {candidate.isPHCandidate && (
                          <Badge variant="secondary">PH</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {candidate.sheetUploaded ? "Yes" : "No"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ImportCandidatesDialog
        open={dialogs.import}
        onOpenChange={(isOpen) =>
          setDialogs((prev) => ({ ...prev, import: isOpen }))
        }
        file={file}
        setFile={setFile}
        fileInputRef={fileInputRef}
        combineds={combineds}
        courses={courses}
        combinedUuid={filters.combinedUuid}
        course={filters.course}
        handleCombinedChange={handleCombinedChange}
        handleCourseChange={handleCourseChange}
        handleImportExcel={handleImportExcel}
        selectedCombined={selectedCombined}
        setSelectedCombined={setSelectedCombined}
        loading={loading}
      />

      <GenerateBookletDialog
        open={dialogs.generateBooklet}
        onOpenChange={(isOpen) =>
          setDialogs((prev) => ({ ...prev, generateBooklet: isOpen }))
        }
        selectedCandidates={selectedCandidates}
        selectedCourse={selectedCourse}
        generationDate={generationDate}
        setGenerationDate={setGenerationDate}
      />

      <ExportDataDialog
        open={dialogs.export}
        onOpenChange={(isOpen) =>
          setDialogs((prev) => ({ ...prev, export: isOpen }))
        }
        combineds={combineds}
        courses={courses}
        subjects={subjects}
        combinedUuid={filters.combinedUuid}
        course={selectedCourse}
        semester={filters.semester}
        statusFilter={filters.statusFilter}
        setCombinedUuid={(combinedUuid) =>
          setFilters((prev) => ({ ...prev, combinedUuid }))
        }
        setCourse={(course) => setFilters((prev) => ({ ...prev, course }))}
        setSemester={(semester) =>
          setFilters((prev) => ({ ...prev, semester }))
        }
        setStatusFilter={(statusFilter) =>
          setFilters((prev) => ({ ...prev, statusFilter }))
        }
        selectedCombined={selectedCombined}
        selectedCourse={selectedCourse}
        filteredCandidates={filteredCandidates}
        generateExportExcel={generateExportExcel}
        setSelectedCombined={setSelectedCombined}
        setSelectedCourse={setSelectedCourse}
      />
    </div>
  );
}
