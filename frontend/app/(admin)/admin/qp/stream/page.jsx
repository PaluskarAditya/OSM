"use client";

import React, { useState, useEffect, useCallback } from "react";
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

export default function StreamManagementPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentStream, setCurrentStream] = useState(null);
  const [newStreamName, setNewStreamName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [streams, setStreams] = useState([]);
  const [showOnlyDeactivated, setShowOnlyDeactivated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Fetch all streams with error handling and loading state
  const fetchStreams = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams`);
      if (!res.ok) throw new Error("Failed to fetch streams");
      const data = await res.json();
      setStreams(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStreams();
  }, [fetchStreams]);

  // Filtered list (search + active/inactive toggle)
  const filteredStreams = streams.filter((stream) =>
    stream.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (showOnlyDeactivated ? !stream.isActive : stream.isActive !== false)
  );

  // Open edit dialog
  const handleEditClick = (stream) => {
    setCurrentStream(stream);
    setNewStreamName(stream.name);
    setIsEditDialogOpen(true);
  };

  // Add new stream
  const handleAddStream = async () => {
    if (!newStreamName.trim()) {
      toast.error("Stream name cannot be empty");
      return;
    }

    const uuid = [...Array(6)].map(() => Math.random().toString(36)[2].toUpperCase()).join("");
    const newStream = { uuid, name: newStreamName.trim(), isActive: true };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStream),
      });

      if (!res.ok) throw new Error("Failed to create stream");
      const data = await res.json();
      setStreams((prev) => [...prev, data]);
      toast.success("Stream created successfully");
      setNewStreamName("");
      setIsDialogOpen(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Update existing stream
  const handleUpdateStream = async () => {
    if (!newStreamName.trim()) {
      toast.error("Stream name cannot be empty");
      return;
    }

    if (!currentStream) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams/${currentStream.uuid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newStreamName.trim() }),
      });

      if (!res.ok) throw new Error("Failed to update stream");
      const data = await res.json();
      
      setStreams((prev) =>
        prev.map((s) =>
          s.uuid === currentStream.uuid ? { ...s, name: newStreamName.trim() } : s
        )
      );
      
      toast.success("Stream updated successfully");
      setNewStreamName("");
      setIsEditDialogOpen(false);
      setCurrentStream(null);
    } catch (err) {
      toast.error(err.message);
    }
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
    XLSX.writeFile(workbook, "Streams.xlsx", { compression: true });
  };

  // Activate/Deactivate logic
  const toggleStreamStatus = async (streamId, isActive) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/streams/${streamId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });

      if (!res.ok) throw new Error("Failed to update stream status");

      setStreams((prev) =>
        prev.map((s) =>
          s.uuid === streamId ? { ...s, isActive } : s
        )
      );

      toast.success(`Stream ${isActive ? "activated" : "deactivated"} successfully`);
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
      setSelectedRows(new Set(filteredStreams.map(stream => stream.uuid)));
    }
  };

  // Clear dialog states
  const clearDialogStates = () => {
    setNewStreamName("");
    setCurrentStream(null);
  };

  return (
    <div className="flex flex-col h-screen w-full gap-6 bg-gray-50 p-6">
      {/* Create Stream Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) clearDialogStates();
      }}>
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
            <Button onClick={handleAddStream} className="bg-blue-600 hover:bg-blue-700">
              Create Stream
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Stream Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) clearDialogStates();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Stream</DialogTitle>
            <DialogDescription>Update the stream details</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="edit-stream-name">Stream Name</Label>
            <Input
              id="edit-stream-name"
              placeholder="e.g. July 2025"
              value={newStreamName}
              onChange={(e) => setNewStreamName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUpdateStream()}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateStream} className="bg-blue-600 hover:bg-blue-700">
              Update Stream
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Breadcrumb */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Question Paper Management</h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link href="/admin">Home</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link href="/admin/qp">Streams & Subjects</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link href="/admin/qp/stream">Streams</Link></BreadcrumbLink>
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
                <DropdownMenuItem onClick={handleExport} disabled={filteredStreams.length === 0}>
                  <FileDown className="h-4 w-4 mr-2" /> Export
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowOnlyDeactivated((v) => !v)}>
                  <Eye className="h-4 w-4 mr-2" />
                  {showOnlyDeactivated ? "Show Active" : "View Deactivated"}
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
                ({filteredStreams.length} {filteredStreams.length === 1 ? "item" : "items"})
              </span>
            </h2>
          </div>
          <div className="rounded-md border">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
              </div>
            ) : filteredStreams.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-gray-500 mb-4">
                  {showOnlyDeactivated ? "No deactivated streams found" : "No streams found"}
                </p>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                  <CirclePlusIcon className="h-4 w-4" /> Create Stream
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedRows.size === filteredStreams.length && filteredStreams.length > 0}
                        onCheckedChange={toggleAllRowsSelection}
                        disabled={filteredStreams.length === 0}
                      />
                    </TableHead>
                    <TableHead>UUID</TableHead>
                    <TableHead>Stream Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStreams.map((stream) => (
                    <TableRow key={stream.uuid} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox 
                          checked={selectedRows.has(stream.uuid)}
                          onCheckedChange={() => toggleRowSelection(stream.uuid)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">{stream.uuid}</TableCell>
                      <TableCell>{stream.name}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          stream.isActive 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {stream.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 gap-1"
                          onClick={() => handleEditClick(stream)}
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
                          onClick={() => toggleStreamStatus(stream.uuid, !stream.isActive)}
                        >
                          {stream.isActive ? (
                            <>
                              <Trash2 className="h-4 w-4" /> Deactivate
                            </>
                          ) : (
                            <>
                              <CirclePlusIcon className="h-4 w-4" /> Activate
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}