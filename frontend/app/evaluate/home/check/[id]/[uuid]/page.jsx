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
import { useCallback } from "react";
import Link from "next/link";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Fixed function to render only leaf-level questions (actual questions)
const renderQuestionHierarchyTable = (data, onQuestionSelect, questionScores) => {
  const questionData = Array.isArray(data) ? data[0] : data;
  const rows = [];
  const processedQuestions = new Set(); // Track processed questions to avoid duplicates

  // Recursive function to extract only leaf-level questions
  const extractLeafQuestions = (question) => {
    const questionNo = question.QuestionNo;

    // Skip if already processed
    if (processedQuestions.has(questionNo)) {
      return;
    }

    // Check if this is a leaf question (has QuestionNo and Marks but no children to render)
    const hasActualQuestions = question.actualQuestions && Object.keys(question.actualQuestions).length > 0;
    const hasSubQuestions = question.subQuestions && Object.keys(question.subQuestions).length > 0;
    
    // If it's a leaf question (no children to render), add it to the table
    if (questionNo && typeof question.Marks !== 'undefined' && !hasActualQuestions && !hasSubQuestions) {
      const score = questionScores[questionNo] || 0;
      const maxMarks = question.Marks || 0;
      
      rows.push(
        <TableRow
          key={questionNo}
          onClick={() => onQuestionSelect(question)}
          className="cursor-pointer hover:bg-gray-50 bg-gray-50"
        >
          <TableCell className="border-r text-center p-2">
            <Badge variant="outline" className="bg-green-100 text-green-800">
              {questionNo}
            </Badge>
          </TableCell>
          <TableCell className="border-r text-center p-2 text-sm">
            {maxMarks}
          </TableCell>
          <TableCell className="text-center p-2 text-sm">{score}</TableCell>
        </TableRow>
      );
      
      processedQuestions.add(questionNo);
    }

    // Process actualQuestions if they exist (these are the leaf nodes)
    if (hasActualQuestions) {
      Object.values(question.actualQuestions).forEach((actualQuestion) => {
        extractLeafQuestions(actualQuestion);
      });
    }

    // Process subQuestions if they exist (drill down to find leaf nodes)
    if (hasSubQuestions) {
      Object.values(question.subQuestions).forEach((subQ) => {
        extractLeafQuestions(subQ);
      });
    }
  };

  Object.values(questionData).forEach((question) => {
    extractLeafQuestions(question);
  });

  return rows;
};

export default function Page() {
  const { uuid, id } = useParams();
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
  const [selectedQuestion, setSelectedQuestion] = useState(null); // Track selected question
  const [questionScores, setQuestionScores] = useState({}); // Track scores for each question
  const [totalScore, setTotalScore] = useState(0); // Track total score
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
      } else if (annotation.type === "number") {
        ctx.font = "bold 20px Arial";
        ctx.fillStyle = "red";
        ctx.fillText(
          annotation.value,
          annotation.position.x,
          annotation.position.y
        );
        ctx.fillStyle = "black";
      }
    });
  }, [annotations]);

  // Update total score when question scores change
  useEffect(() => {
    const newTotalScore = Object.values(questionScores).reduce(
      (sum, score) => sum + (parseFloat(score) || 0),
      0
    );
    setTotalScore(newTotalScore);
  }, [questionScores]);

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

    if (selectedTool === "number" && selectedQuestion) {
      const mark = prompt(
        `Enter marks for question ${selectedQuestion.QuestionNo} (Max: ${selectedQuestion.Marks}):`
      );
      if (mark !== null) {
        const numericMark = parseFloat(mark);
        if (
          !isNaN(numericMark) &&
          numericMark >= 0 &&
          numericMark <= selectedQuestion.Marks
        ) {
          // Add number annotation
          setAnnotations((prev) => [
            ...prev,
            {
              id: Date.now(),
              type: "number",
              value: mark,
              position: { x, y },
            },
          ]);

          // Update question score
          setQuestionScores((prev) => ({
            ...prev,
            [selectedQuestion.QuestionNo]: numericMark,
          }));
        } else {
          toast.error(
            `Please enter a valid number between 0 and ${selectedQuestion.Marks}`
          );
        }
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
        setSelectedTool("number");
        break;
      case 5:
        setSelectedTool("undo");
        setAnnotations((prev) => prev.slice(0, -1));
        break;
      case 6:
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
    <Badge className="bg-blue-500">#</Badge>, // Number annotation
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

  // Handle mark assignment from the buttons
  const handleMarkAssignment = (mark) => {
    if (!selectedQuestion) {
      toast.error("Please select a question first");
      return;
    }

    if (mark === "NA") {
      // Handle NA case
      setQuestionScores((prev) => ({
        ...prev,
        [selectedQuestion.QuestionNo]: 0,
      }));
      toast.success(`Marked question ${selectedQuestion.QuestionNo} as NA`);
      return;
    }

    const numericMark = parseFloat(mark);
    if (
      isNaN(numericMark) ||
      numericMark < 0 ||
      numericMark > selectedQuestion.Marks
    ) {
      toast.error(
        `Please enter a valid number between 0 and ${selectedQuestion.Marks}`
      );
      return;
    }

    setQuestionScores((prev) => ({
      ...prev,
      [selectedQuestion.QuestionNo]: numericMark,
    }));

    toast.success(
      `Assigned ${numericMark} marks to question ${selectedQuestion.QuestionNo}`
    );
  };

  const handlePaperFinish = async () => {
    tryca
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      <nav className="p-2 bg-gray-100 border-b border-gray-200 text-sm flex justify-between items-center w-full">
        <Link href={`/evaluate/home/check/${id}`}>
          <Button
            size={"sm"}
            variant={"outline"}
            className="flex justify-center items-center text-xs gap-1 cursor-pointer"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back</span>
          </Button>
        </Link>
        <span className="flex gap-3 text-xs">
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
        <div className="border-r h-full w-min bg-gray-100">
          <div className="grid grid-cols-2 min-w-[150px] border-b place-content-start gap-2 p-3">
            {MARKS.map((el) => (
              <Button
                variant="outline"
                className="rounded-full text-xs bg-white cursor-pointer"
                size={"icon"}
                key={el}
                onClick={() => handleMarkAssignment(el)}
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
                    ? "number"
                    : i === 5
                    ? "undo"
                    : "trash")
                    ? "bg-blue-200"
                    : ""
                }`}
                size={"icon"}
                key={i}
                onClick={() => handleAnnotationMap(i)}
              >
                {el}
              </Button>
            ))}
          </div>
        </div>
        <div className="w-full border-r h-[calc(100vh-80px)] max-w-3xl flex flex-col p-3 gap-3">
          <div className="flex justify-between items-start">
            <h1 className="text-sm">Page {currentPage}</h1>
            <div className="flex justify-center items-center gap-2">
              {currentPage !== 1 && (
                <Button
                  onClick={handlePageChangeBehind}
                  size={"icon"}
                  variant="outline"
                  className="cursor-pointer"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                </Button>
              )}
              <Button
                onClick={handlePageChangeAhead}
                size={"icon"}
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
        <div className=" border-r flex flex-col gap-2 h-full p-3 bg-gray-100">
          <Table className="bg-white">
            <TableHeader className="border">
              <TableRow>
                <TableHead className="text-center border border-r text-sm">
                  Questions
                </TableHead>
                <TableHead className="text-center border border-r text-sm">
                  Out of
                </TableHead>
                <TableHead className="text-center border border-r text-sm">
                  Score
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="border w-1/4">
              {qp ? (
                renderQuestionHierarchyTable(
                  qp.data,
                  handleQuestionSelect,
                  questionScores
                )
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
              Calculate Total Score:{" "}
              <span>
                {totalScore.toFixed(2)} / {qp?.totalMarks || 0}
              </span>
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
                ? `Question ${selectedQuestion.QuestionNo} (${
                    questionScores[selectedQuestion.QuestionNo] || 0
                  }/${selectedQuestion.Marks || 0})`
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
