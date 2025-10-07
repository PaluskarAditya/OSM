"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarInset,
  useSidebar,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  BookCheckIcon,
  BookOpenCheckIcon,
  ChevronRight,
  ChevronsUpDown,
  Layers3Icon,
  LibraryBigIcon,
  LogOut,
  PaperclipIcon,
  SheetIcon,
  SquareCheckBigIcon,
  UserCheckIcon,
  UserCircleIcon,
  UserIcon,
  ViewIcon,
  WalletCardsIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const SidebarFooterMenu = () => {
  const { isMobile } = useSidebar();

  const [role, setRole] = React.useState("");
  const [mail, setMail] = React.useState("");

  const router = useRouter();

  useEffect(() => {
    setRole(Cookies.get("role") || "");
    setMail(Cookies.get("mail") || "");
  }, []);

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("mail");
    Cookies.remove("iid");

    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg" className="cursor-pointer">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <UserCheckIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <p className="truncate font-medium">{role}</p>
                  <p className="truncate text-xs">{mail}</p>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-[14rem] rounded-lg"
              align="end"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuGroup>
                {role === "Admin" && (
                  <DropdownMenuItem>
                    <ViewIcon />
                    <Link href={"/admin/institute/observer-perms"}>
                      Observer Permissions
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <UserCircleIcon />
                  <Link href={"/admin/institute"}>Institute Management</Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer">
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
};

export default function RootLayout({ children }) {
  const EXAM_SUBJECT_ITEMS = [
    "Streams",
    "Degrees",
    "Academic Years",
    "Courses",
    "Specializations",
    "Subjects",
  ];

  const PATH_MAP = {
    Streams: "streams",
    Degrees: "degrees",
    Courses: "courses",
    "Academic Years": "academic-years",
    Specializations: "specializations",
    Subjects: "subjects",
  };

  const [iid, setIid] = useState(null);
  const [institute, setInstitute] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setToken(Cookies.get("token"));
    setIid(Cookies.get("iid"));
    setRole(Cookies.get("role"));
  }, []);

  useEffect(() => {
    if (!token || !iid) return;

    setLoading(true);
    const getData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/institute`,
          {
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        const user_ins = data.find((el) => el.IID === Number(iid));
        setInstitute(user_ins);
        setLoading(false);
      } catch (error) {
        toast.error(error.message);
        setLoading(false);
      }
    };

    getData();
  }, [token, iid]);

  return (
    <main className="flex h-screen">
      <SidebarProvider>
        <Sidebar collapsible="icon" className="h-full border-r">
          <Link href={"/admin"}>
            <SidebarHeader>
              <SidebarMenuButton size="lg" className="cursor-pointer">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Layers3Icon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Evaluation</span>
                  <span className="truncate text-xs">
                    {loading ? "Loading..." : institute && institute.name}
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarHeader>
          </Link>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Platform</SidebarGroupLabel>
              <SidebarMenu>
                {/* Exams */}
                <SidebarMenuItem>
                  <Collapsible>
                    <CollapsibleTrigger
                      className="group/collapsible cursor-pointer"
                      asChild
                    >
                      <SidebarMenuButton className="w-full">
                        <BookCheckIcon className="h-4 w-4" />
                        <span>Exams</span>
                        <ChevronRight className="h-4 w-4 ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 rotate-0" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {/* Subjects */}
                        <SidebarMenuSubItem>
                          <Collapsible className="group/subjects">
                            <CollapsibleTrigger
                              asChild
                              className="cursor-pointer"
                            >
                              <SidebarMenuSubButton className="w-full">
                                <WalletCardsIcon className="h-4 w-4" />
                                <span>Subjects</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/subjects:rotate-90 rotate-0 h-4 w-4" />
                              </SidebarMenuSubButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {EXAM_SUBJECT_ITEMS.map((el) => (
                                  <SidebarMenuSubItem
                                    key={el}
                                    className="cursor-pointer"
                                  >
                                    <SidebarMenuSubButton asChild>
                                      <Link href={`/admin/${PATH_MAP[el]}`}>
                                        {el}
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </Collapsible>
                        </SidebarMenuSubItem>

                        {/* Question Paper */}
                        <SidebarMenuSubItem>
                          <Collapsible>
                            <CollapsibleTrigger
                              asChild
                              className="group/question cursor-pointer"
                            >
                              <SidebarMenuSubButton className="w-full">
                                <PaperclipIcon className="h-4 w-4" />
                                <span>Question Paper</span>
                                <ChevronRight className="ml-auto h-4 w-4 rotate-0 group-data-[state=open]/question:rotate-90 transition-transform duration-200" />
                              </SidebarMenuSubButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {role === "Admin" && (
                                  <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild>
                                      <Link href="/admin/qp/create">
                                        Create Paper Excel
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                )}
                                <SidebarMenuSubItem>
                                  <SidebarMenuSubButton asChild>
                                    <Link href="/admin/qp/master">
                                      Manage Papers
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </Collapsible>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>

                {/* Inwards / Outwards */}
                <SidebarMenuItem>
                  <Collapsible>
                    <CollapsibleTrigger
                      className="group/inward cursor-pointer"
                      asChild
                    >
                      <SidebarMenuButton className="w-full">
                        <LibraryBigIcon className="h-4 w-4" />
                        <span>Inwards / Outwards</span>
                        <ChevronRight className="ml-auto h-4 w-4 rotate-0 group-data-[state=open]/inward:rotate-90 transition-transform duration-200" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {role === "Admin" && (
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild>
                              <Link href="/admin/inward/configure">
                                Inward Configurations
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )}
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <Link href="/admin/inward/view">View Inwards</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>

                {/* Candidates */}
                <SidebarMenuItem>
                  <Collapsible>
                    <CollapsibleTrigger
                      className="group/candidate cursor-pointer"
                      asChild
                    >
                      <SidebarMenuButton className="w-full">
                        <UserIcon className="h-4 w-4" />
                        <span>Candidates</span>
                        <ChevronRight className="ml-auto h-4 w-4 rotate-0 group-data-[state=open]/candidate:rotate-90 transition-transform duration-200" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <Link href="/admin/candidates/data">
                              Candidates Data
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <Link href="/admin/candidates/attendance">
                              Candidates Attendance
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        {role === "Admin" && (
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild>
                              <Link href="/admin/candidates/subject">
                                Assign Subject
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )}
                        {role === "Admin" && (
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild>
                              <Link href="/admin/candidates/exam">
                                Assign Exam
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>

                {/* Answer Sheets */}
                <SidebarMenuItem>
                  <Collapsible>
                    <CollapsibleTrigger
                      asChild
                      className="group/sheet cursor-pointer"
                    >
                      <SidebarMenuButton className="w-full">
                        <SheetIcon className="h-4 w-4" />
                        <span>Answer Sheets</span>
                        <ChevronRight className="ml-auto h-4 w-4 rotate-0 group-data-[state=open]/sheet:rotate-90 transition-transform duration-200" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {role === "Admin" && (
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild>
                              <Link href="/admin/answer-sheets/upload">
                                Upload Answer Sheets
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )}
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <Link href="/admin/answer-sheets/view">
                              View Sheets
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>

                {/* Evaluation */}
                <SidebarMenuItem>
                  <Collapsible>
                    <CollapsibleTrigger
                      className="group/eval cursor-pointer"
                      asChild
                    >
                      <SidebarMenuButton className="w-full">
                        <BookOpenCheckIcon className="h-4 w-4" />
                        <span>Evaluation</span>
                        <ChevronRight className="h-4 w-4 ml-auto transition-transform duration-200 group-data-[state=open]/eval:rotate-90 rotate-0" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <Link href="/admin/evaluation/assign">
                              Assign Examiners
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>

                {/* Results */}
                <SidebarMenuItem>
                  <Collapsible>
                    <CollapsibleTrigger
                      className="group/eval cursor-pointer"
                      asChild
                    >
                      <SidebarMenuButton className="w-full">
                        <SquareCheckBigIcon className="h-4 w-4" />
                        <span>Results</span>
                        <ChevronRight className="h-4 w-4 ml-auto transition-transform duration-200 group-data-[state=open]/eval:rotate-90 rotate-0" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <Link href="/admin/evaluation/assign">
                              View Evaluation Results
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooterMenu />
        </Sidebar>

        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </main>
  );
}
