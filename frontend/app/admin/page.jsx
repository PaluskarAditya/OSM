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
  ChevronRight,
  BarChart3,
  CalendarDays,
  ClipboardList,
  UserCheck,
  Download,
  MoreVertical,
  Filter,
  Search,
  RefreshCw,
} from "lucide-react";
import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Cookies from "js-cookie";

// Chart Data
const chartData = [
  { name: "Math", value: 275, fill: "hsl(var(--chart-1))", color: "#3b82f6" },
  { name: "Physics", value: 200, fill: "hsl(var(--chart-2))", color: "#10b981" },
  { name: "Chemistry", value: 287, fill: "hsl(var(--chart-3))", color: "#8b5cf6" },
  { name: "Biology", value: 173, fill: "hsl(var(--chart-4))", color: "#f59e0b" },
  { name: "Others", value: 190, fill: "hsl(var(--chart-5))", color: "#ef4444" },
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <Skeleton className="h-4 w-28 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
              <Skeleton className="h-12 w-12 rounded-xl" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <Card className="border border-gray-200/50">
      <CardHeader>
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="h-4 w-32 rounded-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full rounded-xl" />
      </CardContent>
    </Card>
  );
}

function CalendarSkeleton() {
  return (
    <Card className="h-full border border-gray-200/50">
      <CardHeader>
        <Skeleton className="h-6 w-40 rounded-lg" />
        <Skeleton className="h-4 w-28 rounded-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-96 w-full rounded-xl" />
      </CardContent>
    </Card>
  );
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
      border: "border-blue-100",
      trend: "+12%",
    },
    {
      label: "Active Subjects",
      value: subjects,
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      trend: "+8%",
    },
    {
      label: "Evaluated",
      value: evaluated,
      icon: CheckCircle2,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100",
      trend: "+24%",
    },
    {
      label: "Uploaded",
      value: uploaded,
      icon: Upload,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
      trend: "+15%",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat) => (
        <Card 
          key={stat.label} 
          className={`group hover:shadow-lg transition-all duration-300 border ${stat.border} hover:-translate-y-1 hover:border-gray-300`}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <Badge variant="outline" className="text-xs border-green-200 bg-green-50 text-green-700">
                    {stat.trend}
                  </Badge>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>This month</span>
                <span className="font-medium">View details</span>
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
    <Card className="border border-gray-200 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Evaluation Distribution
            </CardTitle>
            <CardDescription className="text-gray-500">
              By subject area
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View details</DropdownMenuItem>
              <DropdownMenuItem>Export data</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Refresh</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-xs">
          <ChartContainer config={chartConfig} className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <ChartTooltip 
                  content={<ChartTooltipContent hideLabel className="bg-white shadow-lg border rounded-lg" />} 
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={2}
                  strokeWidth={2}
                  stroke="white"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        <div className="mt-6 w-full">
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-gray-900">{total}</div>
            <div className="text-sm text-gray-500">Total evaluations</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {chartData.map((item) => (
              <div key={item.name} className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {item.name}
                  </span>
                </div>
                <div className="text-lg font-semibold mt-1">{item.value}</div>
                <div className="text-xs text-gray-500">
                  {Math.round((item.value / total) * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
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
      ? "bg-red-50 rounded-lg"
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
      <Card className="h-full border border-gray-200 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Academic Calendar
              </CardTitle>
              <CardDescription className="text-gray-500">
                Upcoming exams & events
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9">
                <CalendarDays className="h-4 w-4 mr-2" />
                Today
              </Button>
              <Button size="sm" onClick={() => setOpen(true)} className="h-9">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="w-full"
              classNames={{
                day: "h-9 w-9 rounded-lg hover:bg-gray-100",
                day_selected: "bg-blue-600 text-white hover:bg-blue-700",
                day_today: "bg-gray-100 font-semibold",
              }}
              tileClassName={tileClassName}
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                {date.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </h3>
              <Badge variant="outline" className="text-xs">
                {dayEvents.length} {dayEvents.length === 1 ? "event" : "events"}
              </Badge>
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {dayEvents.length > 0 ? (
                dayEvents.map((e) => (
                  <div
                    key={e.id}
                    className={`p-4 rounded-lg border transition-all hover:shadow-sm ${
                      e.isExam
                        ? "border-red-200 bg-red-50/50 hover:bg-red-50"
                        : "border-blue-200 bg-blue-50/50 hover:bg-blue-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-md ${
                            e.isExam ? "bg-red-100" : "bg-blue-100"
                          }`}>
                            {e.isExam ? (
                              <FileCheck className="h-4 w-4 text-red-600" />
                            ) : (
                              <Users className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <span className="font-semibold text-gray-900">
                            {e.title}
                          </span>
                          <Badge
                            variant={e.isExam ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {e.isExam ? "Exam" : "Event"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-2 ml-9">
                          {formatDateRange(new Date(e.from), new Date(e.to))}
                        </p>
                        {e.description && (
                          <p className="text-sm text-gray-500 mt-2 ml-9">
                            {e.description}
                          </p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                  <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No events scheduled</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Add an event to get started
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Add New Event</DialogTitle>
            <DialogDescription className="text-gray-600">
              Schedule for {date.toLocaleDateString("en-US", { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-700">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Math Final Exam"
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-700">Description</Label>
              <Input
                id="description"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Optional details"
                className="bg-gray-50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from" className="text-gray-700">Start Time *</Label>
                <Input
                  id="from"
                  type="time"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to" className="text-gray-700">End Time *</Label>
                <Input
                  id="to"
                  type="time"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="bg-gray-50"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAdd}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Pending Evaluations
function PendingEvaluationsList() {
  const data = [
    { 
      name: "Dr. Smith", 
      dept: "Mathematics", 
      pending: 15, 
      priority: "high",
      avatar: "DS"
    },
    { 
      name: "Prof. Jones", 
      dept: "Physics", 
      pending: 8, 
      priority: "medium",
      avatar: "PJ"
    },
    { 
      name: "Ms. Taylor", 
      dept: "Chemistry", 
      pending: 22, 
      priority: "high",
      avatar: "MT"
    },
    { 
      name: "Dr. Brown", 
      dept: "Biology", 
      pending: 5, 
      priority: "low",
      avatar: "DB"
    },
  ];

  const priorityConfig = {
    high: { 
      color: "bg-red-100 text-red-700 border-red-200",
      icon: AlertCircle,
      label: "High Priority"
    },
    medium: { 
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
      icon: Clock,
      label: "Medium Priority"
    },
    low: { 
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
      label: "Low Priority"
    },
  };

  return (
    <Card className="border border-gray-200 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Pending Evaluations
            </CardTitle>
            <CardDescription className="text-gray-500">
              Examiners with evaluation backlog
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="h-3.5 w-3.5 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item) => {
          const PriorityIcon = priorityConfig[item.priority].icon;
          return (
            <div
              key={item.name}
              className="group flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-gray-200">
                  <AvatarFallback className="bg-gray-100 text-gray-700">
                    {item.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {item.name}
                  </p>
                  <p className="text-sm text-gray-500">{item.dept}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Badge className={priorityConfig[item.priority].color}>
                      <PriorityIcon className="h-3 w-3 mr-1" />
                      {priorityConfig[item.priority].label}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {item.pending}
                    </p>
                    <p className="text-xs text-gray-500">pending sheets</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
      <CardFooter className="border-t border-gray-200 bg-gray-50/50">
        <Button variant="ghost" size="sm" className="w-full text-gray-600 hover:text-gray-900">
          View all examiners
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
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
      id: e._id,
      name: e.name,
      examiners: e.examiners.map(getName),
      percent,
      total,
      checked,
      color: percent === 100 ? "bg-emerald-500" : 
             percent >= 75 ? "bg-blue-500" : 
             percent >= 50 ? "bg-amber-500" : 
             "bg-red-500"
    };
  });

  return (
    <Card className="border border-gray-200 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Evaluation Progress
            </CardTitle>
            <CardDescription className="text-gray-500">
              Real-time tracking by task
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="h-8 w-32">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {transformed.map((item) => (
          <div key={item.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {item.name}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {item.examiners.length} {item.examiners.length === 1 ? 'examiner' : 'examiners'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {item.examiners.join(", ")}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">
                  {item.percent}%
                </div>
                <div className="text-xs text-gray-500">
                  {item.checked}/{item.total} sheets
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-900">
                  {item.percent === 100 ? "Completed" : 
                   item.percent >= 75 ? "Almost Done" : 
                   item.percent >= 50 ? "In Progress" : "Needs Attention"}
                </span>
              </div>
              <Progress value={item.percent} className="h-2" indicatorClassName={item.color} />
            </div>
            {item.percent < 100 && (
              <Button variant="outline" size="sm" className="w-full text-sm">
                <UserCheck className="h-3.5 w-3.5 mr-2" />
                Assign More Staff
              </Button>
            )}
            <Separator />
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
      title: "Mathematics Final Exam",
      from: "2025-06-12T09:00",
      to: "2025-06-12T10:00",
      isExam: true,
      description: "Calculus II - All sections",
    },
    {
      id: 2,
      title: "Physics Midterm",
      from: "2025-06-13T11:30",
      to: "2025-06-13T12:30",
      isExam: true,
      description: "Quantum Mechanics - Hall A",
    },
    {
      id: 3,
      title: "Evaluation Committee Meeting",
      from: "2025-06-14T14:00",
      to: "2025-06-14T15:00",
      isExam: false,
      description: "Quarterly progress review with department heads",
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
          {/* Header Skeleton */}
          <Skeleton className="h-24 w-full rounded-xl" />
          
          {/* Stats Cards Skeleton */}
          <StatsSkeleton />
          
          {/* Main Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              <ChartSkeleton />
              <div className="grid grid-cols-1 gap-6 md:gap-8">
                <Skeleton className="h-80 rounded-xl" />
                <Skeleton className="h-80 rounded-xl" />
              </div>
            </div>
            <div className="lg:col-span-1">
              <CalendarSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="cursor-pointer h-10 w-10 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors" />
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    {institute?.name || "Academic Portal"}
                  </h1>
                  <p className="text-blue-100 text-sm md:text-base">
                    Welcome to your evaluation management dashboard
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-white text-sm font-medium">
                      System Status: <span className="font-bold">Active</span>
                    </span>
                  </div>
                </div>
                <Badge className="bg-white text-blue-600 hover:bg-white/90 gap-2 py-1.5 px-3">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Excellent Progress
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button className="bg-white text-blue-600 hover:bg-white/90">
                <Plus className="h-4 w-4 mr-2" />
                Quick Action
              </Button>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">95%</div>
                <div className="text-sm text-blue-100">Evaluation Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">24</div>
                <div className="text-sm text-blue-100">Active Examiners</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">8</div>
                <div className="text-sm text-blue-100">Live Exams</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">12h</div>
                <div className="text-sm text-blue-100">Avg. Processing Time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards
          exams={qps.length}
          subjects={subjects.length}
          evaluated={sheets.filter((s) => s.status === "Completed").length}
          uploaded={sheets.length}
        />

        {/* Tabs for Mobile */}
        <div className="lg:hidden">
          <Tabs defaultValue="progress">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>
            <TabsContent value="progress" className="space-y-6">
              <EvaluationProgress evaluations={evaluations} users={users} />
              <EvaluationDistributionChart />
            </TabsContent>
            <TabsContent value="pending">
              <PendingEvaluationsList />
            </TabsContent>
            <TabsContent value="calendar">
              <AcademicCalendar
                events={events}
                onAddEvent={(e) => setEvents((prev) => [...prev, e])}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Grid for Desktop */}
        <div className="hidden lg:grid lg:grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - Progress & Pending */}
          <div className="xl:col-span-2 space-y-6 md:space-y-8">
            <EvaluationProgress evaluations={evaluations} users={users} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <PendingEvaluationsList />
              <EvaluationDistributionChart />
            </div>
          </div>

          {/* Right Column - Calendar */}
          <div className="xl:col-span-1">
            <AcademicCalendar
              events={events}
              onAddEvent={(e) => setEvents((prev) => [...prev, e])}
            />
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-8">
          <Card className="border border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Need assistance?</h3>
                  <p className="text-sm text-gray-500">
                    Contact support or explore our documentation
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Search Help
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Get Support
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}