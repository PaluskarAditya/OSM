import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function page() {
  return (
    <div className="p-6 bg-gray-100 flex flex-col gap-6 w-full">
      <Card className="bg-white rounded-lg shadow-xl shadow-gray-200">
        <CardHeader>
          <CardTitle className="text-xl">Inward Barcode Configuration</CardTitle>
        </CardHeader>
      </Card>
      <Card className="bg-white rounded-lg shadow-xl shadow-gray-200">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <Button variant="outline">Action</Button>
            <div className="flex items-center gap-2">
              <span className="text-red-500">*</span>
              <label htmlFor="fromDate">From Date :</label>
              <Input id="fromDate" type="date" className="w-40" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-500">*</span>
              <label htmlFor="toDate">To Date :</label>
              <Input id="toDate" type="date" className="w-40" />
            </div>
            <Button className="ml-auto">Go</Button>
          </div>
          <div className="flex justify-between mt-4">
            <p>Total Inward Barcode Count : 0</p>
            <p>Today's Inward Barcode Count : 0</p>
            <p>Date Range Inward Barcode Count : 0</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}