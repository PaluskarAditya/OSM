import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownGroup,
} from "@/components/ui/dropdown-menu";

export default function page() {
  return (
    <div className="bg-gray-100 p-6 w-full flex-col">
      <div className="bg-white flex flex-col rounded-lg shadow-xl shadow-gray-200">
        <div className="p-5 border-b border-gray-200">
          <h1 className="text-xl font-medium">Inward</h1>
        </div>
        <div className="grid grid-cols-4 border-b border-gray-200 gap-5 p-5">
          <div className="flex flex-col gap-1">
            <label className="text-sm">
              <sup className="text-red-500">*&nbsp;</sup>No. of pages in Main
              Booklet
            </label>
            <Input type="text" className="" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm">
              <sup className="text-red-500">*&nbsp;</sup>No. of pages in
              Supplement
            </label>
            <Input type="text" className="" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm">
              <sup className="text-red-500">*&nbsp;</sup>Length of Main Booklet
              Barcode No.
            </label>
            <Input type="text" className="" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm">
              <sup className="text-red-500">*&nbsp;</sup>Length of Supplement
              Barcode No.
            </label>
            <Input type="text" className="" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm">
              <sup className="text-red-500">*&nbsp;</sup>Supplement Barcode
              Generation Logic
            </label>
            <Input
              placeholder="Add alphabet after main booklet barcode"
              disabled={true}
            />
          </div>
          <div className="flex gap-3 justify-center items-center">
            <Button className="cursor-pointer w-1/4">Add</Button>
            <Button className="cursor-pointer w-1/4" variant="destructive">
              Clear
            </Button>
          </div>
        </div>
        <div className="p-5 gap-3 flex flex-col">
          <h1 className="text-sm">Total Inward Configuration Count: 0</h1>
          <div className="bg-gray-200 text-sm rounded-md p-3 text-center">
            No records found
          </div>
        </div>
      </div>
    </div>
  );
}
