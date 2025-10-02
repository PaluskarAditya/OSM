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

export default function Page() {
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
        Cookies.set("iid", data.iid);
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
    <div className="flex justify-center items-center min-h-screen bg-[url('/bg.jpg')] bg-cover bg-center p-4">
      <div className="p-6 bg-white rounded-lg flex flex-col gap-4 justify-center items-center w-full max-w-md sm:max-w-lg md:w-2/3 lg:w-1/2 xl:w-1/3 2xl:w-1/4">
        <div className="flex flex-col text-center w-full">
          <h1 className="text-xl sm:text-2xl font-semibold">Evaluation Login</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sign In to access your account
          </p>
        </div>
        
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm font-medium">Role</label>
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
        
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm font-medium">Username/Email</label>
          <Input
            value={creds.uname}
            onChange={(e) => setCreds({ ...creds, uname: e.target.value })}
            placeholder="john doe"
            className="w-full"
          />
        </div>
        
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm font-medium">Password</label>
          <Input
            value={creds.pass}
            onChange={(e) => setCreds({ ...creds, pass: e.target.value })}
            type="password"
            placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
            className="w-full"
          />
        </div>
        
        <Button
          onClick={handleLogin}
          disabled={loading}
          className="text-sm w-full cursor-pointer font-normal mt-2"
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
  );
}