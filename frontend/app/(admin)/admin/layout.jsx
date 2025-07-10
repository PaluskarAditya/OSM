import React from "react";
import Navbar from "../../components/AdminNavbar";
import { Toaster } from "sonner";
import AdminSidebar from "../../components/Sidebar";

export default function RootLayout({ children }) {
  return (
    <main className="flex w-full">
      <Toaster />
      {/* Current Navbar */}
      <Navbar />

      {/* Implementing Admin Navbar with ShadCN Sidebar */}
      {/* <AdminSidebar /> */}
      {children}
    </main>
  );
}
