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
import { useEffect, useRef, useState } from "react";
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
import { toast } from "sonner";
import Cookies from "js-cookie";
import * as XLSX from "xlsx";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function StreamsPage() {
  const role = Cookies.get('role')
  const [streams, setStreams] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [years, setYears] = useState([]);
  const [filteredYears, setFilteredYears] = useState([]);
  const [viewMode, setViewMode] = useState("active");
  const [search, setSearch] = useState("");
  const [dialogAction, setDialogAction] = useState("");
  const [editDialogName, setEditDialogName] = useState("");
  const token = Cookies.get("token");
  const [loading, setLoading] = useState(false);
  const [selectedStreams, setSelectedStreams] = useState([]);
  const [selectedDegrees, setSelectedDegrees] = useState([]);
  const [selectedStream, setSelectedStream] = useState(null);
  const [selectedDegree, setSelectedDegree] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [filterStream, setFilterStream] = useState(null);
  const [filterDegree, setFilterDegree] = useState(null);
  const [newYear, setNewYear] = useState("");
  const [file, setFile] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const [streamRes, degreeRes, yearRes] = await Promise.all([
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
          fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

        if (streamRes.ok && degreeRes.ok && yearRes.ok) {
          const parseJson = async (res) => {
            if (res.status === 204 || res.status === 304) return null; // no content
            return res.json();
          };

          const [streamData, degreeData, yearData] = await Promise.all([
            parseJson(streamRes),
            parseJson(degreeRes),
            parseJson(yearRes),
          ]);

          if (streamData) {
            const activeStreams = streamData.filter((el) => el.isActive);
            setStreams(activeStreams);
          }

          if (degreeData) {
            setDegrees(degreeData);
          }

          if (yearData) {
            if (yearData.err) {
              setYears([]);
              setFilteredYears([]);
              setLoading(false);
              return;
            }
            setYears(yearData);
            setFilteredYears(yearData);
          }
        } else {
          toast.error("Failed to fetch one or more resources");
        }
        setLoading(false);
      } catch (error) {
        toast.error("Failed to fetch Academic Years");
        setLoading(false);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    if (dialogAction === "export") handleExport();
  }, [dialogAction]);

  useEffect(() => {
    if (search.trim().length < 1) {
      setFilteredYears(years);
      return;
    }
    const data = years.filter((el) =>
      el.year.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredYears(data);
  }, [search, years]);

  useEffect(() => {
    let data = years;
    if (filterStream) {
      data = data.filter((el) => el.streams.includes(filterStream));
    }
    if (filterDegree) {
      data = data.filter((el) => el.degrees.includes(filterDegree));
    }
    setFilteredYears(data);
  }, [filterStream, filterDegree, years]);

  useEffect(() => {
    if (dialogAction === "edit" && selectedYear) {
      setEditDialogName(selectedYear.year);
      setSelectedStreams(selectedYear.streams || []);
      setSelectedDegrees(selectedYear.degrees || []);
    }
  }, [dialogAction, selectedYear]);

  useEffect(() => {
    if (!years.length) {
      setFilteredYears([]);
      return;
    }
    const newFiltered = years.filter((year) => {
      const hasActiveStream = year.streams?.some((sid) =>
        streams.some((s) => s.uuid === sid && s.isActive)
      );
      const hasActiveDegree = year.degrees?.some((did) =>
        degrees.some((d) => d.uuid === did && d.isActive)
      );
      console.log("Filtered Data:", hasActiveStream, hasActiveDegree);
      return hasActiveStream && hasActiveDegree;
    });
    setFilteredYears(newFiltered);
  }, [years, streams, degrees]);

  const clearFilters = () => {
    setFilterStream(null);
    setFilterDegree(null);
  };

  const handleCreate = async () => {
    try {
      if (
        (!newYear && !selectedYear) ||
        selectedStreams.length === 0 ||
        selectedDegrees.length === 0
      ) {
        toast.error("Please select year, stream(s), and degree(s)");
        return;
      }
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            year: selectedYear || newYear,
            streams: [...new Set(selectedStreams)],
            degrees: selectedDegrees,
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setYears([...years, data.new_year]);
        setFilteredYears([...filteredYears, data.new_year]);
        toast.success("Academic Year added successfully");
        setLoading(false);
        setDialogAction("");
        setNewYear("");
        setSelectedStreams([]);
        setSelectedDegrees([]);
        setSelectedYear(null);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add academic year");
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const payload = {
        year: editDialogName,
        streams: selectedStreams,
        degrees: selectedDegrees,
        isActive: selectedYear.isActive,
      };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years/${selectedYear.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (res.ok) {
        toast.success("Academic year updated successfully 🎉");
        setDialogAction("");
        setLoading(false);
        // Update local state
        const updatedYears = years.map((y) =>
          y.uuid === selectedYear.uuid ? { ...y, ...payload } : y
        );
        setYears(updatedYears);
        setFilteredYears(updatedYears);
      } else {
        const err = await res.json();
        toast.error(err.err || "Update failed");
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (filteredYears.length < 1) {
      toast.error("No data to export");
      return;
    }
    const cleaned_data = filteredYears.map((el) => ({
      uuid: el.uuid,
      year: el.year,
      degrees: el.degrees?.map((d) => getDegreeName(d)).join(", ") || "",
      streams: el.streams?.map((s) => getStreamName(s)).join(", ") || "",
      isActive: el.isActive ? "Active" : "Inactive",
    }));
    try {
      const worksheet = XLSX.utils.json_to_sheet(cleaned_data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Academic Years");
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
      link.setAttribute("download", "AcademicYears.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Export successful 🎉");
      setDialogAction("");
    } catch (error) {
      toast.error("Export failed: " + error.message);
    }
  };

  const handleChangeStatus = async (year) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years/${year.uuid}/status`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: !year.isActive }),
        }
      );
      if (res.ok) {
        toast.success(
          `Year ${!year.isActive ? "activated" : "deactivated"} successfully`
        );
        // Update local state
        const updatedYears = years.map((y) =>
          y.uuid === year.uuid ? { ...y, isActive: !year.isActive } : y
        );
        setYears(updatedYears);
        setFilteredYears(updatedYears);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const handleExcelTemplate = async () => {
    try {
      const headers = ["Academic Year", "Stream Name", "Degree Name"];
      const worksheet = XLSX.utils.aoa_to_sheet([
        headers,
        ["Test Year", "Test Stream", "Test Degree"],
      ]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Academic Years Template"
      );
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
      link.setAttribute("download", "AcademicYears_Template.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Template downloaded 🎉");
    } catch (error) {
      toast.error(error.message);
    }
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
        let degree = (row["Degree Name"] || "").toString().trim();
        let year = (row["Academic Year"] || "").toString().trim();
        stream = stream.replace(/\s+/g, " ");
        degree = degree.replace(/\s+/g, " ");
        year = year.replace(/\s+/g, " ");
        if (!stream || !degree || !year) return;
        const key = `${stream}-${degree}-${year}`;
        if (!seen.has(key)) {
          seen.add(key);
          sanitized_data.push({
            stream,
            degree,
            year,
          });
        } else {
          console.warn(`Duplicate row at index ${index + 2}:`, row);
        }
      });
      if (sanitized_data.length > 0) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/academic-years/bulk`,
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
          toast.success(`${sanitized_data.length} academic years imported`);
          setDialogAction("");
          setLoading(false);
          setStreams((prev) => [...prev, ...data.data.streams]);
          setDegrees((prev) => [...prev, ...data.data.degrees]);
          setYears((prev) => [...prev, ...data.data.years]);
          setFilteredYears((prev) => [...prev, ...data.data.years]);
        } else {
          const err = await res.json();
          toast.error(err.error || "Failed to import academic years");
          setLoading(false);
        }
      } else {
        toast.error("No valid rows found to import");
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const getStreamName = (id) => {
    const stream = streams.find((el) => el.uuid === id);
    return stream?.name || "";
  };

  const getDegreeName = (id) => {
    const degree = degrees.find((el) => el.uuid === id);
    return degree?.name || "";
  };

  const displayedYears = filteredYears.filter((year) =>
    viewMode === "active" ? year.isActive : !year.isActive
  );

  useEffect(() => {
    if (selectedStream) {
      setSelectedStreams((prev) => [...prev, selectedStream]);
    }

    if (selectedDegree) {
      setSelectedDegrees((prev) => [...prev, selectedDegree]);
    }
  }, [selectedStream, selectedDegree]);

  return (
    <div className="min-h-screen bg-white p-6 text-sm w-full border-0">
      {/* Header */}
      <div className="flex flex-col mb-6">
        <div className="flex justify-start items-center gap-2">
          <SidebarTrigger className="cursor-pointer" />
          <h1 className="text-sm font-medium text-gray-800">
            Academic Years Management
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          Create and manage evaluation academic years
        </p>
      </div>
      {/* Stats and Actions Section */}
      <div className="bg-white rounded-lg mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {years.length}
              </div>
              <div className="text-xs text-blue-500">Total Academic Years</div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {years.filter((s) => s.isActive).length}
              </div>
              <div className="text-xs text-green-500">
                Active Academic Years
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {role === "Admin" && (
              <>
                <Button
                  onClick={() => setDialogAction("new")}
                  className="flex items-center gap-2 cursor-pointer text-sm"
                  size="sm"
                >
                  <Plus size={16} />
                  Add Academic Year
                </Button>
                <Button
                  onClick={() => setDialogAction("import")}
                  className="flex items-center gap-2 cursor-pointer text-sm"
                  size="sm"
                >
                  <ImportIcon size={16} />
                  Import Academic Years
                </Button>
              </>
            )}
            <Button
              variant="outline"
              onClick={() => setDialogAction("export")}
              className="flex items-center gap-2 cursor-pointer text-sm"
              size="sm"
            >
              <Download size={16} />
              Export
            </Button>
            {(filterStream || filterDegree) && (
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
                placeholder="Search academic years..."
                className="pl-10"
              />
            </div>
            <Select
              value={filterStream || ""}
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
            {filterStream && (
              <Select
                value={filterDegree || ""}
                onValueChange={(value) => setFilterDegree(value)}
              >
                <SelectTrigger className="text-sm cursor-pointer">
                  <SelectValue placeholder="Select Degree" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {degrees
                      ?.filter(
                        (el) =>
                          el.isActive === true && el.stream === filterStream
                      )
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
            )}
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
      {/* Academic Years Table Section */}
      <div className="bg-white rounded-lg">
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-max">Stream</TableHead>
              <TableHead>Degree</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="flex justify-center items-center gap-1">
                <TableCell className="flex justify-center items-center gap-1">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </TableCell>
              </TableRow>
            ) : displayedYears.length > 0 ? (
              displayedYears.map((year, i) => (
                <TableRow key={year.uuid}>
                  <TableCell className="font-medium">{i + 1}</TableCell>
                  <TableCell className="font-medium text-sm">
                    {year.year}
                  </TableCell>
                  <TableCell className="font-medium text-sm w-max">
                    <div className="align-middle w-max text-sm grid grid-cols-2 gap-1 justify-start items-center">
                      {year.streams.map((el) => (
                        <Badge key={el} variant="outline" className="w-max">
                          {getStreamName(el)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium align-middle text-sm grid sm:grid-cols-1 lg:grid-cols-2 gap-1 justify-start items-center">
                    {year.degrees.map((el) => (
                      <Badge className="w-min" key={el} variant="outline">
                        {getDegreeName(el)}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500 font-mono">
                    {year.uuid}
                  </TableCell>
                  <TableCell>
                    <Badge variant={year.isActive ? "default" : "secondary"}>
                      {year.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  {role === "Admin" && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedYear(year);
                            setDialogAction("edit");
                          }}
                          className="h-8 cursor-pointer"
                        >
                          <Edit size={14} className="mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant={year.isActive ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleChangeStatus(year)}
                          disabled={loading}
                          className="h-8 cursor-pointer"
                        >
                          <Power size={14} className="mr-1" />
                          {year.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No {viewMode} academic years found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Create Academic Year Dialog */}
      <Dialog
        open={dialogAction === "new"}
        onOpenChange={(open) => !open && setDialogAction("")}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Academic Year</DialogTitle>
            <DialogDescription>
              Add a new academic year to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            {/* Multi-select Streams */}
            <div className="flex flex-col gap-1">
              <label className="text-sm">Stream(s)</label>
              <Select
                value={selectedStream}
                onValueChange={(val) => setSelectedStream(val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select streams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {streams
                      ?.filter((el) => el.isActive)
                      .map((el) => (
                        <SelectItem key={el.uuid} value={el.uuid}>
                          {el.name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {/* Multi-select Degrees (filtered by selected streams) */}
            <div className="flex flex-col gap-1">
              <label className="text-sm">Degree(s)</label>
              <Select
                value={selectedDegree}
                onValueChange={setSelectedDegree}
                // disabled={!selectedStream}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select degrees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {degrees
                      ?.filter(
                        (el) => el.isActive && el.stream === selectedStream
                      )
                      .map((el) => (
                        <SelectItem key={el.uuid} value={el.uuid}>
                          {el.name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {/* Academic Year */}
            <div className="flex flex-col gap-1">
              <label>Academic Year</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <Input
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    placeholder="Enter new year"
                    disabled={!!selectedYear}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      (newYear || selectedYear) &&
                      handleCreate()
                    }
                  />
                  <span className="text-xs text-gray-500">Type a new year</span>
                </div>
                <div className="flex flex-col gap-1">
                  <Select
                    value={selectedYear || ""}
                    onValueChange={(val) => setSelectedYear(val)}
                    disabled={!!newYear}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select existing year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years
                        .filter((el) => el.isActive)
                        .map((year) => (
                          <SelectItem key={year.uuid} value={year.year}>
                            {year.year}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-gray-500">
                    Or choose existing
                  </span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAction("")}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                loading ||
                selectedStreams.length === 0 ||
                selectedDegrees.length === 0 ||
                (!newYear && !selectedYear)
              }
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Academic Year"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Edit Academic Year Dialog */}
      <Dialog
        open={dialogAction === "edit"}
        onOpenChange={(open) => !open && setDialogAction("")}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Academic Year</DialogTitle>
            <DialogDescription>
              Make changes to the academic year here.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {/* Academic Year */}
            <div className="flex flex-col gap-1">
              <label className="text-sm">Academic Year</label>
              <Input
                value={editDialogName}
                onChange={(e) => setEditDialogName(e.target.value)}
                placeholder="Enter new academic year"
                onKeyDown={(e) =>
                  e.key === "Enter" && editDialogName && handleUpdate()
                }
              />
            </div>
            {/* Streams Section */}
            <div className="flex flex-col gap-2">
              <label className="text-sm">Streams</label>
              {/* Selected Streams */}
              <div className="flex flex-wrap gap-2">
                {selectedStreams.map((s) => (
                  <Badge
                    key={s}
                    variant="outline"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    {getStreamName(s)}
                    <button
                      className="cursor-pointer"
                      onClick={() =>
                        setSelectedStreams(
                          selectedStreams.filter((x) => x !== s)
                        )
                      }
                    >
                      <XIcon size={14} />
                    </button>
                  </Badge>
                ))}
              </div>
              {/* Add New Stream */}
              <div className="flex flex-col gap-1">
                <label>Add new stream</label>
                <Select
                  onValueChange={(value) => {
                    if (selectedStreams.includes(value)) {
                      toast.error(`${getStreamName(value)} already exists`);
                    } else {
                      setSelectedStreams([...selectedStreams, value]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Stream" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {streams
                        .filter((el) => el.isActive)
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
            {/* Degrees Section */}
            <div className="flex flex-col gap-2">
              <label className="text-sm">Degrees</label>
              {/* Selected Degrees */}
              <div className="flex flex-wrap gap-2">
                {selectedDegrees.map((d) => (
                  <Badge
                    key={d}
                    variant="outline"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    {getDegreeName(d)}
                    <button
                      className="cursor-pointer"
                      onClick={() =>
                        setSelectedDegrees(
                          selectedDegrees.filter((x) => x !== d)
                        )
                      }
                    >
                      <XIcon size={14} />
                    </button>
                  </Badge>
                ))}
              </div>
              {/* Add New Degree (only from selected streams) */}
              <div className="flex flex-col gap-1">
                <label>Add new degree</label>
                <Select
                  onValueChange={(value) => {
                    if (selectedDegrees.includes(value)) {
                      toast.error(`${getDegreeName(value)} already exists`);
                    } else {
                      setSelectedDegrees([...selectedDegrees, value]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Degree" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {degrees
                        .filter(
                          (d) =>
                            selectedStreams.includes(d.stream) && d.isActive
                        )
                        .map((d) => (
                          <SelectItem key={d.uuid} value={d.uuid}>
                            {d.name}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAction("")}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={loading || !editDialogName}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Academic Year"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Import Academic Years Dialog */}
      <Dialog
        open={dialogAction === "import"}
        onOpenChange={(open) => !open && setDialogAction("")}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Academic Year</DialogTitle>
            <DialogDescription>
              Import academic years through excel
            </DialogDescription>
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
                "Import Academic Year"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
