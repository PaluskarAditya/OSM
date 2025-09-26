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
  UserCheckIcon,
  UserCircleIcon,
  UserIcon,
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

const SidebarFooterMenu = () => {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [role, setRole] = React.useState("");
  const [mail, setMail] = React.useState("");

  useEffect(() => {
    setRole(Cookies.get("role") || "");
    setMail(Cookies.get("mail") || "");
  }, []);

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("mail");

    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg">
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
                <DropdownMenuItem>
                  <UserCircleIcon />
                  <Link href={"/admin/institute"}>Institute Management</Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
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

  return (
    <main className="flex h-screen">
      <SidebarProvider>
        <Sidebar collapsible="icon" className="h-full border-r">
          <SidebarHeader>
            <SidebarMenuButton size="lg">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Layers3Icon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Evaluation</span>
                <span className="truncate text-xs">XYZ College</span>
              </div>
            </SidebarMenuButton>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Platform</SidebarGroupLabel>
              <SidebarMenu>
                {/* Exams */}
                <SidebarMenuItem>
                  <Collapsible>
                    <CollapsibleTrigger className="group/collapsible" asChild>
                      <SidebarMenuButton className="w-full">
                        <BookCheckIcon className="h-4 w-4" />
                        <span>Exams</span>
                        <ChevronRight className="h-4 w-4 ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {/* Subjects */}
                        <SidebarMenuSubItem>
                          <Collapsible className="group/subjects">
                            <CollapsibleTrigger asChild>
                              <SidebarMenuSubButton className="w-full">
                                <WalletCardsIcon className="h-4 w-4" />
                                <span>Subjects</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/subjects:rotate-90 rotate-0 h-4 w-4" />
                              </SidebarMenuSubButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {EXAM_SUBJECT_ITEMS.map((el) => (
                                  <SidebarMenuSubItem key={el}>
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
                              className="group/question"
                            >
                              <SidebarMenuSubButton className="w-full">
                                <PaperclipIcon className="h-4 w-4" />
                                <span>Question Paper</span>
                                <ChevronRight className="ml-auto h-4 w-4 rotate-0 group-data-[state=open]/question:rotate-90 transition-transform duration-200" />
                              </SidebarMenuSubButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                <SidebarMenuSubItem>
                                  <SidebarMenuSubButton asChild>
                                    <Link href="/admin/qp/create">
                                      Create Paper Excel
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
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
                    <CollapsibleTrigger className="group/inward" asChild>
                      <SidebarMenuButton className="w-full">
                        <LibraryBigIcon className="h-4 w-4" />
                        <span>Inwards / Outwards</span>
                        <ChevronRight className="ml-auto h-4 w-4 rotate-0 group-data-[state=open]/inward:rotate-90 transition-transform duration-200" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <Link href="/admin/inward/configure">
                              Inward Configurations
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
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
                    <CollapsibleTrigger className="group/candidate" asChild>
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
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <Link href="/admin/candidates/subject">
                              Assign Subject
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <Link href="/admin/candidates/exam">
                              Assign Exam
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>

                {/* Answer Sheets */}
                <SidebarMenuItem>
                  <Collapsible>
                    <CollapsibleTrigger asChild className="group/sheet">
                      <SidebarMenuButton className="w-full">
                        <SheetIcon className="h-4 w-4" />
                        <span>Answer Sheets</span>
                        <ChevronRight className="ml-auto h-4 w-4 rotate-0 group-data-[state=open]/sheet:rotate-90 transition-transform duration-200" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <Link href="/admin/answer-sheets/upload">
                              Upload Answer Sheets
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
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
                    <CollapsibleTrigger className="group/eval" asChild>
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
