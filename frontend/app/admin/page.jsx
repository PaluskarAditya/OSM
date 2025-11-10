"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { formatDateRange } from "little-date";
import {
  TrendingUp,
  Plus,
  Users,
  BookOpen,
  FileCheck,
  Upload,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Pie, PieChart, ResponsiveContainer } from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Cookies from "js-cookie";

// Chart Data
const chartData = [
  { name: "Math", value: 275, fill: "hsl(var(--chart-1))" },
  { name: "Physics", value: 200, fill: "hsl(var(--chart-2))" },
  { name: "Chemistry", value: 287, fill: "hsl(var(--chart-3))" },
  { name: "Biology", value: 173, fill: "hsl(var(--chart-4))" },
  { name: "Others", value: 190, fill: "hsl(var(--chart-5))" },
];

const chartConfig = {
  value: { label: "Evaluations" },
  ...chartData.reduce(
    (acc, curr) => ({
      ...acc,
      [curr.name]: { label: curr.name, color: curr.fill },
    }),
    {}
  ),
};

// Loading Skeletons
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="bg-muted/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-7 w-16" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return <Skeleton className="h-64 w-full rounded-xl" />;
}

function CalendarSkeleton() {
  return <Skeleton className="h-96 w-full rounded-xl" />;
}

// Stats Cards
function StatsCards({ exams, subjects, evaluated, uploaded }) {
  const stats = [
    {
      label: "Exams Created",
      value: exams,
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Subjects Active",
      value: subjects,
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Evaluated",
      value: evaluated,
      icon: CheckCircle2,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Uploaded",
      value: uploaded,
      icon: Upload,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-2.5 rounded-full ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Pie Chart
function EvaluationDistributionChart() {
  const total = useMemo(() => chartData.reduce((a, c) => a + c.value, 0), []);

  return (
    <Card className="col-span-1 lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-lg">Evaluation Distribution</CardTitle>
        <CardDescription>By Subject</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center p-4">
        <ChartContainer
          config={chartConfig}
          className="h-56 w-full max-w-[220px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={3}
              >
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-foreground text-2xl font-bold"
                >
                  {total}
                </text>
                <text
                  x="50%"
                  y="58%"
                  textAnchor="middle"
                  className="fill-muted-foreground text-xs"
                >
                  Total
                </text>
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Calendar Component
function AcademicCalendar({ events, onAddEvent }) {
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const dayEvents = events.filter(
    (e) => new Date(e.from).toDateString() === date.toDateString()
  );

  const tileClassName = ({ date: d }) =>
    events.some(
      (e) => e.isExam && new Date(e.from).toDateString() === d.toDateString()
    )
      ? "bg-red-100 rounded-full"
      : "";

  const handleAdd = () => {
    if (!title || !from || !to) return;
    const start = new Date(`${date.toISOString().split("T")[0]}T${from}`);
    const end = new Date(`${date.toISOString().split("T")[0]}T${to}`);
    if (end <= start) return alert("End time must be after start");

    onAddEvent({
      id: Date.now(),
      title,
      from: start.toISOString(),
      to: end.toISOString(),
      isExam: title.toLowerCase().includes("exam"),
      description: desc,
    });
    setOpen(false);
    setTitle("");
    setDesc("");
    setFrom("");
    setTo("");
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Academic Calendar</CardTitle>
              <CardDescription>Exams & Events</CardDescription>
            </div>
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            tileClassName={tileClassName}
          />
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <p className="text-sm font-medium">
              {date.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </p>
            {dayEvents.length > 0 ? (
              dayEvents.map((e) => (
                <div
                  key={e.id}
                  className={`p-3 rounded-lg border-l-4 text-sm ${
                    e.isExam
                      ? "border-red-500 bg-red-50"
                      : "border-blue-500 bg-blue-50"
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{e.title}</span>
                    <Badge
                      variant={e.isExam ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {e.isExam ? "Exam" : "Event"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDateRange(new Date(e.from), new Date(e.to))}
                  </p>
                  {e.description && (
                    <p className="text-xs mt-1">{e.description}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground text-sm py-4">
                No events
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
            <DialogDescription>For {date.toDateString()}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Exam / Meeting"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>From *</Label>
                <Input
                  type="time"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div>
                <Label>To *</Label>
                <Input
                  type="time"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Add Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Pending Evaluations
function PendingEvaluationsList() {
  const data = [
    { name: "Dr. Smith", dept: "Mathematics", pending: 15, priority: "high" },
    { name: "Prof. Jones", dept: "Physics", pending: 8, priority: "medium" },
    { name: "Ms. Taylor", dept: "Chemistry", pending: 22, priority: "high" },
    { name: "Dr. Brown", dept: "Biology", pending: 5, priority: "low" },
  ];

  const priorityColor = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-green-100 text-green-700 border-green-200",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Evaluations</CardTitle>
        <CardDescription>Examiners with backlog</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between p-3 rounded-lg border"
          >
            <div>
              <p className="font-medium text-sm">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.dept}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={priorityColor[item.priority]}>
                {item.priority}
              </Badge>
              <div className="text-right">
                <p className="font-semibold text-sm">{item.pending}</p>
                <p className="text-xs text-muted-foreground">pending</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Progress Status
function EvaluationProgress({ evaluations, users }) {
  const getName = (id) => {
    const user = users.find((u) => u._id === id);
    return user ? `${user.FirstName} ${user.LastName}` : "Unknown";
  };

  const transformed = evaluations.map((e) => {
    const total = e.sheets.length;
    const checked = e.progress?.checked || 0;
    const percent = total ? Math.round((checked / total) * 100) : 0;
    return {
      name: e.name,
      examiners: e.examiners.map(getName).join(", "),
      percent,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evaluation Progress</CardTitle>
        <CardDescription>By evaluation task</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {transformed.map((item) => (
          <div key={item.name} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{item.examiners}</span>
              <span>{item.percent}%</span>
            </div>
            <Progress value={item.percent} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Main Dashboard
export default function AdminDashboard() {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Math Exam",
      from: "2025-06-12T09:00",
      to: "2025-06-12T10:00",
      isExam: true,
      description: "Calculus II Final",
    },
    {
      id: 2,
      title: "Physics Exam",
      from: "2025-06-13T11:30",
      to: "2025-06-13T12:30",
      isExam: true,
      description: "Quantum Midterm",
    },
    {
      id: 3,
      title: "Evaluation Meeting",
      from: "2025-06-14T14:00",
      to: "2025-06-14T15:00",
      isExam: false,
      description: "Progress Review",
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [institute, setInstitute] = useState(null);
  const [qps, setQps] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [users, setUsers] = useState([]);

  const token = Cookies.get("token");
  const iid = Cookies.get("iid");

  useEffect(() => {
    if (!token || !iid) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [instRes, qpRes, subRes, sheetRes, evalRes, userRes] =
          await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/institute`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/qp`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subject`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/answer-sheet`,
              { headers: { Authorization: `Bearer ${token}` } }
            ),
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/eval`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        const [inst, qps, subs, sheets, evals, users] = await Promise.all([
          instRes.json(),
          qpRes.json(),
          subRes.json(),
          sheetRes.json(),
          evalRes.json(),
          userRes.json(),
        ]);

        const instData = inst.find((i) => i.IID === Number(iid));
        setInstitute(instData);
        setQps(qps);
        setSubjects(subs);
        setSheets(sheets);
        setEvaluations(evals);
        setUsers(users);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, iid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-20 w-full rounded-xl" />
          <StatsSkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <ChartSkeleton />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-64 rounded-xl" />
                <Skeleton className="h-64 rounded-xl" />
              </div>
            </div>
            <CalendarSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gray-100">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="cursor-pointer h-9 w-9" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {institute?.name || "Academic Portal"}
                  </h1>
                  <p className="text-sm text-gray-600">
                    95% evaluation completed this semester
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Excellent Progress
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <StatsCards
          exams={qps.length}
          subjects={subjects.length}
          evaluated={sheets.filter((s) => s.status === "Completed").length}
          uploaded={sheets.length}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Progress + Pending + Chart */}
          <div className="lg:col-span-2 space-y-6">
            <EvaluationProgress evaluations={evaluations} users={users} />
            <PendingEvaluationsList />
            <EvaluationDistributionChart />
          </div>

          {/* Right: Calendar */}
          <div className="lg:col-span-1">
            <AcademicCalendar
              events={events}
              onAddEvent={(e) => setEvents((prev) => [...prev, e])}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
