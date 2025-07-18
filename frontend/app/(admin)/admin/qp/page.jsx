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
import { PlusIcon, ChevronRight } from "lucide-react";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function QPManagementPage() {
  return (
    <div className="flex flex-col min-h-screen w-full gap-6 p-6 bg-gray-50">
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
      <Card className="overflow-hidden h-max shadow-sm p-0">
        {/* Card Header */}
        <div className="bg-blue-600 p-6">
          <h2 className="text-2xl font-light text-white">Define Timetable</h2>
        </div>

        {/* Card Body */}
        <div className="p-2 py-2 -mt-5 bg-white">
          <Link href="/admin/qp/stream" className="group">
            <div className="flex items-center h-full gap-4 p-4 rounded-lg transition-all duration-200 group-hover:bg-blue-50 group-hover:shadow-xs">
              <Button
                size="icon"
                className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors duration-200"
              >
                <PlusIcon className="h-5 w-5" />
              </Button>
              <div className="flex flex-col">
                <h3 className="text-md font-medium text-gray-800">Stream</h3>
                <p className="text-xs text-gray-500">
                  Create and manage examination streams
                </p>
              </div>
              <ChevronRight className="ml-auto h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
            </div>
          </Link>
        </div>
        <div className="p-2 -mt-10 bg-white">
          <Link href="/admin/qp/degree" className="group">
            <div className="flex items-center h-full gap-4 p-4 rounded-lg transition-all duration-200 group-hover:bg-green-50 group-hover:shadow-xs">
              <Button
                size="icon"
                className="h-12 w-12 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors duration-200"
              >
                <PlusIcon className="h-5 w-5" />
              </Button>
              <div className="flex flex-col">
                <h3 className="text-md font-medium text-gray-800">Degree</h3>
                <p className="text-xs text-gray-500">
                  Create and manage degree's{" "}
                </p>
              </div>
              <ChevronRight className="ml-auto h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors duration-200" />
            </div>
          </Link>
        </div>
        <div className="p-2 -mt-10 bg-white">
          <Link href="/admin/qp/academic-year" className="group">
            <div className="flex items-center h-full gap-4 p-4 rounded-lg transition-all duration-200 group-hover:bg-red-50 group-hover:shadow-xs">
              <Button
                size="icon"
                className="h-12 w-12 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-200"
              >
                <PlusIcon className="h-5 w-5" />
              </Button>
              <div className="flex flex-col">
                <h3 className="text-md font-medium text-gray-800">
                  Academic Year
                </h3>
                <p className="text-xs text-gray-500">
                  Create and manage academic year's{" "}
                </p>
              </div>
              <ChevronRight className="ml-auto h-5 w-5 text-red-400 group-hover:text-red-600 transition-colors duration-200" />
            </div>
          </Link>
        </div>
        <div className="p-2 -mt-10 bg-white">
          <Link href="/admin/qp/course" className="group">
            <div className="flex items-center h-full gap-4 p-4 rounded-lg transition-all duration-200 group-hover:bg-indigo-50 group-hover:shadow-xs">
              <Button
                size="icon"
                className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors duration-200"
              >
                <PlusIcon className="h-5 w-5" />
              </Button>
              <div className="flex flex-col">
                <h3 className="text-md font-medium text-gray-800">Course</h3>
                <p className="text-xs text-gray-500">
                  Create and manage courses
                </p>
              </div>
              <ChevronRight className="ml-auto h-5 w-5 text-indigo-400 group-hover:text-indigo-600 transition-colors duration-200" />
            </div>
          </Link>
        </div>
        <div className="p-2 -mt-10 bg-white">
          <Link href="/admin/qp/specialization" className="group">
            <div className="flex items-center h-full gap-4 p-4 rounded-lg transition-all duration-200 group-hover:bg-green-50 group-hover:shadow-xs">
              <Button
                size="icon"
                className="h-12 w-12 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors duration-200"
              >
                <PlusIcon className="h-5 w-5" />
              </Button>
              <div className="flex flex-col">
                <h3 className="text-md font-medium text-gray-800">
                  Specialization
                </h3>
                <p className="text-xs text-gray-500">
                  Create and manage specialization
                </p>
              </div>
              <ChevronRight className="ml-auto h-5 w-5 text-green-400 group-hover:text-green-600 transition-colors duration-200" />
            </div>
          </Link>
        </div>
        <div className="p-2 -mt-10 bg-white">
          <Link href="/admin/qp/subject" className="group">
            <div className="flex items-center h-full gap-4 p-4 rounded-lg transition-all duration-200 group-hover:bg-green-50 group-hover:shadow-xs">
              <Button
                size="icon"
                className="h-12 w-12 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors duration-200"
              >
                <PlusIcon className="h-5 w-5" />
              </Button>
              <div className="flex flex-col">
                <h3 className="text-md font-medium text-gray-800">Subjects</h3>
                <p className="text-xs text-gray-500">
                  Create and manage subject's
                </p>
              </div>
              <ChevronRight className="ml-auto h-5 w-5 text-green-400 group-hover:text-green-600 transition-colors duration-200" />
            </div>
          </Link>
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
