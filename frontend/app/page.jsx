"use client";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * NOTE: 'next/navigation' is not available in this preview environment.
 * To make this runnable, we use a mock router or standard state.
 * In your actual Next.js project, revert to: import { useRouter } from 'next/navigation';
 */

export default function LoginPage() {
  const router = useRouter()
  const ROLES = [
    "Admin", "Observer", "COE Login", "Photocopy Viewer",
    "Examiner", "Scanner", "Head Examiner", "Moderator",
  ];

  const [creds, setCreds] = useState({ role: "", uname: "", pass: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Check for existing token on mount
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      console.log("Authenticated. Redirecting to admin...");
      // window.location.href = "/admin"; // In real Next.js use router.push
    }
  }, []);

  const validatePassword = (password) => {
    if (password.length < 8) return "Min 8 characters required";
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return "Must include Caps, Small & Number";
    return "";
  };

  const handleLogin = async () => {
    if (!creds.role || !creds.uname || !creds.pass) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(creds),
      });

      const data = await res.json();
      if (res.ok) {
        Cookies.set("token", data.token);
        Cookies.set("role", data.role);
        Cookies.set("mail", data.mail);
        Cookies.set("iid", data.iid);
        Cookies.set("perms", data.perms);
        Cookies.set("id", data.id);

        if (data.changePassword === false) {
          setShowChangePassword(true);
          return;
        }
        toast.success("Login Successful");
        router.push('/admin')
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      showChangePassword ? handleChangePassword() : handleLogin();
    }
  };

  const handleChangePassword = async () => {
    const vErr = validatePassword(newPassword);
    if (vErr) return setPasswordError(vErr);
    if (newPassword !== confirmPassword) return setPasswordError("Passwords do not match");

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/auth/change-pass`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      if (res.ok) {
        toast.success("Password updated!");
        setShowChangePassword(false);
        // window.location.href = "/admin";
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Update failed");
      }
    } catch (error) {
      toast.error("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!creds.uname) return toast.error("Enter username first.");
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/requests/request-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: creds.uname }),
      });
      if (res.ok) toast.success("Reset request sent!");
    } catch (error) {
      toast.error("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const closePasswordDialog = () => {
    setShowChangePassword(false);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    Cookies.remove("token");
  };

  return (
    <div className="min-h-screen flex items-center justify-center lg:justify-end bg-cover bg-center bg-no-repeat px-6 lg:px-32 bg-slate-100"
      style={{ backgroundImage: "url('/bg.jpg')" }}>
      <div className="w-full max-w-[340px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden transition-all duration-300">
        {/* Top Accent Bar */}
        <div className="h-1.5 bg-blue-700 w-full" />

        <div className="p-8 pb-12">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-xl font-bold text-blue-800 tracking-tight leading-tight uppercase">
              Management Login
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Secure Access Portal
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-6 w-full">
            {/* Role Selection */}
            <div className="w-full space-y-1">
              <Select value={creds.role} onValueChange={(v) => setCreds({ ...creds, role: v })}>
                <SelectTrigger className="border-0 border-b border-gray-300 rounded-none px-0 h-11 focus:ring-0 focus:border-blue-600 bg-transparent transition-colors shadow-none text-sm font-medium w-full">
                  <SelectValue placeholder="Select Account Role" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectGroup>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r} className="py-2.5 cursor-pointer text-xs">{r}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Username */}
            <div className="space-y-1">
              <Input
                className="border-0 border-b border-gray-300 rounded-none px-0 h-11 focus-visible:ring-0 focus-visible:border-blue-600 bg-transparent transition-colors placeholder:text-gray-400 text-xs shadow-none"
                value={creds.uname}
                onChange={(e) => setCreds({ ...creds, uname: e.target.value })}
                placeholder="Username or Email"
                onKeyDown={handleKeyPress}
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="relative">
                <Input
                  className="border-0 border-b border-gray-300 rounded-none px-0 h-11 focus-visible:ring-0 focus-visible:border-blue-600 bg-transparent transition-colors placeholder:text-gray-400 text-xs pr-10 shadow-none"
                  type={showPassword ? "text" : "password"}
                  value={creds.pass}
                  onChange={(e) => setCreds({ ...creds, pass: e.target.value })}
                  placeholder="Password"
                  onKeyDown={handleKeyPress}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-3 text-gray-400 hover:text-blue-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mt-8 flex items-center justify-between">
            {creds.role !== 'Admin' && creds.uname !== "" ? (
              <button
                onClick={handleCreateRequest}
                className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-blue-700 transition-colors underline-offset-4 hover:underline"
              >
                Forgot?
              </button>
            ) : <div />}

            <Button
              onClick={handleLogin}
              disabled={loading}
              className="h-12 w-12 rounded-full bg-blue-700 hover:bg-blue-800 shadow-lg flex items-center justify-center transition-all active:scale-95 border-none p-0"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5 text-white" />
              ) : (
                <ArrowRight className="h-6 w-6 text-white" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showChangePassword} onOpenChange={closePasswordDialog}>
        <DialogContent className="sm:max-w-[400px] p-0 border-none rounded-none shadow-2xl">
          <div className="h-1.5 bg-blue-700 w-full" />
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-bold uppercase tracking-tight text-blue-800">Security Update</DialogTitle>
              <DialogDescription className="text-gray-500 font-medium text-xs">
                Please set a new password to continue.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPasswordError(""); }}
                  placeholder="New Password"
                  className="border-0 border-b border-gray-300 rounded-none px-0 h-11 focus-visible:ring-0 focus-visible:border-blue-600 shadow-none text-xs"
                  onKeyDown={handleKeyPress}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-0 top-3 text-gray-400"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(""); }}
                placeholder="Confirm New Password"
                className="border-0 border-b border-gray-300 rounded-none px-0 h-11 focus-visible:ring-0 focus-visible:border-blue-600 shadow-none text-xs"
                onKeyDown={handleKeyPress}
              />

              {passwordError && (
                <p className="text-[10px] text-red-600 font-bold uppercase tracking-wide bg-red-50 p-2 border-l-2 border-red-600">
                  {passwordError}
                </p>
              )}
            </div>

            <div className="mt-10 flex flex-col gap-3">
              <Button onClick={handleChangePassword} disabled={loading} className="w-full bg-blue-700 h-12 text-xs font-bold uppercase tracking-widest hover:bg-blue-800 border-none">
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Save Changes"}
              </Button>
              <Button variant="ghost" onClick={closePasswordDialog} className="text-gray-400 text-[10px] font-bold uppercase hover:bg-transparent tracking-widest">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}