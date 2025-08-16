"use client";

import React from "react";

import {
  Card,
  CardHeader,
  CardFooter,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChevronRight,
  BookCheck,
  Database,
  Presentation,
  Paperclip,
} from "lucide-react";
import Link from "next/link";

export default function Page() {
  const createOperation = (name, route, color, icon) => ({
    name,
    route,
    color,
    icon,
  });

  const operations = [
    createOperation(
      "Candidates Data",
      "/admin/candidates/data",
      "emerald",
      <Database className="h-4 w-4" />
    ),
    createOperation(
      "Assign Subject",
      "/admin/candidates/subject",
      "blue",
      <BookCheck className="h-4 w-4" />
    ),
    createOperation(
      "Mark Attendance",
      "/admin/candidates/attendance",
      "rose",
      <Presentation className="h-4 w-4" />
    ),
    createOperation(
      "Assign Exam",
      "/admin/candidates/exam",
      "indigo",
      <Paperclip className="h-4 w-4" />
    ),
  ];

  // Color mapping for Tailwind class generation
  const colorMap = {
    emerald: {
      bg: "bg-emerald-100",
      text: "text-emerald-600",
      hover: "hover:bg-emerald-50",
    },
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      hover: "hover:bg-blue-50",
    },
    rose: {
      bg: "bg-rose-100",
      text: "text-rose-600",
      hover: "hover:bg-rose-50",
    },
    indigo: {
      bg: "bg-indigo-100",
      text: "text-indigo-600",
      hover: "hover:bg-indigo-50",
    },
  };

  return (
    <div className="flex flex-col min-h-screen w-full p-6 gap-6 bg-gray-50">
      {/* Header Card */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-semibold text-gray-800">
            Candidates Management
          </CardTitle>
          <CardDescription className="text-gray-600">
            Create and manage all candidate operations in one place
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Operations Card */}
      <Card className="w-full max-w-sm p-0 border border-gray-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100">
              <Database className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">
                Operations
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Select an operation to begin
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-2 py-0 h-max">
          <div className="flex flex-col gap-1">
            {operations.map((operation, index) => {
              const colors = colorMap[operation.color];
              return (
                <Link href={operation.route} key={index}>
                  <div
                    className={`${colors.hover} transition-colors cursor-pointer rounded-lg p-3`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${colors.bg}`}>
                          {React.cloneElement(operation.icon, {
                            className: `h-4 w-4 ${colors.text}`,
                          })}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {operation.name}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>

        <CardFooter className="bg-gray-50 border-t border-gray-200 p-4">
          <p className="text-xs text-gray-500">
            {operations.length} operations available
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
