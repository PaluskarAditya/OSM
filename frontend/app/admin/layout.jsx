"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ROUTES from "../../lib/ROUTES";
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
  Paperclip,
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
    Cookies.remove("perms");

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
  const [permissions, setPermissions] = useState([]);
  const [id, setId] = useState(null);

  useEffect(() => {
    updatePerms();

    setToken(Cookies.get("token"));
    setId(Cookies.get("id"));
    setIid(Cookies.get("iid"));
    setRole(Cookies.get("role"));
    setPermissions(Cookies.get("perms"));

    console.log(ROUTES, permissions);
  }, []);

  const updatePerms = async () => {
    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_BACKEND_URL
      }/api/v1/users/permissions/${Cookies.get("id")}`,
      {
        method: "GET",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      }
    );
    const data = await res.json();
    setPermissions(data.perms);
    Cookies.set("perms", data.perms);
  };

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

  const SUBJECT_KEYS = [
    "admin.streams",
    "admin.degrees",
    "admin.courses",
    "admin.academic-years",
    "admin.specializations",
    "admin.subjects",
  ];
  const QP_KEYS = ["admin.qp.create", "admin.qp.pdf", "admin.qp.manage"];
  const INWARD_KEYS = ["admin.inward.configure"];
  const CANDIDATE_KEYS = [
    "admin.candidates.data",
    "admin.candidates.attendance",
    "admin.candidates.subject",
    "admin.candidates.exam",
  ];
  const ANSWER_SHEET_KEYS = ["admin.answers.upload", "admin.answers.view"];
  const EVALUATION_KEYS = ["admin.evaluation.assign"];
  const RESULT_KEYS = ["admin.results.view"];
  const REPORT_KEYS = ["admin.reports.view"];

  const canAccess = (key) => role === "Admin" || permissions.includes(key);

  const hasAnyAccess = (keys = []) =>
    role === "Admin" || keys.some((k) => permissions && permissions.includes(k));

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
                  <span className="truncate font-medium">NEXA</span>
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
                {((role !== "Admin" && permissions?.length > 0) ||
                  permissions === undefined) && (
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
                          {hasAnyAccess(SUBJECT_KEYS) && (
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
                                    {EXAM_SUBJECT_ITEMS.map((el) => {
                                      const canAccess = (key) =>
                                        role === "Admin" ||
                                        permissions.includes(key);
                                      const routeKey = `admin.${PATH_MAP[el]}`;
                                      if (!canAccess(routeKey)) return null;

                                      return (
                                        <SidebarMenuSubItem
                                          key={el}
                                          className="cursor-pointer"
                                        >
                                          <SidebarMenuSubButton asChild>
                                            <Link
                                              href={`/admin/${PATH_MAP[el]}`}
                                            >
                                              {el}
                                            </Link>
                                          </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                      );
                                    })}
                                  </SidebarMenuSub>
                                </CollapsibleContent>
                              </Collapsible>
                            </SidebarMenuSubItem>
                          )}

                          {/* Question Paper */}
                          {hasAnyAccess(QP_KEYS) && (
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
                                    {canAccess("admin.qp.create") && (
                                      <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild>
                                          <Link href="/admin/qp/create">
                                            Create Paper
                                          </Link>
                                        </SidebarMenuSubButton>
                                      </SidebarMenuSubItem>
                                    )}

                                    {canAccess("admin.qp.pdf") && (
                                      <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild>
                                          <Link href="/admin/qp/key">
                                            PDF / Key
                                          </Link>
                                        </SidebarMenuSubButton>
                                      </SidebarMenuSubItem>
                                    )}

                                    {canAccess("admin.qp.manage") && (
                                      <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild>
                                          <Link href="/admin/qp/master">
                                            Manage Papers
                                          </Link>
                                        </SidebarMenuSubButton>
                                      </SidebarMenuSubItem>
                                    )}
                                  </SidebarMenuSub>
                                </CollapsibleContent>
                              </Collapsible>
                            </SidebarMenuSubItem>
                          )}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  </SidebarMenuItem>
                )}

                {/* Inwards / Outwards */}
                {hasAnyAccess(INWARD_KEYS) && (
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
                          {canAccess("admin.inward.configure") && (
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild>
                                  <Link href="/admin/inward/configure">
                                    Inward Configurations
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )}
                          {/* <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <Link href="/admin/inward/view">View Inwards</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem> */}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  </SidebarMenuItem>
                )}

                {/* Candidates */}
                {hasAnyAccess(CANDIDATE_KEYS) && (
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
                          {canAccess("admin.candidates.data") && (
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild>
                                  <Link href="/admin/candidates/data">
                                    Data
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )}
                          {canAccess("admin.candidates.attendance") && (
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild>
                                  <Link href="/admin/candidates/attendance">
                                    Attendance
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )}
                          {canAccess("admin.candidates.subject") && (
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild>
                                  <Link href="/admin/candidates/subject">
                                    Assign Subject
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )}
                          {canAccess("admin.candidates.exam") && (
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
                )}

                {/* Answer Sheets */}
                {hasAnyAccess(ANSWER_SHEET_KEYS) && (
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
                          {canAccess("admin.answers.upload") && (
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild>
                                  <Link href="/admin/answer-sheets/upload">
                                    Upload Answer Sheets
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )}
                          {canAccess("admin.answers.view") &&
                            role === "Admin" && (
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild>
                                  <Link href="/admin/answer-sheets/view">
                                    View Sheets
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  </SidebarMenuItem>
                )}

                {/* Evaluation */}
                {hasAnyAccess(EVALUATION_KEYS) && (
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
                          {canAccess("admin.evaluation.assign") && (
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild>
                                  <Link href="/admin/evaluation/assign">
                                    Assign Examiners
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  </SidebarMenuItem>
                )}

                {/* Results */}
                {hasAnyAccess(RESULT_KEYS) && (
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
                          {canAccess("admin.results.view") && (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild>
                                <Link href="/admin/results/view">
                                  View Evaluation Results
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  </SidebarMenuItem>
                )}

                {/* Reports */}
                {hasAnyAccess(REPORT_KEYS) && (
                  <SidebarMenuItem>
                    <Collapsible>
                      <CollapsibleTrigger
                        className="group/eval cursor-pointer"
                        asChild
                      >
                        <SidebarMenuButton className="w-full">
                          <Paperclip className="h-4 w-4" />
                          <span>Reports</span>
                          <ChevronRight className="h-4 w-4 ml-auto transition-transform duration-200 group-data-[state=open]/eval:rotate-90 rotate-0" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {canAccess("admin.reports.view") && (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild>
                                <Link href="/admin/reports/view">
                                  View Reports
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  </SidebarMenuItem>
                )}
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
