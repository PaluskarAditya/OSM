'use client'

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
  SelectGroup,
} from "@/components/ui/select";
import {
  Dialog,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogContent,
} from "@/components/ui/dialog";
import { useState } from "react";

const UsersTab = () => {
  const [action, setAction] = useState("");

  return (
    <div className="h-full p-6 flex flex-col gap-5">
      <Dialog open={action === "add"}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Users</DialogTitle>
            <DialogDescription>
              Add new users to the institute with appropriate permissions
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="cursor-pointer" variant="outline">
              cancel
            </Button>
            <Button className="cursor-pointer">Add User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex bg-white shadow-lg p-5 shadow-gray-200 rounded-lg flex-col gap-0">
        <h1 className="text-xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-gray-500">
          Manage all the operations regarding users
        </p>
      </div>
      <div className="flex justify-between items-center">
        <Input placeholder="search" className="w-max bg-white" />
        <Select
          value={action}
          onValueChange={(value) => setAction(value)}
          className="bg-white"
        >
          <SelectTrigger className="bg-white text-black cursor-pointer">
            <SelectValue className="bg-white" placeholder="Actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="add" className="cursor-pointer">
                add
              </SelectItem>
              <SelectItem value="import" className="cursor-pointer">
                import
              </SelectItem>
              <SelectItem value="export" className="cursor-pointer">
                export
              </SelectItem>
              <SelectItem value="active" className="cursor-pointer">
                active users
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Table className="bg-white">
        <TableHeader>
          <TableRow className="border">
            <TableHead className="border-r">Sr no</TableHead>
            <TableHead className="border-r">Name</TableHead>
            <TableHead className="border-r">Email</TableHead>
            <TableHead className="border-r">Role</TableHead>
            <TableHead className="border-r">Mobile</TableHead>
            <TableHead className="border-r">Faculty ID</TableHead>
            <TableHead className="border-r">Status</TableHead>
            <TableHead className="border-r">View Documents</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody></TableBody>
      </Table>
    </div>
  );
};

export default function page() {
  return (
    <div className="w-full h-screen bg-gray-100">
      <UsersTab />
    </div>
  );
}
