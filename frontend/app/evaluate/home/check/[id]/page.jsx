"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import Cookies from "js-cookie";
import { toast } from "sonner";
import {
  ArrowLeft, FileText, BookOpen, CheckCircle2, XCircle,
  Clock, AlertCircle, UserCheck, Download, Filter, Search,
  MoreVertical, BarChart3, TrendingUp, Eye, RefreshCw,
  FileDown, Share2, Printer, Shield, CalendarDays, Loader2,
  XIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table, TableHeader, TableHead, TableRow, TableBody, TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader,
  SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";

// ── Constants ────────────────────────────────────────────────
const STATUS_CONFIG = {
  Checking: { bg: "from-blue-500 to-cyan-500", icon: Clock, text: "Checking" },
  Completed: { bg: "from-emerald-500 to-green-500", icon: CheckCircle2, text: "Completed" },
  Pending: { bg: "from-amber-500 to-orange-500", icon: Clock, text: "Pending" },
  Rejected: { bg: "from-orange-500 to-red-500", icon: XIcon, text: "Rejected" },
};

const CHECKED_CONFIG = {
  Evaluated: {
    cls: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: CheckCircle2,
  },
  "Not Evaluated": {
    cls: "bg-rose-100 text-rose-800 border-rose-200",
    icon: XCircle,
  },
};

// ── Badge helpers ────────────────────────────────────────────
function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? {
    bg: "from-gray-400 to-gray-300",
    icon: AlertCircle,
    text: status || "Unknown",
  };
  const Icon = config.icon;
  return (
    <Badge className={`bg-gradient-to-r ${config.bg} text-white border-0 shadow-sm text-xs flex items-center gap-1.5 px-3 py-1`}>
      <Icon className="h-3.5 w-3.5" />
      {config.text}
    </Badge>
  );
}

function CheckedBadge({ checked }) {
  const config = CHECKED_CONFIG[checked];
  if (!config) return <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-xs">{checked}</Badge>;
  const Icon = config.icon;
  return (
    <Badge className={`${config.cls} text-xs flex items-center gap-1.5 px-3 py-1`}>
      <Icon className="h-3.5 w-3.5" />
      {checked}
    </Badge>
  );
}

// ── Stats calculator ─────────────────────────────────────────
function calcStats(sheets = []) {
  const total = sheets.length;
  const evaluated = sheets.filter(s => s.isChecked === "Evaluated").length;
  const pending = sheets.filter(s => s.isChecked === "Not Evaluated").length;
  const inProgress = sheets.filter(s => s.status === "Checking").length;
  const evalSheets = sheets.filter(s => s.marks);
  const avgMarks = evalSheets.length
    ? (evalSheets.reduce((sum, s) => sum + (parseFloat(s.marks) || 0), 0) / evalSheets.length).toFixed(1)
    : 0;
  return { total, evaluated, pending, inProgress, avgMarks };
}

// ── Date helpers ─────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export default function EvaluationDetail() {
  const { id } = useParams();
  const router = useRouter();
  const token = Cookies.get("token");

  const [evaluation, setEvaluation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, evaluated: 0, pending: 0, inProgress: 0, avgMarks: 0 });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [checkedFilter, setCheckedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("id");

  // ── Fetch ──────────────────────────────────────────────────
  const loadEval = useCallback(async (silent = false) => {
    if (!token) { router.push("/evaluate"); return; }
    if (!silent) setIsLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/eval/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error("Failed to load evaluation");
      const data = await res.json();
      setEvaluation(data);
      setStats(calcStats(data.sheets || []));
      if (silent) toast.success("Data refreshed");
    } catch (err) {
      toast.error(err.message || "Failed to load evaluation");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [id, token, router]);

  useEffect(() => { loadEval(); }, [loadEval]);

  // ── Start evaluation ───────────────────────────────────────
  const handleCheck = useCallback(async (assignmentId) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/answer-sheet/status/${assignmentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: "Checking" }),
        },
      );
      if (!res.ok) throw new Error();
      const updated = await res.json();

      setEvaluation(prev => {
        const sheets = prev.sheets.map(s => s.assignmentId === updated.assignmentId ? updated : s);
        setStats(calcStats(sheets));
        return { ...prev, sheets };
      });

      router.push(`/evaluate/home/check/${id}/${assignmentId}`);
    } catch {
      toast.error("Failed to start evaluation");
    }
  }, [token, id, router]);

  // ── Filtered + sorted sheets ───────────────────────────────
  const filteredSheets = useMemo(() => {
    if (!evaluation?.sheets) return [];
    let result = [...evaluation.sheets];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.assignmentId?.toLowerCase().includes(q) ||
        s.studentName?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") result = result.filter(s => s.status === statusFilter);
    if (checkedFilter !== "all") result = result.filter(s => s.isChecked === checkedFilter);

    result.sort((a, b) => {
      if (sortBy === "marks") return (b.marks || 0) - (a.marks || 0);
      if (sortBy === "status") return a.status?.localeCompare(b.status);
      if (sortBy === "checked") return a.isChecked?.localeCompare(b.isChecked);
      return a.assignmentId?.localeCompare(b.assignmentId);
    });

    return result;
  }, [evaluation, searchQuery, statusFilter, checkedFilter, sortBy]);

  const clearFilters = () => {
    setSearchQuery(""); setStatusFilter("all");
    setCheckedFilter("all"); setSortBy("id");
  };

  const progressPercentage = stats.total > 0
    ? Math.round((stats.evaluated / stats.total) * 100)
    : 0;

  // ── Render states ──────────────────────────────────────────
  if (isLoading) return <LoadingSkeleton />;
  if (!evaluation) return <NotFoundState />;

  // ── Shared filter UI (used in sidebar + bottom sheet) ─────
  const FilterControls = (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search sheets..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/70 backdrop-blur-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white/70 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Checking">Checking</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Evaluation</label>
          <Select value={checkedFilter} onValueChange={setCheckedFilter}>
            <SelectTrigger className="bg-white/70 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Evaluated">Evaluated</SelectItem>
              <SelectItem value="Not Evaluated">Not Evaluated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Sort by</label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="bg-white/70 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="id">Assignment ID</SelectItem>
            <SelectItem value="marks">Marks</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="checked">Evaluation</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button variant="outline" className="w-full" onClick={clearFilters}>
        Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 pb-12">
      {/* Background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/4 w-96 h-96 bg-emerald-200/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-10 space-y-8">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/evaluate/home")}
              className="gap-2 rounded-full bg-white/50 backdrop-blur-sm hover:bg-white/70"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div className="hidden sm:block h-6 w-px bg-gray-300/50" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Evaluation Details
              </h1>
              <p className="text-gray-600 text-sm mt-1">Track and manage individual answer sheets</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => loadEval(true)}
                    disabled={refreshing}
                    className="rounded-full hover:bg-white/50"
                  >
                    <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh data</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 rounded-full bg-white/50 backdrop-blur-sm">
                  <MoreVertical className="h-4 w-4" /> Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-lg">
                <DropdownMenuItem><Download className="mr-2 h-4 w-4" />Export as CSV</DropdownMenuItem>
                <DropdownMenuItem><FileDown className="mr-2 h-4 w-4" />Download All Sheets</DropdownMenuItem>
                <DropdownMenuItem><Printer className="mr-2 h-4 w-4" />Print Summary</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem><Share2 className="mr-2 h-4 w-4" />Share Results</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* ── Main Grid ──────────────────────────────────────── */}
        <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">

          {/* Left sidebar */}
          <div className="lg:col-span-1 space-y-6">

            {/* Info card */}
            <Card className="border-white/50 bg-white/60 backdrop-blur-lg shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold line-clamp-2">{evaluation.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5 mt-1">
                      <Shield className="h-3.5 w-3.5" /> ID: {id.slice(0, 8)}...
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Semester</span>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      Semester {evaluation.semester}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Course</span>
                    <span className="font-medium">{evaluation.course || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Due Date</span>
                    <div className="flex items-center gap-2">
                      <CalendarDays className={`h-4 w-4 ${isOverdue(evaluation.endDate) ? "text-rose-500" : "text-blue-500"}`} />
                      <span className={isOverdue(evaluation.endDate) ? "text-rose-600 font-medium" : "font-medium"}>
                        {formatDate(evaluation.endDate)}
                      </span>
                      {isOverdue(evaluation.endDate) && (
                        <Badge className="bg-rose-100 text-rose-800 text-xs">Overdue</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-bold">{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2.5" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{stats.evaluated} evaluated</span>
                    <span>{stats.total} total</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats card */}
            <Card className="border-white/50 bg-blue-50/50 backdrop-blur-lg shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Evaluation Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Total Sheets", value: stats.total, icon: FileText, color: "from-blue-500 to-cyan-500" },
                  { label: "Evaluated", value: stats.evaluated, icon: CheckCircle2, color: "from-emerald-500 to-green-500" },
                  { label: "Pending", value: stats.pending, icon: Clock, color: "from-amber-500 to-orange-500" },
                  { label: "In Progress", value: stats.inProgress, icon: TrendingUp, color: "from-violet-500 to-purple-500" },
                  { label: "Avg. Marks", value: stats.avgMarks, icon: BarChart3, color: "from-rose-500 to-pink-500" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm text-gray-700">{label}</span>
                    </div>
                    <span className="font-bold text-gray-900">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Desktop filters */}
            <Card className="border-white/50 bg-white/60 backdrop-blur-lg shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" /> Filters
                </CardTitle>
              </CardHeader>
              <CardContent>{FilterControls}</CardContent>
            </Card>
          </div>

          {/* Sheets table */}
          <div className="lg:col-span-3">
            <Card className="border-white/50 bg-white/60 backdrop-blur-lg shadow-xl">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                      <UserCheck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Answer Sheets</CardTitle>
                      <CardDescription>{filteredSheets.length} of {stats.total} sheets</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <AnimatePresence mode="wait">
                  {filteredSheets.length === 0 ? (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <EmptySheetsState />
                    </motion.div>
                  ) : (
                    <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="overflow-hidden rounded-xl border border-white/50 bg-white/30 backdrop-blur-sm"
                    >
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-blue-50/50">
                              <TableHead className="font-semibold text-gray-700">
                                <div className="flex items-center gap-2"><FileText className="h-4 w-4" />Assignment</div>
                              </TableHead>
                              <TableHead className="font-semibold text-gray-700">Status</TableHead>
                              <TableHead className="font-semibold text-gray-700">Evaluation</TableHead>
                              <TableHead className="font-semibold text-gray-700">Marks</TableHead>
                              <TableHead className="font-semibold text-gray-700">Attendance</TableHead>
                              <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredSheets.map((sheet, index) => (
                              <motion.tr
                                key={sheet.assignmentId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04 }}
                                className="group hover:bg-blue-50/30 border-b border-white/20"
                              >
                                <TableCell>
                                  <div className="font-mono text-sm text-gray-900">{sheet.assignmentId}</div>
                                  {sheet.studentName && (
                                    <div className="text-xs text-gray-500 mt-0.5">{sheet.studentName}</div>
                                  )}
                                </TableCell>
                                <TableCell><StatusBadge status={sheet.status} /></TableCell>
                                <TableCell><CheckedBadge checked={sheet.isChecked} /></TableCell>
                                <TableCell>
                                  <span className={`font-bold text-lg ${sheet.marks ? "text-emerald-600" : "text-gray-400"}`}>
                                    {sheet.marks ?? "—"}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Badge className={`text-xs ${sheet.attendance
                                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                      : "bg-rose-100 text-rose-800 border-rose-200"
                                    }`}>
                                    {sheet.attendance ? "Present" : "Absent"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  {sheet.status === "Rejected" ? (
                                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs px-3">
                                      Awaiting Re-upload
                                    </Badge>
                                  ) : sheet.isChecked === "Not Evaluated" ? (
                                    <Button
                                      size="sm"
                                      onClick={() => handleCheck(sheet.assignmentId)}
                                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-sm"
                                    >
                                      Start Evaluation
                                    </Button>
                                  ) : (
                                    <div className="flex items-center justify-end gap-2">
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-blue-50">
                                              <Eye className="h-4 w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>View details</TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                      <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-xs px-3">
                                        {sheet.isChecked === "Evaluated" ? "Done" : "In Progress"}
                                      </Badge>
                                    </div>
                                  )}
                                </TableCell>
                              </motion.tr>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>

              <CardFooter className="flex items-center justify-between border-t border-white/50 pt-4">
                <span className="text-sm text-gray-600">
                  Showing {filteredSheets.length} of {stats.total} sheets
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" /> Export
                  </Button>
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    Generate Report
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile filter sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline" size="icon"
            className="fixed bottom-6 right-6 lg:hidden rounded-full shadow-xl bg-white/80 backdrop-blur-sm"
          >
            <Filter className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-3/4 rounded-t-3xl bg-white/95 backdrop-blur-lg">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Filter answer sheets</SheetDescription>
          </SheetHeader>
          <div className="mt-6">{FilterControls}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-32 bg-gray-200/50 rounded-full animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 bg-gray-200/50 rounded-lg w-48 animate-pulse" />
            <div className="h-4 bg-gray-200/50 rounded w-64 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          {[96, 64, 80].map(h => (
            <div key={h} className={`h-${h} bg-white/50 rounded-2xl animate-pulse`} />
          ))}
        </div>
        <div className="lg:col-span-3">
          <div className="bg-white/50 rounded-2xl p-6 space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4 py-4 border-b border-gray-200/50">
                {[...Array(6)].map((_, j) => (
                  <div key={j} className="h-8 bg-gray-200/50 rounded-lg" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const NotFoundState = () => (
  <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30">
    <Card className="border-white/50 bg-white/70 backdrop-blur-lg shadow-2xl text-center max-w-md w-full">
      <CardContent className="p-12">
        <div className="w-20 h-20 mx-auto bg-rose-100 rounded-2xl flex items-center justify-center mb-6">
          <AlertCircle className="h-10 w-10 text-rose-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Evaluation Not Found</h3>
        <p className="text-gray-600 mb-6">The evaluation you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => window.history.back()} className="bg-gradient-to-r from-blue-600 to-indigo-600">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </CardContent>
    </Card>
  </div>
);

const EmptySheetsState = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-24 h-24 mx-auto bg-blue-100/50 rounded-3xl flex items-center justify-center mb-6">
      <FileText className="h-12 w-12 text-blue-400" />
    </div>
    <h3 className="text-xl font-bold text-gray-700 mb-2">No Answer Sheets</h3>
    <p className="text-gray-500 max-w-sm">
      No sheets match your current filters, or none have been assigned yet.
    </p>
    <Button
      variant="outline"
      onClick={() => window.location.reload()}
      className="mt-6 gap-2 rounded-full"
    >
      <RefreshCw className="h-4 w-4" /> Refresh
    </Button>
  </div>
);