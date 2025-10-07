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
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const ROLES = [
    "Admin",
    "Observer",
    "COE Login",
    "Photocopy Viewer",
    "Examiner",
    "Scanner",
    "Head Examiner",
    "Moderator",
  ];

  const [creds, setCreds] = useState({ role: "", uname: "", pass: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      router.push("/admin");
    }
  }, [router]);

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return "Password must contain at least one special character";
    }
    return "";
  };

  const handleLogin = async () => {
    // Validation
    if (!creds.role || !creds.uname || !creds.pass) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/login`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(creds),
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (data.changePassword === false) {
          setShowChangePassword(true);
          Cookies.set("token", data.token);
          Cookies.set("role", data.role);
          Cookies.set("mail", data.mail);
          Cookies.set("iid", data.iid);
          setLoading(false);
          return;
        }

        // Normal login
        Cookies.set("token", data.token);
        Cookies.set("role", data.role);
        Cookies.set("mail", data.mail);
        Cookies.set("iid", data.iid);
        toast.success("Login Successful");
        router.push("/admin");
        return;
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Login failed");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (showChangePassword) {
        handleChangePassword();
      } else {
        handleLogin();
      }
    }
  };

  const handleChangePassword = async () => {
    // Validate new password
    const validationError = validatePassword(newPassword);
    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/change-pass`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
          body: JSON.stringify({ newPassword }),
        }
      );

      if (res.ok) {
        toast.success("Password changed successfully!");
        setShowChangePassword(false);
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError("");
        router.push("/admin");
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to change password");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
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
    <>
      <div className="flex justify-center items-center min-h-screen bg-[url('/bg.jpg')] bg-cover bg-center p-4">
        <div className="p-6 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 flex flex-col gap-4 justify-center items-center w-full max-w-md">
          <div className="flex flex-col text-center w-full">
            <h1 className="text-2xl font-bold text-gray-900">
              Evaluation Login
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Sign in to access your account
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Role</label>
              <Select
                value={creds.role}
                onValueChange={(value) => setCreds({ ...creds, role: value })}
              >
                <SelectTrigger className="cursor-pointer w-full">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {ROLES.map((role) => (
                      <SelectItem
                        key={role}
                        value={role}
                        className="cursor-pointer"
                      >
                        {role}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Username/Email
              </label>
              <Input
                value={creds.uname}
                onChange={(e) => setCreds({ ...creds, uname: e.target.value })}
                placeholder="Enter your username or email"
                className="w-full"
                onKeyPress={handleKeyPress}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Input
                  value={creds.pass}
                  onChange={(e) => setCreds({ ...creds, pass: e.target.value })}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full pr-10"
                  onKeyPress={handleKeyPress}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full cursor-pointer font-medium mt-2"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin h-4 w-4" />
                Logging in...
              </div>
            ) : (
              "Login"
            )}
          </Button>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showChangePassword} onOpenChange={closePasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Change Password</DialogTitle>
            <DialogDescription className="text-base">
              For security reasons, you must change your password before
              continuing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError("");
                  }}
                  placeholder="Enter new password"
                  className="pr-10"
                  onKeyPress={handleKeyPress}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
              {passwordError && newPassword && (
                <p className="text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError("");
                }}
                placeholder="Confirm new password"
                onKeyPress={handleKeyPress}
              />
              {passwordError &&
                confirmPassword &&
                newPassword !== confirmPassword && (
                  <p className="text-sm text-red-600">Passwords do not match</p>
                )}
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-1">
                Password Requirements:
              </p>
              <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
                <li>At least 8 characters long</li>
                <li>One uppercase letter</li>
                <li>One lowercase letter</li>
                <li>One number</li>
                <li>One special character (@$!%*?&)</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-col gap-2">
            <Button
              onClick={handleChangePassword}
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" />
                  Changing Password...
                </div>
              ) : (
                "Change Password"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={closePasswordDialog}
              disabled={loading}
              className="w-full"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
