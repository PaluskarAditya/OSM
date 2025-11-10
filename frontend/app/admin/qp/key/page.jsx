"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";

export default function page() {
  return (
    <div className="p-6 bg-white flex flex-col gap-6">
      <div className="flex flex-col">
        <div className="flex justify-start items-center gap-2">
          <SidebarTrigger className="cursor-pointer" />
          <h1 className="text-sm font-medium text-gray-800">QP / Key</h1>
        </div>
        <p className="text-sm text-gray-500">
          Upload PDF and Key for created Question Papers
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        <div className="flex flex-col gap-1 w-full">
          <p className="text-sm font-medium">Stream | Degree | Year</p>
          <Select>
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue placeholder="Select Stream" />
            </SelectTrigger>
            <SelectContent className="w-full">
              <SelectItem className="w-full cursor-pointer" value="Item 1">
                Item 1
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1 w-full">
          <p className="text-sm font-medium">Course</p>
          <Select>
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue placeholder="Select Stream" />
            </SelectTrigger>
            <SelectContent className="w-full">
              <SelectItem className="w-full cursor-pointer" value="Item 1">
                Item 1
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1 w-full">
          <p className="text-sm font-medium">Semester</p>
          <Select>
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue placeholder="Select Stream" />
            </SelectTrigger>
            <SelectContent className="w-full">
              <SelectItem className="w-full cursor-pointer" value="Item 1">
                Item 1
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1 w-full">
          <p className="text-sm font-medium">Subject</p>
          <Select>
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue placeholder="Select Stream" />
            </SelectTrigger>
            <SelectContent className="w-full">
              <SelectItem className="w-full cursor-pointer" value="Item 1">
                Item 1
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
