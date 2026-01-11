"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SearchIcon,
  UserIcon,
  CheckIcon,
  XIcon,
  EyeIcon,
  EyeOffIcon,
  ShieldIcon,
  LockIcon,
  UnlockIcon,
  FilterIcon,
  RefreshCwIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function ObserverPermissionsPage() {
  const [observers, setObservers] = useState([]);
  const [selectedObserver, setSelectedObserver] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState({});
  const [activeTab, setActiveTab] = useState("permissions");

  const ROUTES = [
    {
      key: "admin.streams",
      route: "/admin/streams",
      title: "Streams Management",
      category: "Exams & Subjects",
      description: "Manage all streams and their configurations",
    },
    {
      key: "admin.degrees",
      route: "/admin/degrees",
      title: "Degrees Management",
      category: "Exams & Subjects",
      description: "Configure academic degrees and their properties",
    },
    {
      key: "admin.academic-years",
      route: "/admin/academic-years",
      title: "Academic Years",
      category: "Exams & Subjects",
      description: "Set up and manage academic year timelines",
    },
    {
      key: "admin.courses",
      route: "/admin/courses",
      title: "Courses Management",
      category: "Exams & Courses",
      description: "Handle course creation, updates, and assignments",
    },
    {
      key: "admin.subjects",
      route: "/admin/subjects",
      title: "Subjects Management",
      category: "Exams & Subjects",
      description: "Handle subject creation, updates, and assignments",
    },
    {
      key: "admin.reports",
      route: "/admin/reports",
      title: "Reports & Analytics",
      category: "Analytics",
      description: "Access system reports and analytics dashboard",
    },
    {
      key: "admin.settings",
      route: "/admin/settings",
      title: "System Settings",
      category: "Administration",
      description: "Configure system-wide settings and preferences",
    },
    {
      key: "admin.audit",
      route: "/admin/audit-logs",
      title: "Audit Logs",
      category: "Security",
      description: "View system activity and access logs",
    },
  ];

  useEffect(() => {
    getObservers();
  }, []);

  useEffect(() => {
    if (selectedObserver) {
      loadObserverPermissions(selectedObserver._id);
    }
  }, [selectedObserver]);

  const getObservers = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      const data = await res.json();
      const observerUsers = data.filter((user) => user.Role === "Observer");
      setObservers(observerUsers);
    } catch (error) {
      console.error("Failed to fetch observers:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadObserverPermissions = async (observerId) => {
    try {
      // Mock API call - replace with actual endpoint
      // const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/permissions/${observerId}`);
      // const data = await res.json();

      // For now, create mock permissions (all false initially)
      const mockPermissions = {};
      ROUTES.forEach((route) => {
        mockPermissions[route.key] = Math.random() > 0.5; // Random true/false for demo
      });
      setPermissions(mockPermissions);
    } catch (error) {
      console.error("Failed to load permissions:", error);
    }
  };

  const handlePermissionToggle = (routeKey) => {
    setPermissions((prev) => ({
      ...prev,
      [routeKey]: !prev[routeKey],
    }));
  };

  const savePermissions = async () => {
    if (!selectedObserver) return;

    try {
      // Mock API call - replace with actual endpoint
      // await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/permissions/${selectedObserver._id}`, {
      //   method: "PUT",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${Cookies.get("token")}`,
      //   },
      //   body: JSON.stringify({ permissions })
      // });

      // Show success message
      alert("Permissions saved successfully!");
    } catch (error) {
      console.error("Failed to save permissions:", error);
      alert("Failed to save permissions");
    }
  };

  const resetPermissions = () => {
    const resetPerms = {};
    ROUTES.forEach((route) => {
      resetPerms[route.key] = false;
    });
    setPermissions(resetPerms);
  };

  const grantAllPermissions = () => {
    const allPerms = {};
    ROUTES.forEach((route) => {
      allPerms[route.key] = true;
    });
    setPermissions(allPerms);
  };

  const filteredObservers = observers.filter(
    (observer) =>
      observer.Email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      observer.FirstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      observer.LastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedRoutes = ROUTES.reduce((acc, route) => {
    if (!acc[route.category]) {
      acc[route.category] = [];
    }
    acc[route.category].push(route);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors" />
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ShieldIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Observer Permissions
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage access controls and permissions for observer accounts
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Observers List */}
          <Card className="lg:col-span-1 border-gray-200 shadow-sm">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-gray-500" />
                    Observers List
                  </CardTitle>
                  <CardDescription>
                    {observers.length} observer
                    {observers.length !== 1 ? "s" : ""} found
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={getObservers}
                  className="h-9"
                >
                  <RefreshCwIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {/* Search Bar */}
              <div className="relative mb-4">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search observers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-gray-50 border-gray-200"
                />
              </div>

              {/* Observers List */}
              <ScrollArea className="h-[400px]">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-4 p-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-3 w-[150px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredObservers.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <UserIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No observers found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {searchQuery
                        ? "Try a different search"
                        : "No observer accounts exist"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredObservers.map((observer) => (
                      <div
                        key={observer._id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-gray-50 ${
                          selectedObserver?._id === observer._id
                            ? "bg-blue-50 border-blue-200 ring-2 ring-blue-100"
                            : "border-gray-200"
                        }`}
                        onClick={() => setSelectedObserver(observer)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                              <span className="font-semibold text-blue-600">
                                {observer.FirstName?.[0] ||
                                  observer.Email?.[0] ||
                                  "U"}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {observer.FirstName} {observer.LastName}
                              </h3>
                              <p className="text-sm text-gray-500 truncate max-w-[200px]">
                                {observer.Email}
                              </p>
                            </div>
                          </div>
                          {selectedObserver?._id === observer._id && (
                            <Badge
                              variant="default"
                              className="bg-blue-100 text-blue-700"
                            >
                              <CheckIcon className="h-3 w-3 mr-1" />
                              Selected
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            ID: {observer.FacultyID || "N/A"}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {observer.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Right Panel - Permissions Management */}
          <Card className="lg:col-span-2 border-gray-200 shadow-sm">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {selectedObserver ? (
                      <>
                        <LockIcon className="h-5 w-5 text-gray-500" />
                        Permissions for {selectedObserver.FirstName}{" "}
                        {selectedObserver.LastName}
                      </>
                    ) : (
                      "Select an Observer"
                    )}
                  </CardTitle>
                  <CardDescription>
                    {selectedObserver
                      ? "Configure access permissions for selected observer"
                      : "Select an observer from the list to manage their permissions"}
                  </CardDescription>
                </div>
                {selectedObserver && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetPermissions}
                      className="h-9"
                    >
                      Reset All
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={savePermissions}
                      className="h-9 bg-blue-600 hover:bg-blue-700"
                    >
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              {!selectedObserver ? (
                <div className="text-center py-16">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <EyeIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Observer Selected
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    Select an observer from the list to view and manage their
                    access permissions
                  </p>
                </div>
              ) : (
                <>
                  {/* Observer Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 mb-6 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">
                            {selectedObserver.FirstName?.[0] ||
                              selectedObserver.Email?.[0] ||
                              "U"}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {selectedObserver.FirstName}{" "}
                            {selectedObserver.LastName}
                          </h3>
                          <p className="text-gray-600">
                            {selectedObserver.Email}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="default" className="bg-blue-600">
                              Observer
                            </Badge>
                            <span className="text-sm text-gray-500">
                              Faculty ID: {selectedObserver.FacultyID || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={grantAllPermissions}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Grant All Access
                      </Button>
                    </div>
                  </div>

                  {/* Permissions Tabs */}
                  <Tabs defaultValue="permissions" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                      <TabsTrigger
                        value="permissions"
                        className="flex items-center gap-2"
                      >
                        <LockIcon className="h-4 w-4" />
                        Page Permissions
                      </TabsTrigger>
                      <TabsTrigger
                        value="summary"
                        className="flex items-center gap-2"
                      >
                        <FilterIcon className="h-4 w-4" />
                        Summary
                      </TabsTrigger>
                      <TabsTrigger
                        value="activity"
                        className="flex items-center gap-2"
                      >
                        <RefreshCwIcon className="h-4 w-4" />
                        Recent Activity
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="permissions" className="space-y-6">
                      <ScrollArea className="h-[500px] pr-4">
                        {Object.entries(groupedRoutes).map(
                          ([category, routes]) => (
                            <div key={category} className="mb-6 last:mb-0">
                              <div className="flex items-center gap-2 mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {category}
                                </h3>
                                <Badge variant="outline">
                                  {routes.length} pages
                                </Badge>
                              </div>
                              <div className="grid gap-3">
                                {routes.map((route) => (
                                  <div
                                    key={route.key}
                                    className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors bg-white"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                          <h4 className="font-medium text-gray-900">
                                            {route.title}
                                          </h4>
                                          {permissions[route.key] ? (
                                            <Badge
                                              variant="default"
                                              className="bg-green-100 text-green-800"
                                            >
                                              <CheckIcon className="h-3 w-3 mr-1" />
                                              Allowed
                                            </Badge>
                                          ) : (
                                            <Badge
                                              variant="outline"
                                              className="text-gray-500"
                                            >
                                              <XIcon className="h-3 w-3 mr-1" />
                                              Restricted
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-gray-600">
                                          {route.description}
                                        </p>
                                      </div>
                                      <Switch
                                        checked={
                                          permissions[route.key] || false
                                        }
                                        onCheckedChange={() =>
                                          handlePermissionToggle(route.key)
                                        }
                                        className="data-[state=checked]:bg-green-600"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="summary">
                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div className="bg-white p-4 rounded-lg border shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">
                                Total Pages
                              </span>
                              <Badge variant="outline">{ROUTES.length}</Badge>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                              {
                                Object.values(permissions).filter(Boolean)
                                  .length
                              }
                              <span className="text-sm font-normal text-gray-500 ml-1">
                                allowed
                              </span>
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-lg border shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">
                                Restricted
                              </span>
                              <Badge variant="outline">
                                {ROUTES.length -
                                  Object.values(permissions).filter(Boolean)
                                    .length}
                              </Badge>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                              {Math.round(
                                (Object.values(permissions).filter(Boolean)
                                  .length /
                                  ROUTES.length) *
                                  100
                              )}
                              %
                              <span className="text-sm font-normal text-gray-500 ml-1">
                                access rate
                              </span>
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-lg border shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">
                                Last Updated
                              </span>
                              <RefreshCwIcon className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                              Just now
                            </div>
                          </div>
                        </div>
                        <Separator className="my-6" />
                        <h4 className="font-medium text-gray-900 mb-4">
                          Permissions Summary
                        </h4>
                        <div className="space-y-4">
                          {Object.entries(groupedRoutes).map(
                            ([category, routes]) => {
                              const allowedCount = routes.filter(
                                (r) => permissions[r.key]
                              ).length;
                              const totalCount = routes.length;
                              const percentage = Math.round(
                                (allowedCount / totalCount) * 100
                              );

                              return (
                                <div
                                  key={category}
                                  className="bg-white p-4 rounded-lg border"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-900">
                                      {category}
                                    </span>
                                    <Badge
                                      variant={
                                        percentage === 100
                                          ? "default"
                                          : "outline"
                                      }
                                    >
                                      {allowedCount}/{totalCount} pages
                                    </Badge>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>{allowedCount} allowed</span>
                                    <span>{percentage}% access</span>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="activity">
                      <div className="text-center py-10">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <RefreshCwIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Activity Logs
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                          Activity tracking and audit logs will be displayed
                          here
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
