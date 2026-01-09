"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Download, 
  Filter, 
  Search, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Page() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    document.title = "NEXA - Reports";
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/v1/reports", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRowExpansion = (id) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedResults = [...results].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setResults(sortedResults);
  };

  const filteredResults = results.filter((report) => {
    const matchesSearch = 
      report.examinerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = selectedCourse === "all" || report.course === selectedCourse;
    
    return matchesSearch && matchesCourse;
  });

  const courses = [...new Set(results.map(report => report.course))];

  const exportToCSV = () => {
    const headers = [
      'Sr No', 'Examiner Name', 'Email', 'Course', 'Semester',
      'Subject', 'Date', 'Mobile', 'Exam Date', 'Assigned Datetime',
      'Evaluation Last Date', 'Total Count', 'Present Count', 'Absent Count',
      'Upload Count', 'Total Check Count'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredResults.map((report, index) => [
        index + 1,
        `"${report.examinerName}"`,
        `"${report.email}"`,
        `"${report.course}"`,
        report.semester,
        `"${report.subject}"`,
        `"${new Date(report.date).toLocaleDateString()}"`,
        `"${report.mobile}"`,
        `"${new Date(report.examDate).toLocaleDateString()}"`,
        `"${new Date(report.assignedDatetime).toLocaleString()}"`,
        `"${new Date(report.evaluationLastDate).toLocaleDateString()}"`,
        report.totalCount,
        report.presentCount || 0,
        report.absentCount || 0,
        report.uploadCount,
        report.totalCheckCount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-6">
      {/* Header Section */}
      <header className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="cursor-pointer h-9 w-9" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Examination Reports
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                View detailed reports for examiners and students
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchResults}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </header>

      {/* Filters and Search Section */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by examiner, email, course, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Course: {selectedCourse === "all" ? "All Courses" : selectedCourse}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSelectedCourse("all")}>
                    All Courses
                  </DropdownMenuItem>
                  {courses.map((course) => (
                    <DropdownMenuItem
                      key={course}
                      onClick={() => setSelectedCourse(course)}
                    >
                      {course}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Reports</p>
                <p className="text-2xl font-bold">{results.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Papers</p>
                <p className="text-2xl font-bold">
                  {results.reduce((sum, report) => sum + (report.totalCount || 0), 0)}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Uploaded Papers</p>
                <p className="text-2xl font-bold">
                  {results.reduce((sum, report) => sum + (report.uploadCount || 0), 0)}
                </p>
              </div>
              <Download className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Evaluation</p>
                <p className="text-2xl font-bold">
                  {results.filter(r => new Date(r.evaluationLastDate) > new Date()).length}
                </p>
              </div>
              <RefreshCw className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Section */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Reports List</CardTitle>
              <CardDescription>
                Showing {filteredResults.length} of {results.length} reports
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('examinerName')}
                  >
                    <div className="flex items-center gap-1">
                      Examiner
                      {sortConfig.key === 'examinerName' && (
                        sortConfig.direction === 'asc' ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('course')}
                  >
                    <div className="flex items-center gap-1">
                      Course
                      {sortConfig.key === 'course' && (
                        sortConfig.direction === 'asc' ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Subject</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('examDate')}
                  >
                    <div className="flex items-center gap-1">
                      Exam Date
                      {sortConfig.key === 'examDate' && (
                        sortConfig.direction === 'asc' ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-center hidden xl:table-cell">Total</TableHead>
                  <TableHead className="text-center hidden xl:table-cell">Uploaded</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={10}>
                        <div className="flex items-center space-x-4 p-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <FileText className="h-12 w-12 text-gray-300" />
                        <div>
                          <p className="text-gray-500 font-medium">No reports found</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {searchTerm ? "Try adjusting your search or filters" : "No reports available"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((report, index) => {
                    const isExpanded = expandedRows.has(report._id);
                    const isPending = new Date(report.evaluationLastDate) > new Date();
                    
                    return (
                      <>
                        <TableRow key={report._id} className="hover:bg-gray-50/50 transition-colors">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRowExpansion(report._id)}
                              className="h-8 w-8 p-0"
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{report.examinerName}</p>
                              <p className="text-xs text-gray-500 md:hidden">{report.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <p className="text-sm">{report.email}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{report.course}</span>
                              <span className="text-xs text-gray-500">Sem {report.semester}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <p className="text-sm truncate max-w-[150px]">{report.subject}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">
                                {new Date(report.examDate).toLocaleDateString()}
                              </span>
                              <span className="text-xs text-gray-500">
                                Due: {new Date(report.evaluationLastDate).toLocaleDateString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center hidden xl:table-cell">
                            <div className="flex flex-col items-center">
                              <span className="font-medium">{report.totalCount}</span>
                              <span className="text-xs text-gray-500">Papers</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center hidden xl:table-cell">
                            <div className="flex flex-col items-center">
                              <span className={`font-medium ${report.uploadCount === report.totalCount ? 'text-green-600' : 'text-orange-600'}`}>
                                {report.uploadCount || 0}
                              </span>
                              <span className="text-xs text-gray-500">Uploaded</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isPending 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {isPending ? 'Pending' : 'Completed'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" className="h-8 px-2">
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 px-2">
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        
                        {/* Expanded Row Details */}
                        {isExpanded && (
                          <TableRow className="bg-blue-50/30">
                            <TableCell colSpan={10} className="p-0">
                              <div className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Contact Info</p>
                                    <div className="text-sm">
                                      <p>Email: {report.email || 'N/A'}</p>
                                      <p>Mobile: {report.mobile || 'N/A'}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Assignment Details</p>
                                    <div className="text-sm">
                                      <p>Assigned: {new Date(report.assignedDatetime).toLocaleString()}</p>
                                      <p>Date: {new Date(report.date).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Paper Counts</p>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="text-center p-2 bg-white rounded border">
                                        <p className="font-bold">{report.totalCount}</p>
                                        <p className="text-xs text-gray-500">Total</p>
                                      </div>
                                      <div className="text-center p-2 bg-white rounded border">
                                        <p className="font-bold">{report.uploadCount || 0}</p>
                                        <p className="text-xs text-gray-500">Uploaded</p>
                                      </div>
                                      <div className="text-center p-2 bg-white rounded border">
                                        <p className="font-bold">{report.totalCheckCount || 0}</p>
                                        <p className="text-xs text-gray-500">Checked</p>
                                      </div>
                                      <div className="text-center p-2 bg-white rounded border">
                                        <p className="font-bold">{report.presentCount || 0}</p>
                                        <p className="text-xs text-gray-500">Present</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Actions</p>
                                    <div className="flex flex-wrap gap-2">
                                      <Button size="sm" variant="outline">
                                        View Details
                                      </Button>
                                      <Button size="sm" variant="outline">
                                        Download Report
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}