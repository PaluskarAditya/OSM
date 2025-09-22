"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, FileText, Calendar, BookOpen, Loader2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import Link from 'next/link'

export default function EvaluationDetail() {
  const { id } = useParams(); // eval uuid
  const router = useRouter();
  const [evaluation, setEvaluation] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEval = async () => {
      try {
        setIsLoading(true);
        const [evalRes, sheetsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/eval/${id}`, {
            headers: {
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
          }),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/answer-sheet`, {
            headers: {
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
          }),
        ]);
        if (!evalRes.ok || !sheetsRes.ok)
          throw new Error("Failed to fetch evaluation");
        const [evalData, sheetData] = await Promise.all([
          evalRes.json(),
          sheetsRes.json(),
        ]);
        setEvaluation(evalData);
        setSheets(sheetData);
      } catch (err) {
        toast.error(err.message || "Failed to load evaluation details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEval();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="ml-3 h-6 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="flex justify-between items-center p-3 border border-gray-200 rounded-md"
              >
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-9 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <FileText className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Evaluation not found
            </h3>
            <p className="text-gray-500">
              The requested evaluation could not be loaded.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/evaluate/home")}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Evaluations
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              {evaluation.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 mr-1.5" />
                Semester {evaluation.semester}
              </div>
              {evaluation.course && (
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-1.5" />
                  {evaluation.course}
                </div>
              )}
              {evaluation.endDate && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  Due: {new Date(evaluation.endDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">
              Assignment Sheets
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {evaluation.sheets?.length || 0} assignments to evaluate
            </p>
          </div>

          {!evaluation.sheets || evaluation.sheets.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No assignments
              </h3>
              <p className="text-gray-500">
                There are no assignments to evaluate for this subject.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assignment ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Is Checked</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead className="text-center">Attendance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluation.sheets.map((el) => (
                  <TableRow key={el}>
                    <TableCell>{el}</TableCell>
                    <TableCell>checking...</TableCell>
                    <TableCell>no</TableCell>
                    <TableCell>0</TableCell>
                    <TableCell className="flex justify-center items-center gap-5">
                      <span>Present</span>
                      <Link href={`/evaluate/home/check/${id}/${el}`}>
                        <Button size="sm" className="cursor-pointer text-sm">
                          check
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
