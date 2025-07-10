import {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarInset,
} from "@/components/ui/sidebar";

export default function AdminSidebar() {
  return (
    <Sidebar className="bg-white h-full">
      <SidebarHeader className="bg-white flex justify-start items-center p-5">
        <div className="flex gap-2 justify-start w-full items-center">
          <SidebarInset className="w-max">
            <img src="/favicon.ico" className="h-10 w-10" />
          </SidebarInset>
          <span className="text-xl text-black">Onscreen Eval</span>
        </div>
      </SidebarHeader>
    </Sidebar>
  );
}
