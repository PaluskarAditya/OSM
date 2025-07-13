"use client";

import React, { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ChevronDown,
  CirclePlusIcon,
  Eye,
  FileDown,
  Pencil,
  Trash2,
  Search,
  FileUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export default function AcademicYearManagementPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newYear, setNewYear] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStreamId, setSelectedStreamId] = useState(null);
  const [selectedDegreeId, setSelectedDegreeId] = useState(null);
  const [selectedStream, setSelectedStream] = useState(null);
  const [selectedDegree, setSelectedDegree] = useState(null);
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [streams, setStreams] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [academicYears, setAcademicYears] = useState([
    {
      id: 1,
      stream: 1,
      degree: 1,
      year: "2024-25",
      isActive: true,
    },
    {
      id: 2,
      stream: 2,
      degree: 2,
      year: "2024-25",
      isActive: true,
    },
    {
      id: 3,
      stream: 3,
      degree: 3,
      year: "2024-25",
      isActive: true,
    },
  ]);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams`
        );
        if (!res.ok) throw new Error("Failed to fetch streams");
        const data = await res.json();
        setStreams(data);
      } catch (err) {
        console.error("Error loading streams:", err);
      }
    };

    fetchStreams();
  }, []);

  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years`
        );
        if (!res.ok) throw new Error("Failed to fetch academic years");
        const data = await res.json();
        setAcademicYears(data); // assuming API returns array of academic years
      } catch (err) {
        console.error(err);
      }
    };

    fetchAcademicYears();
  }, []);

  useEffect(() => {
    const getDegreesByStream = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams/${selectedStream.uuid}/degrees`
        );

        if (res.ok) {
          const data = await res.json();
          console.log(data);
          setDegrees(data);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };

    getDegreesByStream();
  }, [selectedStream]);

  // Filter academic years based on search term, selected stream, and active status
  const filteredAcademicYears = academicYears.filter((academicYear) => {
    const matchesSearch = academicYear.year
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStream = selectedStreamId
      ? academicYear.stream === selectedStreamId
      : true;
    const matchesActiveStatus = showDeactivated ? true : academicYear.isActive;
    return matchesSearch && matchesStream && matchesActiveStatus;
  });

  const handleAddAcademicYear = async () => {
    if (!newYear.trim() || !selectedStream || !selectedDegree) return;

    const payload = {
      year: newYear.trim(),
      stream: selectedStream.uuid,
      degree: selectedDegree.uuid,
      uuid: [...Array(6)]
        .map(() => Math.random().toString(36)[2].toUpperCase())
        .join(""),
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to create academic year");
      const created = await res.json();
      setAcademicYears((prev) => [...prev, created]);
      setNewYear("");
      setSelectedStreamId(null);
      setSelectedDegreeId(null);
      setIsDialogOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAcademicYearStatus = (yearId) => {
    setAcademicYears(
      academicYears.map((year) =>
        year.id === yearId ? { ...year, isActive: !year.isActive } : year
      )
    );
  };

  const getStreamName = (streamId) => {
    return (
      streams.find((stream) => stream.id === streamId)?.name || "Unknown Stream"
    );
  };

  const getDegreeName = (degreeId) => {
    return (
      degrees.find((degree) => degree.id === degreeId)?.name || "Unknown Degree"
    );
  };

  const getDegreesByStream = (streamId) => {
    return degrees.filter((degree) => degree.streamId === streamId);
  };

  return (
    <div className="flex flex-col h-screen w-full gap-6 bg-gray-50 p-6">
      {/* Dialog for adding new academic year */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Create New Academic Year
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Add a new academic year to the system
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Select Stream <span className="text-red-500">*</span>
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between w-full"
                  >
                    {selectedStream ? selectedStream.name : "Select Stream"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuGroup>
                    {streams.map((stream) => (
                      <DropdownMenuItem
                        key={stream.id}
                        onSelect={async () => {
                          // setSelectedStreamId(stream.id);
                          // setSelectedDegreeId(null);
                          setSelectedStream(stream);
                          try {
                            const res = await fetch(
                              `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams/${stream.uuid}/degrees`
                            );
                            if (!res.ok)
                              throw new Error("Failed to fetch degrees");
                            const data = await res.json();
                            setDegrees(data);
                            console.log(degrees);
                          } catch (err) {
                            console.error("Error loading degrees:", err);
                            setDegrees([]);
                          }
                        }}
                      >
                        {stream.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Select Degree <span className="text-red-500">*</span>
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between w-full"
                    disabled={!selectedStream}
                  >
                    {selectedDegree ? selectedDegree.name : "Select Degree"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuGroup>
                    {selectedStream ? (
                      degrees
                        .filter(
                          (degree) => degree.stream === selectedStream.uuid
                        )
                        .map((degree) => (
                          <DropdownMenuItem
                            key={degree.id}
                            onSelect={() => setSelectedDegree(degree)}
                          >
                            {degree.name}
                          </DropdownMenuItem>
                        ))
                    ) : (
                      <DropdownMenuItem disabled>
                        Select a stream first
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year" className="text-sm font-medium">
                Academic Year <span className="text-red-500">*</span>
              </Label>
              <Input
                id="year"
                placeholder="e.g. 2024-25"
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                className="focus-visible:ring-1 focus-visible:ring-blue-500"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="hover:bg-gray-100">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleAddAcademicYear}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
              disabled={!newYear.trim() || !selectedStream || !selectedDegree}
            >
              Create Academic Year
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header Section */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-semibold text-gray-800">
          Question Paper Management
        </h1>
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
              <ChevronDown className="h-3 w-3 rotate-90" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/admin/qp"
                className="text-sm font-medium text-gray-600 hover:text-blue-600"
              >
                QP Management
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-gray-400" />
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/admin/qp/academic-year"
                className="text-sm font-medium text-blue-600"
              >
                Academic Year
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {selectedStreamId
                    ? streams.find((s) => s.id === selectedStreamId)?.name
                    : "All Streams"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={() => setSelectedStreamId(null)}>
                    All Streams
                  </DropdownMenuItem>
                  {streams.map((stream) => (
                    <DropdownMenuItem
                      key={stream.id}
                      onSelect={() => setSelectedStreamId(stream.id)}
                    >
                      {stream.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {selectedStreamId && (
            <div className="w-full sm:w-64">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    All Degrees
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onSelect={() => setSelectedDegreeId(null)}
                    >
                      All Degrees
                    </DropdownMenuItem>
                    {degrees.map((stream) => (
                      <DropdownMenuItem
                        key={stream.id}
                        onSelect={() => setSelectedDegreeId(stream.id)}
                      >
                        {stream.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search academic years..."
              className="pl-9 bg-white focus-visible:ring-1 focus-visible:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              Actions
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => setIsDialogOpen(true)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <CirclePlusIcon className="h-4 w-4" />
                <span>New Year</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                <FileUp className="h-4 w-4" />
                <span>Import</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                <FileDown className="h-4 w-4" />
                <span>Export</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeactivated(!showDeactivated)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Eye className="h-4 w-4" />
                <span>{showDeactivated ? "Hide" : "View"} Deactivated</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Content Card */}
      <Card className="flex-1 overflow-hidden">
        <div className="p-6 py-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">
              Academic Years{" "}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredAcademicYears.length}{" "}
                {showDeactivated ? "found" : "active"})
              </span>
            </h2>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox />
                  </TableHead>
                  <TableHead className="font-medium">ID</TableHead>
                  <TableHead className="font-medium">Year</TableHead>
                  <TableHead className="font-medium">Stream</TableHead>
                  <TableHead className="font-medium">Degree</TableHead>
                  <TableHead className="font-medium text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAcademicYears.length > 0 ? (
                  filteredAcademicYears.map((academicYear) => (
                    <TableRow
                      key={academicYear.uuid}
                      className="hover:bg-gray-50"
                    >
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell className="font-medium">
                        {academicYear.uuid}
                      </TableCell>
                      <TableCell>{academicYear.year}</TableCell>
                      <TableCell>
                        {getStreamName(academicYear.streamId)}
                      </TableCell>
                      <TableCell>
                        {getDegreeName(academicYear.degreeId)}
                      </TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-gray-700 hover:bg-gray-100"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={`h-8 gap-1 ${
                            academicYear.isActive
                              ? "text-red-600 hover:bg-red-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          onClick={() =>
                            handleToggleAcademicYearStatus(academicYear.id)
                          }
                        >
                          {academicYear.isActive ? (
                            <>
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Deactivate</span>
                            </>
                          ) : (
                            <>
                              <CirclePlusIcon className="h-3.5 w-3.5" />
                              <span>Activate</span>
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No academic years found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
}
