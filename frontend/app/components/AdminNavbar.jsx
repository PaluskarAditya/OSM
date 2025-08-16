"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpenText,
  Users,
  FileText,
  ClipboardList,
  Award,
  FileBarChart2,
  PlusCircle,
  Upload,
  UserCog,
  LogOut,
  User,
  ChevronDown,
  ArrowBigRight,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Streams & Subjects", href: "/admin/qp", icon: BookOpenText },
  { name: "Inward / Outward", href: "/admin/inward-outward", icon: ArrowBigRight },
  { name: "Candidates", href: "/admin/candidates", icon: Users },
  { name: "Answer Books", href: "/admin/answer-books", icon: FileText, badge: "New" },
  { name: "Evaluation", href: "/evaluation", icon: ClipboardList },
  { name: "Results", href: "/results", icon: Award },
  { name: "Reports", href: "/reports", icon: FileBarChart2 },
];

const quickLinks = [
  { name: "Create Stream", href: "/streams/new", icon: PlusCircle },
  { name: "Upload PDFs", href: "/answer-books/upload", icon: Upload },
  { name: "Assign Examiner", href: "/evaluation/assign", icon: UserCog },
];

export default function Navbar() {
  const pathname = usePathname();
  const { collapsed } = useSidebar(); // Assuming useSidebar hook provides collapsed state

  return (
    <Sidebar collapsible="icon" className="bg-white border-r">
      {/* Logo Section */}
      <SidebarHeader className="p-4 bg-white">
        <div className="flex items-center gap-2">
          <Image
            src="/favicon.ico"
            alt="Logo"
            width={32}
            height={32}
            className="rounded-md"
          />
          {!collapsed && (
            <h2 className="text-xl font-semibold tracking-tight">
              Onscreen Eval
            </h2>
          )}
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="h-full space-y-1 bg-white">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ name, href, icon: Icon, badge }) => {
                const isActive =
                  pathname === href ||
                  (href !== "/admin" && pathname.startsWith(href));

                return (
                  <Tooltip key={href} delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Link href={href}>
                        <SidebarMenuItem
                          className={cn(
                            "group flex items-center justify-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-accent",
                            collapsed && "justify-center"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          {!collapsed && (
                            <>
                              <span className="flex-1">{name}</span>
                              {badge && (
                                <Badge variant="secondary" className="ml-auto">
                                  {badge}
                                </Badge>
                              )}
                            </>
                          )}
                        </SidebarMenuItem>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{name}</TooltipContent>
                  </Tooltip>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer: Quick Actions + Profile */}
      <SidebarFooter className="p-4 border-t space-y-3">
        {/* Quick Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "w-full",
                collapsed ? "justify-center px-2" : "justify-between"
              )}
            >
              {collapsed ? (
                <PlusCircle className="h-4 w-4" />
              ) : (
                <>
                  <span>Quick Actions</span>
                  <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-56">
            {quickLinks.map(({ name, href, icon: Icon }) => (
              <DropdownMenuItem key={href} asChild>
                <Link href={href} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {name}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full px-2 py-1.5 h-auto",
                collapsed ? "justify-center" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "flex items-center",
                  collapsed ? "gap-0" : "gap-2"
                )}
              >
                <div className="h-8 w-8 flex items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                  SA
                </div>
                {!collapsed && (
                  <SidebarInset>
                    <div className="text-left">
                      <p className="text-sm font-medium">Super Admin</p>
                      <p className="text-xs text-muted-foreground truncate">
                        admin@onscreen.com
                      </p>
                    </div>
                  </SidebarInset>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/logout"
                className="flex items-center gap-2 text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
