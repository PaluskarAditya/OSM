"use client";

import {
  Layers3Icon,
  LogOutIcon,
  UserCircleIcon,
  UserIcon,
  WifiHighIcon,
} from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RootLayout({ children }) {
  const router = useRouter();
  const [mail, setMail] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const mail = Cookies.get("mail");
    const token = Cookies.get("token");
    setMail(mail);
    setToken(token);

    if (!token) {
      router.push("/evaluate");
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("mail");
    toast.success("Logout Successful");
    setMail(null);
    setToken(null);
    router.push("/evaluate");
  };

  return (
    <>
      <nav className="p-4 bg-gray-100 border-b flex justify-between items-center">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-0">
            <div className="flex gap-2 pl-0">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg pl-0">
                <Layers3Icon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Evaluation</span>
                <span className="truncate text-xs text-gray-500">
                  XYZ College
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center gap-5">
          <div className="flex flex-col gap-1 justify-center items-center">
            <span className="flex gap-1 text-sm text-black justify-center items-center">
              <UserCircleIcon className="size-4" />
              <p className="text-sm">{mail}</p>
            </span>
            <Badge variant="default" className="text-xs">
              <WifiHighIcon className="size-4" />
              1.5 mbps
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex cursor-pointer font-normal gap-2 justify-center items-center"
          >
            <span className="text-sm">Logout</span>
            <LogOutIcon className="size-3" />
          </Button>
        </div>
      </nav>
      {children}
    </>
  );
}
