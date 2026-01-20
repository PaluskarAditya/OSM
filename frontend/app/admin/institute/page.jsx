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
  MoreVerticalIcon,
  UserPlusIcon,
  FileSpreadsheetIcon,
  UserIcon,
  BuildingIcon,
} from "lucide-react";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import debounce from "lodash/debounce";

// Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Constants
const ROLES = [
  { value: "Admin", label: "Admin", color: "bg-red-100 text-red-800" },
  { value: "Observer", label: "Observer", color: "bg-blue-100 text-blue-800" },
  {
    value: "Moderator",
    label: "Moderator",
    color: "bg-green-100 text-green-800",
  },
  {
    value: "Photocopy Viewer",
    label: "Photocopy",
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "Examiner",
    label: "Examiner",
    color: "bg-amber-100 text-amber-800",
  },
  { value: "Scanner", label: "Scanner", color: "bg-cyan-100 text-cyan-800" },
  {
    value: "Head Examiner",
    label: "Head Examiner",
    color: "bg-indigo-100 text-indigo-800",
  },
  { value: "COE Login", label: "COE", color: "bg-pink-100 text-pink-800" },
];

const STATUS_COLORS = {
  active: "bg-green-100 text-green-800 border-green-200",
  inactive: "bg-gray-100 text-gray-800 border-gray-200",
};

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
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const roleFromCookie = Cookies.get("role");
    const userIdFromCookie = Cookies.get("id");
    setRole(roleFromCookie || "");
    setUserId(userIdFromCookie || "");
  }, []);

  const token = Cookies.get("token");

  return { role, token, userId };
};

const useUsers = (token) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch users: ${res.status}`);
      }

      const data = await res.json();
      setUsers(data);
    } catch (error) {
      setError(error.message);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refreshUsers: fetchUsers };
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

  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

const cleanExcelData = (jsonData) => {
  return jsonData.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim() : value,
      ]),
    ),
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

// Loading Skeletons
const TableSkeleton = () => (
  <div className="bg-white rounded-lg border overflow-hidden">
    <div className="p-4 border-b">
      <Skeleton className="h-10 w-full" />
    </div>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="p-4 border-b flex items-center space-x-4">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-8 w-24 ml-auto" />
      </div>
    ))}
  </div>
);

const StatsCards = ({ users }) => {
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.isActive).length;
    const inactive = total - active;
    const admins = users.filter((u) => u.Role === "Admin").length;

    return [
      {
        label: "Total Users",
        value: total,
        icon: UserIcon,
        color: "bg-blue-50 border-blue-100",
      },
      {
        label: "Active Users",
        value: active,
        icon: UserIcon,
        color: "bg-green-50 border-green-100",
      },
      {
        label: "Inactive Users",
        value: inactive,
        icon: UserIcon,
        color: "bg-gray-50 border-gray-100",
      },
      {
        label: "Admins",
        value: admins,
        icon: BuildingIcon,
        color: "bg-red-50 border-red-100",
      },
    ];
  }, [users]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className={`border ${stat.color} hover:shadow-sm transition-shadow`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className="p-3 rounded-full bg-white border">
                <stat.icon className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Subcomponents
const UserTable = ({
  users,
  search,
  selectedRows,
  selectedAll,
  onSelectAll,
  onSelectRow,
  role,
  userId,
  onEdit,
  onResetPassword,
}) => {
  const filteredUsers = useMemo(() => {
    if (!search) return users;

    const searchLower = search.toLowerCase();
    return users.filter((user) => {
      const fullName =
        `${user.FirstName || ""} ${user.LastName || ""}`.toLowerCase();
      const email = user.Email?.toLowerCase() || "";
      const mobile = user.MobileNo?.toLowerCase() || "";
      const facultyId = user.FacultyID?.toLowerCase() || "";

      return (
        fullName.includes(searchLower) ||
        email.includes(searchLower) ||
        mobile.includes(searchLower) ||
        facultyId.includes(searchLower)
      );
    });
  }, [users, search]);

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-12 py-4 px-4">
                <input
                  type="checkbox"
                  onChange={onSelectAll}
                  checked={selectedAll}
                  className="rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </TableHead>
              <TableHead className="py-4 px-4 font-semibold text-gray-700">
                #
              </TableHead>
              <TableHead className="py-4 px-4 font-semibold text-gray-700">
                Name
              </TableHead>
              <TableHead className="py-4 px-4 font-semibold text-gray-700">
                Email
              </TableHead>
              <TableHead className="py-4 px-4 font-semibold text-gray-700">
                Role
              </TableHead>
              <TableHead className="py-4 px-4 font-semibold text-gray-700 hidden md:table-cell">
                Mobile
              </TableHead>
              <TableHead className="py-4 px-4 font-semibold text-gray-700 hidden lg:table-cell">
                Faculty ID
              </TableHead>
              <TableHead className="py-4 px-4 font-semibold text-gray-700">
                Status
              </TableHead>
              <TableHead className="py-4 px-4 font-semibold text-gray-700 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, i) => (
                <TableRow
                  key={user._id}
                  className="border-t hover:bg-gray-50/50 transition-colors"
                >
                  <TableCell className="py-3 px-4">
                    {user._id !== userId && role === "Admin" && (
                      <input
                        type="checkbox"
                        onChange={() => onSelectRow(user._id)}
                        checked={selectedAll || selectedRows.includes(user._id)}
                        className="rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                  </TableCell>
                  <TableCell className="py-3 px-4 font-medium text-gray-600">
                    {i + 1}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {user.FirstName?.[0]}
                          {user.LastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {user.FirstName} {user.LastName}
                        </p>
                        {user.Designation && (
                          <p className="text-xs text-gray-500">
                            {user.Designation}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="text-sm">{user.Email}</span>
                      {user.Username && (
                        <span className="text-xs text-gray-500">
                          @{user.Username}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <Badge
                      variant="outline"
                      className={`${
                        ROLES.find((r) => r.value === user.Role)?.color ||
                        "bg-gray-100 text-gray-800"
                      } border-0 rounded-full px-3 py-1 text-xs font-medium`}
                    >
                      {user.Role}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 px-4 hidden md:table-cell">
                    {user.MobileNo || "-"}
                  </TableCell>
                  <TableCell className="py-3 px-4 hidden lg:table-cell">
                    <code className="bg-gray-50 px-2 py-1 rounded text-sm">
                      {user.FacultyID || "-"}
                    </code>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <Badge
                      variant="outline"
                      className={`${
                        user.isActive
                          ? STATUS_COLORS.active
                          : STATUS_COLORS.inactive
                      } rounded-full px-3 py-1 text-xs font-medium`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                        >
                          <MoreVerticalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onEdit(user)}>
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onResetPassword(user._id)}
                        >
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuItem>View Documents</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          Deactivate User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <UserIcon className="h-12 w-12" />
                    <p className="font-medium">No users found</p>
                    <p className="text-sm">
                      {search
                        ? "Try adjusting your search"
                        : "Add your first user to get started"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
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
  onAutoGenPassChange,
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
    ...initialData,
  });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSelectChange = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  return (
    <Dialog open={!!action} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b bg-gray-50">
          <DialogTitle className="text-xl font-semibold">
            {action === "edit" ? "Edit User" : "Add New User"}
          </DialogTitle>
          <DialogDescription>
            {action === "edit"
              ? "Update user details and permissions"
              : "Add new users to the institute with appropriate permissions"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="basic" className="text-sm">
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="bank" className="text-sm">
                Bank Details
              </TabsTrigger>
              <TabsTrigger value="security" className="text-sm">
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Role *</label>
                  <Select
                    value={formData.Role}
                    onValueChange={(value) => handleSelectChange("Role", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {ROLES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Campus</label>
                  <Input
                    name="CampusName"
                    value={formData.CampusName}
                    onChange={handleChange}
                    placeholder="Enter campus name"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">First Name *</label>
                  <Input
                    name="FirstName"
                    value={formData.FirstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Last Name *</label>
                  <Input
                    name="LastName"
                    value={formData.LastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    name="Email"
                    type="email"
                    value={formData.Email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Mobile *</label>
                  <Input
                    name="MobileNo"
                    value={formData.MobileNo}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Faculty ID</label>
                  <Input
                    name="FacultyID"
                    value={formData.FacultyID}
                    onChange={handleChange}
                    placeholder="Enter faculty ID"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Designation</label>
                  <Input
                    name="Designation"
                    value={formData.Designation}
                    onChange={handleChange}
                    placeholder="Enter designation"
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-medium">Address</label>
                  <textarea
                    className="rounded-md border p-3 text-sm min-h-[80px] resize-none"
                    name="Address"
                    value={formData.Address}
                    onChange={handleChange}
                    placeholder="Enter full address"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bank" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Account Holder Name", name: "AccountHolderName" },
                  { label: "Bank Name", name: "BankName" },
                  { label: "Branch Name", name: "BranchName" },
                  { label: "Account Number", name: "AccountNumber" },
                  { label: "IFSC Code", name: "IFSC" },
                  { label: "TIN Number", name: "TIN" },
                  { label: "Aadhar Card Number", name: "AadharNo" },
                  { label: "PAN Card Number", name: "PANNo" },
                ].map((field) => (
                  <div key={field.name} className="flex flex-col gap-2">
                    <label className="text-sm font-medium">{field.label}</label>
                    <Input
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <input
                  type="checkbox"
                  className="accent-blue-600 rounded h-4 w-4"
                  checked={autoGenPass}
                  onChange={onAutoGenPassChange}
                  id="autoGenPass"
                />
                <div className="flex-1">
                  <label htmlFor="autoGenPass" className="text-sm font-medium">
                    Auto Generate Secure Password
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    A strong 12-character password will be generated
                    automatically
                  </p>
                </div>
                {autoGenPass && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigator.clipboard.writeText(genRandomPass())
                    }
                  >
                    Preview
                  </Button>
                )}
              </div>

              {!autoGenPass && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Password *</label>
                    <Input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                    />
                    <p className="text-xs text-gray-500">
                      Minimum 8 characters with letters, numbers, and symbols
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                      Confirm Password *
                    </label>
                    <Input
                      type="password"
                      name="ConfirmPassword"
                      value={formData.ConfirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                    />
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose} className="min-w-[100px]">
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit(formData)}
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <>
                <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                {action === "edit" ? "Updating..." : "Creating..."}
              </>
            ) : action === "edit" ? (
              "Update User"
            ) : (
              "Create User"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const UsersTab = () => {
  const { role, token, userId } = useAuth();
  const { users, loading: usersLoading, refreshUsers } = useUsers(token);

  const [action, setAction] = useState("");
  const [search, setSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedAll, setSelectedAll] = useState(false);
  const [autoGenPass, setAutoGenPass] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  // Debounced search
  const debouncedSetSearch = useMemo(
    () => debounce((value) => setSearch(value), 300),
    [],
  );

  useEffect(() => {
    return () => debouncedSetSearch.cancel();
  }, [debouncedSetSearch]);

  const handleSearch = useCallback(
    (e) => {
      debouncedSetSearch(e.target.value);
    },
    [debouncedSetSearch],
  );

  const handleSelectAll = useCallback(() => {
    if (selectedAll) {
      setSelectedAll(false);
      setSelectedRows([]);
    } else {
      setSelectedAll(true);
      setSelectedRows(users.map((u) => u._id).filter((id) => id !== userId));
    }
  }, [selectedAll, users, userId]);

  const handleSelectRow = useCallback(
    (id) => {
      if (id === userId) return;
      setSelectedRows((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
      );
    },
    [userId],
  );

  const handleCreateUser = useCallback(
    async (userData) => {
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
              password: autoGenPass ? genRandomPass() : userData.password,
            }),
          },
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
    },
    [token, autoGenPass, refreshUsers],
  );

  const handleUpdateUser = useCallback(
    async (userData) => {
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
          },
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
    },
    [token, userToEdit, refreshUsers],
  );

  const handleEditUser = useCallback((user) => {
    setUserToEdit(user);
    setAction("edit");
  }, []);

  const handlePasswordReset = useCallback(
    async (userId) => {
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      setProcessing(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/reset-password/${userId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (res.ok) {
          toast.success("Password reset email sent successfully");
        } else {
          const error = await res.json();
          toast.error(error.err || "Failed to reset password");
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setProcessing(false);
      }
    },
    [token],
  );

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Dialogs */}
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

      {/* Header */}
      <div className="flex justify-end">
          {role === "Admin" && (
            <Button
              onClick={() => setAction("add")}
              className="gap-2 min-w-[140px]"
            >
              <UserPlusIcon className="w-4 h-4" />
              Add New User
            </Button>
          )}
      </div>

      {/* Stats Cards */}
      <StatsCards users={users} />

      {/* Controls */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name, email, mobile or faculty ID..."
              onChange={handleSearch}
              className="pl-10 rounded-lg"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {role === "Admin" && (
              <Button
                variant="outline"
                onClick={() => setAction("import")}
                className="gap-2"
              >
                <FileSpreadsheetIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Import Excel</span>
              </Button>
            )}

            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="w-[140px] rounded-lg">
                <SelectValue placeholder="More Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {role === "Admin" && (
                    <SelectItem value="export">Export Users</SelectItem>
                  )}
                  <SelectItem value="active">View Active</SelectItem>
                  <SelectItem value="inactive">View Inactive</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {role === "Admin" && selectedRows.length > 0 && (
              <Badge variant="secondary" className="px-3 py-1">
                {selectedRows.length} selected
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Users Table */}
      {usersLoading ? (
        <TableSkeleton />
      ) : (
        <UserTable
          users={users}
          search={search}
          selectedRows={selectedRows}
          selectedAll={selectedAll}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
          role={role}
          userId={userId}
          onEdit={handleEditUser}
          onResetPassword={handlePasswordReset}
        />
      )}

      {/* Mobile Floating Action Button */}
      {role === "Admin" && (
        <div className="fixed bottom-6 right-6 lg:hidden">
          <Button
            onClick={() => setAction("add")}
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg"
          >
            <UserPlusIcon className="w-5 h-5" />
          </Button>
        </div>
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

    if (!uploadedFile.name.match(/\.(xlsx|xls)$/i)) {
      toast.error("Please upload an Excel file (.xlsx or .xls)");
      return;
    }

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

    if (!autoGenPass && password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    onImport(file, importRole, password, autoGenPass);
  }, [file, importRole, autoGenPass, password, confirmPassword, onImport]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="rounded-xl max-w-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">
            Import Users from Excel
          </DialogTitle>
          <DialogDescription>
            Bulk import users using an Excel template
          </DialogDescription>
        </DialogHeader>

        <Card className="border-blue-100 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-gray-900">Download Template</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Use our pre-formatted template to ensure proper data structure
                </p>
              </div>
              <Button
                onClick={onDownloadTemplate}
                variant="outline"
                className="gap-2 whitespace-nowrap"
              >
                <DownloadIcon className="w-4 h-4" />
                Download Template
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">Default Role</label>
              <Select value={importRole} onValueChange={setImportRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select default role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoGenPassImport"
                  checked={autoGenPass}
                  onChange={() => setAutoGenPass(!autoGenPass)}
                  className="h-4 w-4 accent-blue-600 rounded"
                />
                <label
                  htmlFor="autoGenPassImport"
                  className="text-sm font-medium"
                >
                  Auto Generate Passwords
                </label>
              </div>
              {!autoGenPass && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Upload Excel File</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-colors bg-gray-50 hover:bg-gray-50/50"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              {file ? (
                <div className="w-full">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheetIcon className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="h-8 w-8"
                    >
                      <XIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <UploadIcon className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="font-medium text-gray-700">
                    Drag & drop or click to upload
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Supports .xlsx, .xls files up to 10MB
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!file} className="gap-2">
            <UploadIcon className="w-4 h-4" />
            Import Users
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function UsersPage() {
  const { role } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="p-6 sm:p-6">
      <div className="max-w-[2000px] mx-auto">
        <Tabs defaultValue="users" className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="cursor-pointer" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  User Management
                </h1>
                <p className="text-gray-600 text-sm hidden sm:block">
                  Manage users, roles, and permissions
                </p>
              </div>
            </div>

            <TabsList className="bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
              <TabsTrigger
                value="users"
                className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm flex-1 sm:flex-none"
              >
                <UserIcon className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              {role === "Admin" && (
                <TabsTrigger
                  value="profile"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm flex-1 sm:flex-none"
                >
                  <BuildingIcon className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Institute Profile</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="users" className="mt-0">
            <UsersTab />
          </TabsContent>
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Institute Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <BuildingIcon className="w-12 h-12 mx-auto mb-4" />
                  <p>Institute profile details will be available soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
