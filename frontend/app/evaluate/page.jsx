"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckIcon,
  CircleXIcon,
  PencilIcon,
  TypeIcon,
  TrashIcon,
  UndoIcon,
  WifiIcon,
  TimerIcon,
  FullscreenIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { pdfjs } from "react-pdf";

// PDF activities
import * as pdfjsLib from "pdfjs-dist";
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function page() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfDOC, setPdfDOC] = useState(null);

  useEffect(() => {
    const getAndRenderPDF = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/answersheet/${FILE_NAME}`
      );

      const data = await res.arrayBuffer();

      console.log("Data:", data);

      const pdf = await pdfjsLib.getDocument({ data }).promise;

      console.log("PDF Document Data:", pdf);

      const page = await pdf.getPage(currentPage);
      const viewport = page.getViewport({ scale: 1.5 });

      console.log("Page:", page, "Viewport:", viewport);

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      page.render({
        canvasContext: context,
        viewport,
      });

      setTotalPages(pdf.numPages);
    };

    getAndRenderPDF();
  });

  const MARKS = [0, 1 / 4, 1 / 2, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, "NA"];
  const ANNOTATIONS = [
    <CheckIcon className="w-4 h-4" />,
    <CircleXIcon className="h-4 w-4" />,
    <TypeIcon className="h-4 w-4" />,
    <PencilIcon className="h-4 w-4" />,
    <UndoIcon className="h-4 w-4" />,
    <TrashIcon className="h-4 w-4" />,
  ];
  const canvasRef = useRef(null);
  const FILE_NAME = "101 [20230001]-1755154193031-521796957.pdf";

  const handlePageChange = () => {
    const nextPage = currentPage + 1;

    if (nextPage > totalPages) {
      toast.error("Page not available");
      return; // 🚨 stop here, don’t update state
    }

    setCurrentPage(nextPage);
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      <nav className="p-2 bg-gray-100 border-b border-gray-200 text-sm flex justify-between items-center w-full">
        <Button
          size={"sm"}
          variant={"outline"}
          className="flex justify-center items-center text-xs gap-1 cursor-pointer"
        >
          <ArrowLeftIcon className="w-1 h-1" />
          <span>Back</span>
        </Button>
        <span className="flex gap-3 text-xs">
          <h1>ID: 98118</h1>
          <p>
            Subject: <span>Marketing Analysis</span>
          </p>
        </span>
        <div>
          <p className="flex gap-1 justify-center items-center">
            <TimerIcon className="h-4 w-4 text-blue-500" />{" "}
            <span className="text-xs">00:11:22</span>
          </p>
        </div>
        <div>
          <p className="flex gap-1 justify-center items-center">
            <WifiIcon className="h-4 w-4 text-blue-500" />{" "}
            <span className="text-xs">10 mbps</span>
          </p>
        </div>
      </nav>
      <div className="flex w-full h-full">
        <div className="border-r h-full w-max bg-gray-100 min-w-max">
          <div className="grid grid-cols-2 border-b place-content-start gap-2 p-3">
            {MARKS.map((el) => (
              <Button
                variant="outline"
                className="rounded-full text-xs bg-white cursor-pointer"
                size={"icon"}
                key={el}
              >
                {el}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-2 border-b place-content-start gap-2 p-3">
            {ANNOTATIONS.map((el, i) => (
              <Button
                variant="outline"
                className="rounded-full text-xs bg-white cursor-pointer"
                size={"icon"}
                key={i}
              >
                {el}
              </Button>
            ))}
          </div>
        </div>
        <div className="w-full border-r h-full flex flex-col p-3 gap-3">
          <div className="flex justify-between items-start">
            <h1 className="text-sm">Page 1</h1>
            <Button
              onClick={handlePageChange}
              size={"icon"}
              variant="outline"
              className="cursor-pointer"
              disabled={currentPage >= totalPages}
            >
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
          <canvas ref={canvasRef} className="w-full bg-gray-50 border"></canvas>
        </div>
        <div className="w-2/5 border-r flex flex-col gap-2 h-full p-3 bg-gray-100">
          <Table className="bg-white">
            <TableHeader className="border">
              <TableRow>
                <TableHead className="text-center border border-r text-sm ">
                  Questions
                </TableHead>
                <TableHead className="text-center border border-r text-sm ">
                  Out of
                </TableHead>
                <TableHead className="text-center border border-r text-sm ">
                  Score
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="border">
              <TableRow>
                <TableCell className="border-r text-center">
                  <Badge className="bg-yellow-500">Q1</Badge>
                </TableCell>
                <TableCell className="border-r text-xs text-center">
                  10
                </TableCell>
                <TableCell className="border-r text-xs text-center">
                  0
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="border-r text-center">
                  <Badge>Q2</Badge>
                </TableCell>
                <TableCell className="border-r text-xs text-center">
                  10
                </TableCell>
                <TableCell className="border-r text-xs text-center">
                  0
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="border-r text-center">
                  <Badge>Q3</Badge>
                </TableCell>
                <TableCell className="border-r text-xs text-center">
                  10
                </TableCell>
                <TableCell className="border-r text-xs text-center">
                  0
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="flex flex-col border gap-2 p-3 bg-white justify-center items-center rounded-lg w-full">
            {/* Full width button */}
            <Button size="sm" className="cursor-pointer text-xs w-full">
              Calculate Total Score: <span>0.00 / 30.00</span>
            </Button>

            {/* Two half-width buttons */}
            <div className="flex gap-2 w-full">
              <Button
                size="sm"
                variant="destructive"
                className="text-xs cursor-pointer w-1/2"
              >
                Reject Paper
              </Button>
              <Button
                size="sm"
                className="bg-green-500 hover:bg-green-600 cursor-pointer text-xs w-1/2"
              >
                Finish Paper
              </Button>
            </div>
          </div>

          <div className="flex bg-white p-3 rounded-lg border flex-col gap-1">
            <h1 className="text-xs font-semibold">Q1</h1>
            <p className="text-sm">
              This is a sample question text and this is just some placeholder
              content added
            </p>
            <div className="w-full flex justify-end items-center">
              <Button
                size="icon"
                className="p-1 cursor-pointer mt-2"
                variant="outline"
              >
                <FullscreenIcon className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-3 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <p className="text-xs">
                Pages: <Badge className="bg-purple-500">10</Badge>
              </p>
              <p className="text-xs">
                Visited: <Badge className="bg-green-500">0</Badge>
              </p>
              <p className="text-xs">
                Remaining: <Badge className="bg-orange-500">10</Badge>
              </p>
            </div>
            <div className="grid grid-cols-10 md:grid-cols-5 gap-1">
              {Array.from({ length: 10 }, (_, i) => (
                <Badge className="bg-orange-500 md:w-full" key={i + 1}>
                  {i + 1}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
