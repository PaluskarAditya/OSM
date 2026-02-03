"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import {
  Layers3,
  LogOut,
  UserCircle2,
  Wifi,
  WifiOff,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function EvaluatorLayout({ children }) {
  const router = useRouter();

  const [userMail, setUserMail] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [connection, setConnection] = useState({
    online: true,
    speed: "—",
  });

  // Auth check & redirect
  useEffect(() => {
    const token = Cookies.get("token");
    const mail = Cookies.get("mail");

    if (!token) {
      toast.error("Session expired", {
        description: "Please sign in again",
      });
      router.replace("/evaluate");
      return;
    }

    setUserMail(mail || "Evaluator");
    setIsAuthenticated(true);
  }, [router]);

  // Internet connection & speed monitoring
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkConnection = async () => {
      if (!navigator.onLine) {
        setConnection({ online: false, speed: "Offline" });
        return;
      }

      setConnection((prev) => ({ ...prev, online: true }));

      const start = performance.now();
      try {
        // Small, reliable asset (Google favicon is tiny & fast)
        await fetch("https://www.google.com/favicon.ico", {
          cache: "no-cache",
          mode: "no-cors",
        });
        const duration = (performance.now() - start) / 1000;
        // Very approximate – real-world usage would use larger test file
        const approxMbps = ((0.008 * 8) / duration).toFixed(1); // ~8KB
        setConnection({ online: true, speed: `${approxMbps} Mbps` });
      } catch {
        setConnection({ online: true, speed: "—" });
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 8000); // less aggressive
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogout = () => {
    Cookies.remove("token", { path: "/" });
    Cookies.remove("role", { path: "/" });
    Cookies.remove("mail", { path: "/" });
    toast.success("You have been logged out", {
      description: "See you next time!",
    });
    router.replace("/evaluate");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100/70">
      {/* Top Navigation – consistent with dashboard header style */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left – Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-md">
                <Layers3 className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold tracking-tight text-gray-900">
                  Evaluation Portal
                </h1>
                <p className="text-xs text-gray-600">XYZ College • Evaluator</p>
              </div>
            </div>

            {/* Right – Status & Actions */}
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Connection Status */}
              <Badge
                variant="outline"
                className={`hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-colors ${
                  connection.online
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                {connection.online ? (
                  <Wifi className="h-3.5 w-3.5" />
                ) : (
                  <WifiOff className="h-3.5 w-3.5" />
                )}
                <span>{connection.speed}</span>
              </Badge>

              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-blue-50 rounded-full">
                  <UserCircle2 className="h-5 w-5 text-blue-700" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {userMail.split("@")[0]}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-[180px]">
                    {userMail}
                  </p>
                </div>
              </div>

              {/* Logout */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </div>
      </main>

      {/* Optional subtle footer */}
      <footer className="border-t border-gray-200 bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} XYZ College • Evaluator Dashboard
        </div>
      </footer>
    </div>
  );
}