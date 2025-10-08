"use client";

import { useMemo, useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Clock, Download, Eye, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function CompletedEvaluations() {
  const [evaluations, setEvaluations] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = Cookies.get("token");

  const getUserEmail = (id) => {
    const user = users.find((user) => user._id === id);
    return user?.Email || "Unknown Examiner";
  };

  const getCourseName = (id) => {
    const course = courses.find((course) => course.uuid === id);
    return course?.name || "Unknown Course";
  };

  const getSubjectName = (id) => {
    const subject = subjects.find((subject) => subject.uuid === id);
    return subject?.name || "Unknown Subject";
  };

  const formatExaminers = (examiners) => {
    const examinerEmails = examiners.map((examiner) => getUserEmail(examiner));
    if (examinerEmails.length <= 2) {
      return examinerEmails.join(", ");
    }
    return `${examinerEmails[0]}, ${examinerEmails[1]} +${
      examinerEmails.length - 2
    }`;
  };

  const handleViewDetails = (id) => {
    console.log("View details for:", id);
    // Implement navigation or modal opening
  };

  const handleDownloadReport = (id) => {
    console.log("Download report for:", id);
    // Implement download functionality
  };

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const [evalRes, usersRes, courseRes, subjectRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/eval`, {
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`, {
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/course`, {
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/subject`, {
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (evalRes.ok && usersRes.ok && courseRes.ok && subjectRes.ok) {
          const evaldata = await evalRes.json();
          const completed = evaldata.filter((el) => el.status === "Completed");
          const userData = await usersRes.json();
          const courseData = await courseRes.json();
          const subjectData = await subjectRes.json();
          setEvaluations(completed);
          setUsers(userData);
          setCourses(courseData);
          setSubjects(subjectData);
        } else {
          throw new Error("Failed to fetch data");
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="cursor-pointer" />
              <div className="p-2 bg-gray-900 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Completed Evaluations
              </h1>
            </div>
            <p className="text-gray-600 max-w-2xl">
              Subjects that have been completely evaluated and verified. All
              answer sheets have been checked and approved.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-gray-900" />
            <span>{evaluations.length} evaluations completed</span>
          </div>
        </div>

        <Separator className="bg-gray-200" />

        {/* Main Content */}
        <Card className="border border-gray-200 shadow-lg rounded-xl bg-white">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Evaluation Results
                </CardTitle>
                <CardDescription className="text-gray-600">
                  All answer sheets have been checked and verified by examiners
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                  <span className="text-gray-600">Completed</span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {evaluations.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No completed evaluations yet
                </h3>
                <p className="text-gray-600 max-w-sm mx-auto">
                  Evaluations that are fully checked will appear here once
                  completed by all examiners.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden lg:block">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left p-6 font-semibold text-gray-900 text-sm uppercase tracking-wide">
                          Subject Details
                        </th>
                        <th className="text-left p-6 font-semibold text-gray-900 text-sm uppercase tracking-wide">
                          Examiners
                        </th>
                        <th className="text-left p-6 font-semibold text-gray-900 text-sm uppercase tracking-wide">
                          Progress
                        </th>
                        <th className="text-center p-6 font-semibold text-gray-900 text-sm uppercase tracking-wide">
                          Status
                        </th>
                        <th className="text-right p-6 font-semibold text-gray-900 text-sm uppercase tracking-wide">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {evaluations.map((item) => (
                        <tr
                          key={item._id}
                          className="hover:bg-gray-50 transition-colors duration-150 group"
                        >
                          <td className="p-6">
                            <div className="space-y-2">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                  <CheckCircle2 className="h-5 w-5 text-gray-700" />
                                </div>
                                <div className="space-y-1">
                                  <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                                    {item.name}
                                  </h3>
                                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                                    <span>{getCourseName(item.course)}</span>
                                    <span>•</span>
                                    <span>{item.semester}</span>
                                    <span>•</span>
                                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                      {getSubjectName(item.subject)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-700">
                                {formatExaminers(item.examiners)}
                              </span>
                            </div>
                          </td>
                          <td className="p-6 w-48">
                            <div className="space-y-2">
                              <Progress
                                value={item.progress.percent}
                                className="h-2 bg-gray-200"
                                indicatorClassName="bg-gray-900"
                              />
                              <div className="flex justify-between text-xs text-gray-600">
                                <span>
                                  {item.progress.checked}/
                                  {item.progress.uploaded} sheets
                                </span>
                                <span className="font-medium text-gray-900">
                                  {item.progress.percent}%
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-6 text-center">
                            <Badge
                              variant="secondary"
                              className="bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200 px-3 py-1 rounded-full font-medium"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          </td>
                          <td className="p-6 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(item._id)}
                                className="border-gray-300 hover:bg-gray-50 text-gray-700"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleDownloadReport(item._id)}
                                className="bg-gray-900 hover:bg-gray-800 text-white"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Export
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4 p-4">
                  {evaluations.map((item) => (
                    <Card
                      key={item._id}
                      className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                <CheckCircle2 className="h-5 w-5 text-gray-700" />
                              </div>
                              <div className="space-y-1">
                                <h3 className="font-semibold text-gray-900">
                                  {item.name}
                                </h3>
                                <div className="text-sm text-gray-600">
                                  {getCourseName(item.course)} • {item.semester}
                                </div>
                                <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200 inline-block">
                                  {getSubjectName(item.subject)}
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant="secondary"
                              className="bg-gray-100 text-gray-900 border border-gray-300"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Done
                            </Badge>
                          </div>

                          {/* Examiners */}
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">
                              {formatExaminers(item.examiners)}
                            </span>
                          </div>

                          {/* Progress */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium text-gray-900">
                                {item.progress.percent}%
                              </span>
                            </div>
                            <Progress
                              value={item.progress.percent}
                              className="h-2 bg-gray-200"
                              indicatorClassName="bg-gray-900"
                            />
                            <div className="text-xs text-gray-500 text-center">
                              {item.progress.checked}/{item.progress.uploaded}{" "}
                              answer sheets checked
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                              onClick={() => handleViewDetails(item._id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Details
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                              onClick={() => handleDownloadReport(item._id)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
