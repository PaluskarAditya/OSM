import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";

export default function page() {
  return (
    <div className="bg-white p-5 flex flex-col gap-5">
      <div className="flex flex-col gap-0">
        <div className="flex gap-2 justify-start items-center">
          <SidebarTrigger className="cursor-pointer" />
          <h1 className="text-lg tracking-tight font-medium">
            Observer Permissions
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          Manage all permissions for observer role
        </p>
      </div>
      <div className="p-5 rounded-lg flex justify-between items-center bg-gray-100">
        <div className="flex flex-col gap-1 justify-center items-start">
          <h1 className="text-sm">Observers</h1>  
          <Select>
            <SelectTrigger className="cursor-pointer bg-white">
              <SelectValue
                className="cursor-pointer"
                placeholder="Select Observers"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="cursor-pointer" value="value-1">
                Item 1
              </SelectItem>
              <SelectItem className="cursor-pointer" value="value-2">
                Item 2
              </SelectItem>
              <SelectItem className="cursor-pointer" value="value-3">
                Item 3
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="cursor-pointer font-normal">Show permitted pages</Button>
      </div>
    </div>
  );
}
