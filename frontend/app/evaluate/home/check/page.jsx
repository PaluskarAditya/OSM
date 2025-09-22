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
import Cookies from "js-cookie";
import * as pdfjsLib from "pdfjs-dist";
import { useParams } from "next/navigation";

// Set PDF.js worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Function to render question hierarchy in the table
const renderQuestionHierarchyTable = (data, onQuestionSelect) => {
  const questionData = Array.isArray(data) ? data[0] : data;
  const rows = [];

  Object.values(questionData).forEach((question) => {
    // Main question row
    rows.push(
      <TableRow
        key={question.QuestionNo}
        onClick={() => onQuestionSelect(question)}
        className="cursor-pointer hover:bg-gray-50 bg-gray-100"
      >
        <TableCell className="border-r text-center p-2 font-medium w-[80px]">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {question.QuestionNo}
          </Badge>
        </TableCell>
        <TableCell className="border-r p-2 text-sm truncate">
          {question.QuestionText.length > 40
            ? `${question.QuestionText.slice(0, 25)}...`
            : question.QuestionText || "No question text"}
        </TableCell>
        <TableCell className="border-r text-center p-2 text-sm w-[60px]">
          {question.Marks || 0}
        </TableCell>
        <TableCell className="text-center p-2 text-sm w-[60px]">0</TableCell>
      </TableRow>
    );

    // Render sub-questions
    if (question.subQuestions) {
      Object.values(question.subQuestions).forEach((subQuestion) => {
        rows.push(
          <TableRow
            key={subQuestion.QuestionNo}
            onClick={() => onQuestionSelect(subQuestion)}
            className="cursor-pointer hover:bg-gray-50 bg-gray-50"
          >
            <TableCell className="border-r text-center p-2 pl-4 w-[80px]">
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                {subQuestion.QuestionNo}
              </Badge>
            </TableCell>
            <TableCell className="border-r p-2 text-sm truncate">
              {subQuestion.QuestionText.length > 40
                ? `${subQuestion.QuestionText.slice(0, 25)}...`
                : subQuestion.QuestionText || "No sub-question text"}
              {subQuestion.Optional && (
                <span className="text-xs text-gray-500 ml-2">
                  (Answer any {subQuestion.Optional} out of{" "}
                  {subQuestion.TotalQuestions})
                </span>
              )}
            </TableCell>
            <TableCell className="border-r text-center p-2 text-sm w-[60px]">
              {subQuestion.Marks || 0}
            </TableCell>
            <TableCell className="text-center p-2 text-sm w-[60px]">0</TableCell>
          </TableRow>
        );

        // Actual questions under sub-questions
        if (subQuestion.actualQuestions) {
          Object.values(subQuestion.actualQuestions).forEach((actualQuestion) => {
            rows.push(
              <TableRow
                key={actualQuestion.QuestionNo}
                onClick={() => onQuestionSelect(actualQuestion)}
                className="cursor-pointer hover:bg-gray-50"
              >
                <TableCell className="border-r text-center p-2 pl-8 w-[80px]">
                  <Badge
                    variant="outline"
                    className="bg-purple-100 text-purple-800"
                  >
                    {actualQuestion.QuestionNo}
                  </Badge>
                </TableCell>
                <TableCell className="border-r p-2 text-sm truncate">
                  {actualQuestion.QuestionText.length > 40
                    ? `${actualQuestion.QuestionText.slice(0, 25)}...`
                    : actualQuestion.QuestionText || "No actual question text"}
                </TableCell>
                <TableCell className="border-r text-center p-2 text-sm w-[60px]">
                  {actualQuestion.Marks || 0}
                </TableCell>
                <TableCell className="text-center p-2 text-sm w-[60px]">
                  0
                </TableCell>
              </TableRow>
            );
          });
        }
      });
    }

    // Render direct actual questions
    if (question.actualQuestions) {
      Object.values(question.actualQuestions).forEach((actualQuestion) => {
        rows.push(
          <TableRow
            key={actualQuestion.QuestionNo}
            onClick={() => onQuestionSelect(actualQuestion)}
            className="cursor-pointer hover:bg-gray-50 bg-gray-50"
          >
            <TableCell className="border-r text-center p-2 pl-6 w-[80px]">
              <Badge variant="outline" className="bg-green-100 text-green-800">
                {actualQuestion.QuestionNo}
              </Badge>
            </TableCell>
            <TableCell className="border-r p-2 text-sm truncate">
              {actualQuestion.QuestionText.length > 40
                ? `${actualQuestion.QuestionText.slice(0, 25)}...`
                : actualQuestion.QuestionText || "No question text"}
            </TableCell>
            <TableCell className="border-r text-center p-2 text-sm w-[60px]">
              {actualQuestion.Marks || 0}
            </TableCell>
            <TableCell className="text-center p-2 text-sm w-[60px]">0</TableCell>
          </TableRow>
        );
      });
    }
  });

  return rows;
};

export default function Page() {
  const { uuid } = useParams();
  const token = Cookies.get("token");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [visitedPages, setVisitedPages] = useState(0);
  const [pdfDOC, setPdfDOC] = useState(null);
  const [qp, setQP] = useState(null);
  const [speed, setSpeed] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const canvasRef = useRef(null);
  const drawCanvasRef = useRef(null);
  const contextRef = useRef(null);

  // Initialize canvas context
  useEffect(() => {
    const drawingCanvas = drawCanvasRef.current;
    if (!drawingCanvas) return;

    const context = drawingCanvas.getContext("2d");
    context.lineCap = "round";
    context.strokeStyle = "black";
    context.lineWidth = 3;
    contextRef.current = context;
  }, []);

  // Handle mouse events for drawing
  const handleMouseDown = (e) => {
    if (selectedTool !== "pencil") return;

    const rect = drawCanvasRef.current.getBoundingClientRect();
    const scale = drawCanvasRef.current.width / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;

    setDrawing(true);
    setCurrentPath([{ x, y }]);

    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
  };

  const handleMouseMove = (e) => {
    if (!drawing || selectedTool !== "pencil") return;

    const rect = drawCanvasRef.current.getBoundingClientRect();
    const scale = drawCanvasRef.current.width / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;

    setCurrentPath((prev) => [...prev, { x, y }]);

    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const handleMouseUp = () => {
    if (!drawing || selectedTool !== "pencil") return;

    contextRef.current.closePath();
    setDrawing(false);

    if (currentPath.length > 0) {
      setAnnotations((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "drawing",
          value: currentPath,
          position: { x: 0, y: 0 },
        },
      ]);
    }

    setCurrentPath([]);
  };

  // Redraw annotations when they change
  useEffect(() => {
    if (!drawCanvasRef.current || !contextRef.current) return;

    const canvas = drawCanvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    annotations.forEach((annotation) => {
      if (annotation.type === "drawing") {
        ctx.beginPath();
        ctx.moveTo(annotation.value[0].x, annotation.value[0].y);

        for (let i = 1; i < annotation.value.length; i++) {
          ctx.lineTo(annotation.value[i].x, annotation.value[i].y);
        }

        ctx.stroke();
        ctx.closePath();
      } else if (annotation.type === "icon") {
        ctx.beginPath();
        if (annotation.value === "check") {
          ctx.moveTo(annotation.position.x - 10, annotation.position.y);
          ctx.lineTo(annotation.position.x, annotation.position.y + 10);
          ctx.lineTo(annotation.position.x + 15, annotation.position.y - 10);
        } else if (annotation.value === "cross") {
          ctx.moveTo(annotation.position.x - 10, annotation.position.y - 10);
          ctx.lineTo(annotation.position.x + 10, annotation.position.y + 10);
          ctx.moveTo(annotation.position.x + 10, annotation.position.y - 10);
          ctx.lineTo(annotation.position.x - 10, annotation.position.y + 10);
        }
        ctx.stroke();
        ctx.closePath();
      } else if (annotation.type === "text") {
        ctx.font = "16px Arial";
        ctx.fillText(
          annotation.value,
          annotation.position.x,
          annotation.position.y
        );
      }
    });
  }, [annotations]);

  const handleCanvasClick = (e) => {
    if (selectedTool === "pencil") return;

    const rect = drawCanvasRef.current.getBoundingClientRect();
    const scale = drawCanvasRef.current.width / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;

    if (selectedTool === "check" || selectedTool === "cross") {
      setAnnotations((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "icon",
          value: selectedTool,
          position: { x, y },
        },
      ]);
    }

    if (selectedTool === "text") {
      const text = prompt("Enter text:");
      if (text) {
        setAnnotations((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "text",
            value: text,
            position: { x, y },
          },
        ]);
      }
    }

    if (selectedTool === "undo") {
      setAnnotations((prev) => prev.slice(0, -1));
    }
  };

  const handleAnnotationMap = (i) => {
    switch (i) {
      case 0:
        setSelectedTool("check");
        break;
      case 1:
        setSelectedTool("cross");
        break;
      case 2:
        setSelectedTool("text");
        break;
      case 3:
        setSelectedTool("pencil");
        break;
      case 4:
        setSelectedTool("undo");
        setAnnotations((prev) => prev.slice(0, -1));
        break;
      case 5:
        setSelectedTool("trash");
        setAnnotations([]);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const getAndRenderPDF = async () => {
      try {
        const [sheetRes, qpRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/answer-sheet/${uuid}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/qp/${uuid}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [sheetData, qpData] = await Promise.all([
          await sheetRes.arrayBuffer(),
          await qpRes.json(),
        ]);

        const pdf = await pdfjsLib.getDocument({ data: sheetData }).promise;
        setQP(qpData);
        setPdfDOC(pdf);
        setTotalPages(pdf.numPages);
      } catch (error) {
        console.error("Error loading PDF:", error);
        toast.error("Failed to load PDF");
      }
    };

    let interval;
    const measureSpeed = async () => {
      const startTime = performance.now();
      try {
        await fetch(
          "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png",
          { cache: "no-cache", mode: "no-cors" }
        );
        const endTime = performance.now();
        const duration = (endTime - startTime) / 1000;
        const fileSize = 3 * 1024 * 8;
        const currentSpeed = (fileSize / duration / 1_000_000).toFixed(2);
        setSpeed(currentSpeed);
      } catch (err) {
        console.error("Ping failed", err);
        setSpeed(0);
      }
    };

    interval = setInterval(measureSpeed, 2000);
    measureSpeed();
    getAndRenderPDF();

    return () => clearInterval(interval);
  }, [uuid, token]);

  const renderPage = async (pdf, num) => {
    const page = await pdf.getPage(num);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (drawCanvasRef.current) {
      drawCanvasRef.current.width = viewport.width;
      drawCanvasRef.current.height = viewport.height;
    }

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;
  };

  useEffect(() => {
    if (pdfDOC) {
      renderPage(pdfDOC, currentPage);
    }
  }, [currentPage, pdfDOC]);

  const MARKS = [0, 1 / 4, 1 / 2, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, "NA"];
  const ANNOTATIONS = [
    <CheckIcon className="w-4 h-4" />,
    <CircleXIcon className="h-4 w-4" />,
    <TypeIcon className="h-4 w-4" />,
    <PencilIcon className="h-4 w-4" />,
    <UndoIcon className="h-4 w-4" />,
    <TrashIcon className="h-4 w-4" />,
  ];

  const handlePageChangeAhead = () => {
    const nextPage = currentPage + 1;
    setVisitedPages((prev) => prev + 1);

    if (nextPage > totalPages) {
      toast.error("Page not available");
      return;
    }

    setCurrentPage(nextPage);
  };

  const handlePageChangeBehind = () => {
    const nextPage = currentPage - 1;

    if (nextPage < 1) {
      toast.error("Page not available");
      return;
    }

    setCurrentPage(nextPage);
  };

  // Handle question selection
  const handleQuestionSelect = (question) => {
    setSelectedQuestion(question);
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      <nav className="p-2 bg-gray-100 border-b border-gray-200 text-sm flex justify-between items-center w-full">
        <Button
          size="sm"
          variant="outline"
          className="flex justify-center items-center text-xs gap-1 cursor-pointer"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back</span>
        </Button>
        <span className="flex gap-3 text-xs">
          <h1>ID: 98118</h1>
          <p>
            Subject: <span>{qp?.name || "Loading..."}</span>
          </p>
        </span>
        <div>
          <p className="flex gap-1 justify-center items-center">
            <TimerIcon className="h-4 w-4 text-blue-500" />
            <span className="text-xs">00:11:22</span>
          </p>
        </div>
        <div>
          <p className="flex gap-1 justify-center items-center">
            <WifiIcon className="h-4 w-4 text-blue-500" />
            <span className="text-xs">{speed} Mbps</span>
          </p>
        </div>
      </nav>
      <div className="flex w-full h-full">
        <div className="border-r h-full w-[150px] bg-gray-100">
          <div className="grid grid-cols-2 min-w-[150px] border-b place-content-start gap-2 p-3">
            {MARKS.map((el) => (
              <Button
                variant="outline"
                className="rounded-full text-xs bg-white cursor-pointer"
                size="icon"
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
                className={`rounded-full text-xs bg-white cursor-pointer ${
                  selectedTool ===
                  (i === 0
                    ? "check"
                    : i === 1
                    ? "cross"
                    : i === 2
                    ? "text"
                    : i === 3
                    ? "pencil"
                    : i === 4
                    ? "undo"
                    : "trash")
                    ? "bg-blue-200"
                    : ""
                }`}
                size="icon"
                key={i}
                onClick={() => handleAnnotationMap(i)}
              >
                {el}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex-1 border-r h-[calc(100vh-80px)] flex flex-col p-3 gap-3">
          <div className="flex justify-between items-start">
            <h1 className="text-sm">Page {currentPage}</h1>
            <div className="flex justify-center items-center gap-2">
              {currentPage !== 1 && (
                <Button
                  onClick={handlePageChangeBehind}
                  size="icon"
                  variant="outline"
                  className="cursor-pointer"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                </Button>
              )}
              <Button
                onClick={handlePageChangeAhead}
                size="icon"
                variant="outline"
                className="cursor-pointer"
                disabled={currentPage >= totalPages}
              >
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="overflow-y-auto flex-1 h-full relative">
            <canvas
              ref={canvasRef}
              className="w-full bg-gray-50 border absolute top-0 left-0"
            />
            <canvas
              ref={drawCanvasRef}
              className="absolute top-0 z-20 left-0 right-0 bottom-0"
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              style={{
                cursor: selectedTool === "pencil" ? "crosshair" : "pointer",
              }}
            />
          </div>
        </div>
        <div className="w-2/5 border-r flex flex-col gap-2 h-full p-3 bg-gray-100">
          <Table className="bg-white">
            <TableHeader className="border">
              <TableRow>
                <TableHead className="text-center border border-r text-sm w-[80px]">
                  Questions
                </TableHead>
                <TableHead className="text-center border border-r text-sm">
                  Question Text
                </TableHead>
                <TableHead className="text-center border border-r text-sm w-[60px]">
                  Out of
                </TableHead>
                <TableHead className="text-center border border-r text-sm w-[60px]">
                  Score
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="border">
              {qp ? (
                renderQuestionHierarchyTable(qp.data, handleQuestionSelect)
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-xs py-4">
                    Loading questions...
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex flex-col border gap-2 p-3 bg-white justify-center items-center rounded-lg w-full">
            <Button size="sm" className="cursor-pointer text-xs w-full">
              Calculate Total Score: <span>0.00 / {qp?.totalMarks || 0}</span>
            </Button>
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
            <h1 className="text-xs font-semibold">
              {selectedQuestion
                ? selectedQuestion.QuestionNo
                : "Select a Question"}
            </h1>
            <p className="text-sm">
              {selectedQuestion
                ? selectedQuestion.QuestionText
                : "Click a question in the table to view its details."}
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
                Pages: <Badge className="bg-purple-500">{totalPages}</Badge>
              </p>
              <p className="text-xs">
                Visited: <Badge className="bg-green-500">{visitedPages}</Badge>
              </p>
              <p className="text-xs">
                Remaining:{" "}
                <Badge className="bg-orange-500">
                  {totalPages - visitedPages}
                </Badge>
              </p>
            </div>
            <div className="grid grid-cols-10 md:grid-cols-5 gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <Badge
                  className={`md:w-full ${
                    i + 1 === currentPage ? "bg-blue-500" : "bg-orange-500"
                  }`}
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                >
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