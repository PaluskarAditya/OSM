"use client";

import {
  Layers3Icon,
  LogOutIcon,
  UserCircle2Icon,
  WifiHighIcon,
  WifiOffIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RootLayout({ children }) {
  const router = useRouter();
  const [mail, setMail] = useState("");
  const [token, setToken] = useState("");
  const [speed, setSpeed] = useState("—");
  const [isOnline, setIsOnline] = useState(true);

  // Load user & token
  useEffect(() => {
    const storedMail = Cookies.get("mail");
    const storedToken = Cookies.get("token");

    if (!storedToken) {
      router.push("/evaluate");
      return;
    }

    setMail(storedMail || "User");
    setToken(storedToken);
  }, [router]);

  // Measure internet speed every 5 seconds
  useEffect(() => {
    const measureSpeed = async () => {
      if (!navigator.onLine) {
        setIsOnline(false);
        setSpeed("Offline");
        return;
      }

      setIsOnline(true);
      const start = performance.now();
      try {
        // Use a small, fast image from Google
        await fetch("https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png", {
          method: "GET",
          cache: "no-cache",
          mode: "no-cors",
        });
        const duration = (performance.now() - start) / 1000;
        const fileSizeKB = 3; // approx
        const speedMbps = ((fileSizeKB * 8) / duration).toFixed(2);
        setSpeed(`${speedMbps} Mbps`);
      } catch (err) {
        setSpeed("—");
      }
    };

    measureSpeed();
    const interval = setInterval(measureSpeed, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    Cookies.remove("token", { path: "/" });
    Cookies.remove("mail", { path: "/" });
    toast.success("Logged out successfully");
    router.push("/evaluate");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo & App Name */}
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-lg shadow-md">
                <Layers3Icon className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">Evaluation Portal</h1>
                <p className="text-xs text-gray-500">XYZ College</p>
              </div>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center gap-4">

              {/* Internet Speed */}
              <div className="hidden md:flex items-center gap-2 text-sm">
                <Badge
                  variant="outline"
                  className={`text-xs font-medium flex items-center gap-1.5 px-2 py-1 ${
                    isOnline ? "border-green-300 text-green-700 bg-green-50" : "border-red-300 text-red-700 bg-red-50"
                  }`}
                >
                  {isOnline ? <WifiHighIcon className="w-3.5 h-3.5" /> : <WifiOffIcon className="w-3.5 h-3.5" />}
                  <span>{speed}</span>
                </Badge>
              </div>

              {/* User Profile */}
              <div className="flex items-center gap-2 text-sm">
                <UserCircle2Icon className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-800 hidden sm:inline">
                  {mail || "Evaluator"}
                </span>
              </div>

              {/* Logout Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 font-medium"
              >
                <LogOutIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}