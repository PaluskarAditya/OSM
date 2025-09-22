"use client";

import React from "react";

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
  SidebarMenuAction,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  BookCheckIcon,
  BookOpenCheckIcon,
  ChevronRight,
  ChevronsUpDown,
  Expand,
  Layers3Icon,
  LibraryBigIcon,
  LogOut,
  PackageIcon,
  PaperclipIcon,
  SheetIcon,
  Sparkles,
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Cookies from "js-cookie";
import { useEffect } from "react";

const SidebarFooterMenu = () => {
  const { isMobile } = useSidebar();
  const [role, setRole] = React.useState("");
  const [mail, setMail] = React.useState("");

  useEffect(() => {
    setRole(Cookies.get("role") || "");
    setMail(Cookies.get("mail") || "");
  }, []);

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
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
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="end"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuItem className="cursor-pointer">
                  <UserCircleIcon />
                  <Link href={"/admin/institute"}>Insititute Management</Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
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
    "Specilizations",
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
        <div className="h-full border-r">
          <Sidebar collapsible="icons" className="h-full">
            <SidebarHeader>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
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
                  <Collapsible>
                    <SidebarMenuItem>
                      {/* --- Exam main button --- */}
                      <SidebarMenuButton asChild>
                        <Link href={"/admin"}>
                          <span className="text-sm flex gap-1 justify-center items-center">
                            <BookCheckIcon className="h-4 w-4" />
                            <p>Exams</p>
                          </span>
                        </Link>
                      </SidebarMenuButton>

                      <>
                        {/* --- Exam collapsible --- */}
                        <CollapsibleTrigger asChild className="cursor-pointer">
                          <SidebarMenuAction className="data-[state=open]:rotate-90 cursor-pointer">
                            <ChevronRight className="h-4 w-4" />
                            <span className="sr-only">Toggle</span>
                          </SidebarMenuAction>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {/* --- Subjects Collapsible --- */}
                            <Collapsible>
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  className="w-full"
                                >
                                  <span className="text-sm flex gap-1 justify-start w-full items-center cursor-pointer">
                                    <WalletCardsIcon className="h-4 w-4" />
                                    <p>Subjects</p>
                                  </span>
                                </SidebarMenuSubButton>

                                <>
                                  <CollapsibleTrigger
                                    asChild
                                    className="cursor-pointer"
                                  >
                                    <SidebarMenuAction className="data-[state=open]:rotate-90 cursor-pointer">
                                      <ChevronRight className="h-4 w-4" />
                                      <span className="sr-only">Toggle</span>
                                    </SidebarMenuAction>
                                  </CollapsibleTrigger>

                                  <CollapsibleContent>
                                    <SidebarMenuSub>
                                      {EXAM_SUBJECT_ITEMS.map((el) => (
                                        <SidebarMenuSubItem key={el}>
                                          <SidebarMenuSubButton asChild>
                                            <Link
                                              href={`/admin/${PATH_MAP[el]}`}
                                            >
                                              <span className="text-sm">
                                                {el}
                                              </span>
                                            </Link>
                                          </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                      ))}
                                    </SidebarMenuSub>
                                  </CollapsibleContent>
                                </>
                              </SidebarMenuSubItem>
                            </Collapsible>

                            {/* --- Question Paper Collapsible --- */}
                            <Collapsible>
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  className="w-full"
                                >
                                  <span className="text-sm flex gap-1 justify-start w-full items-center cursor-pointer">
                                    <PaperclipIcon className="h-4 w-4" />
                                    <p>Question Paper</p>
                                  </span>
                                </SidebarMenuSubButton>
                                <>
                                  <CollapsibleTrigger
                                    asChild
                                    className="cursor-pointer"
                                  >
                                    <SidebarMenuAction className="data-[state=open]:rotate-90 cursor-pointer">
                                      <ChevronRight className="h-4 w-4" />
                                      <span className="sr-only">Toggle</span>
                                    </SidebarMenuAction>
                                  </CollapsibleTrigger>

                                  <CollapsibleContent>
                                    <SidebarMenuSub>
                                      <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild>
                                          <Link href={`/admin/qp/create`}>
                                            <span className="text-sm">
                                              Create Paper Excel
                                            </span>
                                          </Link>
                                        </SidebarMenuSubButton>
                                      </SidebarMenuSubItem>
                                      <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild>
                                          <Link href={`/admin/qp/master`}>
                                            <span className="text-sm">
                                              Manage Papers
                                            </span>
                                          </Link>
                                        </SidebarMenuSubButton>
                                      </SidebarMenuSubItem>
                                    </SidebarMenuSub>
                                  </CollapsibleContent>
                                </>
                              </SidebarMenuSubItem>
                            </Collapsible>
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    </SidebarMenuItem>
                  </Collapsible>
                  <Collapsible>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href={"/admin"}>
                          <span className="text-sm flex gap-1 justify-center items-center">
                            <LibraryBigIcon className="h-4 w-4" />
                            <p>Inward / Outward</p>
                          </span>
                        </Link>
                      </SidebarMenuButton>
                      <>
                        <CollapsibleTrigger asChild className="cursor-pointer">
                          <SidebarMenuAction className="data-[state=open]:rotate-90 cursor-pointer">
                            <ChevronRight className="h-4 w-4" />
                            <span className="sr-only">Toggle</span>
                          </SidebarMenuAction>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild>
                                <Link href={`/admin/inward/configure`}>
                                  <span className="text-sm">
                                    Inward Configurations
                                  </span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild>
                                <Link href={`/admin/inward/view`}>
                                  <span className="text-sm">View Inwards</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    </SidebarMenuItem>
                  </Collapsible>
                  <Collapsible>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href={"/admin"}>
                          <span className="text-sm flex gap-1 justify-center items-center">
                            <UserIcon className="h-4 w-4" />
                            <p>Candidates</p>
                          </span>
                        </Link>
                      </SidebarMenuButton>
                      <>
                        <CollapsibleTrigger asChild className="cursor-pointer">
                          <SidebarMenuAction className="data-[state=open]:rotate-90 cursor-pointer">
                            <ChevronRight className="h-4 w-4" />
                            <span className="sr-only">Toggle</span>
                          </SidebarMenuAction>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild>
                                <Link href={`/admin/candidates/data`}>
                                  <span className="text-sm">
                                    Candidates Data
                                  </span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild>
                                <Link href={`/admin/candidates/attendance`}>
                                  <span className="text-sm">
                                    Candidates Attendance
                                  </span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild>
                                <Link href={`/admin/candidates/subject`}>
                                  <span className="text-sm">
                                    Assign Subject
                                  </span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild>
                                <Link href={`/admin/candidates/exam`}>
                                  <span className="text-sm">Assign Exam</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    </SidebarMenuItem>
                  </Collapsible>
                  <Collapsible>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href={"/admin"}>
                          <span className="text-sm flex gap-1 justify-center items-center">
                            <SheetIcon className="h-4 w-4" />
                            <p>Answer Sheets</p>
                          </span>
                        </Link>
                      </SidebarMenuButton>
                      <>
                        <CollapsibleTrigger asChild className="cursor-pointer">
                          <SidebarMenuAction className="data-[state=open]:rotate-90 cursor-pointer">
                            <ChevronRight className="h-4 w-4" />
                            <span className="sr-only">Toggle</span>
                          </SidebarMenuAction>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild>
                                <Link href={`/admin/answer-sheets/upload`}>
                                  <span className="text-sm">
                                    Upload Answer Sheets
                                  </span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild>
                                <Link href={`/admin/answer-sheets/view`}>
                                  <span className="text-sm">View Sheets</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    </SidebarMenuItem>
                  </Collapsible>
                  <Collapsible>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="w-full" asChild>
                        <span className="text-sm flex gap-1 justify-start w-full items-center">
                          <BookOpenCheckIcon className="h-4 w-4" />
                          <p>Evaluation</p>
                        </span>
                      </SidebarMenuButton>
                      <>
                        <CollapsibleTrigger asChild className="cursor-pointer">
                          <SidebarMenuAction className="data-[state=open]:rotate-90 cursor-pointer">
                            <ChevronRight className="h-4 w-4" />
                            <span className="sr-only">Toggle</span>
                          </SidebarMenuAction>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild>
                                <Link href={`/admin/evaluation/assign`}>
                                  <span className="text-sm">
                                    Assign Examiners
                                  </span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    </SidebarMenuItem>
                  </Collapsible>
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooterMenu />
          </Sidebar>
        </div>

        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </main>
  );
}
