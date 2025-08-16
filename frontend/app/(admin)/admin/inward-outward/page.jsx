import {
  ArrowBigRight,
  PlusCircleIcon,
  PlusIcon,
  SettingsIcon,
} from "lucide-react";
import React from "react";
import Link from "next/link";

export default function page() {
  return (
    <div className="bg-gray-100 p-6 gap-6 flex flex-col w-full">
      <div className="p-5 bg-white shadow-lg rounded-lg flex flex-col gap-1 shadow-gray-200">
        <h1 className="text-xl font-medium">Inward / Outword / Scanning</h1>
        <p className="text-sm text-gray-500">manage inward & outward data</p>
      </div>
      <div className="flex gap-6 w-full">
        <div className="bg-white flex w-1/4 flex-col shadow-lg shadow-gray-200 rounded-lg">
          <div className="p-5 border-b border-gray-200">
            <h1 className="text-lg font-medium">Inward Details</h1>
          </div>
          <div className="flex flex-col p-3">
            <Link href={"/admin/inward-outward/inward-conf"}>
              <div className="p-3 flex gap-2 justify-start items-center hover:bg-gray-100/50 transition-all rounded-lg cursor-pointer">
                <div className="p-3 rounded-lg bg-green-100 hover:bg-green-200 transition-all">
                  <SettingsIcon className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-sm">Inward Configuration</p>
              </div>
            </Link>
            <Link href={'/admin/inward-outward/inward-barc-conf'}>
              <div className="p-3 flex gap-2 justify-start items-center hover:bg-gray-100/50 transition-all rounded-lg cursor-pointer">
                <div className="p-3 rounded-lg bg-blue-100 hover:bg-blue-200 transition-all">
                  <PlusIcon className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-sm">Inward Barcode Configuration</p>
              </div>
            </Link>
          </div>
        </div>
        <div className="bg-white flex w-1/4 flex-col shadow-lg shadow-gray-200 rounded-lg">
          <div className="p-5 border-b border-gray-200">
            <h1 className="text-lg font-medium">Inward / Outward</h1>
          </div>
          <div className="flex flex-col p-3">
            <div className="p-3 flex gap-2 justify-start items-center hover:bg-gray-100/50 transition-all rounded-lg cursor-pointer">
              <div className="p-3 rounded-lg bg-green-100 hover:bg-green-200 transition-all">
                <ArrowBigRight className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-sm">Inward / Outward</p>
            </div>
            <div className="p-3 flex gap-2 justify-start items-center hover:bg-gray-100/50 transition-all rounded-lg cursor-pointer">
              <div className="p-3 rounded-lg bg-blue-100 hover:bg-blue-200 transition-all">
                <PlusIcon className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-sm">Generate Inward Details</p>
            </div>
            <div className="p-3 flex gap-2 justify-start items-center hover:bg-gray-100/50 transition-all rounded-lg cursor-pointer">
              <div className="p-3 rounded-lg bg-red-100 hover:bg-red-200 transition-all">
                <PlusCircleIcon className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-sm">Generate Supplement Barcode</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
