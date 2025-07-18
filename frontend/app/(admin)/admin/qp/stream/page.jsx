"use client";

import React, { useState, useEffect } from "react";
import { SidebarTrigger } from '@/components/ui/sidebar'
import * as XLSX from "xlsx";
import Link from "next/link";
import { toast } from "sonner";
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
  FileUp,
  Pencil,
  CheckCircle2,
  Search,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export default function StreamManagementPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingStream, setEditingStream] = useState(null);
  const [newStreamName, setNewStreamName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [streams, setStreams] = useState([]);
  const [showOnlyDeactivated, setShowOnlyDeactivated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Fetch all streams
  useEffect(() => {
    const fetchStreams = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams`
        );
        if (!res.ok) throw new Error("Failed to fetch streams");
        const data = await res.json();
        setStreams(data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreams();
  }, []);

  // Filtered list (search + active/inactive toggle)
  const filteredStreams = streams.filter(
    (stream) =>
      stream.name?.toLowerCase().includes(searchTerm?.toLowerCase() || "") &&
      (showOnlyDeactivated ? !stream.isActive : true)
  );

  // Add new stream
  const handleAddStream = async () => {
    if (!newStreamName.trim()) {
      toast.error("Stream name is required");
      return;
    }

    const uuid = [...Array(6)]
      .map(() => Math.random().toString(36)[2].toUpperCase())
      .join("");
    const newStream = { uuid, name: newStreamName.trim(), isActive: true };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newStream),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create stream");
      }
      const data = await res.json();
      setStreams((prev) => [...prev, data]);
      toast.success("Stream created successfully");
      setNewStreamName("");
      setIsDialogOpen(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Edit stream
  const handleEditStream = async () => {
    if (!editingStream || !newStreamName.trim()) {
      toast.error("Stream name is required");
      return;
    }

    try {
      const updatedStream = {
        name: newStreamName.trim(),
        isActive: editingStream.isActive,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams/${editingStream.uuid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedStream),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update stream");
      }
      const data = await res.json();
      setStreams((prev) =>
        prev.map((s) => (s.uuid === editingStream.uuid ? data : s))
      );
      toast.success("Stream updated successfully");
      setNewStreamName("");
      setIsEditDialogOpen(false);
      setEditingStream(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Handle edit button click
  const handleEditButtonClick = (stream) => {
    setEditingStream(stream);
    setNewStreamName(stream.name);
    setIsEditDialogOpen(true);
  };

  // Export to Excel
  const handleExport = () => {
    const exportData = filteredStreams.map(({ uuid, name, isActive }) => ({
      UUID: uuid,
      "Stream Name": name,
      Status: isActive ? "Active" : "Inactive",
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Streams");
    XLSX.writeFile(workbook, "Streams.xlsx");
  };

  // Import from Excel
  const handleImportExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validate required fields
        const requiredFields = ["Stream Name"];
        const missingFields = [];
        jsonData.forEach((row, index) => {
          requiredFields.forEach((field) => {
            if (!row[field]) {
              missingFields.push(`Row ${index + 2}: Missing ${field}`);
            }
          });
        });

        if (missingFields.length > 0) {
          toast.error(`Missing required fields:\n${missingFields.join("\n")}`);
          return;
        }

        // Transform and import streams
        const streamsToAdd = jsonData.map((row) => {
          const uuid = [...Array(6)]
            .map(() => Math.random().toString(36)[2].toUpperCase())
            .join("");
          return {
            uuid,
            name: row["Stream Name"],
            isActive: row["Status"]?.toLowerCase() === "active" ? true : false,
          };
        });

        const responses = await Promise.all(
          streamsToAdd.map((stream) =>
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(stream),
            })
          )
        );

        const newStreams = await Promise.all(
          responses.map((res) => res.json())
        );
        const successfulImports = newStreams.filter((stream) => !stream.error);
        if (successfulImports.length > 0) {
          setStreams((prev) => [...prev, ...successfulImports]);
          toast.success(
            `${successfulImports.length} streams imported successfully`
          );
        } else {
          toast.error("No streams were imported successfully");
        }
        setIsImportDialogOpen(false);
      } catch (error) {
        toast.error("Error importing file: " + error.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Activate/Deactivate logic
  const toggleStreamStatus = async (streamId, isActive) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams/${streamId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update stream status");
      }

      setStreams((prev) =>
        prev.map((s) => (s.uuid === streamId ? { ...s, isActive } : s))
      );
      toast.success(
        `Stream ${isActive ? "activated" : "deactivated"} successfully`
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Toggle row selection
  const toggleRowSelection = (uuid) => {
    setSelectedRows((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(uuid)) {
        newSelection.delete(uuid);
      } else {
        newSelection.add(uuid);
      }
      return newSelection;
    });
  };

  // Toggle all rows selection
  const toggleAllRowsSelection = () => {
    if (selectedRows.size === filteredStreams.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredStreams.map((stream) => stream.uuid)));
    }
  };

  return (
    <div className="flex flex-col h-screen w-full gap-6 bg-gray-50 p-6">
      {/* Create Stream Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Stream</DialogTitle>
            <DialogDescription>Add a new examination stream</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="stream-name">Stream Name</Label>
            <Input
              id="stream-name"
              placeholder="e.g. July 2025"
              value={newStreamName}
              onChange={(e) => setNewStreamName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddStream()}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleAddStream}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Stream
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Stream Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Stream</DialogTitle>
            <DialogDescription>Update stream details</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="edit-stream-name">Stream Name</Label>
            <Input
              id="edit-stream-name"
              placeholder="e.g. July 2025"
              value={newStreamName}
              onChange={(e) => setNewStreamName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEditStream()}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleEditStream}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Update Stream
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Stream Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Streams</DialogTitle>
            <DialogDescription>
              Upload an Excel file to import streams
              <p
                className="text-xs te;xt-gray-500 mt-2">
                File should contain columns: Stream Name, Status
              </p>
            </DialogDescription>
          </DialogHeader>
          <div>
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => setIsImportDialogOpen(false)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Breadcrumb */}
      <div className="space-y-2">
        <div className="flex gap-1 justify-start items-center">
          <SidebarTrigger className="mt-1 mb-1" />
          <h1 className="text-2xl font-semibold">Stream Management</h1>
        </div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin/qp">Streams & Subjects</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="text-muted-foreground">
                <Link href="/admin/qp/stream">Streams</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search streams..."
            className="pl-9 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {showOnlyDeactivated && (
            <Button
              variant="ghost"
              onClick={() => setShowOnlyDeactivated(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear filter
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                Actions <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                  <CirclePlusIcon className="h-4 w-4 mr-2" /> New Stream
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleExport}
                  disabled={filteredStreams.length === 0}
                >
                  <FileDown className="h-4 w-4 mr-2" /> Export
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsImportDialogOpen(true)}>
                  <FileUp className="h-4 w-4 mr-2" /> Import
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowOnlyDeactivated((v) => !v)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showOnlyDeactivated ? "Show All" : "View Deactivated"}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Streams Table */}
      <Card className="flex-1 overflow-hidden">
        <div className="p-6">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              Streams
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({filteredStreams.length}{" "}
                {filteredStreams.length === 1 ? "item" : "items"})
              </span>
            </h2>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedRows.size === filteredStreams.length &&
                        filteredStreams.length > 0
                      }
                      onCheckedChange={toggleAllRowsSelection}
                    />
                  </TableHead>
                  <TableHead>UUID</TableHead>
                  <TableHead>Stream Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-4 text-gray-500"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredStreams.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-4 text-gray-500"
                    >
                      No streams found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStreams.map((stream) => (
                    <TableRow
                      key={stream.uuid}
                      className={`hover:bg-gray-50 ${
                        !stream.isActive ? "bg-red-50 text-gray-500" : ""
                      }`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.has(stream.uuid)}
                          onCheckedChange={() =>
                            toggleRowSelection(stream.uuid)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {stream.uuid}
                      </TableCell>
                      <TableCell>{stream.name}</TableCell>
                      <TableCell>
                        <span
                          className={
                            stream.isActive
                              ? "text-green-600 font-semibold"
                              : "text-red-500 font-medium"
                          }
                        >
                          {stream.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-gray-700 hover:bg-gray-100"
                          onClick={() => handleEditButtonClick(stream)}
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={`h-8 gap-1 ${
                            stream.isActive
                              ? "text-red-600 hover:bg-red-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          onClick={() =>
                            toggleStreamStatus(stream.uuid, !stream.isActive)
                          }
                        >
                          {stream.isActive ? (
                            <>
                              <Trash2 className="h-4 w-4" /> Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4" /> Activate
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
}
