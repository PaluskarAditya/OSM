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
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function page() {
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
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");

    if (token) {
      router.push("/admin");
    }
  }, []);

  const handleLogin = async () => {
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
        Cookies.set("token", data.token);
        Cookies.set("role", data.role);
        Cookies.set("mail", data.mail);
        toast.success("Login Successful");
        setLoading(false);
        router.push("/admin");
        return;
      }

      setLoading(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[url('/bg.jpg')] bg-cover">
      <div className="p-4 bg-white rounded-lg flex flex-col gap-3 justify-center items-center w-1/4">
        <div className="flex flex-col text-center">
          <h1>Evaluation Login</h1>
          <p className="text-sm text-gray-500">
            Sign In to access your account
          </p>
        </div>
        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm">Role</label>
          <Select
            value={creds.role}
            onValueChange={(value) => setCreds({ ...creds, role: value })}
          >
            <SelectTrigger className="cursor-pointer w-full">
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {ROLES.map((role) => (
                  <SelectItem
                    key={role}
                    value={role}
                    className="text-sm cursor-pointer"
                  >
                    {role}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col text-sm gap-1 w-full">
          <label>Username/Email</label>
          <Input
            value={creds.uname}
            onChange={(e) => setCreds({ ...creds, uname: e.target.value })}
            placeholder="john doe"
          />
        </div>
        <div className="flex flex-col text-sm gap-1 w-full">
          <label>Password</label>
          <Input
            value={creds.pass}
            onChange={(e) => setCreds({ ...creds, pass: e.target.value })}
            type="password"
            placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
          />
        </div>
        <Button
          onClick={handleLogin}
          disabled={loading}
          className="text-sm w-full cursor-pointer font-normal"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-4 w-4" />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </Button>
      </div>
    </div>
  );
}
