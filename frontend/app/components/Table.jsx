import React from "react";

export default function Table({ data, headers }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-12">
              <Checkbox />
            </TableHead>
            {headers.map((el) => (
              <TableHead className="font-medium">{el}</TableHead>
            ))}
            <TableHead className="font-medium text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
        </TableBody>
      </Table>
    </div>
  );
}
