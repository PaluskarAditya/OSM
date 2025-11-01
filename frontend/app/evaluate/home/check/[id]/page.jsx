"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, FileText, Calendar, BookOpen, CheckCircle2, XCircle, Clock, AlertCircle, UserCheck } from "lucide-react";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import Link from "next/link";

export default function EvaluationDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [evaluation, setEvaluation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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
          }
        );

        if (!res.ok) throw new Error("Failed to load evaluation");
        const data = await res.json();
        setEvaluation(data);
      } catch (err) {
        toast.error(err.message || "Failed to load evaluation details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEval();
  }, [id, token, router]);

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
        }
      );

      if (res.ok) {
        const data = await res.json();
        setEvaluation((prev) => ({
          ...prev,
          sheets: prev.sheets.map((sheet) =>
            sheet.assignmentId === data.assignmentId ? data : sheet
          ),
        }));
        toast.success("Started evaluation");
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to start evaluation");
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      Checking: "bg-blue-100 text-blue-700",
      Completed: "bg-green-100 text-green-700",
      Pending: "bg-yellow-100 text-yellow-700",
      default: "bg-gray-100 text-gray-700",
    };
    return (
      <Badge className={`text-xs font-medium ${variants[status] || variants.default}`}>
        {status}
      </Badge>
    );
  };

  const getCheckedBadge = (checked) => {
    if (checked === "Evaluated")
      return <Badge className="bg-green-100 text-green-700 text-xs flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Evaluated</Badge>;
    if (checked === "Not Evaluated")
      return <Badge className="bg-red-100 text-red-700 text-xs flex items-center gap-1"><XCircle className="w-3 h-3" /> Not Evaluated</Badge>;
    return <Badge className="bg-gray-100 text-gray-700 text-xs">{checked}</Badge>;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const [day, month, year] = dateStr.split("-");
    return new Date(`${year}-${month}-${day}`).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Loading State
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Not Found
  if (!evaluation) {
    return <NotFoundState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/evaluate/home")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Evaluations
          </Button>
        </div>

        {/* Evaluation Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                  {evaluation.name}
                </h1>
                <p className="text-sm text-gray-600 mt-2">
                  {evaluation.sheets?.length || 0} answer sheets to evaluate
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Semester:</span> {evaluation.semester}
              </div>
              {evaluation.course && (
                <div className="flex items-center gap-2 text-gray-700">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Course:</span> {evaluation.course}
                </div>
              )}
              {evaluation.endDate && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="font-medium">Due:</span> {formatDate(evaluation.endDate)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              Answer Sheets
            </h2>
          </div>

          {(!evaluation.sheets || evaluation.sheets.length === 0) ? (
            <EmptySheetsState />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">Assignment ID</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Evaluation</TableHead>
                    <TableHead className="font-semibold text-gray-700">Marks</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Attendance</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evaluation.sheets.map((sheet) => {
                    const canStart = sheet.isChecked === "Not Evaluated";
                    return (
                      <TableRow
                        key={sheet.assignmentId}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <TableCell className="font-mono text-xs text-gray-700">
                          {sheet.assignmentId}
                        </TableCell>
                        <TableCell>{getStatusBadge(sheet.status)}</TableCell>
                        <TableCell>{getCheckedBadge(sheet.isChecked)}</TableCell>
                        <TableCell>
                          <span className={`font-semibold ${sheet.marks ? "text-green-600" : "text-gray-400"}`}>
                            {sheet.marks ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={sheet.attendance ? "default" : "secondary"} className="text-xs">
                            {sheet.attendance ? "Present" : "Absent"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {canStart ? (
                            <Link href={`/evaluate/home/check/${id}/${sheet.assignmentId}`}>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleCheck(sheet.assignmentId);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                              >
                                Start Evaluation
                              </Button>
                            </Link>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-600 text-xs">
                              {sheet.isChecked === "Evaluated" ? "Done" : "In Progress"}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading Skeleton
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center">
        <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-6 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-5 animate-pulse space-y-3">
        <div className="h-6 bg-gray-200 rounded w-48"></div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="grid grid-cols-6 gap-4 py-3 border-b">
            <div className="h-5 bg-gray-200 rounded col-span-1"></div>
            <div className="h-5 bg-gray-200 rounded col-span-1"></div>
            <div className="h-5 bg-gray-200 rounded col-span-1"></div>
            <div className="h-5 bg-gray-200 rounded col-span-1"></div>
            <div className="h-5 bg-gray-200 rounded col-span-1"></div>
            <div className="h-8 bg-gray-200 rounded col-span-1"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Not Found
const NotFoundState = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
    <div className="max-w-5xl mx-auto">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.history.back()}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Evaluation Not Found</h3>
        <p className="text-gray-600">The evaluation you're looking for doesn't exist or has been removed.</p>
      </div>
    </div>
  </div>
);

// Empty Sheets
const EmptySheetsState = () => (
  <div className="p-12 text-center">
    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Answer Sheets</h3>
    <p className="text-gray-600">There are no assignments assigned to this evaluation yet.</p>
  </div>
);