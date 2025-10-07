"use client";

import * as XLSX from "xlsx";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
  SelectGroup,
} from "@/components/ui/select";
import {
  Dialog,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogContent,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { UploadIcon, XIcon, SearchIcon, DownloadIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useEffect } from "react";
import { useRef } from "react";
import Cookies from "js-cookie";

const UsersTab = () => {
  const ref = useRef(null);
  const [action, setAction] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedAll, setSelectedAll] = useState(false);
  const [file, setFile] = useState(null);
  const [autoGenPass, setAutoGenPass] = useState(false);
  const [role, setRole] = useState("");
  const [userData, setUserData] = useState([]);
  const [dialogPassword, setDialogPassword] = useState("");
  const [dialogConfPassword, setDialogConfPassword] = useState("");
  const token = Cookies.get("token");

  const genRandomPass = (length = 12) => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const symbols = "!@#$%^&*()-_=+[]{}|;:,.<>?";

    const allChars = upper + lower + digits + symbols;

    let password = "";
    password += upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += digits[Math.floor(Math.random() * digits.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    password = password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    return password;
  };

  const handleImportedExcel = async (e) => {
    const uploaded_file = e.target.files[0];
    setFile(uploaded_file);

    if (!uploaded_file) return;

    const data = await uploaded_file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    let jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    jsonData = jsonData.map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
          key,
          typeof value === "string" ? value.trim() : value,
        ])
      )
    );

    const seen = new Set();
    const uniqueData = jsonData.filter((row) => {
      const rowKey = JSON.stringify({
        FirstName: row.FirstName,
        LastName: row.LastName,
        Email: row.Email,
        MobileNo: row.MobileNo,
        FacultyID: row.FacultyID,
      });
      if (seen.has(rowKey)) return false;
      seen.add(rowKey);
      return true;
    });

    const finalData = uniqueData.map((row) => ({
      ...row,
      Role: role,
      password: autoGenPass ? genRandomPass() : dialogPassword,
    }));

    setUserData(finalData);
  };

  const handleImportedData = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/import`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setUsers(data);
        setFilteredUsers(data);
        toast.success("Users imported successfully");
        setAction("");
        setFile(null);
        setUserData(null);
        setAutoGenPass(false);
        return;
      }

      toast.error(data.err);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const getData = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        setFilteredUsers(data);
      }
    };

    getData();
  }, []);

  useEffect(() => {
    if (!search) {
      setFilteredUsers(users);
      return;
    }

    const data = users.filter((el) => {
      const name = (el.FirstName + " " + el.LastName).toLowerCase();
      return name.includes(search.toLowerCase());
    });

    setFilteredUsers(data);
  }, [search, users]);

  const [user, setUser] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    MobileNo: "",
    AadharNo: "",
    PANNo: "",
    Designation: "",
    Address: "",
    FacultyID: "",
    CampusName: "",
    Role: "",
    AccountHolderName: "",
    BankName: "",
    BranchName: "",
    AccountNumber: "",
    IFSC: "",
    TIN: "",
    Institute: "",
    password: "",
    ConfirmPassword: "",
    AutoGeneratePassword: false,
  });

  useEffect(() => {
    if (autoGenPass) {
      user.password = genRandomPass();
    }
  }, [autoGenPass]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleUserCreate = async () => {
    try {
      if (!user.FirstName || !user.LastName || !user.FacultyID) {
        toast.error("User details required");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(user),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setUsers([...users, data]);
        toast.success("User created successfully");
        setAction("");
        setAutoGenPass(false);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCheckChange = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleTemplateDownload = () => {
    const headers = [
      "FirstName",
      "LastName",
      "MobileNo",
      "Email",
      "FacultyID",
      "AadharNo",
      "PANNo",
      "AccountHolderName",
      "BankName",
      "BranchName",
      "AccountNumber",
      "IFSC",
      "TIN",
      "Username",
      "Designation",
      "Address",
      "CampusName",
    ];

    const demoRow = {
      FirstName: "John",
      LastName: "Doe",
      MobileNo: "9876543210",
      Email: "john.doe@example.com",
      FacultyID: "FAC123",
      AadharNo: "1234-5678-9012",
      PANNo: "ABCDE1234F",
      AccountHolderName: "John Doe",
      BankName: "State Bank of India",
      BranchName: "Mumbai Main",
      AccountNumber: "123456789012",
      IFSC: "SBIN0000123",
      TIN: "TIN123456",
      Username: "johndoe",
      Designation: "Professor",
      Address: "123 Street, Mumbai",
      CampusName: "Main Campus",
    };

    const worksheet = XLSX.utils.json_to_sheet([demoRow], { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "UsersTemplate.xlsx");
  };

  return (
    <div className="h-full flex flex-col gap-5">
      {role === "Admin" && (
        <Dialog open={action === "add"} onOpenChange={() => setAction("")}>
          <DialogContent className="min-w-2/4  rounded-lg">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="text-xl font-semibold">
                Add New User
              </DialogTitle>
              <DialogDescription>
                Add new users to the institute with appropriate permissions
              </DialogDescription>
            </DialogHeader>
            <main className="grid w-full max-h-[50vh] grid-cols-2 gap-4 px-3 overflow-y-auto">
              <div className="flex flex-col gap-2 col-span-2">
                <label className="text-sm font-medium">Role</label>
                <Select
                  value={user.Role}
                  onValueChange={(value) => setUser({ ...user, Role: value })}
                >
                  <SelectTrigger className="w-full rounded-md">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Observer">Observer</SelectItem>
                      <SelectItem value="Moderator">Moderator</SelectItem>
                      <SelectItem value="Photocopy Viewer">
                        Photocopy Viewer
                      </SelectItem>
                      <SelectItem value="Examiner">Examiner</SelectItem>
                      <SelectItem value="Scanner">Scanner</SelectItem>
                      <SelectItem value="Head Examiner">
                        Head Examiner
                      </SelectItem>
                      <SelectItem value="COE Login">COE Login</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">First Name</label>
                <Input
                  className="rounded-md"
                  name="FirstName"
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  className="rounded-md"
                  name="LastName"
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Mobile</label>
                <Input
                  className="rounded-md"
                  name="MobileNo"
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  className="rounded-md"
                  name="Email"
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Faculty ID</label>
                <Input
                  className="rounded-md"
                  name="FacultyID"
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Campus</label>
                <Input
                  className="rounded-md"
                  name="CampusName"
                  onChange={handleChange}
                />
              </div>

              <div className="col-span-2 mt-2">
                <h3 className="text-md font-medium mb-2">Bank Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                      Account Holder Name
                    </label>
                    <Input
                      className="rounded-md"
                      name="AccountHolderName"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Bank Name</label>
                    <Input
                      className="rounded-md"
                      name="BankName"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Branch Name</label>
                    <Input
                      className="rounded-md"
                      name="BranchName"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                      Account Number
                    </label>
                    <Input
                      className="rounded-md"
                      name="AccountNumber"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">IFSC Code</label>
                    <Input
                      className="rounded-md"
                      name="IFSC"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">TIN</label>
                    <Input
                      className="rounded-md"
                      name="TIN"
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-2 mt-2">
                <h3 className="text-md font-medium mb-2">Security</h3>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    className="accent-blue-500 rounded"
                    name="AutoGeneratePassword"
                    checked={autoGenPass}
                    onChange={() => setAutoGenPass(!autoGenPass)}
                  />
                  <label className="text-sm">Auto Generate Password</label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Password</label>
                    <Input
                      className="rounded-md"
                      name="password"
                      onChange={handleChange}
                      disabled={autoGenPass}
                      type="password"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                      Confirm Password
                    </label>
                    <Input
                      className="rounded-md"
                      name="ConfirmPassword"
                      onChange={handleChange}
                      disabled={autoGenPass}
                      type="password"
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-2 mt-2">
                <h3 className="text-md font-medium mb-2">
                  Additional Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Aadhar Card</label>
                    <Input
                      className="rounded-md"
                      name="AadharNo"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">PAN Card</label>
                    <Input
                      className="rounded-md"
                      name="PANNo"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Designation</label>
                    <Input
                      className="rounded-md"
                      name="Designation"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex flex-col gap-2 col-span-2">
                    <label className="text-sm font-medium">Address</label>
                    <textarea
                      className="rounded-md border p-2 text-sm"
                      name="Address"
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </main>
            <DialogFooter className="pt-4 border-t">
              <Button
                className="rounded-md"
                variant="outline"
                onClick={() => setAction("")}
              >
                Cancel
              </Button>
              <Button className="rounded-md" onClick={handleUserCreate}>
                Add User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {role === "Admin" && (
        <Dialog open={action === "add"} onOpenChange={() => setAction("")}>
          <DialogContent className="min-w-2/4  rounded-lg">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="text-xl font-semibold">
                Add New User
              </DialogTitle>
              <DialogDescription>
                Add new users to the institute with appropriate permissions
              </DialogDescription>
            </DialogHeader>
            <main className="grid w-full max-h-[50vh] grid-cols-2 gap-4 px-3 overflow-y-auto">
              <div className="flex flex-col gap-2 col-span-2">
                <label className="text-sm font-medium">Role</label>
                <Select
                  value={user.Role}
                  onValueChange={(value) => setUser({ ...user, Role: value })}
                >
                  <SelectTrigger className="w-full rounded-md">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Observer">Observer</SelectItem>
                      <SelectItem value="Moderator">Moderator</SelectItem>
                      <SelectItem value="Photocopy Viewer">
                        Photocopy Viewer
                      </SelectItem>
                      <SelectItem value="Examiner">Examiner</SelectItem>
                      <SelectItem value="Scanner">Scanner</SelectItem>
                      <SelectItem value="Head Examiner">
                        Head Examiner
                      </SelectItem>
                      <SelectItem value="COE Login">COE Login</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">First Name</label>
                <Input
                  className="rounded-md"
                  name="FirstName"
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  className="rounded-md"
                  name="LastName"
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Mobile</label>
                <Input
                  className="rounded-md"
                  name="MobileNo"
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  className="rounded-md"
                  name="Email"
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Faculty ID</label>
                <Input
                  className="rounded-md"
                  name="FacultyID"
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Campus</label>
                <Input
                  className="rounded-md"
                  name="CampusName"
                  onChange={handleChange}
                />
              </div>

              <div className="col-span-2 mt-2">
                <h3 className="text-md font-medium mb-2">Bank Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                      Account Holder Name
                    </label>
                    <Input
                      className="rounded-md"
                      name="AccountHolderName"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Bank Name</label>
                    <Input
                      className="rounded-md"
                      name="BankName"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Branch Name</label>
                    <Input
                      className="rounded-md"
                      name="BranchName"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                      Account Number
                    </label>
                    <Input
                      className="rounded-md"
                      name="AccountNumber"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">IFSC Code</label>
                    <Input
                      className="rounded-md"
                      name="IFSC"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">TIN</label>
                    <Input
                      className="rounded-md"
                      name="TIN"
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-2 mt-2">
                <h3 className="text-md font-medium mb-2">Security</h3>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    className="accent-blue-500 rounded"
                    name="AutoGeneratePassword"
                    checked={autoGenPass}
                    onChange={() => setAutoGenPass(!autoGenPass)}
                  />
                  <label className="text-sm">Auto Generate Password</label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Password</label>
                    <Input
                      className="rounded-md"
                      name="password"
                      onChange={handleChange}
                      disabled={autoGenPass}
                      type="password"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                      Confirm Password
                    </label>
                    <Input
                      className="rounded-md"
                      name="ConfirmPassword"
                      onChange={handleChange}
                      disabled={autoGenPass}
                      type="password"
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-2 mt-2">
                <h3 className="text-md font-medium mb-2">
                  Additional Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Aadhar Card</label>
                    <Input
                      className="rounded-md"
                      name="AadharNo"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">PAN Card</label>
                    <Input
                      className="rounded-md"
                      name="PANNo"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Designation</label>
                    <Input
                      className="rounded-md"
                      name="Designation"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex flex-col gap-2 col-span-2">
                    <label className="text-sm font-medium">Address</label>
                    <textarea
                      className="rounded-md border p-2 text-sm"
                      name="Address"
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </main>
            <DialogFooter className="pt-4 border-t">
              <Button
                className="rounded-md"
                variant="outline"
                onClick={() => setAction("")}
              >
                Cancel
              </Button>
              <Button className="rounded-md" onClick={handleUserCreate}>
                Add User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {role === "Admin" && (
        <Dialog open={action === "import"}>
          <DialogContent className="rounded-lg max-w-2xl">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="text-xl font-semibold">
                Import Users
              </DialogTitle>
              <DialogDescription>
                Add new users by importing through Excel
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-3 p-4 border justify-between items-center bg-blue-50 rounded-lg border-blue-200">
              <div className="flex flex-col gap-1">
                <h1 className="text-lg font-medium">Template</h1>
                <p className="text-sm text-blue-700">
                  Use this template to fill in proper details
                </p>
              </div>
              <Button
                onClick={handleTemplateDownload}
                variant="outline"
                className="rounded-md flex gap-2"
              >
                <DownloadIcon className="w-4 h-4" />
                Download Template
              </Button>
            </div>

            <main className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={role} onValueChange={(value) => setRole(value)}>
                  <SelectTrigger className="w-full rounded-md">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Observer">Observer</SelectItem>
                      <SelectItem value="Moderator">Moderator</SelectItem>
                      <SelectItem value="Photocopy Viewer">
                        Photocopy Viewer
                      </SelectItem>
                      <SelectItem value="Examiner">Examiner</SelectItem>
                      <SelectItem value="Scanner">Scanner</SelectItem>
                      <SelectItem value="Head Examiner">
                        Head Examiner
                      </SelectItem>
                      <SelectItem value="COE Login">COE Login</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  checked={autoGenPass}
                  onChange={() => setAutoGenPass(!autoGenPass)}
                  type="checkbox"
                  className="accent-blue-500 rounded"
                />
                <p className="text-sm">Auto Generate Password</p>
              </div>

              {!autoGenPass && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Password</label>
                    <Input
                      type="password"
                      className="rounded-md"
                      placeholder="Password"
                      value={dialogPassword}
                      onChange={(e) => setDialogPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                      Confirm Password
                    </label>
                    <Input
                      type="password"
                      className="rounded-md"
                      placeholder="Confirm Password"
                      value={dialogConfPassword}
                      onChange={(e) => setDialogConfPassword(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Upload Excel File</label>
                <div
                  onClick={() => ref.current?.click()}
                  className="p-6 cursor-pointer flex flex-col justify-center items-center border-2 border-dashed bg-gray-50 rounded-lg border-gray-300 hover:border-blue-400 transition-colors"
                >
                  <input
                    onChange={handleImportedExcel}
                    type="file"
                    accept=".xlsx"
                    className="hidden"
                    ref={ref}
                  />
                  {file ? (
                    <div className="flex w-full justify-between items-center">
                      <span className="text-blue-600 font-medium">
                        {file.name}
                      </span>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                      >
                        <XIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <UploadIcon className="w-8 h-8" />
                      <span>Click to upload Excel file</span>
                      <p className="text-xs">.xlsx files only</p>
                    </div>
                  )}
                </div>
              </div>
            </main>

            <DialogFooter className="pt-4 border-t">
              <Button
                className="rounded-md"
                variant="outline"
                onClick={() => setAction("")}
              >
                Cancel
              </Button>
              <Button
                disabled={!file}
                className="rounded-md"
                onClick={handleImportedData}
              >
                Import Users
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <div className="bg-white rounded-lg">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Users Management</h1>
          <p className="text-gray-500">
            Manage all user accounts and permissions
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg flex justify-between items-center">
        <div className="relative w-80">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-full bg-gray-50 border-0"
          />
        </div>

        <div className="flex gap-3">
          <Select value={action} onValueChange={(value) => setAction(value)}>
            <SelectTrigger className="w-40 rounded-md bg-white">
              <SelectValue placeholder="Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {role === "Admin" && (
                  <SelectItem value="add">Add User</SelectItem>
                )}
                {role === "Admin" && (
                  <SelectItem value="import">Import Users</SelectItem>
                )}
                <SelectItem value="export">Export Users</SelectItem>
                <SelectItem value="active">Active Users</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {role === "Admin" && (selectedAll || selectedRows.length >= 1) && (
            <Button className="rounded-md">Assign Examiner Role</Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden border">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-12 py-3">
                <input
                  type="checkbox"
                  onChange={() => {
                    if (selectedAll) {
                      setSelectedAll(false);
                      setSelectedRows([]);
                    } else {
                      setSelectedAll(true);
                      setSelectedRows(users.map((u) => u._id));
                    }
                  }}
                  checked={selectedAll}
                  className="rounded border-gray-300"
                />
              </TableHead>
              <TableHead className="py-3 font-medium">#</TableHead>
              <TableHead className="py-3 font-medium">Name</TableHead>
              <TableHead className="py-3 font-medium">Email</TableHead>
              <TableHead className="py-3 font-medium">Role</TableHead>
              <TableHead className="py-3 font-medium">Mobile</TableHead>
              <TableHead className="py-3 font-medium">Faculty ID</TableHead>
              <TableHead className="py-3 font-medium">Status</TableHead>
              <TableHead className="py-3 font-medium text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, i) => (
                <TableRow key={user._id} className="border-t">
                  <TableCell className="py-3">
                    <input
                      type="checkbox"
                      onChange={() => handleCheckChange(user._id)}
                      checked={selectedAll || selectedRows.includes(user._id)}
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell className="py-3">{i + 1}</TableCell>
                  <TableCell className="py-3 font-medium">
                    {(user.FirstName || user.LastName) &&
                      user.FirstName + " " + user.LastName}
                  </TableCell>
                  <TableCell className="py-3">{user.Email}</TableCell>
                  <TableCell className="py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {user.Role}
                    </span>
                  </TableCell>
                  <TableCell className="py-3">{user.MobileNo}</TableCell>
                  <TableCell className="py-3">{user.FacultyID}</TableCell>
                  <TableCell className="py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    {role === "Admin" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-md h-8"
                      >
                        View Documents
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-8 text-center text-gray-500"
                >
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default function page() {
  const role = Cookies.get("role");

  return (
    <div className="w-full min-h-screen bg-white p-6">
      <Tabs defaultValue="users" className="w-full">
        <div className="flex gap-2 justify-start my-auto items-center">
          <SidebarTrigger className="cursor-pointer" />
          <TabsList className="bg-gray-100 p-1 rounded-lg mb-3">
            <TabsTrigger
              value="users"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Users
            </TabsTrigger>
            {role === "Admin" && (
              <TabsTrigger
                value="profile"
                className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Profile
              </TabsTrigger>
            )}
          </TabsList>
        </div>
        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
        <TabsContent value="profile">
          <div className="bg-white rounded-lg p-6">
            <h1 className="text-2xl font-semibold mb-4">Institute Profile</h1>
            <p className="text-gray-500">
              Institute profile details will be shown here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
