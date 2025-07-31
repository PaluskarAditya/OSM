import React from "react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { PlusIcon, ChevronRight, FileText, Upload, Copy, Library } from "lucide-react";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function QPManagementPage() {
  return (
    <div className="flex flex-col w-full gap-6 p-6 bg-gray-50">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <div className="flex gap-1 justify-start items-center">
          <SidebarTrigger className="mt-1 mb-1" />
          <h1 className="text-2xl font-semibold text-gray-800">
            Question Paper Management
          </h1>
        </div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/admin"
                className="text-sm font-medium text-gray-600 hover:text-blue-600"
              >
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-gray-400">
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/admin/qp"
                className="text-sm font-medium text-blue-600"
              >
                QP Management
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Main Content Card */}
      <Card className="overflow-hidden h-max bg-none shadow-sm p-0">
        <div className="flex flex-col md:flex-row gap-4 w-full">
          {/* Timetable Card */}
          <div className="flex flex-col w-full flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className="bg-blue-600 p-6">
              <h2 className="text-2xl font-light text-white">Define Timetable</h2>
            </div>

            {/* Card Body */}
            <div className="space-y-2 p-4">
              <Link href="/admin/qp/stream" className="group block">
                <div className="flex items-center gap-4 p-4 rounded-lg transition-all duration-200 group-hover:bg-blue-50 group-hover:shadow-xs h-20">
                  <Button
                    size="icon"
                    className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors duration-200"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </Button>
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="text-md font-medium text-gray-800 truncate">Stream</h3>
                    <p className="text-xs text-gray-500 truncate">
                      Create and manage examination streams
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-200 flex-shrink-0" />
                </div>
              </Link>

              <Link href="/admin/qp/degree" className="group block">
                <div className="flex items-center gap-4 p-4 rounded-lg transition-all duration-200 group-hover:bg-green-50 group-hover:shadow-xs h-20">
                  <Button
                    size="icon"
                    className="h-12 w-12 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors duration-200"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </Button>
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="text-md font-medium text-gray-800 truncate">Degree</h3>
                    <p className="text-xs text-gray-500 truncate">
                      Create and manage degrees
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors duration-200 flex-shrink-0" />
                </div>
              </Link>

              <Link href="/admin/qp/academic-year" className="group block">
                <div className="flex items-center gap-4 p-4 rounded-lg transition-all duration-200 group-hover:bg-red-50 group-hover:shadow-xs h-20">
                  <Button
                    size="icon"
                    className="h-12 w-12 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-200"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </Button>
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="text-md font-medium text-gray-800 truncate">Academic Year</h3>
                    <p className="text-xs text-gray-500 truncate">
                      Create and manage academic years
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-red-600 transition-colors duration-200 flex-shrink-0" />
                </div>
              </Link>

              <Link href="/admin/qp/course" className="group block">
                <div className="flex items-center gap-4 p-4 rounded-lg transition-all duration-200 group-hover:bg-indigo-50 group-hover:shadow-xs h-20">
                  <Button
                    size="icon"
                    className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors duration-200"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </Button>
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="text-md font-medium text-gray-800 truncate">Course</h3>
                    <p className="text-xs text-gray-500 truncate">
                      Create and manage courses
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors duration-200 flex-shrink-0" />
                </div>
              </Link>

              <Link href="/admin/qp/specialization" className="group block">
                <div className="flex items-center gap-4 p-4 rounded-lg transition-all duration-200 group-hover:bg-amber-50 group-hover:shadow-xs h-20">
                  <Button
                    size="icon"
                    className="h-12 w-12 rounded-full bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors duration-200"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </Button>
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="text-md font-medium text-gray-800 truncate">Specialization</h3>
                    <p className="text-xs text-gray-500 truncate">
                      Create and manage specializations
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-amber-600 transition-colors duration-200 flex-shrink-0" />
                </div>
              </Link>

              <Link href="/admin/qp/subject" className="group block">
                <div className="flex items-center gap-4 p-4 rounded-lg transition-all duration-200 group-hover:bg-cyan-50 group-hover:shadow-xs h-20">
                  <Button
                    size="icon"
                    className="h-12 w-12 rounded-full bg-cyan-100 text-cyan-600 hover:bg-cyan-200 transition-colors duration-200"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </Button>
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="text-md font-medium text-gray-800 truncate">Subjects</h3>
                    <p className="text-xs text-gray-500 truncate">
                      Create and manage subjects
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-cyan-600 transition-colors duration-200 flex-shrink-0" />
                </div>
              </Link>
            </div>
          </div>

          {/* Question Paper Card */}
          <div className="flex flex-col w-full flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className="bg-blue-600 p-6">
              <h2 className="text-2xl font-light text-white">Define Question Paper</h2>
            </div>

            {/* Card Body */}
            <div className="space-y-2 p-4">
              <Link href="/admin/qp/question-paper/generate" className="group block">
                <div className="flex items-center gap-4 p-4 rounded-lg transition-all duration-200 group-hover:bg-purple-50 group-hover:shadow-xs h-20">
                  <Button
                    size="icon"
                    className="h-12 w-12 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors duration-200"
                  >
                    <FileText className="h-5 w-5" />
                  </Button>
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="text-md font-medium text-gray-800 truncate">Generate QP Excel</h3>
                    <p className="text-xs text-gray-500 truncate">
                      Generate question paper Excel templates
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors duration-200 flex-shrink-0" />
                </div>
              </Link>

              <Link href="/admin/qp/question-paper/import" className="group block">
                <div className="flex items-center gap-4 p-4 rounded-lg transition-all duration-200 group-hover:bg-emerald-50 group-hover:shadow-xs h-20">
                  <Button
                    size="icon"
                    className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors duration-200"
                  >
                    <Upload className="h-5 w-5" />
                  </Button>
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="text-md font-medium text-gray-800 truncate">Import Question Paper</h3>
                    <p className="text-xs text-gray-500 truncate">
                      Upload and process question papers
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition-colors duration-200 flex-shrink-0" />
                </div>
              </Link>

              <Link href="/admin/qp/question-paper/copy" className="group block">
                <div className="flex items-center gap-4 p-4 rounded-lg transition-all duration-200 group-hover:bg-blue-50 group-hover:shadow-xs h-20">
                  <Button
                    size="icon"
                    className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors duration-200"
                  >
                    <Copy className="h-5 w-5" />
                  </Button>
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="text-md font-medium text-gray-800 truncate">Copy Question Paper</h3>
                    <p className="text-xs text-gray-500 truncate">
                      Copy and modify existing papers
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-200 flex-shrink-0" />
                </div>
              </Link>

              <Link href="/admin/qp/question-paper/master" className="group block">
                <div className="flex items-center gap-4 p-4 rounded-lg transition-all duration-200 group-hover:bg-rose-50 group-hover:shadow-xs h-20">
                  <Button
                    size="icon"
                    className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200 transition-colors duration-200"
                  >
                    <Library className="h-5 w-5" />
                  </Button>
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="text-md font-medium text-gray-800 truncate">QP Master</h3>
                    <p className="text-xs text-gray-500 truncate">
                      Manage question paper database
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-rose-600 transition-colors duration-200 flex-shrink-0" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* Additional Cards Section - Example for future expansion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 hover:shadow-md transition-shadow duration-200">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Recent Activities
          </h3>
          <p className="text-sm text-gray-500">
            View recent changes and updates
          </p>
        </Card>
        <Card className="p-6 hover:shadow-md transition-shadow duration-200">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Quick Actions
          </h3>
          <p className="text-sm text-gray-500">Access frequent operations</p>
        </Card>
      </div>
    </div>
  );
}
