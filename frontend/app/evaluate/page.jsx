"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EvaluatorLogin() {
  const router = useRouter();

  const [form, setForm] = useState({ identifier: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const token = Cookies.get("token");
    const role = Cookies.get("role");

    if (token && role) {
      if (!["Examiner", "Moderator"].includes(role)) {
        toast.error("Access restricted", { description: "Redirecting..." });
        router.replace("/admin");
        return;
      }
      router.replace("/evaluate/home");
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async () => {
    const { identifier, password } = form;

    if (!identifier.trim() || !password.trim()) {
      setError("Please fill in both fields");
      toast.error("Missing fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/eval`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uname: identifier.trim(),
            pass: password,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        Cookies.set("token", data.token, { expires: 7, sameSite: "lax" });
        Cookies.set("role", data.role, { expires: 7, sameSite: "lax" });
        Cookies.set("mail", data.mail, { expires: 7, sameSite: "lax" });

        toast.success(`Welcome, ${data.role || "Evaluator"}!`);
        router.push("/evaluate/home");
      } else {
        const msg = data.message || "Invalid credentials";
        setError(msg);
        toast.error(msg);
      }
    } catch {
      const msg = "Cannot connect. Please try again.";
      setError(msg);
      toast.error("Network error", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const onEnter = (e) => {
    if (e.key === "Enter" && !isLoading) handleSubmit();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-end bg-cover bg-center bg-no-repeat px-20"
      style={{ backgroundImage: "url(/eval-bg.jpg)" }}
    >
      {/* Card – exact compact style from screenshot */}
      <div className="w-full max-w-[300px] bg-white/95 backdrop-blur-sm shadow-2xl overflow-hidden">
        {/* Blue top accent bar */}
        <div className="h-1.5 bg-blue-600" />

        <div className="p-8 pb-10">
          {/* Brand / Title */}
          <div className="text-left mb-8">
            <h1 className="text-lg font-bold text-blue-700 tracking-tight">
              EVALUATOR LOGIN
            </h1>
            <p className="text-sm font-medium text-gray-700 mt-1">Sign In</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 text-red-600 text-sm text-center bg-red-50 py-2 px-4 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="space-y-5">
            <Input
              type="text"
              name="identifier"
              value={form.identifier}
              onChange={handleChange}
              onKeyDown={onEnter}
              placeholder="Username or Email"
              disabled={isLoading}
              className="border-0 test-xs border-b h-11 border-gray-300 shadow-none rounded-none"
            />

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                onKeyDown={onEnter}
                placeholder="Password"
                disabled={isLoading}
                className="border-0 test-xs border-b h-11 border-gray-300 shadow-none rounded-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Sign In Button – floating circle arrow style */}
            <div className="flex relative justify-end mt-8 ">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="relative z-20 cursor-pointer h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center border-none"
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <ArrowRight className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}