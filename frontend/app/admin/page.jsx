"use client";
import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { formatDateRange } from "little-date";
import {
  TrendingUp,
  PlusIcon,
  Users,
  BookOpen,
  FileCheck,
  Upload,
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

// Chart configuration
const chartData = [
  { browser: "chrome", visitors: 275, fill: "hsl(var(--chart-1))" },
  { browser: "safari", visitors: 200, fill: "hsl(var(--chart-2))" },
  { browser: "firefox", visitors: 287, fill: "hsl(var(--chart-3))" },
  { browser: "edge", visitors: 173, fill: "hsl(var(--chart-4))" },
  { browser: "other", visitors: 190, fill: "hsl(var(--chart-5))" },
];

const chartConfig = {
  visitors: { label: "Visitors" },
  chrome: { label: "Chrome", color: "hsl(var(--chart-1))" },
  safari: { label: "Safari", color: "hsl(var(--chart-2))" },
  firefox: { label: "Firefox", color: "hsl(var(--chart-3))" },
  edge: { label: "Edge", color: "hsl(var(--chart-4))" },
  other: { label: "Other", color: "hsl(var(--chart-5))" },
};

// Enhanced placeholder data
const totalTableData = {
  examsCreated: 50,
  subjectsCreated: 10,
  answerBooksEvaluated: 200,
  answerBooksUploaded: 250,
};

const pendingEvaluations = [
  {
    examiner: "Dr. Smith",
    pending: 15,
    department: "Mathematics",
    priority: "high",
  },
  {
    examiner: "Prof. Jones",
    pending: 8,
    department: "Physics",
    priority: "medium",
  },
  {
    examiner: "Ms. Taylor",
    pending: 22,
    department: "Chemistry",
    priority: "high",
  },
  { examiner: "Dr. Brown", pending: 5, department: "Biology", priority: "low" },
];

const progressData = {
  faculty: [
    { name: "Dr. Smith", progress: 85, target: 100 },
    { name: "Prof. Jones", progress: 70, target: 90 },
    { name: "Ms. Taylor", progress: 45, target: 80 },
  ],
  course: [
    { name: "Mathematics", progress: 90, target: 100 },
    { name: "Physics", progress: 65, target: 85 },
    { name: "Chemistry", progress: 78, target: 95 },
  ],
};

const initialEvents = [
  {
    id: 1,
    title: "Math Exam",
    from: "2025-06-12T09:00:00",
    to: "2025-06-12T10:00:00",
    isExam: true,
    description: "Final examination for Calculus II",
  },
  {
    id: 2,
    title: "Physics Exam",
    from: "2025-06-13T11:30:00",
    to: "2025-06-13T12:30:00",
    isExam: true,
    description: "Quantum mechanics midterm",
  },
  {
    id: 3,
    title: "Evaluation Meeting",
    from: "2025-06-14T14:00:00",
    to: "2025-06-14T15:00:00",
    isExam: false,
    description: "Monthly evaluation progress review",
  },
];

// Loading Skeleton Components
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="bg-muted/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Enhanced Pie Chart Component
// function ChartPieDonutText() {
//   const totalVisitors = useMemo(() => {
//     return chartData.reduce((acc, curr) => acc + curr.visitors, 0);
//   }, []);

//   return (
//     <Card className="flex flex-col bg-muted/50 h-full">
//       <CardHeader className="items-center pb-0">
//         <CardTitle className="text-lg">Evaluation Distribution</CardTitle>
//         <CardDescription>January - June 2024</CardDescription>
//       </CardHeader>
//       <CardContent className="flex-1 flex items-center justify-center p-4">
//         <ChartContainer
//           config={chartConfig}
//           className="w-full aspect-square max-w-[200px]"
//         >
//           <ResponsiveContainer width="100%" height="100%">
//             <PieChart>
//               <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
//               <Pie
//                 data={chartData}
//                 dataKey="visitors"
//                 nameKey="browser"
//                 innerRadius={50}
//                 outerRadius={80}
//                 strokeWidth={2}
//               >
//                 <Label
//                   content={({ viewBox }) => {
//                     if (viewBox && "cx" in viewBox && "cy" in viewBox) {
//                       return (
//                         <text
//                           x={viewBox.cx}
//                           y={viewBox.cy}
//                           textAnchor="middle"
//                           dominantBaseline="middle"
//                         >
//                           <tspan
//                             x={viewBox.cx}
//                             y={viewBox.cy}
//                             className="fill-foreground text-xl font-bold"
//                           >
//                             {totalVisitors.toLocaleString()}
//                           </tspan>
//                           <tspan
//                             x={viewBox.cx}
//                             y={(viewBox.cy || 0) + 20}
//                             className="fill-muted-foreground text-xs"
//                           >
//                             Total
//                           </tspan>
//                         </text>
//                       );
//                     }
//                   }}
//                 />
//               </Pie>
//             </PieChart>
//           </ResponsiveContainer>
//         </ChartContainer>
//       </CardContent>
//     </Card>
//   );
// }

// Stats Cards Component
function StatsCards({ data, exams, subjects, sheetsEval, sheetsUp }) {
  const stats = [
    {
      label: "Exams Created",
      value: exams,
      icon: BookOpen,
      description: "Total exams",
      color: "text-blue-600",
    },
    {
      label: "Subjects Created",
      value: subjects,
      icon: Users,
      description: "Active subjects",
      color: "text-green-600",
    },
    {
      label: "Books Evaluated",
      value: sheetsEval,
      icon: FileCheck,
      description: "Completed evaluations",
      color: "text-purple-600",
    },
    {
      label: "Books Uploaded",
      value: sheetsUp,
      icon: Upload,
      description: "Total uploads",
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card
          key={stat.color}
          className="bg-muted/50 hover:bg-muted/70 transition-colors"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </div>
              <div className={`p-3 rounded-full bg-background ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Enhanced Calendar Component
function Calendar31({ events, onAddEvent }) {
  const [date, setDate] = useState(new Date(2025, 5, 12));
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventFrom, setNewEventFrom] = useState("");
  const [newEventTo, setNewEventTo] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");

  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.from).toDateString();
    return eventDate === date.toDateString();
  });

  const tileClassName = ({ date }) => {
    const hasExam = events.some(
      (event) =>
        event.isExam &&
        new Date(event.from).toDateString() === date.toDateString()
    );
    return hasExam ? "bg-red-100 dark:bg-red-900/30 rounded-full" : "";
  };

  const handleAddEvent = () => {
    if (!newEventTitle || !newEventFrom || !newEventTo) {
      alert("Please fill in all required fields");
      return;
    }
    const fromDateTime = new Date(
      `${date.toISOString().split("T")[0]}T${newEventFrom}:00`
    );
    const toDateTime = new Date(
      `${date.toISOString().split("T")[0]}T${newEventTo}:00`
    );
    if (toDateTime <= fromDateTime) {
      alert("End time must be after start time");
      return;
    }
    onAddEvent({
      id: Date.now(),
      title: newEventTitle,
      from: fromDateTime.toISOString(),
      to: toDateTime.toISOString(),
      isExam: newEventTitle.toLowerCase().includes("exam"),
      description: newEventDescription,
    });
    setNewEventTitle("");
    setNewEventFrom("");
    setNewEventTo("");
    setNewEventDescription("");
    setIsAddEventDialogOpen(false);
  };

  return (
    <>
      <Card className="h-max flex flex-col w-max">
        <CardHeader className="">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Academic Calendar</CardTitle>
              <CardDescription>Upcoming exams and events</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddEventDialogOpen(true)}
              className="h-8"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Event
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-4">
          <div className="flex flex-col gap-3h-full">
            <div className="">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                tileClassName={tileClassName}
                required
              />
            </div>
            <div className="flex flex-col">
              <h3 className="font-semibold mb-3 text-sm">
                Events for{" "}
                {date?.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </h3>
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px]">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        event.isExam
                          ? "border-l-red-500 bg-red-50 dark:bg-red-950/20"
                          : "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-medium text-sm">{event.title}</div>
                        <Badge
                          variant={event.isExam ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {event.isExam ? "Exam" : "Event"}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground text-xs mt-1">
                        {formatDateRange(
                          new Date(event.from),
                          new Date(event.to)
                        )}
                      </div>
                      {event.description && (
                        <div className="text-muted-foreground text-xs mt-2">
                          {event.description}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No events scheduled for this date
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isAddEventDialogOpen}
        onOpenChange={setIsAddEventDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Schedule an event for {date?.toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="event-title" className="text-sm font-medium">
                Event Title *
              </label>
              <Input
                id="event-title"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="Enter event title"
              />
            </div>
            <div className="grid gap-2">
              <label
                htmlFor="event-description"
                className="text-sm font-medium"
              >
                Description
              </label>
              <Input
                id="event-description"
                value={newEventDescription}
                onChange={(e) => setNewEventDescription(e.target.value)}
                placeholder="Enter event description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="event-from" className="text-sm font-medium">
                  Start Time *
                </label>
                <Input
                  id="event-from"
                  type="time"
                  value={newEventFrom}
                  onChange={(e) => setNewEventFrom(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="event-to" className="text-sm font-medium">
                  End Time *
                </label>
                <Input
                  id="event-to"
                  type="time"
                  value={newEventTo}
                  onChange={(e) => setNewEventTo(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddEventDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddEvent}>Add Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Enhanced Pending Evaluations Component
function PendingEvaluations() {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100 dark:bg-red-900/30";
      case "medium":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
      case "low":
        return "text-green-600 bg-green-100 dark:bg-green-900/30";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/30";
    }
  };

  return (
    <Card className="h-full w-full bg-muted/50">
      <CardHeader>
        <CardTitle>Pending Evaluations</CardTitle>
        <CardDescription>Examiners with pending answer scripts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingEvaluations.map((item) => (
            <div
              key={item.examiner}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{item.examiner}</span>
                  <span className="text-muted-foreground text-xs">
                    {item.department}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={getPriorityColor(item.priority)}
                >
                  {item.priority}
                </Badge>
                <div className="text-right">
                  <div className="font-semibold text-sm">{item.pending}</div>
                  <div className="text-muted-foreground text-xs">pending</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Progress Status Component
function ProgressStatus() {
  return (
    <Card className="h-full w-full bg-muted/50">
      <CardHeader>
        <CardTitle>Evaluation Progress</CardTitle>
        <CardDescription>
          Current progress by faculty and course
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-3">Faculty Progress</h3>
          <div className="space-y-4">
            {progressData.faculty.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span className="font-medium">{item.progress}%</span>
                </div>
                <Progress value={item.progress} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  Target: {item.target}%
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium mb-3">Course Progress</h3>
          <div className="space-y-4">
            {progressData.course.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span className="font-medium">{item.progress}%</span>
                </div>
                <Progress value={item.progress} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  Target: {item.target}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Dashboard Component
export default function Page() {
  const [events, setEvents] = useState(initialEvents);
  const [iid, setIid] = useState(null);
  const [institute, setInstitute] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sheets, setSheets] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [qps, setQps] = useState([]);

  useEffect(() => {
    setToken(Cookies.get("token"));
    setIid(Cookies.get("iid"));
  }, []);

  useEffect(() => {
    if (!token || !iid) return;

    const getData = async () => {
      try {
        setLoading(true);
        // Simulate API delay for better UX
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/institute`,
          {
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const qpRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/qp`,
          {
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const subRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subject`,
          {
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const sheetRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/answer-sheet`,
          {
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch institute data");
        if (!qpRes.ok) throw new Error("Failed to fetch exams");
        if (!subRes.ok) throw new Error("Failed to fetch subjects");
        if (!sheetRes.ok) throw new Error("Failed to fetch answer sheets");

        const data = await res.json();
        const qpData = await qpRes.json();
        const subData = await subRes.json();
        const sheetData = await sheetRes.json();
        const user_ins = data.find((el) => el.IID === Number(iid));
        setInstitute(user_ins);
        setQps(qpData);
        setSubjects(subData);
        setSheets(sheetData);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [token, iid]);

  const handleAddEvent = (newEvent) => {
    setEvents((prev) => [...prev, newEvent]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <Card className="bg-muted/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-64" />
                </div>
              </div>
            </CardContent>
          </Card>

          <StatsSkeleton />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-lg" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            </div>
            <Skeleton className="h-[600px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-5 gap-5">
      <div className="mx-auto space-y-6">
        {/* Header Section */}
        <Card className="bg-gradient-to-r from-primary/5 to-muted/50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="h-9 w-9 cursor-pointer rounded-md border bg-background p-2 hover:bg-muted" />
                <div>
                  <h1 className="text-xl font-semibold">
                    Welcome to {institute?.name || "Academic Portal"}
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Your evaluators have completed 95% of paper checking for
                    this semester
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="flex items-center gap-1 w-fit"
              >
                <TrendingUp className="h-3 w-3" />
                Excellent Progress
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <StatsCards
          data={totalTableData}
          exams={qps.length}
          subjects={subjects.length}
          sheetsEval={
            sheets.filter((sheet) => sheet.status === "Completed").length
          }
          sheetsUp={sheets.length}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 on desktop */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress and Pending Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProgressStatus />
              <PendingEvaluations />
            </div>

            {/* Chart Row */}
            {/* <ChartPieDonutText /> */}
          </div>

          {/* Right Column - Calendar */}
          <div className="lg:col-span-1">
            <Calendar31 events={events} onAddEvent={handleAddEvent} />
          </div>
        </div>
      </div>
    </div>
  );
}
