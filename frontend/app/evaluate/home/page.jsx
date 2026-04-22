"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "sonner";
import Link from "next/link";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Filter,
  Loader2,
  Search,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  Clock,
  BarChart3,
  Download,
  Eye,
  MoreVertical,
  RefreshCw,
  Bell,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function EvaluationDashboard() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [currentUserMail, setCurrentUserMail] = useState("");
  const [token, setToken] = useState("");
  const [userProfile, setUserProfile] = useState(null);

  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [evaluations, setEvaluations] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [activeTab, setActiveTab] = useState("all");

  // 1. Auth & initial data fetch
  useEffect(() => {
    const mail = Cookies.get("mail")?.trim();
    const tk = Cookies.get("token")?.trim();

    if (!tk || !mail) {
      toast.error("Session expired", {
        description: "Please log in again",
      });
      router.replace("/evaluate");
      return;
    }

    setCurrentUserMail(mail);
    setToken(tk);

    fetchInitialData(tk, mail);
  }, [router]);

  const fetchInitialData = async (tk, mail) => {
    setIsLoading(true);
    setError(null);

    try {
      const [usersRes, coursesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`, {
          headers: { Authorization: `Bearer ${tk}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/course`, {
          headers: { Authorization: `Bearer ${tk}` },
        }),
      ]);

      if (!usersRes.ok || !coursesRes.ok) {
        throw new Error("Failed to load required data");
      }

      const [usersData, coursesData] = await Promise.all([
        usersRes.json(),
        coursesRes.json(),
      ]);

      setUsers(usersData ?? []);
      setCourses(coursesData ?? []);

      const currentUser = usersData.find((u) => u.Email === mail);
      setUserProfile(currentUser);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data. Please try again.");
      toast.error("Data loading failed", {
        description: "Check your connection or try refreshing",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Load evaluations once we have users & examiner ID
  useEffect(() => {
    if (!users.length || !currentUserMail || !token) return;

    const examiner = users.find((u) => u.Email === currentUserMail);
    if (!examiner?._id) {
      toast.warning("User profile not found");
      return;
    }

    const fetchEvaluations = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/eval/examiner/${examiner._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) throw new Error("Failed to fetch evaluations");

        const data = await res.json();
        setEvaluations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Evaluations fetch failed:", err);
        toast.error("Could not load your evaluation assignments");
      }
    };

    fetchEvaluations();
  }, [users, currentUserMail, token]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData(token, currentUserMail);
    setRefreshing(false);
    toast.success("Dashboard refreshed");
  };

  const getProgressPercentage = (prog) =>
    !prog || prog.uploaded === 0
      ? 0
      : Math.round((prog.checked / prog.uploaded) * 100);

  const isOverdue = (endDate) => {
    const [d, m, y] = endDate.split("-");
    return new Date(`${y}-${m}-${d}`) < new Date();
  };

  function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "numeric", month: "short", year: "numeric",
    });
  }

  // Filtered & sorted evaluations
  const displayedEvaluations = useMemo(() => {
    let result = [...evaluations];

    // Active tab filtering
    if (activeTab !== "all") {
      if (activeTab === "overdue") {
        result = result.filter((e) => {
          const pct = getProgressPercentage(e.progress);
          return pct < 100 && isOverdue(e.endDate);
        });
      } else if (activeTab === "pending") {
        result = result.filter((e) => {
          const pct = getProgressPercentage(e.progress);
          return pct > 0 && pct < 100 && !isOverdue(e.endDate);
        });
      } else if (activeTab === "completed") {
        result = result.filter(
          (e) => getProgressPercentage(e.progress) === 100,
        );
      }
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((e) => e.name.toLowerCase().includes(q));
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((e) => {
        const pct = getProgressPercentage(e.progress);
        if (statusFilter === "completed") return pct === 100;
        if (statusFilter === "in-progress") return pct > 0 && pct < 100;
        if (statusFilter === "not-started") return pct === 0;
        return true;
      });
    }

    // Semester filter
    if (semesterFilter !== "all") {
      const sem = Number(semesterFilter);
      result = result.filter((e) => e.semester === sem);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "dueDate") {
        return (
          new Date(a.endDate.split("-").reverse().join("-")).getTime() -
          new Date(b.endDate.split("-").reverse().join("-")).getTime()
        );
      }
      if (sortBy === "progress") {
        return (
          getProgressPercentage(b.progress) - getProgressPercentage(a.progress)
        );
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return result;
  }, [
    evaluations,
    searchQuery,
    statusFilter,
    semesterFilter,
    sortBy,
    activeTab,
  ]);

  const stats = useMemo(() => {
    const total = evaluations.length;
    let completed = 0,
      inProgress = 0,
      overdue = 0,
      pending = 0;

    for (const ev of evaluations) {
      const pct = getProgressPercentage(ev.progress);
      if (pct === 100) completed++;
      else if (pct > 0) inProgress++;
      else pending++;

      if (pct < 100 && isOverdue(ev.endDate)) overdue++;
    }

    return { total, completed, inProgress, overdue, pending };
  }, [evaluations]);

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 backdrop-blur-sm">
        <Card className="max-w-md w-full text-center border-white/50 bg-white/70 backdrop-blur-lg shadow-2xl">
          <CardHeader>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center"
            >
              <AlertCircle className="h-8 w-8 text-red-500" />
            </motion.div>
            <CardTitle className="text-red-600">Something went wrong</CardTitle>
            <CardDescription className="text-gray-600">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
            >
              <Zap className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 backdrop-blur-sm pb-12">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-200/10 to-cyan-200/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-gradient-to-br from-amber-200/10 to-orange-200/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-10 space-y-8">
        {/* Header with User Menu */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-xl shadow-blue-500/30"
            >
              <BookOpen className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Evaluation Dashboard
              </h1>
              <p className="text-gray-600 mt-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Manage and track your assigned answer sheet evaluations
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

            <Badge className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white border-0 shadow-md">
              <Shield className="h-3.5 w-3.5 mr-1.5" />
              Evaluator
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="gap-2 cursor-pointer rounded-full px-3 hover:bg-white/50 backdrop-blur-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col justify-center items-start">
                    <span className="hidden sm:inline font-medium">
                      {currentUserMail || "User"}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {Cookies.get("role")}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 border-white/50 bg-white/90 backdrop-blur-lg"
              >
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => {
                    Cookies.remove("token");
                    Cookies.remove("mail");
                    router.replace("/evaluate");
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats Cards with Glassmorphism */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatCard
              title="Total Assignments"
              value={stats.total}
              icon={BookOpen}
              color="from-blue-500 to-cyan-500"
              trend={`${stats.pending} pending`}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatCard
              title="In Progress"
              value={stats.inProgress}
              icon={TrendingUp}
              color="from-amber-500 to-orange-500"
              trend={`${Math.round((stats.inProgress / stats.total) * 100) || 0}%`}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatCard
              title="Completed"
              value={stats.completed}
              icon={CheckCircle2}
              color="from-emerald-500 to-green-500"
              trend={`${Math.round((stats.completed / stats.total) * 100) || 0}%`}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StatCard
              title="Overdue"
              value={stats.overdue}
              icon={AlertCircle}
              color="from-rose-500 to-pink-500"
              trend="Requires attention"
            />
          </motion.div>
        </div>

        {/* Main Content Area */}
        <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Left Column - Filters */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-white/50 bg-white/50 backdrop-blur-lg shadow-xl">
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
                      placeholder="Search evaluations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/70 backdrop-blur-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-white/70 backdrop-blur-sm">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-lg">
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="not-started">Not Started</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Semester</label>
                  <Select
                    value={semesterFilter}
                    onValueChange={setSemesterFilter}
                  >
                    <SelectTrigger className="bg-white/70 backdrop-blur-sm">
                      <SelectValue placeholder="All semesters" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-lg">
                      <SelectItem value="all">All Semesters</SelectItem>
                      {[...new Set(evaluations.map((e) => e.semester))]
                        .sort((a, b) => a - b)
                        .map((sem) => (
                          <SelectItem key={sem} value={sem.toString()}>
                            Semester {sem}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort by</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-white/70 backdrop-blur-sm">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-lg">
                      <SelectItem value="dueDate">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          Due Date
                        </div>
                      </SelectItem>
                      <SelectItem value="progress">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Progress
                        </div>
                      </SelectItem>
                      <SelectItem value="name">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Name
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setSemesterFilter("all");
                    setSortBy("dueDate");
                    setActiveTab("all");
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-white/50 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 backdrop-blur-lg shadow-xl">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Evaluation Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pending Review</span>
                  <Badge variant="outline">{stats.pending}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Due This Week</span>
                  <Badge variant="outline">
                    {
                      evaluations.filter((e) => {
                        const date = new Date(
                          e.endDate.split("-").reverse().join("-"),
                        );
                        const weekFromNow = new Date();
                        weekFromNow.setDate(weekFromNow.getDate() + 7);
                        return date <= weekFromNow && date >= new Date();
                      }).length
                    }
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg. Progress</span>
                  <Badge variant="outline">
                    {evaluations.length > 0
                      ? `${Math.round(evaluations.reduce((acc, e) => acc + getProgressPercentage(e.progress), 0) / evaluations.length)}%`
                      : "0%"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Evaluations */}
          <div className="lg:col-span-3">
            <Card className="border-white/50 bg-white/50 backdrop-blur-lg shadow-xl">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Evaluation Assignments</CardTitle>
                    <CardDescription>
                      {displayedEvaluations.length} of {evaluations.length}{" "}
                      assignments
                    </CardDescription>
                  </div>

                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full sm:w-auto"
                  >
                    <TabsList className="bg-white/70 backdrop-blur-sm">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="overdue" className="relative">
                        {stats.overdue > 0 && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full" />
                        )}
                        Overdue
                      </TabsTrigger>
                      <TabsTrigger value="pending">Pending</TabsTrigger>
                      <TabsTrigger value="completed">Completed</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>

              <CardContent>
                <AnimatePresence mode="wait">
                  {displayedEvaluations.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <EmptyEvaluationsState />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6"
                    >
                      {displayedEvaluations.map((evalItem, index) => (
                        <motion.div
                          key={evalItem._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <EvaluationCard
                            evaluation={evalItem}
                            courseName={
                              courses.find((c) => c.uuid === evalItem.course)
                                ?.name ?? "—"
                            }
                            percentage={getProgressPercentage(
                              evalItem.progress,
                            )}
                            isOverdue={isOverdue(evalItem.endDate)}
                            formatDate={formatDate}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Mobile Filters Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="fixed bottom-6 right-6 lg:hidden rounded-full shadow-lg bg-white/80 backdrop-blur-sm"
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
                  <SheetDescription>
                    Filter your evaluation assignments
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search evaluations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="in-progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="not-started">
                            Not Started
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Semester</label>
                      <Select
                        value={semesterFilter}
                        onValueChange={setSemesterFilter}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Semester" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          {[...new Set(evaluations.map((e) => e.semester))]
                            .sort((a, b) => a - b)
                            .map((sem) => (
                              <SelectItem key={sem} value={sem.toString()}>
                                Sem {sem}
                              </SelectItem>
                            ))}
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
                      setSemesterFilter("all");
                      setSortBy("dueDate");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Components
// ────────────────────────────────────────────────

function StatCard({ title, value, icon: Icon, color, trend }) {
  return (
    <Card className="border-white/50 bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && <p className="text-xs text-gray-500 mt-2">{trend}</p>}
          </div>
          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div
          className={`mt-4 h-1 w-full bg-gradient-to-r ${color} rounded-full`}
        />
      </CardContent>
    </Card>
  );
}

function EvaluationCard({
  evaluation,
  courseName,
  percentage,
  isOverdue,
  formatDate,
}) {
  const statusConfig = {
    completed: {
      badge: "bg-gradient-to-r from-emerald-500 to-green-500",
      icon: CheckCircle2,
      text: "Completed",
    },
    overdue: {
      badge: "bg-gradient-to-r from-rose-500 to-pink-500",
      icon: AlertCircle,
      text: "Overdue",
    },
    progress: {
      badge: "bg-gradient-to-r from-blue-500 to-cyan-500",
      icon: TrendingUp,
      text: "In Progress",
    },
    notStarted: {
      badge: "bg-gradient-to-r from-gray-400 to-gray-300",
      icon: Clock,
      text: "Not Started",
    },
  };

  const getStatus = () => {
    if (percentage === 100) return statusConfig.completed;
    if (isOverdue) return statusConfig.overdue;
    if (percentage > 0) return statusConfig.progress;
    return statusConfig.notStarted;
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  const progressColor = () => {
    if (percentage === 100) return "from-emerald-400 to-green-400";
    if (percentage >= 75) return "from-blue-400 to-cyan-400";
    if (percentage >= 50) return "from-amber-400 to-orange-400";
    if (percentage >= 25) return "from-orange-400 to-red-400";
    return "from-rose-400 to-pink-400";
  };

  return (
    <Link href={`/evaluate/home/check/${evaluation._id}`} className="block">
      <Card className="h-full border-white/50 bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-lg shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start gap-2">
            <Badge className={`${status.badge} text-white border-0 shadow-sm`}>
              <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
              {status.text}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-white/95 backdrop-blur-lg"
              >
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Download Reports
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-rose-600">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Report Issue
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <CardTitle className="mt-4 text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
            {evaluation.name}
          </CardTitle>
          <CardDescription className="line-clamp-1 mt-1">
            {courseName}
          </CardDescription>

          <div className="flex items-center gap-2 mt-3">
            <Badge variant="outline" className="text-xs bg-white/50">
              Sem {evaluation.semester}
            </Badge>
            <Badge variant="outline" className="text-xs bg-white/50">
              <Users className="h-3 w-3 mr-1" />
              {evaluation.progress.uploaded} students
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 font-medium">Progress</span>
              <span className="font-bold text-gray-900">{percentage}%</span>
            </div>
            <div className="relative">
              <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${progressColor()} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>
                  {evaluation.progress.checked} of{" "}
                  {evaluation.progress.uploaded}
                </span>
                <span>100%</span>
              </div>
            </div>
          </div>

          <Separator className="bg-gray-200/50" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                <CalendarDays
                  className={`h-5 w-5 ${isOverdue ? "text-rose-500" : "text-blue-500"}`}
                />
              </div>
              <div>
                <p className="text-xs text-gray-500">Due Date</p>
                <p
                  className={`font-medium ${isOverdue ? "text-rose-600" : "text-gray-900"}`}
                >
                  {formatDate(evaluation.endDate)}
                </p>
              </div>
            </div>

            <motion.div
              className="opacity-0 group-hover:opacity-100 transition-all duration-300"
              whileHover={{ x: 5 }}
            >
              <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
                <ChevronRight className="h-5 w-5 text-white" />
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function DashboardLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="w-14 h-14 rounded-2xl" />
            <div className="space-y-3">
              <Skeleton className="h-9 w-64 rounded-lg" />
              <Skeleton className="h-5 w-96 rounded-lg" />
            </div>
          </div>
          <Skeleton className="w-32 h-10 rounded-full" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Skeleton
                key={i}
                className="h-32 rounded-2xl bg-white/50 backdrop-blur-lg"
              />
            ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Skeleton */}
          <div className="lg:col-span-1 space-y-6">
            <Skeleton className="h-96 rounded-2xl bg-white/50 backdrop-blur-lg" />
            <Skeleton className="h-48 rounded-2xl bg-white/50 backdrop-blur-lg" />
          </div>

          {/* Evaluations Skeleton */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              <Skeleton className="h-20 rounded-2xl bg-white/50 backdrop-blur-lg" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton
                      key={i}
                      className="h-64 rounded-2xl bg-white/50 backdrop-blur-lg"
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyEvaluationsState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="relative mb-8">
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100/50 to-indigo-100/50 rounded-3xl flex items-center justify-center backdrop-blur-sm">
          <BookOpen className="h-16 w-16 text-blue-500/50" />
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-2 border-dashed border-blue-200/50 rounded-3xl"
        />
        <div className="absolute -top-3 -right-3 bg-gradient-to-br from-amber-400 to-orange-500 text-white p-3 rounded-full shadow-xl">
          <Sparkles className="h-6 w-6" />
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          No Evaluations Assigned
        </h3>
        <p className="text-gray-600">
          You don't have any answer sheet evaluation assignments at the moment.
          New assignments will appear here once they are assigned to you.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="gap-2 rounded-full px-6 bg-white/70 backdrop-blur-sm"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
        <Button className="gap-2 rounded-full px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
          <BookOpen className="h-4 w-4" />
          View Guidelines
        </Button>
      </div>
    </motion.div>
  );
}
