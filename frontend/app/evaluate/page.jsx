"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Loader2, LogIn, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EvaluatorLogin() {
  const [creds, setCreds] = useState({ uname: "", pass: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /* ------------------------------------------------------------------ */
  /*  Redirect if already logged in                                     */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const token = Cookies.get("token");
    const role = Cookies.get("role");

    if (token && role) {
      if (!["Examiner", "Moderator"].includes(role)) {
        toast.error("Invalid Permissions");
        router.push("/admin");
        return;
      }
      router.push("/evaluate/home");
    }
  }, [router]);

  /* ------------------------------------------------------------------ */
  /*  Login handler with validation                                     */
  /* ------------------------------------------------------------------ */
  const handleLogin = async () => {
    if (!creds.uname.trim() || !creds.pass.trim()) {
      toast.error("Please fill in both fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/eval`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ uname: creds.uname, pass: creds.pass }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        Cookies.set("token", data.token, { expires: 7 });
        Cookies.set("role", data.role, { expires: 7 });
        Cookies.set("mail", data.mail, { expires: 7 });

        toast.success(`Welcome, ${data.role}!`);
        router.push("/evaluate/home");
      } else {
        toast.error(data.message ?? "Invalid credentials");
      }
    } catch (err) {
      toast.error("Network error – try again later");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[url('/bg.jpg')] bg-cover bg-center p-4">
      {/* Responsive Card */}
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl rounded-xl bg-white p-6 sm:p-8 shadow-xl">

        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Evaluator Login</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Login to continue evaluation
            <span className="block text-xs text-gray-400 mt-1">only for evaluators</span>
          </p>
        </div>

        {/* Username */}
        <div className="mb-4">
          <label htmlFor="uname" className="block text-sm font-medium text-gray-700 mb-1">
            Username / Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="uname"
              value={creds.uname}
              onChange={(e) => setCreds({ ...creds, uname: e.target.value })}
              placeholder="john.doe@example.com"
              className="pl-10 text-sm sm:text-base"
              autoComplete="username"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-6">
          <label htmlFor="pass" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="pass"
              type="password"
              value={creds.pass}
              onChange={(e) => setCreds({ ...creds, pass: e.target.value })}
              placeholder="••••••••"
              className="pl-10 text-sm sm:text-base"
              autoComplete="current-password"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm sm:text-base font-medium text-white transition hover:bg-blue-700 disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Logging in…
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Login
            </>
          )}
        </Button>

        {/* Footer Note */}
        <p className="mt-5 text-center text-xs text-gray-500">
          Need help? Contact{" "}
          <a href="mailto:support@xyzcollege.edu" className="underline hover:text-blue-600">
            support@xyzcollege.edu
          </a>
        </p>
      </div>
    </div>
  );
}