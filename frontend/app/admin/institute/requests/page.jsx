"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
  Search,
  Loader2,
  Check,
  X,
  Clock,
  AlertCircle,
  Filter,
  User,
  Shield,
  Download,
  RefreshCw,
  Eye,
  MoreVertical,
} from "lucide-react";
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
const REQUEST_TYPES = {
  passwordReset: { label: "Password Reset", icon: Shield, color: "bg-blue-100 text-blue-800 border-blue-200" },
  accessRequest: { label: "Access Request", icon: User, color: "bg-purple-100 text-purple-800 border-purple-200" },
};

const STATUSES = {
  pending: { label: "Pending", icon: Clock, color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  approved: { label: "Approved", icon: Check, color: "bg-green-100 text-green-800 border-green-200" },
  rejected: { label: "Rejected", icon: X, color: "bg-red-100 text-red-800 border-red-200" },
};

const STATUS_FILTERS = [
  { value: "all", label: "All Requests" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const TYPE_FILTERS = [
  { value: "all", label: "All Types" },
  { value: "passwordReset", label: "Password Reset" },
  { value: "accessRequest", label: "Access Request" },
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

const useRequests = (token) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRequests = useCallback(async () => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/requests`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch requests: ${res.status}`);
      }

      const data = await res.json();
      setRequests(data);
    } catch (error) {
      setError(error.message);
      toast.error("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { requests, loading, error, refreshRequests: fetchRequests };
};

// Loading Skeletons
const TableSkeleton = () => (
  <div className="bg-white rounded-lg border overflow-hidden">
    <div className="p-4 border-b">
      <Skeleton className="h-10 w-full" />
    </div>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="p-4 border-b flex items-center space-x-4">
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-24 ml-auto" />
      </div>
    ))}
  </div>
);

const StatsCards = ({ requests }) => {
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const approved = requests.filter(r => r.status === 'approved').length;
    const rejected = requests.filter(r => r.status === 'rejected').length;

    return [
      { label: "Total Requests", value: total, icon: AlertCircle, color: "bg-blue-50 border-blue-100" },
      { label: "Pending", value: pending, icon: Clock, color: "bg-yellow-50 border-yellow-100" },
      { label: "Approved", value: approved, icon: Check, color: "bg-green-50 border-green-100" },
      { label: "Rejected", value: rejected, icon: X, color: "bg-red-50 border-red-100" },
    ];
  }, [requests]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className={`border ${stat.color} hover:shadow-sm transition-shadow`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className="p-3 rounded-full bg-white border">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Subcomponents
const RequestTable = ({
  requests,
  search,
  statusFilter,
  typeFilter,
  onStatusChange,
  onViewDetails,
}) => {
  const filteredRequests = useMemo(() => {
    let filtered = requests;

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((request) => {
        const userName = `${request.userId?.FirstName || ""} ${request.userId?.LastName || ""}`.toLowerCase();
        const userEmail = request.userId?.Email?.toLowerCase() || "";
        return userName.includes(searchLower) || userEmail.includes(searchLower);
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(request => request.requestType === typeFilter);
    }

    return filtered;
  }, [requests, search, statusFilter, typeFilter]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="py-4 px-4 font-semibold text-gray-700">#</TableHead>
              <TableHead className="py-4 px-4 font-semibold text-gray-700">User</TableHead>
              <TableHead className="py-4 px-4 font-semibold text-gray-700">Request Type</TableHead>
              <TableHead className="py-4 px-4 font-semibold text-gray-700">Status</TableHead>
              <TableHead className="py-4 px-4 font-semibold text-gray-700 hidden md:table-cell">Date</TableHead>
              <TableHead className="py-4 px-4 font-semibold text-gray-700 hidden lg:table-cell">Action By</TableHead>
              <TableHead className="py-4 px-4 font-semibold text-gray-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request, i) => {
                const RequestTypeIcon = REQUEST_TYPES[request.requestType].icon;
                const StatusIcon = STATUSES[request.status].icon;
                
                return (
                  <TableRow key={request._id} className="border-t hover:bg-gray-50/50 transition-colors">
                    <TableCell className="py-3 px-4 font-medium text-gray-600">
                      {i + 1}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {request.userId?.FirstName?.[0]}{request.userId?.LastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {request.userId?.FirstName} {request.userId?.LastName}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-gray-500">
                            <span>{request.userId?.Email}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{request.userId?.Role}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={`${REQUEST_TYPES[request.requestType].color} border-0 rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1`}
                      >
                        <RequestTypeIcon className="w-3 h-3" />
                        {REQUEST_TYPES[request.requestType].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={`${STATUSES[request.status].color} rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {STATUSES[request.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 px-4 hidden md:table-cell">
                      <div className="flex flex-col">
                        <span className="text-sm">{formatDate(request.createdAt)}</span>
                        <span className="text-xs text-gray-500">
                          {getTimeAgo(request.createdAt)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4 hidden lg:table-cell">
                      {request.approvedBy ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-600 text-xs font-medium">
                              {request.approvedBy.FirstName?.[0]}{request.approvedBy.LastName?.[0]}
                            </span>
                          </div>
                          <span className="text-sm">
                            {request.approvedBy.FirstName} {request.approvedBy.LastName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {request.status === 'pending' && (
                            <>
                              <DropdownMenuItem onClick={() => onStatusChange(request._id, 'approved')}>
                                <Check className="w-4 h-4 mr-2 text-green-600" />
                                Approve Request
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onStatusChange(request._id, 'rejected')}>
                                <X className="w-4 h-4 mr-2 text-red-600" />
                                Reject Request
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem onClick={() => onViewDetails(request)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {request.requestType === 'passwordReset' && (
                            <DropdownMenuItem>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <AlertCircle className="h-12 w-12" />
                    <p className="font-medium">No requests found</p>
                    <p className="text-sm">
                      {search ? "Try adjusting your search or filters" : "All requests have been processed"}
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

const RequestDetailsDialog = ({ request, open, onClose, onStatusChange }) => {
  const [processing, setProcessing] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleStatusChange = async (newStatus) => {
    setProcessing(true);
    try {
      await onStatusChange(request._id, newStatus);
      onClose();
    } catch (error) {
      toast.error("Failed to update request");
    } finally {
      setProcessing(false);
    }
  };

  const RequestTypeIcon = REQUEST_TYPES[request.requestType].icon;
  const StatusIcon = STATUSES[request.status].icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b bg-gray-50">
          <DialogTitle className="text-xl font-semibold">
            Request Details
          </DialogTitle>
          <DialogDescription>
            Review request details and take appropriate action
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Request Status Banner */}
            <div className={`p-4 rounded-lg border ${
              request.status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
              request.status === 'approved' ? 'bg-green-50 border-green-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusIcon className={`w-5 h-5 ${
                    request.status === 'pending' ? 'text-yellow-600' :
                    request.status === 'approved' ? 'text-green-600' :
                    'text-red-600'
                  }`} />
                  <div>
                    <h3 className="font-medium">Status: {STATUSES[request.status].label}</h3>
                    <p className="text-sm text-gray-600">
                      Created on {formatDate(request.createdAt)}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`${REQUEST_TYPES[request.requestType].color} border-0 flex items-center gap-1`}
                >
                  <RequestTypeIcon className="w-3 h-3" />
                  {REQUEST_TYPES[request.requestType].label}
                </Badge>
              </div>
            </div>

            {/* User Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">User Information</h3>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-xl">
                        {request.userId?.FirstName?.[0]}{request.userId?.LastName?.[0]}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium text-lg">
                        {request.userId?.FirstName} {request.userId?.LastName}
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>{request.userId?.Email}</p>
                        <div className="flex items-center gap-2">
                          <span>{request.userId?.Role}</span>
                          {request.userId?.MobileNo && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span>{request.userId?.MobileNo}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Request Details */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Request Details</h3>
              <Card>
                <CardContent className="p-4">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Request Type</dt>
                      <dd className="mt-1">
                        <Badge className={`${REQUEST_TYPES[request.requestType].color} flex items-center gap-1 w-fit`}>
                          <RequestTypeIcon className="w-3 h-3" />
                          {REQUEST_TYPES[request.requestType].label}
                        </Badge>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created At</dt>
                      <dd className="mt-1 text-gray-900">{formatDate(request.createdAt)}</dd>
                    </div>
                    {request.updatedAt && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                        <dd className="mt-1 text-gray-900">{formatDate(request.updatedAt)}</dd>
                      </div>
                    )}
                    {request.approvedBy && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Action By</dt>
                        <dd className="mt-1 text-gray-900">
                          {request.approvedBy.FirstName} {request.approvedBy.LastName}
                        </dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            </div>

            {/* Additional Notes for Access Requests */}
            {request.requestType === 'accessRequest' && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Access Details</h3>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-gray-600">
                      User is requesting additional access permissions. Please review their current role and determine if additional access is appropriate.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-gray-50 space-x-2">
          {request.status === 'pending' && (
            <>
              <Button
                variant="outline"
                onClick={() => handleStatusChange('rejected')}
                disabled={processing}
                className="min-w-[100px]"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <X className="w-4 h-4 mr-2" />
                )}
                Reject
              </Button>
              <Button
                onClick={() => handleStatusChange('approved')}
                disabled={processing}
                className="min-w-[100px] bg-green-600 hover:bg-green-700"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Approve
              </Button>
            </>
          )}
          <Button variant="outline" onClick={onClose} className="min-w-[100px]">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const RequestsTab = () => {
  const { role, token } = useAuth();
  const { requests, loading: requestsLoading, refreshRequests } = useRequests(token);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processing, setProcessing] = useState(false);

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

  const handleStatusChange = useCallback(async (requestId, newStatus) => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/requests/${requestId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (res.ok) {
        await refreshRequests();
        toast.success(`Request ${newStatus} successfully`);
        setSelectedRequest(null);
      } else {
        const error = await res.json();
        toast.error(error.err || "Failed to update request");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  }, [token, refreshRequests]);

  const handleExportRequests = useCallback(() => {
    const exportData = requests.map(request => ({
      'User Name': `${request.userId?.FirstName} ${request.userId?.LastName}`,
      'User Email': request.userId?.Email,
      'User Role': request.userId?.Role,
      'Request Type': REQUEST_TYPES[request.requestType].label,
      'Status': STATUSES[request.status].label,
      'Created At': new Date(request.createdAt).toLocaleString(),
      'Action By': request.approvedBy ? 
        `${request.approvedBy.FirstName} ${request.approvedBy.LastName}` : 'N/A',
    }));

    // Create CSV content
    const headers = Object.keys(exportData[0] || {});
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => JSON.stringify(row[header])).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `requests_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);

    toast.success("Requests exported successfully");
  }, [requests]);

  const handleBulkApprove = useCallback(async () => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/requests/bulk-approve`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        await refreshRequests();
        toast.success("Pending requests approved successfully");
      } else {
        const error = await res.json();
        toast.error(error.err || "Failed to approve requests");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  }, [token, refreshRequests]);

  const handleViewDetails = useCallback((request) => {
    setSelectedRequest(request);
  }, []);

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Request Details Dialog */}
      {selectedRequest && (
        <RequestDetailsDialog
          request={selectedRequest}
          open={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Header */}
      <div className="bg-white rounded-xl p-6 border">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Requests</h1>
              <p className="text-gray-600 mt-1">
                Review and manage user access and password reset requests
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleExportRequests}
                variant="outline"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button
                onClick={refreshRequests}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards requests={requests} />

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by user name or email..."
              onChange={handleSearch}
              className="pl-10 rounded-lg"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px] rounded-lg">
                  <SelectValue placeholder="Request Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {TYPE_FILTERS.map((filter) => (
                      <SelectItem key={filter.value} value={filter.value}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] rounded-lg">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {STATUS_FILTERS.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {role === "Admin" && (
              <Button
                onClick={handleBulkApprove}
                variant="default"
                disabled={processing}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Approve All Pending</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Requests Table */}
      {requestsLoading ? (
        <TableSkeleton />
      ) : (
        <RequestTable
          requests={requests}
          search={search}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          onStatusChange={handleStatusChange}
          onViewDetails={handleViewDetails}
        />
      )}

      {/* Quick Actions */}
      {role === "Admin" && (
        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const pendingRequests = requests.filter(r => r.status === 'pending');
                if (pendingRequests.length > 0) {
                  handleViewDetails(pendingRequests[0]);
                }
              }}
            >
              Review Next Pending Request
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTypeFilter('passwordReset')}
            >
              View Password Reset Requests
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusFilter('pending')}
            >
              Show Only Pending
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function RequestsPage() {
  const { role } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className=" p-6 sm:p-6">
      <div className="max-w-[2000px] mx-auto">
        <Tabs defaultValue="requests" className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="cursor-pointer" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Request Management</h1>
                <p className="text-gray-600 text-sm hidden sm:block">
                  Monitor and manage user access and support requests
                </p>
              </div>
            </div>
            
            <TabsList className="bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
              <TabsTrigger
                value="requests"
                className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm flex-1 sm:flex-none"
              >
                <AlertCircle className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Requests</span>
              </TabsTrigger>
              {role === "Admin" && (
                <TabsTrigger
                  value="settings"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm flex-1 sm:flex-none"
                >
                  <Shield className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>
          
          <TabsContent value="requests" className="mt-0">
            <RequestsTab />
          </TabsContent>
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Request Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-4" />
                    <p>Request management settings will be available soon</p>
                    <p className="text-sm mt-2">Configure auto-approval, notifications, and more</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}