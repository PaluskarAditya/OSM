"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
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
} from "lucide-react";
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
import { useEffect } from "react";
import { toast } from "sonner";

export default function StreamManagementPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStreamName, setNewStreamName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [streams, setStreams] = useState([
    { id: 1, name: "July 2025", selected: false },
    { id: 2, name: "March 2025", selected: false },
    { id: 3, name: "April 2025", selected: false },
  ]);

  useEffect(() => {
    const getStreams = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams`
        );

        if (res.ok) {
          const data = await res.json();
          setStreams(data);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };

    getStreams();
  }, []);

  const filteredStreams = streams.filter((stream) =>
    stream.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStream = async () => {
    if (newStreamName.trim()) {
      const code = [...Array(6)]
        .map(() => Math.random().toString(36)[2].toUpperCase())
        .join("");

      const stream = { uuid: code, name: newStreamName, selected: false };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(stream),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setStreams([...streams, data]);
      }
      setNewStreamName("");
      setIsDialogOpen(false);
    }
  };

  const handleExport = () => {
    // Prepare data for export
    const exportData = filteredStreams.map((stream) => ({
      ID: stream.id,
      "Stream Name": stream.name,
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Streams");

    // Export the file
    XLSX.writeFile(workbook, "Streams.xlsx", { compression: true });
  };

  const handleDeactivateStream = (streamId) => {
    setStreams(
      streams.map((stream) =>
        stream.uuid === streamId ? { ...stream, isActive: false } : stream
      )
    );
    toast.success("Stream deactivated successfully");
  };

  return (
    <div className="flex flex-col h-screen w-full gap-6 bg-gray-50 p-6">
      {/* Dialog for adding new stream */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Create New Stream
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Add a new examination stream to the system
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stream-name" className="text-sm font-medium">
                Stream Name
              </Label>
              <Input
                id="stream-name"
                placeholder="e.g. July 2025"
                value={newStreamName}
                onChange={(e) => setNewStreamName(e.target.value)}
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
              onClick={handleAddStream}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Stream
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
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/admin/qp/stream"
                className="text-sm font-medium text-blue-600"
              >
                Streams
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search streams..."
            className="pl-9 bg-white focus-visible:ring-1 focus-visible:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                <span>New stream</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleExport}
                className="flex items-center gap-2 cursor-pointer"
              >
                <FileDown className="h-4 w-4" />
                <span>Export</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                <Eye className="h-4 w-4" />
                <span>View deactivated</span>
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
              Streams{" "}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredStreams.length} total)
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
                  <TableHead className="font-medium">UUID</TableHead>
                  <TableHead className="font-medium">Stream Name</TableHead>
                  <TableHead className="font-medium text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStreams
                  .filter((stream) => stream.isActive)
                  .map((stream) => (
                    <TableRow key={stream.uuid} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell className="font-medium">
                        {stream.uuid}
                      </TableCell>
                      <TableCell>{stream.name}</TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-gray-700 hover:bg-gray-100 cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-red-600 hover:bg-red-50 cursor-pointer"
                          onClick={() => handleDeactivateStream(stream.uuid)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Deactivate</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
}
