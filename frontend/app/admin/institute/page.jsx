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
import {
  UploadIcon,
  XIcon,
  SearchIcon,
  DownloadIcon,
  Loader2Icon,
} from "lucide-react";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import debounce from "lodash/debounce";

// Constants
const ROLES = [
  "Admin",
  "Observer",
  "Moderator",
  "Photocopy Viewer",
  "Examiner",
  "Scanner",
  "Head Examiner",
  "COE Login"
];

const EXCEL_HEADERS = [
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

// Custom Hooks
const useAuth = () => {
  const [role, setRole] = useState("");
  
  useEffect(() => {
    const roleFromCookie = Cookies.get("role");
    setRole(roleFromCookie || "");
  }, []);

  const token = Cookies.get("token");
  
  return { role, token };
};

const useUsers = (token) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, refreshUsers: fetchUsers };
};

// Utility Functions
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

  return password.split("").sort(() => Math.random() - 0.5).join("");
};

const cleanExcelData = (jsonData) => {
  return jsonData.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim() : value,
      ])
    )
  );
};

const getUniqueExcelData = (data) => {
  const seen = new Set();
  return data.filter((row) => {
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
};

// Subcomponents
const UserTable = ({ 
  users, 
  search, 
  selectedRows, 
  selectedAll, 
  onSelectAll, 
  onSelectRow,
  role 
}) => {
  const filteredUsers = useMemo(() => {
    if (!search) return users;
    
    const searchLower = search.toLowerCase();
    return users.filter((user) => {
      const fullName = `${user.FirstName || ''} ${user.LastName || ''}`.toLowerCase();
      return fullName.includes(searchLower);
    });
  }, [users, search]);

  return (
    <div className="bg-white rounded-lg overflow-hidden border">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-12 py-3">
              <input
                type="checkbox"
                onChange={onSelectAll}
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
              <TableRow key={user._id} className="border-t hover:bg-gray-50">
                <TableCell className="py-3">
                  <input
                    type="checkbox"
                    onChange={() => onSelectRow(user._id)}
                    checked={selectedAll || selectedRows.includes(user._id)}
                    className="rounded border-gray-300"
                  />
                </TableCell>
                <TableCell className="py-3">{i + 1}</TableCell>
                <TableCell className="py-3 font-medium">
                  {user.FirstName} {user.LastName}
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
                      className="rounded-md h-8 hover:bg-gray-100"
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
  );
};

const UserFormDialog = ({ 
  action, 
  onClose, 
  onSubmit, 
  loading,
  initialData = {},
  autoGenPass,
  onAutoGenPassChange 
}) => {
  const [formData, setFormData] = useState({
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
    password: "",
    ConfirmPassword: "",
    ...initialData
  });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSelectChange = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  return (
    <Dialog open={!!action} onOpenChange={onClose}>
      <DialogContent className="min-w-2/4 rounded-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">
            {action === "edit" ? "Edit User" : "Add New User"}
          </DialogTitle>
          <DialogDescription>
            {action === "edit" 
              ? "Edit user details and permissions" 
              : "Add new users to the institute with appropriate permissions"}
          </DialogDescription>
        </DialogHeader>
        
        <main className="flex-1 overflow-y-auto px-3 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 col-span-2">
              <label className="text-sm font-medium">Role</label>
              <Select
                value={formData.Role}
                onValueChange={(value) => handleSelectChange("Role", value)}
              >
                <SelectTrigger className="w-full rounded-md">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {[
              { label: "First Name", name: "FirstName" },
              { label: "Last Name", name: "LastName" },
              { label: "Mobile", name: "MobileNo" },
              { label: "Email", name: "Email" },
              { label: "Faculty ID", name: "FacultyID" },
              { label: "Campus", name: "CampusName" },
            ].map((field) => (
              <div key={field.name} className="flex flex-col gap-2">
                <label className="text-sm font-medium">{field.label}</label>
                <Input
                  className="rounded-md"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                />
              </div>
            ))}

            <div className="col-span-2 mt-2">
              <h3 className="text-md font-medium mb-2">Bank Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Account Holder Name", name: "AccountHolderName" },
                  { label: "Bank Name", name: "BankName" },
                  { label: "Branch Name", name: "BranchName" },
                  { label: "Account Number", name: "AccountNumber" },
                  { label: "IFSC Code", name: "IFSC" },
                  { label: "TIN", name: "TIN" },
                ].map((field) => (
                  <div key={field.name} className="flex flex-col gap-2">
                    <label className="text-sm font-medium">{field.label}</label>
                    <Input
                      className="rounded-md"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-2 mt-2">
              <h3 className="text-md font-medium mb-2">Security</h3>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  className="accent-blue-500 rounded"
                  checked={autoGenPass}
                  onChange={onAutoGenPassChange}
                />
                <label className="text-sm">Auto Generate Password</label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    className="rounded-md"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={autoGenPass}
                    type="password"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Confirm Password</label>
                  <Input
                    className="rounded-md"
                    name="ConfirmPassword"
                    value={formData.ConfirmPassword}
                    onChange={handleChange}
                    disabled={autoGenPass}
                    type="password"
                  />
                </div>
              </div>
            </div>

            <div className="col-span-2 mt-2">
              <h3 className="text-md font-medium mb-2">Additional Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Aadhar Card</label>
                  <Input
                    className="rounded-md"
                    name="AadharNo"
                    value={formData.AadharNo}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">PAN Card</label>
                  <Input
                    className="rounded-md"
                    name="PANNo"
                    value={formData.PANNo}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Designation</label>
                  <Input
                    className="rounded-md"
                    name="Designation"
                    value={formData.Designation}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-sm font-medium">Address</label>
                  <textarea
                    className="rounded-md border p-2 text-sm"
                    name="Address"
                    value={formData.Address}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <DialogFooter className="pt-4 border-t flex-shrink-0">
          <Button
            className="rounded-md cursor-pointer"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="rounded-md cursor-pointer"
            disabled={loading}
            onClick={() => onSubmit(formData)}
          >
            {loading ? (
              <span className="flex gap-1 justify-center items-center">
                <Loader2Icon className="animate-spin" />
                <p>{action === "edit" ? "Updating User" : "Adding User"}</p>
              </span>
            ) : (
              action === "edit" ? "Update User" : "Add User"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const UsersTab = () => {
  const { role, token } = useAuth();
  const { users, loading: usersLoading, refreshUsers } = useUsers(token);
  
  const [action, setAction] = useState("");
  const [search, setSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedAll, setSelectedAll] = useState(false);
  const [autoGenPass, setAutoGenPass] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  
  const fileInputRef = useRef(null);

  // Debounced search
  const debouncedSetSearch = useMemo(
    () => debounce((value) => setSearch(value), 300),
    []
  );

  useEffect(() => {
    return () => debouncedSetSearch.cancel();
  }, [debouncedSetSearch]);

  // Handle edit action
  useEffect(() => {
    if (action === "edit" && selectedRows.length === 1) {
      const user = users.find(u => u._id === selectedRows[0]);
      setUserToEdit(user);
    }
  }, [action, selectedRows, users]);

  const handleSearch = useCallback((e) => {
    debouncedSetSearch(e.target.value);
  }, [debouncedSetSearch]);

  const handleSelectAll = useCallback(() => {
    if (selectedAll) {
      setSelectedAll(false);
      setSelectedRows([]);
    } else {
      setSelectedAll(true);
      setSelectedRows(users.map(u => u._id));
    }
  }, [selectedAll, users]);

  const handleSelectRow = useCallback((id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }, []);

  const handleCreateUser = useCallback(async (userData) => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...userData,
            password: autoGenPass ? genRandomPass() : userData.password
          }),
        }
      );

      if (res.ok) {
        await refreshUsers();
        toast.success("User created successfully");
        setAction("");
        setAutoGenPass(false);
      } else {
        const error = await res.json();
        toast.error(error.err || "Failed to create user");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  }, [token, autoGenPass, refreshUsers]);

  const handleUpdateUser = useCallback(async (userData) => {
    if (!token || !userToEdit?._id) {
      toast.error("Authentication required");
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/${userToEdit._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        }
      );

      if (res.ok) {
        await refreshUsers();
        toast.success("User updated successfully");
        setAction("");
        setUserToEdit(null);
      } else {
        const error = await res.json();
        toast.error(error.err || "Failed to update user");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  }, [token, userToEdit, refreshUsers]);

  const handleExcelImport = useCallback(async (file, importRole, password, isAutoGen) => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    setProcessing(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      let jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      jsonData = cleanExcelData(jsonData);
      jsonData = getUniqueExcelData(jsonData);

      const finalData = jsonData.map((row) => ({
        ...row,
        Role: importRole || role,
        password: isAutoGen ? genRandomPass() : password,
      }));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/import`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(finalData),
        }
      );

      const responseData = await res.json();

      if (res.ok) {
        await refreshUsers();
        toast.success("Users imported successfully");
        setAction("");
      } else {
        toast.error(responseData.err || "Import failed");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  }, [token, role, refreshUsers]);

  const handleTemplateDownload = useCallback(() => {
    const demoRow = EXCEL_HEADERS.reduce((acc, header) => {
      acc[header] = header === "Email" ? "john.doe@example.com" : 
                   header === "MobileNo" ? "9876543210" : 
                   header === "FacultyID" ? "FAC123" : header;
      return acc;
    }, {});

    const worksheet = XLSX.utils.json_to_sheet([demoRow], { header: EXCEL_HEADERS });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "UsersTemplate.xlsx");
  }, []);

  return (
    <div className="h-full flex flex-col gap-5">
      {/* User Form Dialog */}
      {(action === "add" || action === "edit") && (
        <UserFormDialog
          action={action}
          onClose={() => {
            setAction("");
            setUserToEdit(null);
          }}
          onSubmit={action === "edit" ? handleUpdateUser : handleCreateUser}
          loading={processing}
          initialData={userToEdit || {}}
          autoGenPass={autoGenPass}
          onAutoGenPassChange={() => setAutoGenPass(!autoGenPass)}
        />
      )}

      {/* Excel Import Dialog */}
      {role === "Admin" && action === "import" && (
        <ExcelImportDialog
          onClose={() => setAction("")}
          onImport={handleExcelImport}
          onDownloadTemplate={handleTemplateDownload}
        />
      )}

      {/* Header */}
      <div className="bg-white rounded-lg">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Users Management</h1>
          <p className="text-gray-500">
            Manage all user accounts and permissions
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg flex justify-between items-center p-4">
        <div className="relative w-80">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search users..."
            onChange={handleSearch}
            className="pl-10 rounded-full bg-gray-50 border-0"
          />
        </div>

        <div className="flex gap-3">
          <Select value={action} onValueChange={setAction}>
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

          {role === "Admin" && selectedRows.length === 1 && (
            <Button 
              className="rounded-md"
              onClick={() => setAction("edit")}
            >
              Edit User
            </Button>
          )}

          {role === "Admin" && (selectedAll || selectedRows.length >= 1) && (
            <Button className="rounded-md">Assign Examiner Role</Button>
          )}
        </div>
      </div>

      {/* Users Table */}
      {usersLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2Icon className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <UserTable
          users={users}
          search={search}
          selectedRows={selectedRows}
          selectedAll={selectedAll}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
          role={role}
        />
      )}
    </div>
  );
};

const ExcelImportDialog = ({ onClose, onImport, onDownloadTemplate }) => {
  const [file, setFile] = useState(null);
  const [importRole, setImportRole] = useState("");
  const [autoGenPass, setAutoGenPass] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const fileInputRef = useRef(null);

  const handleFileSelect = useCallback(async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
  }, []);

  const handleImport = useCallback(() => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    if (!autoGenPass && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    onImport(file, importRole, password, autoGenPass);
  }, [file, importRole, autoGenPass, password, confirmPassword, onImport]);

  return (
    <Dialog open onOpenChange={onClose}>
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
            onClick={onDownloadTemplate}
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
            <Select value={importRole} onValueChange={setImportRole}>
              <SelectTrigger className="w-full rounded-md">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Upload Excel File</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 cursor-pointer flex flex-col justify-center items-center border-2 border-dashed bg-gray-50 rounded-lg border-gray-300 hover:border-blue-400 transition-colors"
            >
              <input
                onChange={handleFileSelect}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                ref={fileInputRef}
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
                  <p className="text-xs">.xlsx, .xls files only</p>
                </div>
              )}
            </div>
          </div>
        </main>

        <DialogFooter className="pt-4 border-t">
          <Button
            className="rounded-md"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            disabled={!file}
            className="rounded-md"
            onClick={handleImport}
          >
            Import Users
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function UsersPage() {
  const { role } = useAuth();

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