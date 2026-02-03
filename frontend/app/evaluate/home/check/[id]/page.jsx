"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Cookies from "js-cookie";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  Calendar,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  UserCheck,
  ChevronRight,
  Download,
  Filter,
  Search,
  MoreVertical,
  BarChart3,
  Users,
  Target,
  TrendingUp,
  Eye,
  RefreshCw,
  FileDown,
  Share2,
  Printer,
  Shield,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function EvaluationDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [evaluation, setEvaluation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    evaluated: 0,
    pending: 0,
    inProgress: 0,
    avgMarks: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [checkedFilter, setCheckedFilter] = useState("all");
  const [attendanceFilter, setAttendanceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("id");

  const token = Cookies.get("token");

  useEffect(() => {
    const fetchEval = async () => {
      if (!token) {
        router.push("/evaluate");
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/eval/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) throw new Error("Failed to load evaluation");
        const data = await res.json();
        setEvaluation(data);
        calculateStats(data.sheets || []);
      } catch (err) {
        toast.error(err.message || "Failed to load evaluation details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEval();
  }, [id, token, router]);

  const calculateStats = (sheets) => {
    const total = sheets.length;
    const evaluated = sheets.filter((s) => s.isChecked === "Evaluated").length;
    const pending = sheets.filter(
      (s) => s.isChecked === "Not Evaluated",
    ).length;
    const inProgress = sheets.filter((s) => s.status === "Checking").length;

    const evaluatedSheets = sheets.filter((s) => s.marks);
    const avgMarks =
      evaluatedSheets.length > 0
        ? (
            evaluatedSheets.reduce(
              (sum, s) => sum + (parseFloat(s.marks) || 0),
              0,
            ) / evaluatedSheets.length
          ).toFixed(1)
        : 0;

    setStats({ total, evaluated, pending, inProgress, avgMarks });
  };

  const handleCheck = async (assignmentId) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/answer-sheet/status/${assignmentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "Checking" }),
        },
      );

      if (res.ok) {
        const data = await res.json();
        setEvaluation((prev) => ({
          ...prev,
          sheets: prev.sheets.map((sheet) =>
            sheet.assignmentId === data.assignmentId ? data : sheet,
          ),
        }));
        calculateStats(
          evaluation.sheets.map((s) =>
            s.assignmentId === data.assignmentId ? data : s,
          ),
        );
        toast.success("Started evaluation");
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to start evaluation");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/eval/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        const data = await res.json();
        setEvaluation(data);
        calculateStats(data.sheets || []);
        toast.success("Data refreshed");
      }
    } catch (err) {
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      Checking: {
        bg: "bg-gradient-to-r from-blue-500 to-cyan-500",
        icon: Clock,
        text: "Checking",
      },
      Completed: {
        bg: "bg-gradient-to-r from-emerald-500 to-green-500",
        icon: CheckCircle2,
        text: "Completed",
      },
      Pending: {
        bg: "bg-gradient-to-r from-amber-500 to-orange-500",
        icon: Clock,
        text: "Pending",
      },
      default: {
        bg: "bg-gradient-to-r from-gray-400 to-gray-300",
        icon: AlertCircle,
        text: status || "Unknown",
      },
    };

    const config = variants[status] || variants.default;
    const Icon = config.icon;

    return (
      <Badge
        className={`${config.bg} text-white border-0 shadow-sm text-xs flex items-center gap-1.5 px-3 py-1`}
      >
        <Icon className="h-3.5 w-3.5" />
        {config.text}
      </Badge>
    );
  };

  const getCheckedBadge = (checked) => {
    if (checked === "Evaluated")
      return (
        <Badge className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200 text-xs flex items-center gap-1.5 px-3 py-1">
          <CheckCircle2 className="h-3.5 w-3.5" /> Evaluated
        </Badge>
      );
    if (checked === "Not Evaluated")
      return (
        <Badge className="bg-gradient-to-r from-rose-100 to-pink-100 text-rose-800 border-rose-200 text-xs flex items-center gap-1.5 px-3 py-1">
          <XCircle className="h-3.5 w-3.5" /> Not Evaluated
        </Badge>
      );
    return (
      <Badge className="bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border-gray-200 text-xs">
        {checked}
      </Badge>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const [day, month, year] = dateStr.split("-");
    const date = new Date(`${year}-${month}-${day}`);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isOverdue = (dateStr) => {
    if (!dateStr) return false;
    const [day, month, year] = dateStr.split("-");
    return new Date(`${year}-${month}-${day}`) < new Date();
  };

  // Filter and sort sheets
  const filteredSheets = useMemo(() => {
    if (!evaluation?.sheets) return [];

    let sheets = [...evaluation.sheets];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      sheets = sheets.filter(
        (s) =>
          s.assignmentId?.toLowerCase().includes(q) ||
          (s.studentName && s.studentName.toLowerCase().includes(q)),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      sheets = sheets.filter((s) => s.status === statusFilter);
    }

    // Checked filter
    if (checkedFilter !== "all") {
      sheets = sheets.filter((s) => s.isChecked === checkedFilter);
    }

    // Attendance filter
    if (attendanceFilter !== "all") {
      sheets = sheets.filter((s) =>
        attendanceFilter === "present" ? s.attendance : !s.attendance,
      );
    }

    // Sorting
    sheets.sort((a, b) => {
      if (sortBy === "id") return a.assignmentId?.localeCompare(b.assignmentId);
      if (sortBy === "marks") return (b.marks || 0) - (a.marks || 0);
      if (sortBy === "status") return a.status?.localeCompare(b.status);
      if (sortBy === "checked") return a.isChecked?.localeCompare(b.isChecked);
      return 0;
    });

    return sheets;
  }, [
    evaluation,
    searchQuery,
    statusFilter,
    checkedFilter,
    attendanceFilter,
    sortBy,
  ]);

  // Loading State
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Not Found
  if (!evaluation) {
    return <NotFoundState />;
  }

  const progressPercentage =
    stats.total > 0 ? Math.round((stats.evaluated / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 backdrop-blur-sm pb-12">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-200/10 to-cyan-200/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Button
                variant="ghost"
                onClick={() => router.push("/evaluate/home")}
                className="gap-2 rounded-full bg-white/50 backdrop-blur-sm hover:bg-white/70"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </motion.div>

            <div className="hidden sm:block h-6 w-px bg-gradient-to-b from-gray-300/50 to-transparent" />

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Evaluation Details
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Track and manage individual answer sheets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="rounded-full hover:bg-white/50 backdrop-blur-sm"
                  >
                    <RefreshCw
                      className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 rounded-full bg-white/50 backdrop-blur-sm"
                >
                  <MoreVertical className="h-4 w-4" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-white/95 backdrop-blur-lg border-white/50"
              >
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileDown className="mr-2 h-4 w-4" />
                  Download All Sheets
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Summary
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Results
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Left Column - Overview & Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Evaluation Info Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-white/50 bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-lg shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold line-clamp-2">
                        {evaluation.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1.5 mt-1">
                        <Shield className="h-3.5 w-3.5" />
                        Evaluation ID: {id.slice(0, 8)}...
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Semester</span>
                      <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200">
                        Semester {evaluation.semester}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Course</span>
                      <span className="font-medium text-gray-900">
                        {evaluation.course || "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Due Date</span>
                      <div className="flex items-center gap-2">
                        <CalendarDays
                          className={`h-4 w-4 ${isOverdue(evaluation.endDate) ? "text-rose-500" : "text-blue-500"}`}
                        />
                        <span
                          className={`font-medium ${isOverdue(evaluation.endDate) ? "text-rose-600" : "text-gray-900"}`}
                        >
                          {formatDate(evaluation.endDate)}
                        </span>
                        {isOverdue(evaluation.endDate) && (
                          <Badge className="bg-gradient-to-r from-rose-100 to-pink-100 text-rose-800 text-xs">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-gradient-to-r from-transparent via-gray-200/50 to-transparent" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Overall Progress</span>
                      <span className="font-bold text-gray-900">
                        {progressPercentage}%
                      </span>
                    </div>
                    <Progress
                      value={progressPercentage}
                      className="h-2.5 bg-gradient-to-r from-blue-200 to-indigo-200"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{stats.evaluated} evaluated</span>
                      <span>{stats.total} total</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-white/50 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 backdrop-blur-lg shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    Evaluation Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      label: "Total Sheets",
                      value: stats.total,
                      icon: FileText,
                      color: "from-blue-500 to-cyan-500",
                    },
                    {
                      label: "Evaluated",
                      value: stats.evaluated,
                      icon: CheckCircle2,
                      color: "from-emerald-500 to-green-500",
                    },
                    {
                      label: "Pending",
                      value: stats.pending,
                      icon: Clock,
                      color: "from-amber-500 to-orange-500",
                    },
                    {
                      label: "In Progress",
                      value: stats.inProgress,
                      icon: TrendingUp,
                      color: "from-violet-500 to-purple-500",
                    },
                    {
                      label: "Avg. Marks",
                      value: stats.avgMarks,
                      icon: BarChart3,
                      color: "from-rose-500 to-pink-500",
                    },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}
                        >
                          <stat.icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm text-gray-700">
                          {stat.label}
                        </span>
                      </div>
                      <span className="font-bold text-gray-900">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Filters Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-white/50 bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-lg shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search sheets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/70 backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className="bg-white/70 backdrop-blur-sm text-sm">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-lg">
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Checking">Checking</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Evaluation</label>
                      <Select
                        value={checkedFilter}
                        onValueChange={setCheckedFilter}
                      >
                        <SelectTrigger className="bg-white/70 backdrop-blur-sm text-sm">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-lg">
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="Evaluated">Evaluated</SelectItem>
                          <SelectItem value="Not Evaluated">
                            Not Evaluated
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sort by</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="bg-white/70 backdrop-blur-sm text-sm">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-lg">
                        <SelectItem value="id">Assignment ID</SelectItem>
                        <SelectItem value="marks">Marks</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                        <SelectItem value="checked">Evaluation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                      setCheckedFilter("all");
                      setAttendanceFilter("all");
                      setSortBy("id");
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Sheets Table */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-white/50 bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-lg shadow-xl">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                        <UserCheck className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle>Answer Sheets</CardTitle>
                        <CardDescription>
                          {filteredSheets.length} of {stats.total} sheets
                        </CardDescription>
                      </div>
                    </div>

                    <Tabs defaultValue="all" className="w-full sm:w-auto">
                      <TabsList className="bg-white/70 backdrop-blur-sm">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="evaluated">Evaluated</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>

                <CardContent>
                  <AnimatePresence mode="wait">
                    {filteredSheets.length === 0 ? (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <EmptySheetsState />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="table"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="overflow-hidden rounded-xl border border-white/50 bg-white/30 backdrop-blur-sm"
                      >
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 backdrop-blur-sm">
                                <TableHead className="font-semibold text-gray-700">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Assignment
                                  </div>
                                </TableHead>
                                <TableHead className="font-semibold text-gray-700">
                                  Status
                                </TableHead>
                                <TableHead className="font-semibold text-gray-700">
                                  Evaluation
                                </TableHead>
                                <TableHead className="font-semibold text-gray-700">
                                  Marks
                                </TableHead>
                                <TableHead className="font-semibold text-gray-700">
                                  Attendance
                                </TableHead>
                                <TableHead className="font-semibold text-gray-700 text-right">
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredSheets.map((sheet, index) => (
                                <motion.tr
                                  key={sheet.assignmentId}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="group hover:bg-gradient-to-r hover:from-white/50 hover:to-blue-50/30 backdrop-blur-sm border-b border-white/20"
                                >
                                  <TableCell>
                                    <div className="space-y-1">
                                      <div className="font-mono text-sm text-gray-900">
                                        {sheet.assignmentId}
                                      </div>
                                      {sheet.studentName && (
                                        <div className="text-xs text-gray-600">
                                          {sheet.studentName}
                                        </div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {getStatusBadge(sheet.status)}
                                  </TableCell>
                                  <TableCell>
                                    {getCheckedBadge(sheet.isChecked)}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`font-bold text-lg ${sheet.marks ? "text-emerald-600" : "text-gray-400"}`}
                                      >
                                        {sheet.marks ?? "—"}
                                      </span>
                                      {sheet.marks && (
                                        <Badge className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 text-xs">
                                          /100
                                        </Badge>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        sheet.attendance
                                          ? "default"
                                          : "secondary"
                                      }
                                      className={`text-xs ${
                                        sheet.attendance
                                          ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200"
                                          : "bg-gradient-to-r from-rose-100 to-pink-100 text-rose-800 border-rose-200"
                                      }`}
                                    >
                                      {sheet.attendance ? "Present" : "Absent"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {sheet.isChecked === "Not Evaluated" ? (
                                        <Button
                                          size="sm"
                                          onClick={async () => {
                                            try {
                                              await handleCheck(
                                                sheet.assignmentId,
                                              );
                                              router.push(
                                                `/evaluate/home/check/${id}/${sheet.assignmentId}`,
                                              );
                                              // toast.success already inside handleCheck
                                            } catch {
                                              // error already shown in handleCheck
                                            }
                                          }}
                                          disabled={sheet.status === "Checking"} // optional improvement
                                          className="..."
                                        >
                                          {sheet.status === "Checking" ? (
                                            <>
                                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                              Opening...
                                            </>
                                          ) : (
                                            "Start Evaluation"
                                          )}
                                        </Button>
                                      ) : (
                                        <div className="flex items-center gap-2">
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-8 w-8 rounded-full hover:bg-blue-50"
                                                >
                                                  <Eye className="h-4 w-4" />
                                                </Button>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>View details</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>

                                          <Badge className="bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border-gray-200 text-xs px-3">
                                            {sheet.isChecked === "Evaluated"
                                              ? "Done"
                                              : "In Progress"}
                                          </Badge>
                                        </div>
                                      )}
                                    </div>
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
                  <div className="text-sm text-gray-600">
                    Showing {filteredSheets.length} of {stats.total} sheets
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600"
                    >
                      Generate Report
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Mobile Filters Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed bottom-6 right-6 lg:hidden rounded-full shadow-xl bg-white/80 backdrop-blur-sm"
            >
              <Filter className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="h-3/4 rounded-t-3xl bg-white/95 backdrop-blur-lg"
          >
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Filter answer sheets</SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search sheets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Checking">Checking</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Evaluation</label>
                  <Select
                    value={checkedFilter}
                    onValueChange={setCheckedFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Evaluation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="Evaluated">Evaluated</SelectItem>
                      <SelectItem value="Not Evaluated">
                        Not Evaluated
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setCheckedFilter("all");
                  setAttendanceFilter("all");
                  setSortBy("id");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

// Loading Skeleton
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 backdrop-blur-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 space-y-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-32 bg-gradient-to-r from-gray-200/50 to-gray-300/50 rounded-full animate-pulse" />
          <div className="h-6 w-px bg-gradient-to-b from-gray-300/50 to-transparent" />
          <div className="space-y-2">
            <div className="h-8 bg-gradient-to-r from-gray-200/50 to-gray-300/50 rounded-lg w-48 animate-pulse" />
            <div className="h-4 bg-gradient-to-r from-gray-200/50 to-gray-300/50 rounded w-64 animate-pulse" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-10 bg-gradient-to-r from-gray-200/50 to-gray-300/50 rounded-full animate-pulse" />
          <div className="h-10 w-24 bg-gradient-to-r from-gray-200/50 to-gray-300/50 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-1 space-y-6">
          <div className="h-96 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-lg rounded-2xl animate-pulse" />
          <div className="h-64 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-lg rounded-2xl animate-pulse" />
          <div className="h-80 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-lg rounded-2xl animate-pulse" />
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-3">
          <div className="bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-lg rounded-2xl p-6 space-y-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="h-6 bg-gradient-to-r from-gray-200/50 to-gray-300/50 rounded w-48" />
                <div className="h-4 bg-gradient-to-r from-gray-200/50 to-gray-300/50 rounded w-64" />
              </div>
              <div className="h-10 w-48 bg-gradient-to-r from-gray-200/50 to-gray-300/50 rounded-full" />
            </div>

            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="grid grid-cols-6 gap-4 py-4 border-b border-gray-200/50"
                >
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <div
                      key={j}
                      className="h-8 bg-gradient-to-r from-gray-200/50 to-gray-300/50 rounded-lg"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Not Found
const NotFoundState = () => (
  <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 backdrop-blur-sm">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md w-full"
    >
      <Card className="border-white/50 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-lg shadow-2xl text-center">
        <CardContent className="p-12">
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-rose-500" />
            </div>
            <div className="absolute inset-0 border-2 border-dashed border-rose-200/50 rounded-2xl animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Evaluation Not Found
          </h3>
          <p className="text-gray-600 mb-6">
            The evaluation you're looking for doesn't exist or has been removed.
          </p>
          <Button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  </div>
);

// Empty Sheets
const EmptySheetsState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-16 px-4 text-center"
  >
    <div className="relative mb-8">
      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100/50 to-indigo-100/50 rounded-3xl flex items-center justify-center backdrop-blur-sm">
        <FileText className="h-12 w-12 text-blue-500/50" />
      </div>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border-2 border-dashed border-blue-200/50 rounded-3xl"
      />
      <div className="absolute -top-2 -right-2 bg-gradient-to-br from-amber-400 to-orange-500 text-white p-2 rounded-full shadow-md">
        <AlertCircle className="h-5 w-5" />
      </div>
    </div>

    <div className="max-w-md mx-auto space-y-3">
      <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
        No Answer Sheets
      </h3>
      <p className="text-gray-600">
        There are no answer sheets assigned to this evaluation yet. Sheets will
        appear here once they are uploaded.
      </p>
    </div>

    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
      <Button
        variant="outline"
        onClick={() => window.location.reload()}
        className="gap-2 rounded-full bg-white/70 backdrop-blur-sm"
      >
        <RefreshCw className="h-4 w-4" />
        Refresh
      </Button>
      <Button className="gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
        <FileDown className="h-4 w-4" />
        Upload Sheets
      </Button>
    </div>
  </motion.div>
);
