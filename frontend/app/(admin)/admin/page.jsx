"use client";

import React, { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { RefreshCw, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const [date, setDate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data - replace with real data in production
  const facultyProgress = [
    {
      name: "Dr. Smith",
      department: "Computer Science",
      progress: 92,
      status: "completed",
    },
    {
      name: "Dr. Johnson",
      department: "Mathematics",
      progress: 87,
      status: "in-progress",
    },
    {
      name: "Dr. Williams",
      department: "Physics",
      progress: 45,
      status: "in-progress",
    },
    {
      name: "Dr. Brown",
      department: "Chemistry",
      progress: 100,
      status: "completed",
    },
    {
      name: "Dr. Davis",
      department: "Biology",
      progress: 76,
      status: "in-progress",
    },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 w-full md:p-6 lg:p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 justify-center items-center">
              <SidebarTrigger className="mt-1 mb-1" />
              <h1 className="text-2xl font-bold text-gray-900">
                Evaluation Dashboard
              </h1>
            </div>
            <p className="text-sm text-gray-500">
              XYZ College - Academic Year 2023-2024
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              Export Report
            </Button>
            <Button size="sm">Send Reminders</Button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Welcome, XYZ College</span>
                <Badge variant="success">95% Complete</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="space-y-4 flex-1">
                  <p className="text-gray-600">
                    The evaluation process is almost complete. Only a few
                    faculty members remain to submit their evaluations.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Overall Progress
                      </span>
                      <span className="text-sm font-medium">95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                      <p className="text-2xl font-bold mt-1">42</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium">In Progress</span>
                      </div>
                      <p className="text-2xl font-bold mt-1">8</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium">Not Started</span>
                      </div>
                      <p className="text-2xl font-bold mt-1">2</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 hidden md:block">
                  <img
                    src="/evaluation.jpg"
                    alt="Evaluation progress visualization"
                    className="rounded-lg object-cover w-full h-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar Card */}
          <Card>
            <CardHeader>
              <CardTitle>Event Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
                <div className="text-sm">
                  {date ? (
                    <p className="font-medium">
                      Selected:{" "}
                      {date.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  ) : (
                    <p className="text-gray-500">No date selected</p>
                  )}
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Upcoming Deadlines</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center space-x-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                      <span>Faculty submissions due: May 15</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                      <span>Department review: May 20-25</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      <span>Final reports published: June 1</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Faculty Progress Card */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Faculty Progress</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Faculty Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facultyProgress.map((faculty) => (
                      <TableRow key={faculty.name}>
                        <TableCell className="font-medium">
                          {faculty.name}
                        </TableCell>
                        <TableCell>{faculty.department}</TableCell>
                        <TableCell>
                          <Progress value={faculty.progress} className="h-2" />
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              faculty.status === "completed"
                                ? "success"
                                : faculty.progress > 50
                                ? "warning"
                                : "danger"
                            }
                          >
                            {faculty.status === "completed"
                              ? "Completed"
                              : "In Progress"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="link" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Percentage Card */}
          <Card>
            <CardHeader>
              <CardTitle>Evaluation Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Completion Rate</h3>
                <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: "95%" }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  95% of evaluations submitted
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Average Rating</h3>
                <div className="flex items-center">
                  <div className="text-3xl font-bold mr-2">4.2</div>
                  <div className="text-sm text-gray-500">/ 5.0</div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Up from 4.0 last semester
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Response Rate</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: "78%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm font-medium">78%</div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Student participation
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
