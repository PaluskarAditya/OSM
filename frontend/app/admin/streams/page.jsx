"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { toast } from "sonner";
import { useState } from "react";
import Cookies from "js-cookie";
import { Loader2, Search, Plus, Download, Edit, Power } from "lucide-react";
import * as XLSX from "xlsx";

export default function StreamsPage() {
  const [streams, setStreams] = useState([]);
  const [filteredStreams, setFilteredStreams] = useState([]);
  const [viewMode, setViewMode] = useState("active");
  const [search, setSearch] = useState("");
  const [dialogAction, setDialogAction] = useState("");
  const [addDialogName, setAddDialogName] = useState("");
  const [editDialogName, setEditDialogName] = useState("");
  const token = Cookies.get("token");
  const [loading, setLoading] = useState(false);
  const [selectedStream, setSelectedStream] = useState(null);

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/stream`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setStreams(data);
        setFilteredStreams(data);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (dialogAction === "export") handleExportStream();
  }, [dialogAction]);

  useEffect(() => {
    if (search.trim().length < 1) {
      setFilteredStreams(streams);
      return;
    }

    const data = streams.filter((el) =>
      el.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredStreams(data);
  }, [search, streams]);

  useEffect(() => {
    if (selectedStream) {
      setEditDialogName(selectedStream.name);
    }
  }, [selectedStream]);

  const handleCreateStream = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/stream`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: addDialogName }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setStreams([...streams, data.stream]);
        toast.success("Stream added successfully");
        setLoading(false);
        setDialogAction("");
        setAddDialogName("");
      }
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const handleUpdateStream = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/stream/${selectedStream.uuid}`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: editDialogName }),
        }
      );

      if (res.ok) {
        await fetchStreams();
        toast.success("Stream updated successfully");
        setLoading(false);
        setDialogAction("");
        setSelectedStream(null);
      }
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const handleExportStream = async () => {
    if (filteredStreams.length < 1) {
      toast.error("No data to export");
      return;
    }

    const cleaned_data = filteredStreams.map((el) => ({
      name: el.name,
      uuid: el.uuid,
      status: el.isActive ? "Active" : "Inactive",
    }));

    try {
      const worksheet = XLSX.utils.json_to_sheet(cleaned_data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Streams");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Streams.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Export successful 🎉");
      setDialogAction("");
    } catch (error) {
      toast.error("Export failed: " + error.message);
    }
  };

  const handleChangeStatusStream = async (stream) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/stream/${stream.uuid}/status`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: !stream.isActive }),
        }
      );

      if (res.ok) {
        await fetchStreams();
        toast.success(`Stream ${!stream.isActive ? 'activated' : 'deactivated'} successfully`);
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const displayedStreams = filteredStreams.filter(stream => 
    viewMode === "active" ? stream.isActive : !stream.isActive
  );

  return (
    <div className="min-h-screen bg-white p-6 text-sm w-full border-0">
      {/* Header */}
      <div className="flex flex-col mb-6">
        <h1 className="text-sm font-medium text-gray-800">Stream Management</h1>
        <p className="text-sm text-gray-500">Create and manage evaluation streams</p>
      </div>

      {/* Stats and Actions Section */}
      <div className="bg-white rounded-lg mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{streams.length}</div>
              <div className="text-xs text-blue-500">Total Streams</div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {streams.filter(s => s.isActive).length}
              </div>
              <div className="text-xs text-green-500">Active Streams</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button 
              onClick={() => setDialogAction("new")}
              className="flex items-center gap-2 cursor-pointer text-sm"
              size="sm"
            >
              <Plus size={16} />
              Add Stream
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setDialogAction("export")}
              className="flex items-center gap-2 cursor-pointer text-sm"
              size="sm"
            >
              <Download size={16} />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Search Section */}
      <div className="bg-white rounded-lg mb-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search streams..."
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === "active" ? "default" : "outline"}
              onClick={() => setViewMode("active")}
              className="cursor-pointer text-sm"
              size="sm"
            >
              Active
            </Button>
            <Button
              variant={viewMode === "inactive" ? "default" : "outline"}
              onClick={() => setViewMode("inactive")}
              className="cursor-pointer text-sm"
              size="sm"
            >
              Inactive
            </Button>
          </div>
        </div>
      </div>

      {/* Streams Table Section */}
      <div className="bg-white rounded-lg">
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedStreams.length > 0 ? (
              displayedStreams.map((stream, i) => (
                <TableRow key={stream.uuid}>
                  <TableCell className="font-medium">{i + 1}</TableCell>
                  <TableCell className="font-medium text-sm">{stream.name}</TableCell>
                  <TableCell className="text-xs text-gray-500 font-mono">{stream.uuid}</TableCell>
                  <TableCell>
                    <Badge variant={stream.isActive ? "default" : "secondary"}>
                      {stream.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedStream(stream);
                          setDialogAction("edit");
                        }}
                        className="h-8 cursor-pointer"
                      >
                        <Edit size={14} className="mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant={stream.isActive ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleChangeStatusStream(stream)}
                        disabled={loading}
                        className="h-8 cursor-pointer"
                      >
                        <Power size={14} className="mr-1" />
                        {stream.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No {viewMode} streams found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Stream Dialog */}
      <Dialog open={dialogAction === "new"} onOpenChange={(open) => !open && setDialogAction("")}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Stream</DialogTitle>
            <DialogDescription>
              Add a new stream to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                value={addDialogName}
                onChange={(e) => setAddDialogName(e.target.value)}
                placeholder="Enter stream name"
                onKeyDown={(e) => e.key === 'Enter' && addDialogName && handleCreateStream()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAction("")}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateStream} 
              disabled={loading || !addDialogName.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Stream"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Stream Dialog */}
      <Dialog open={dialogAction === "edit"} onOpenChange={(open) => !open && setDialogAction("")}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Stream</DialogTitle>
            <DialogDescription>
              Make changes to the stream here.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                value={editDialogName}
                onChange={(e) => setEditDialogName(e.target.value)}
                placeholder="Enter stream name"
                onKeyDown={(e) => e.key === 'Enter' && editDialogName && handleUpdateStream()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAction("")}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateStream} 
              disabled={loading || !editDialogName.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Stream"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}