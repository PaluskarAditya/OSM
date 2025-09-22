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
import {
  Loader2,
  Search,
  Plus,
  Download,
  Edit,
  Power,
  ImportIcon,
  XIcon,
  UploadCloud,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useRef } from "react";

export default function StreamsPage() {
  const [streams, setStreams] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [filteredDegrees, setFilteredDegrees] = useState([]);
  const [viewMode, setViewMode] = useState("active");
  const [search, setSearch] = useState("");
  const [dialogAction, setDialogAction] = useState("");
  const [addDialogName, setAddDialogName] = useState("");
  const [editDialogName, setEditDialogName] = useState("");
  const token = Cookies.get("token");
  const [loading, setLoading] = useState(false);
  const [selectedDegree, setSelectedDegree] = useState(null);
  const [selectedStream, setSelectedStream] = useState(null);
  const [filterStream, setFilterStream] = useState(null);
  const [file, setFile] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const [streamRes, degreeRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/stream`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degree`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (streamRes.ok || degreeRes.ok) {
        const [streamData, degreeData] = await Promise.all([
          streamRes.json(),
          degreeRes.json(),
        ]);

        setStreams(streamData);

        if (degreeData.err) {
          setDegrees([]);
          setFilteredDegrees([]);
          return;
        }

        setDegrees(degreeData);
        setFilteredDegrees(degreeData);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (dialogAction === "export") handleExportDegree();
  }, [dialogAction]);

  useEffect(() => {
    if (search.trim().length < 1) {
      setFilteredDegrees(degrees);
      return;
    }

    const data = degrees.filter((el) =>
      el.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredDegrees(data);
  }, [search, degrees]);

  useEffect(() => {
    if (filterStream) {
      let data = degrees;
      data = data.filter((el) => el.stream === filterStream);
      setFilteredDegrees(data);
      return;
    }

    setFilteredDegrees(degrees);
  }, [filterStream]);

  useEffect(() => {
    if (selectedDegree) {
      setEditDialogName(selectedDegree.name);
    }
  }, [selectedDegree]);

  const clearFilters = () => {
    setFilterStream(null);
  };

  const handleCreateDegree = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degree`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: addDialogName, stream: selectedStream }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setDegrees([...degrees, data.degree]);
        toast.success("Degree added successfully");
        setLoading(false);
        setDialogAction("");
        setAddDialogName("");
      }
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const handleUpdateDegree = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degree/${selectedDegree.uuid}`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editDialogName,
            stream: selectedStream,
          }),
        }
      );

      if (res.ok) {
        await getData();
        toast.success("Degree updated successfully");
        setLoading(false);
        setDialogAction("");
        setSelectedDegree(null);
      }
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const handleExportDegree = async () => {
    if (filteredDegrees.length < 1) {
      toast.error("No data to export");
      return;
    }

    const cleaned_data = filteredDegrees.map((el) => ({
      uuid: el.uuid,
      name: el.name,
      stream: getStreamName(el.stream),
    }));

    try {
      const worksheet = XLSX.utils.json_to_sheet(cleaned_data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Degrees");

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
      link.setAttribute("download", "Degrees.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Export successful 🎉");
      setDialogAction("");
    } catch (error) {
      toast.error("Export failed: " + error.message);
    }
  };

  const handleChangeStatusDegree = async (degree) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degree/${degree.uuid}/status`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: !degree.isActive }),
        }
      );

      if (res.ok) {
        await getData();
        toast.success(
          `Degree ${
            !degree.isActive ? "activated" : "deactivated"
          } successfully`
        );
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const handleExcelTemplate = async () => {
    try {
      const headers = ["Stream Name", "Degree Name"];

      const worksheet = XLSX.utils.aoa_to_sheet([
        headers,
        ["Test Stream", "Test Degree"],
      ]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Degree Template");

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
      link.setAttribute("download", "Degree_Template.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Template downloaded 🎉");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const displayedDegrees = (filteredDegrees || [])
    .filter((degree) =>
      viewMode === "active" ? degree.isActive : !degree.isActive
    )
    .filter((degree) => {
      const stream = streams.find((s) => s.uuid === degree.stream);
      return stream?.isActive;
    });

  const getStreamName = (id) => {
    const stream = streams.find((el) => el.uuid === id);
    return stream?.name;
  };

  const handleExcelImport = async () => {
    try {
      setLoading(true);
      const data = await file.arrayBuffer();

      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json_data = XLSX.utils.sheet_to_json(worksheet);

      const seen = new Set();
      const sanitized_data = [];

      json_data.forEach((row, index) => {
        let stream = (row["Stream Name"] || "").toString().trim();
        let name = (row["Degree Name"] || "").toString().trim();

        stream = stream.replace(/\s+/g, " ");
        name = name.replace(/\s+/g, " ");

        if (!stream || !name) return;

        const key = `${stream}-${name}`;

        if (!seen.has(key)) {
          seen.add(key);
          sanitized_data.push({
            stream,
            name,
          });
        } else {
          console.warn(`Duplicate row at index ${index + 2}:`, row);
        }
      });

      if (sanitized_data.length > 0) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/degree/bulk`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(sanitized_data),
          }
        );

        if (res.ok) {
          const data = await res.json();
          toast.success(`${sanitized_data.length} degrees imported`);
          setDialogAction("");
          setLoading(false);

          setStreams((prev) => [...prev, ...data.data.streams]);
          setDegrees((prev) => [...prev, ...data.data.degrees]);
          setFilteredDegrees((prev) => [...prev, ...data.data.degrees]);
        } else {
          const err = await res.json();
          toast.error(err.error || "Failed to import degrees");
        }
      } else {
        toast.error("No valid rows found to import");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 text-sm w-full border-0">
      {/* Header */}
      <div className="flex flex-col mb-6">
        <h1 className="text-sm font-medium text-gray-800">Degree Management</h1>
        <p className="text-sm text-gray-500">
          Create and manage evaluation degrees
        </p>
      </div>

      {/* Stats and Actions Section */}
      <div className="bg-white rounded-lg mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {degrees?.length}
              </div>
              <div className="text-xs text-blue-500">Total Degrees</div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {degrees?.filter((s) => s.isActive).length}
              </div>
              <div className="text-xs text-green-500">Active Degrees</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              onClick={() => setDialogAction("new")}
              className="flex items-center gap-2 cursor-pointer text-sm"
              size="sm"
            >
              <Plus size={16} />
              Add Degree
            </Button>

            <Button
              onClick={() => setDialogAction("import")}
              className="flex items-center gap-2 cursor-pointer text-sm"
              size="sm"
            >
              <ImportIcon size={16} />
              Import Degrees
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

            {filterStream && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-2 cursor-pointer text-sm"
                size="sm"
              >
                <XIcon size={16} />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters and Search Section */}
      <div className="bg-white rounded-lg mb-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex gap-2 justify-between items-center">
            <div className="relative w-full sm:w-80">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search degrees..."
                className="pl-10"
              />
            </div>
            <Select
              value={filterStream || undefined}
              onValueChange={(value) => setFilterStream(value)}
            >
              <SelectTrigger className="text-sm cursor-pointer">
                <SelectValue placeholder="Select Stream" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {streams
                    ?.filter((el) => el.isActive === true)
                    .map((el) => (
                      <SelectItem
                        className="text-sm cursor-pointer"
                        key={el.uuid}
                        value={el.uuid}
                      >
                        {el.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
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
              <TableHead>Stream</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedDegrees.length > 0 ? (
              displayedDegrees.map((degree, i) => (
                <TableRow key={degree.uuid}>
                  <TableCell className="font-medium">{i + 1}</TableCell>
                  <TableCell className="font-medium text-sm">
                    {degree.name}
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {getStreamName(degree.stream)}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500 font-mono">
                    {degree.uuid}
                  </TableCell>
                  <TableCell>
                    <Badge variant={degree.isActive ? "default" : "secondary"}>
                      {degree.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDegree(degree);
                          setDialogAction("edit");
                        }}
                        className="h-8 cursor-pointer"
                      >
                        <Edit size={14} className="mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant={degree.isActive ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleChangeStatusDegree(degree)}
                        disabled={loading}
                        className="h-8 cursor-pointer"
                      >
                        <Power size={14} className="mr-1" />
                        {degree.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No {viewMode} degrees found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Degree Dialog */}
      <Dialog
        open={dialogAction === "new"}
        onOpenChange={(open) => !open && setDialogAction("")}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Degree</DialogTitle>
            <DialogDescription>
              Add a new degree to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label>Degree Name</label>
              <Input
                value={addDialogName}
                onChange={(e) => setAddDialogName(e.target.value)}
                placeholder="Enter degree name"
                onKeyDown={(e) =>
                  e.key === "Enter" && addDialogName && handleCreateDegree()
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm">Stream</label>
              <Select
                value={selectedStream}
                onValueChange={(value) => setSelectedStream(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="select stream" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {streams
                      ?.filter((el) => el.isActive === true)
                      .map((el) => (
                        <SelectItem key={el.uuid} value={el.uuid}>
                          {el.name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAction("")}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateDegree}
              disabled={loading || !addDialogName.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Degree"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Degree Dialog */}
      <Dialog
        open={dialogAction === "edit"}
        onOpenChange={(open) => !open && setDialogAction("")}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Degree</DialogTitle>
            <DialogDescription>
              Make changes to the degree here.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm">Degree Name</label>
              <Input
                value={editDialogName}
                onChange={(e) => setEditDialogName(e.target.value)}
                placeholder="Enter degree name"
                onKeyDown={(e) =>
                  e.key === "Enter" && editDialogName && handleUpdateDegree()
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm">Stream</label>
              <Select
                value={selectedStream}
                onValueChange={(value) => setSelectedStream(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="select stream" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {streams
                      ?.filter((el) => el.isActive === true)
                      .map((el) => (
                        <SelectItem key={el.uuid} value={el.uuid}>
                          {el.name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAction("")}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateDegree}
              disabled={loading || !editDialogName.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Degree"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Degrees Dialog */}
      <Dialog
        open={dialogAction === "import"}
        onOpenChange={(open) => !open && setDialogAction("")}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Degree</DialogTitle>
            <DialogDescription>Import degrees through excel</DialogDescription>
          </DialogHeader>
          <main className="flex flex-col gap-3">
            <div className="flex justify-between items-center p-3 border">
              <p className="text-sm">Download template to import</p>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm cursor-pointer"
                onClick={handleExcelTemplate}
              >
                download <Download className="h-4 w-4" />
              </Button>
            </div>
            <div className="border border-dashed p-3 flex flex-col justify-center items-center">
              {file ? (
                <span className="flex w-full justify-between items-center gap-2">
                  <h1 className="text-sm text-blue-500">{file.name}</h1>
                  <Button
                    onClick={() => setFile(null)}
                    className="cursor-pointer p-0"
                    variant="outline"
                    size="icon"
                  >
                    <XIcon className="h-2 w-2" />
                  </Button>
                </span>
              ) : (
                <h1 className="text-sm flex justify-center items-center gap-1">
                  Upload Excel <UploadCloud className="h-4 w-4" />
                </h1>
              )}
              <input
                onChange={(e) => {
                  const selectedFile = e.target.files[0];
                  if (selectedFile) {
                    setFile(selectedFile);
                  }
                  e.target.value = null;
                }}
                type="file"
                accept=".xlsx"
                ref={ref}
                className="hidden"
              />
              {!file && (
                <p
                  className="text-blue-500 cursor-pointer underline"
                  onClick={() => ref.current.click()}
                >
                  Browse
                </p>
              )}
            </div>
          </main>
          <DialogFooter>
            <Button
              size="sm"
              className="text-sm cursor-pointer"
              variant="outline"
              onClick={() => setDialogAction("")}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExcelImport}
              size="sm"
              disabled={!file || loading}
              className="text-sm cursor-pointer"
            >
              {loading ? (
                <span className="flex gap-1 justify-center items-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p>Importing...</p>
                </span>
              ) : (
                "Import Degrees"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
