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
  EyeIcon,
  DownloadIcon,
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
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Render leaf questions
const renderQuestionHierarchyTable = (
  data,
  onQuestionSelect,
  questionScores,
  selectedQuestion
) => {
  if (!data) return [];
  
  const questionData = Array.isArray(data) ? data[0] : data;
  const rows = [];
  const processedQuestions = new Set();

  const extractLeafQuestions = (question) => {
    if (!question) return;
    
    const questionNo = question.QuestionNo;

    if (processedQuestions.has(questionNo)) return;

    const hasActualQuestions =
      question.actualQuestions &&
      Object.keys(question.actualQuestions).length > 0;
    const hasSubQuestions =
      question.subQuestions && Object.keys(question.subQuestions).length > 0;

    if (
      questionNo &&
      typeof question.Marks !== "undefined" &&
      !hasActualQuestions &&
      !hasSubQuestions
    ) {
      const score = questionScores[questionNo] ?? 0;
      const maxMarks = question.Marks || 0;
      const isSelected = selectedQuestion?.QuestionNo === questionNo;

      rows.push(
        <TableRow
          key={questionNo}
          onClick={() => onQuestionSelect(question)}
          className={`cursor-pointer transition-colors ${
            isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : "hover:bg-gray-50"
          }`}
        >
          <TableCell className="border-r text-center p-2">
            <Badge 
              variant="outline" 
              className={`${
                isSelected ? "bg-blue-500 text-white" : "bg-green-100 text-green-800"
              } font-semibold text-xs`}
            >
              {questionNo}
            </Badge>
          </TableCell>
          <TableCell className="border-r text-center p-2 text-xs font-medium">
            {maxMarks}
          </TableCell>
          <TableCell className="text-center p-2 text-xs font-semibold">
            <span className={score > 0 ? "text-green-600" : "text-red-600"}>
              {score}
            </span>
          </TableCell>
        </TableRow>
      );

      processedQuestions.add(questionNo);
    }

    if (hasActualQuestions) {
      Object.values(question.actualQuestions).forEach(extractLeafQuestions);
    }

    if (hasSubQuestions) {
      Object.values(question.subQuestions).forEach(extractLeafQuestions);
    }
  };

  Object.values(questionData).forEach(extractLeafQuestions);
  return rows;
};

const getAllLeafQuestions = (data) => {
  if (!data) return [];
  
  const questionData = Array.isArray(data) ? data[0] : data;
  const leaves = [];
  const processed = new Set();

  const extract = (q) => {
    if (!q) return;
    
    const no = q.QuestionNo;
    if (processed.has(no)) return;
    const hasActual = q.actualQuestions && Object.keys(q.actualQuestions).length > 0;
    const hasSub = q.subQuestions && Object.keys(q.subQuestions).length > 0;

    if (no && typeof q.Marks !== "undefined" && !hasActual && !hasSub) {
      leaves.push(no);
      processed.add(no);
    }

    if (hasActual) Object.values(q.actualQuestions).forEach(extract);
    if (hasSub) Object.values(q.subQuestions).forEach(extract);
  };

  Object.values(questionData).forEach(extract);
  return leaves;
};

// Dialogs
const FinishPaperDialog = ({ isOpen, onClose, onConfirm, loading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h2 className="text-lg font-bold mb-3">Finish Evaluation?</h2>
        <p className="text-sm text-gray-600 mb-5">This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={loading} className="bg-green-600 hover:bg-green-700">
            {loading ? "Saving..." : "Finish"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const ErrorDialog = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h2 className="text-lg font-bold text-red-600 mb-3">{title}</h2>
        <p className="text-sm text-gray-700 mb-5">{message}</p>
        <Button onClick={onClose} className="w-full">OK</Button>
      </div>
    </div>
  );
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
  const [annotations, setAnnotations] = useState({});
  const [selectedTool, setSelectedTool] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionScores, setQuestionScores] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [errorDialog, setErrorDialog] = useState({ open: false, title: "", message: "" });
  const [revisitCount, setRevisitCount] = useState(0);
  const canvasRef = useRef(null);
  const drawCanvasRef = useRef(null);
  const contextRef = useRef(null);
  const router = useRouter();

  // Calculate total score whenever questionScores changes
  useEffect(() => {
    const newTotalScore = Object.values(questionScores).reduce(
      (sum, score) => sum + (parseFloat(score) || 0),
      0
    );
    setTotalScore(newTotalScore);
  }, [questionScores]);

  // Canvas context
  useEffect(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "red";
    ctx.lineWidth = 8;
    contextRef.current = ctx;
  }, []);

  // Drawing handlers
  const handleMouseDown = (e) => {
    if (selectedTool !== "pencil") return;
    const rect = drawCanvasRef.current.getBoundingClientRect();
    const scaleX = drawCanvasRef.current.width / rect.width;
    const scaleY = drawCanvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setDrawing(true);
    setCurrentPath([{ x, y }]);
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
  };

  const handleMouseMove = (e) => {
    if (!drawing || selectedTool !== "pencil") return;
    const rect = drawCanvasRef.current.getBoundingClientRect();
    const scaleX = drawCanvasRef.current.width / rect.width;
    const scaleY = drawCanvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setCurrentPath((prev) => [...prev, { x, y }]);
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const handleMouseUp = () => {
    if (!drawing || selectedTool !== "pencil") return;
    contextRef.current.closePath();
    setDrawing(false);
    if (currentPath.length > 0) {
      updateAnnotations((prev) => [
        ...prev,
        { id: Date.now(), type: "drawing", value: [...currentPath] },
      ]);
    }
    setCurrentPath([]);
  };

  const updateAnnotations = (updater) => {
    setAnnotations((prev) => {
      const pageAnnots = prev[currentPage] || [];
      const newAnnots = typeof updater === "function" ? updater(pageAnnots) : updater;
      const hadAnnots = pageAnnots.length > 0;
      const hasAnnots = newAnnots.length > 0;

      // Update visited pages count
      if (hasAnnots && !hadAnnots) {
        setVisitedPages((p) => p + 1);
      } else if (!hasAnnots && hadAnnots) {
        setVisitedPages((p) => Math.max(0, p - 1));
      }

      if (newAnnots.length === 0) {
        const { [currentPage]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [currentPage]: newAnnots };
    });
  };

  // Redraw annotations
  useEffect(() => {
    const canvas = drawCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const pageAnnots = annotations[currentPage] || [];

    pageAnnots.forEach((a) => {
      if (a.type === "drawing") {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 8;
        ctx.beginPath();
        if (a.value && a.value.length > 0) {
          ctx.moveTo(a.value[0].x, a.value[0].y);
          a.value.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
        }
        ctx.stroke();
      } else if (a.type === "icon") {
        ctx.strokeStyle = a.value === "check" ? "green" : "red";
        ctx.lineWidth = 6;
        ctx.beginPath();
        if (a.value === "check") {
          ctx.moveTo(a.position.x - 30, a.position.y);
          ctx.lineTo(a.position.x - 10, a.position.y + 25);
          ctx.lineTo(a.position.x + 40, a.position.y - 30);
        } else {
          ctx.moveTo(a.position.x - 30, a.position.y - 30);
          ctx.lineTo(a.position.x + 30, a.position.y + 30);
          ctx.moveTo(a.position.x + 30, a.position.y - 30);
          ctx.lineTo(a.position.x - 30, a.position.y + 30);
        }
        ctx.stroke();
      } else if (a.type === "text") {
        ctx.font = "bold 32px Arial";
        ctx.fillStyle = "blue";
        ctx.fillText(a.value, a.position.x, a.position.y);
      } else if (a.type === "number") {
        ctx.font = "bold 36px Arial";
        ctx.fillStyle = "red";
        ctx.fillText(a.value, a.position.x, a.position.y);
      }
    });

    ctx.strokeStyle = "red";
    ctx.lineWidth = 8;
  }, [annotations, currentPage]);

  // Load data
  useEffect(() => {
    const load = async () => {
      try {
        const [sheetRes, qpRes, annotRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/answer-sheet/${uuid}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/qp/${uuid}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/answer-sheet/annotations/${uuid}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => ({ ok: false })),
        ]);

        if (!sheetRes.ok) throw new Error("Failed to load answer sheet");
        if (!qpRes.ok) throw new Error("Failed to load question paper");

        const [sheetData, qpData, annotData] = await Promise.all([
          sheetRes.arrayBuffer(),
          qpRes.json(),
          annotRes.ok ? annotRes.json() : {},
        ]);

        const pdf = await pdfjsLib.getDocument({ data: sheetData }).promise;
        setPdfDOC(pdf);
        setQP(qpData);
        setTotalPages(pdf.numPages);

        if (annotData.annotations) {
          setAnnotations(annotData.annotations);
          const visited = Object.values(annotData.annotations).filter(a => a?.length > 0).length;
          setVisitedPages(visited);
        }
        
        // Initialize question scores and total score
        const initialScores = annotData.result || {};
        setQuestionScores(initialScores);
        
        const initialTotalScore = Object.values(initialScores).reduce(
          (sum, score) => sum + (parseFloat(score) || 0),
          0
        );
        setTotalScore(initialTotalScore);

        if (annotData.isEvaluated) {
          const count = (parseInt(Cookies.get(`revisit_${uuid}`) || "0") || 0) + 1;
          setRevisitCount(count);
          Cookies.set(`revisit_${uuid}`, count.toString(), { expires: 30 });
          toast.info(`Reopened: Visit #${count}/5`);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        toast.error("Failed to load data");
      }
    };

    const measureSpeed = async () => {
      const start = performance.now();
      try {
        await fetch("https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png", { cache: "no-cache", mode: "no-cors" });
        const duration = (performance.now() - start) / 1000;
        setSpeed(((3 * 1024 * 8) / duration / 1_000_000).toFixed(2));
      } catch {
        setSpeed("0");
      }
    };

    const interval = setInterval(measureSpeed, 3000);
    measureSpeed();
    load();

    return () => clearInterval(interval);
  }, [uuid, token]);

  // Render page
  const renderPage = async (pdf, num) => {
    if (!pdf || !canvasRef.current) return;
    
    try {
      const page = await pdf.getPage(num);
      const viewport = page.getViewport({ scale: 1.6 });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      // Set canvas dimensions
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      if (drawCanvasRef.current) {
        drawCanvasRef.current.width = viewport.width;
        drawCanvasRef.current.height = viewport.height;
      }
      
      await page.render({ canvasContext: ctx, viewport }).promise;
    } catch (error) {
      console.error("Error rendering page:", error);
    }
  };

  useEffect(() => {
    if (pdfDOC) renderPage(pdfDOC, currentPage);
  }, [currentPage, pdfDOC]);

  const MARKS = [0, 0.25, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, "NA"];
  const ANNOTATIONS = [
    <CheckIcon className="w-5 h-5" />,
    <CircleXIcon className="h-5 w-5" />,
    <TypeIcon className="h-5 w-5" />,
    <PencilIcon className="h-5 w-5" />,
    <Badge className="bg-blue-600 text-white px-2 py-1 text-xs font-bold">#</Badge>,
    <UndoIcon className="h-5 w-5" />,
    <TrashIcon className="h-5 w-5" />,
  ];

  const handleAnnotationMap = (i) => {
    const tools = ["check", "cross", "text", "pencil", "number", null, null];
    if (i === 5) return updateAnnotations(p => p.slice(0, -1));
    if (i === 6) return updateAnnotations([]);
    const tool = tools[i];
    setSelectedTool(prev => prev === tool ? null : tool);
  };

  const handleCanvasClick = (e) => {
    if (selectedTool === "pencil" || !drawCanvasRef.current) return;
    
    const rect = drawCanvasRef.current.getBoundingClientRect();
    const scaleX = drawCanvasRef.current.width / rect.width;
    const scaleY = drawCanvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (["check", "cross"].includes(selectedTool)) {
      updateAnnotations(p => [...p, { 
        id: Date.now(), 
        type: "icon", 
        value: selectedTool, 
        position: { x, y } 
      }]);
    } else if (selectedTool === "text") {
      const text = prompt("Enter text:");
      if (text) {
        updateAnnotations(p => [...p, { 
          id: Date.now(), 
          type: "text", 
          value: text, 
          position: { x, y } 
        }]);
      }
    } else if (selectedTool === "number" && selectedQuestion) {
      const mark = prompt(`Enter marks for question ${selectedQuestion.QuestionNo} (0-${selectedQuestion.Marks} or type "NA"):`);
      if (mark === null) return;
      
      if (mark === "NA") {
        updateAnnotations(p => [...p, { 
          id: Date.now(), 
          type: "number", 
          value: "NA", 
          position: { x, y } 
        }]);
        setQuestionScores(prev => ({ 
          ...prev, 
          [selectedQuestion.QuestionNo]: 0 
        }));
        toast.success(`Marked question ${selectedQuestion.QuestionNo} as NA`);
      } else {
        const num = parseFloat(mark);
        if (!isNaN(num) && num >= 0 && num <= selectedQuestion.Marks) {
          updateAnnotations(p => [...p, { 
            id: Date.now(), 
            type: "number", 
            value: mark, 
            position: { x, y } 
          }]);
          setQuestionScores(prev => ({ 
            ...prev, 
            [selectedQuestion.QuestionNo]: num 
          }));
          toast.success(`Assigned ${num} marks to question ${selectedQuestion.QuestionNo}`);
        } else {
          toast.error(`Please enter a valid number between 0 and ${selectedQuestion.Marks} or "NA"`);
        }
      }
    }
  };

  const handleMarkAssignment = (mark) => {
    if (!selectedQuestion) {
      toast.error("Please select a question first");
      return;
    }
    
    if (mark === "NA") {
      setQuestionScores(prev => ({ 
        ...prev, 
        [selectedQuestion.QuestionNo]: 0 
      }));
      toast.success(`Marked question ${selectedQuestion.QuestionNo} as NA`);
    } else {
      const num = parseFloat(mark);
      if (!isNaN(num) && num >= 0 && num <= selectedQuestion.Marks) {
        setQuestionScores(prev => ({ 
          ...prev, 
          [selectedQuestion.QuestionNo]: num 
        }));
        toast.success(`Assigned ${num} marks to question ${selectedQuestion.QuestionNo}`);
      } else {
        toast.error(`Invalid mark. Must be between 0 and ${selectedQuestion.Marks}`);
      }
    }
  };

  const handlePaperFinish = async () => {
    if (visitedPages < totalPages) {
      setErrorDialog({ 
        open: true, 
        title: "Pages Not Visited", 
        message: "NOT ALL PAGES VISITED, VISIT ALL THE PAGES TO FINISH EVALUATION" 
      });
      return;
    }
    
    if (!qp?.data) {
      setErrorDialog({ 
        open: true, 
        title: "Data Error", 
        message: "Question paper data not loaded properly" 
      });
      return;
    }
    
    const leaves = getAllLeafQuestions(qp.data);
    const unannotatedQuestions = leaves.filter(no => questionScores[no] === undefined);
    
    if (unannotatedQuestions.length > 0) {
      setErrorDialog({ 
        open: true, 
        title: "Missing Marks", 
        message: "ANNOTATE ALL THE QUESTIONS TO FINISH EVALUATION" 
      });
      return;
    }
    
    setFinishDialogOpen(true);
  };

  const confirmFinish = async () => {
    setLoading(true);
    try {
      const requests = [
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/answer-sheet/update/${uuid}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ 
            totalMarks: totalScore, 
            annotations, 
            result: questionScores, 
            isEvaluated: true 
          }),
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/answer-sheet/status/${uuid}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: "Completed" }),
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/eval/status/${uuid}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ 
            status: "Completed", 
            isChecked: "Evaluated", 
            marks: totalScore 
          }),
        }),
      ];

      const results = await Promise.all(requests);
      const allSuccess = results.every(res => res.ok);
      
      if (allSuccess) {
        toast.success("Evaluation completed successfully!");
        setTimeout(() => router.back(), 1500);
      } else {
        throw new Error("Some requests failed");
      }
    } catch (error) {
      console.error("Error finishing paper:", error);
      toast.error("Failed to complete evaluation");
    } finally {
      setLoading(false);
      setFinishDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Loading */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mb-3"></div>
            <p className="font-semibold">Saving Evaluation...</p>
          </div>
        </div>
      )}

      <FinishPaperDialog 
        isOpen={finishDialogOpen} 
        onClose={() => setFinishDialogOpen(false)} 
        onConfirm={confirmFinish} 
        loading={loading} 
      />
      
      <ErrorDialog 
        isOpen={errorDialog.open} 
        onClose={() => setErrorDialog({ ...errorDialog, open: false })} 
        title={errorDialog.title} 
        message={errorDialog.message} 
      />

      {/* Header */}
      <header className="bg-white border-b p-3 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href={`/evaluate/home/check/${id}`}>
              <Button size="sm" variant="outline" className="gap-1">
                <ArrowLeftIcon className="w-4 h-4" /> Back
              </Button>
            </Link>
            <span className="font-medium text-sm">
              {qp?.name || "Loading..."}
              {revisitCount > 0 && (
                <Badge className="ml-2 bg-orange-100 text-orange-800" variant="secondary">
                  Revisit #{revisitCount}/5
                </Badge>
              )}
            </span>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1">
              <TimerIcon className="w-4 h-4 text-blue-600" /> 00:11:22
            </span>
            <span className="flex items-center gap-1">
              <WifiIcon className="w-4 h-4 text-green-600" /> {speed} Mbps
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Tools */}
        <aside className="w-20 lg:w-64 bg-white border-r overflow-y-auto p-3 space-y-6 flex-shrink-0">
          <div>
            <h3 className="text-xs font-bold text-gray-600 mb-2 hidden lg:block">QUICK MARKS</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {MARKS.map(m => (
                <Button 
                  key={m} 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleMarkAssignment(m)}
                  className={`text-xs h-8 ${
                    selectedQuestion && questionScores[selectedQuestion.QuestionNo] === (m === "NA" ? 0 : m) 
                      ? "bg-blue-600 text-white border-blue-600" 
                      : "bg-white"
                  }`}
                >
                  {m}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-bold text-gray-600 mb-2 hidden lg:block">ANNOTATIONS</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {ANNOTATIONS.map((icon, i) => {
                const tool = ["check", "cross", "text", "pencil", "number"][i];
                const isActive = selectedTool === tool;
                return (
                  <Button 
                    key={i} 
                    size="icon" 
                    variant="outline" 
                    onClick={() => handleAnnotationMap(i)}
                    className={`h-8 w-8 lg:h-10 lg:w-10 ${
                      isActive ? "bg-blue-100 border-blue-500 text-blue-700" : ""
                    }`}
                    title={tool ? `Tool: ${tool}` : i === 5 ? "Undo" : "Clear"}
                  >
                    {icon}
                  </Button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Center: PDF */}
        <main className="flex-1 bg-gray-100 flex flex-col overflow-hidden">
          <div className="bg-white border-b p-3 flex justify-between items-center">
            <span className="font-medium text-sm">
              Page {currentPage} / {totalPages}
            </span>
            <div className="flex gap-1">
              <Button 
                size="icon" 
                variant="outline" 
                onClick={() => setCurrentPage(p => Math.max(1, p-1))} 
                disabled={currentPage === 1}
                className="h-8 w-8"
              >
                <ArrowLeftIcon className="w-4 h-4" />
              </Button>
              <Button 
                size="icon" 
                variant="outline" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} 
                disabled={currentPage === totalPages}
                className="h-8 w-8"
              >
                <ArrowRightIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto relative bg-gray-200 p-2">
            <div className="max-w-4xl mx-auto bg-white shadow-lg">
              <div className="relative">
                <canvas 
                  ref={canvasRef} 
                  className="block w-full h-auto" 
                />
                <canvas
                  ref={drawCanvasRef}
                  className="absolute inset-0 w-full h-full cursor-crosshair"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onClick={handleCanvasClick}
                  style={{ 
                    cursor: selectedTool === "pencil" ? "crosshair" : 
                           selectedTool ? "pointer" : "default" 
                  }}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Right: Info */}
        <aside className="w-full lg:w-80 bg-white border-l flex flex-col overflow-hidden flex-shrink-0">
          <div className="p-3 border-b">
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => window.open(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/qp/pdf/${uuid}`, "_blank")} 
                className="flex-1 text-xs"
              >
                <EyeIcon className="w-4 h-4 mr-1" /> QP
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => window.open(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/answer-key/${uuid}`, "_blank")} 
                className="flex-1 text-xs"
              >
                <EyeIcon className="w-4 h-4 mr-1" /> Key
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Questions Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-48 overflow-y-auto">
                <Table>
                  <TableHeader className="bg-gray-50 sticky top-0">
                    <TableRow>
                      <TableHead className="text-center text-xs py-2 border-r">Q</TableHead>
                      <TableHead className="text-center text-xs py-2 border-r">Out of</TableHead>
                      <TableHead className="text-center text-xs py-2">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {qp ? renderQuestionHierarchyTable(qp.data, setSelectedQuestion, questionScores, selectedQuestion) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-xs py-4">
                          Loading questions...
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Selected Question Details */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-bold text-sm text-blue-800 mb-2">
                {selectedQuestion ? 
                  `Question ${selectedQuestion.QuestionNo} (${questionScores[selectedQuestion.QuestionNo] ?? 0}/${selectedQuestion.Marks})` : 
                  "Select Question"
                }
              </h4>
              <p className="text-xs text-gray-700 line-clamp-3">
                {selectedQuestion?.QuestionText || "Click a question from the table above to view details and assign marks."}
              </p>
            </div>

            {/* Total Score & Actions */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
              <p className="text-center text-sm font-semibold text-gray-700 mb-1">Total Score</p>
              <p className="text-center text-2xl font-bold text-green-600 mb-3">
                {totalScore.toFixed(2)} / {qp?.totalMarks || 0}
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 text-xs text-red-600 border-red-300 hover:bg-red-50"
                >
                  Reject
                </Button>
                <Button 
                  size="sm" 
                  onClick={handlePaperFinish} 
                  className="flex-1 text-xs bg-green-600 hover:bg-green-700" 
                  disabled={revisitCount >= 5}
                >
                  Finish {revisitCount > 0 && `(#${revisitCount})`}
                </Button>
              </div>
            </div>

            {/* Pages Overview */}
            <div className="border rounded-lg p-3 bg-white">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold">Pages</h4>
                <div className="flex gap-3 text-xs">
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div> {visitedPages}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-orange-500 rounded"></div> {totalPages - visitedPages}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {Array.from({ length: totalPages }, (_, i) => {
                  const pageNum = i + 1;
                  const hasAnnotations = !!annotations[pageNum]?.length;
                  const isCurrent = pageNum === currentPage;
                  
                  let bgColor = "bg-orange-500"; // Not visited
                  if (hasAnnotations) bgColor = "bg-green-500"; // Visited
                  if (isCurrent) bgColor = "bg-blue-500"; // Current page
                  
                  return (
                    <Badge
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`cursor-pointer text-xs h-7 flex items-center justify-center text-white ${bgColor} hover:opacity-80 transition-opacity`}
                    >
                      {pageNum}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}