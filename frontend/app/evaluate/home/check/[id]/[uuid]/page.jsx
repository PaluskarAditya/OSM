"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
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
  ArrowLeftIcon,
  EyeIcon,
  Maximize2,
  Minimize2,
  RotateCw,
  ZoomIn,
  ZoomOut,
  GridIcon,
  FileTextIcon,
  CalculatorIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  InfoIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  MenuIcon,
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
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const renderQuestionHierarchyTable = (
  data,
  onQuestionSelect,
  questionScores,
  selectedQuestion,
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
        <motion.tr
          key={questionNo}
          onClick={() => onQuestionSelect(question)}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`cursor-pointer transition-all duration-200 ${isSelected
            ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500"
            : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100"
            }`}
        >
          <TableCell className="text-center p-3">
            <Badge
              className={`transition-all duration-300 ${isSelected
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-110"
                : "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 hover:shadow-md"
                } font-semibold text-xs px-3 py-1.5 rounded-full`}
            >
              {questionNo}
            </Badge>
          </TableCell>
          <TableCell className="text-center p-3 text-sm font-medium text-gray-700">
            {maxMarks}
          </TableCell>
          <TableCell className="text-center p-3 text-sm font-semibold">
            <span
              className={`${score > 0
                ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-1 rounded-full"
                : "text-rose-600"
                }`}
            >
              {score}
            </span>
          </TableCell>
        </motion.tr>,
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
    const hasActual =
      q.actualQuestions && Object.keys(q.actualQuestions).length > 0;
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

const calculateTotalScoreWithOptionals = (qpData, scores, maxTotal) => {
  if (!qpData || !Array.isArray(qpData) || qpData.length === 0) return 0;

  const questionData = qpData[0];

  const processQuestion = (q) => {
    if (!q) return 0;

    const hasActual =
      q.actualQuestions && Object.keys(q.actualQuestions).length > 0;
    const hasSub =
      q.subQuestions && Object.keys(q.subQuestions).length > 0;

    // ── Leaf question (no children) ──────────────────────────────────
    if (!hasActual && !hasSub) {
      return parseFloat(scores[q.QuestionNo]) || 0;
    }

    // ── Has actualQuestions — this is the optional-group level ────────
    // e.g. Q1.a: "Answer ANY TWO of the following 3"
    //   q.Optional        = "2"  → keep this many
    //   q.TotalQuestions  = "3"  → total questions available
    if (hasActual) {
      const actuals = Object.values(q.actualQuestions);
      const keepCount = parseInt(q.Optional);      // how many student SHOULD answer
      const isOptional = !isNaN(keepCount) && keepCount > 0;

      // Gather every leaf score under this group
      const leafScores = actuals.map((aq) => ({
        questionNo: aq.QuestionNo,
        score: processQuestion(aq),   // recurse in case actuals have deeper nesting
      }));

      if (isOptional && keepCount < leafScores.length) {
        // Student may have answered more than required — keep only the best N
        const sorted = [...leafScores].sort((a, b) => b.score - a.score);
        return sorted.slice(0, keepCount).reduce((sum, s) => sum + s.score, 0);
      }

      // No optional constraint — sum everything
      return leafScores.reduce((sum, s) => sum + s.score, 0);
    }

    // ── Has subQuestions — recurse down ──────────────────────────────
    if (hasSub) {
      return Object.values(q.subQuestions).reduce(
        (sum, sq) => sum + processQuestion(sq),
        0,
      );
    }

    return 0;
  };

  const grandTotal = Object.values(questionData).reduce(
    (sum, q) => sum + processQuestion(q),
    0,
  );

  // Cap against the paper's declared total marks
  if (maxTotal) {
    return Math.min(grandTotal, parseFloat(maxTotal));
  }

  return grandTotal;
};

// ─────────────────────────────────────────────────────────────
// Dialog components — defined OUTSIDE Page to prevent re-creation on re-render
// ─────────────────────────────────────────────────────────────

const FinishPaperDialog = ({ isOpen, onClose, onConfirm, loading }) => {
  if (!isOpen) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/30 max-w-md w-full"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500">
            <CheckCircleIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Finish Evaluation?
            </h2>
            <p className="text-gray-600 mt-1">
              This will submit your evaluation permanently
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
          This action cannot be undone. Please ensure all questions have been
          evaluated.
        </p>
        <div className="flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="rounded-full px-6 bg-white/50 backdrop-blur-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-full px-8 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg"
          >
            {loading ? (
              <>
                <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Finish & Submit"
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ErrorDialog = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-gradient-to-br from-white to-rose-50/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/30 max-w-md w-full"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500">
            <AlertCircleIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-rose-700">{title}</h2>
          </div>
        </div>
        <p className="text-gray-700 mb-8 bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-lg border border-rose-100">
          {message}
        </p>
        <Button
          onClick={onClose}
          className="w-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
        >
          OK
        </Button>
      </motion.div>
    </div>
  );
};

// ✅ FIX: Moved outside Page so it is not recreated on every render
const RejectPaperDialog = ({
  isOpen,
  onClose,
  onConfirm,
  reason,
  setReason,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full"
      >
        <h2 className="text-xl font-bold mb-4 text-rose-700">Reject Paper</h2>
        <p className="text-sm text-gray-600 mb-4">
          Select a reason for rejection.
        </p>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border rounded-lg p-2 mb-6"
        >
          <option value="">Select reason</option>
          <option value="Document Blur (Reupload)">
            Document Blur (Reupload)
          </option>
          <option value="Invalid Paper">Invalid Paper</option>
        </select>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!reason || loading}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            {loading ? "Rejecting..." : "Reject Paper"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────

export default function Page() {
  const { uuid, id } = useParams();
  const token = Cookies.get("token");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [visitedPages, setVisitedPages] = useState(0);
  const [pdfDOC, setPdfDOC] = useState(null);
  const [qp, setQP] = useState(null);
  const [qpKey, setQpKey] = useState(null);
  const [speed, setSpeed] = useState(null);
  const [annotations, setAnnotations] = useState({});
  const [selectedTool, setSelectedTool] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [pendingMarkPlacement, setPendingMarkPlacement] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionScores, setQuestionScores] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [errorDialog, setErrorDialog] = useState({
    open: false,
    title: "",
    message: "",
  });

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [revisitCount, setRevisitCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.6);
  const canvasRef = useRef(null);
  const drawCanvasRef = useRef(null);
  const contextRef = useRef(null);
  const router = useRouter();

  // ── Extracted redraw helper (stable reference with useCallback) ──
  const redrawAnnotations = useCallback((canvas, pageAnnots) => {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pageAnnots.forEach((a) => {
      if (a.type === "drawing") {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        if (a.value?.length > 0) {
          ctx.moveTo(a.value[0].x, a.value[0].y);
          a.value.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
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

    // Reset stroke style for future drawing
    ctx.strokeStyle = "red";
    ctx.lineWidth = 8;
  }, []);

  // ── Recalculate total whenever scores change ──────────────────
  useEffect(() => {
    if (!qp?.data) return;
    const correctTotal = calculateTotalScoreWithOptionals(
      qp.data,
      questionScores,
      parseFloat(qp.totalMarks || 0),  // ← add this so the cap applies live too
    );
    setTotalScore(correctTotal);
  }, [questionScores, qp?.data, qp?.totalMarks]);

  useEffect(() => {
    if (!drawCanvasRef.current) return;
    // Only redraw if canvas already has correct dimensions (PDF already rendered)
    if (drawCanvasRef.current.width === 0) return;
    redrawAnnotations(drawCanvasRef.current, annotations[currentPage] || []);
  }, [annotations, currentPage, redrawAnnotations]);

  // ── Drawing handlers ──────────────────────────────────────────
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
      const newAnnots =
        typeof updater === "function" ? updater(pageAnnots) : updater;
      const hadAnnots = pageAnnots.length > 0;
      const hasAnnots = newAnnots.length > 0;

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

  // ── Redraw annotations when page changes ─────────────────────
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
          a.value.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
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

  // ── Load data ─────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [sheetRes, qpRes, annotRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/answer-sheet/${uuid}`,
            { headers: { Authorization: `Bearer ${token}` } },
          ),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/qp/${uuid}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/answer-sheet/annotations/${uuid}`,
            { headers: { Authorization: `Bearer ${token}` } },
          ).catch(() => ({ ok: false })),
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
          const visited = Object.values(annotData.annotations).filter(
            (a) => a?.length > 0,
          ).length;
          setVisitedPages(visited);
        }

        const initialScores = annotData.result || {};
        setQuestionScores(initialScores);

        const initialTotalScore = Object.values(initialScores).reduce(
          (sum, score) => sum + (parseFloat(score) || 0),
          0,
        );
        setTotalScore(initialTotalScore);

        if (annotData.isEvaluated) {
          const count =
            (parseInt(Cookies.get(`revisit_${uuid}`) || "0") || 0) + 1;
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
        await fetch(
          "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png",
          { cache: "no-cache", mode: "no-cors" },
        );
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

  useEffect(() => {
    const getQpKey = async () => {
      if (!qp?.name) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/qp-key/${qp.name}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.ok) {
          const data = await res.json();
          setQpKey(data.data);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };
    getQpKey();
  }, [qp]);

  // ── Render PDF page ───────────────────────────────────────────
  const renderPage = useCallback(async (pdf, num, currentAnnotations) => {
    if (!pdf || !canvasRef.current || !drawCanvasRef.current) return;
    try {
      const page = await pdf.getPage(num);
      const viewport = page.getViewport({ scale: zoomLevel });

      // Resize both canvases together
      const canvas = canvasRef.current;
      const drawCanvas = drawCanvasRef.current;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      drawCanvas.width = viewport.width;
      drawCanvas.height = viewport.height;

      // Render PDF
      await page.render({
        canvasContext: canvas.getContext("2d"),
        viewport,
      }).promise;

      // ✅ Redraw annotations IMMEDIATELY after PDF render completes
      // canvas dimensions are correct at this point
      const pageAnnots = currentAnnotations[num] || [];
      redrawAnnotations(drawCanvas, pageAnnots);

      // Re-setup drawing context after resize
      const ctx = drawCanvas.getContext("2d");
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "red";
      ctx.lineWidth = 8;
      contextRef.current = ctx;

    } catch (error) {
      console.error("Error rendering page:", error);
    }
  }, [zoomLevel, redrawAnnotations]);

  useEffect(() => {
    if (pdfDOC) renderPage(pdfDOC, currentPage, annotations);
  }, [currentPage, pdfDOC, zoomLevel]);

  // ── ESC to cancel pending placement ──────────────────────────
  useEffect(() => {
    const cancel = (e) => {
      if (e.key === "Escape") {
        setPendingMarkPlacement(null);
        setSelectedTool(null);
      }
    };
    window.addEventListener("keydown", cancel);
    return () => window.removeEventListener("keydown", cancel);
  }, []);

  // ── Constants ─────────────────────────────────────────────────
  const MARKS = [0, 0.25, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, "NA"];
  const ANNOTATIONS = [
    <CheckIcon className="w-5 h-5" />,
    <CircleXIcon className="h-5 w-5" />,
    <TypeIcon className="h-5 w-5" />,
    <PencilIcon className="h-5 w-5" />,
    <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-2 py-1 text-xs font-bold rounded-full">
      #
    </Badge>,
    <UndoIcon className="h-5 w-5" />,
    <TrashIcon className="h-5 w-5" />,
  ];

  // ── Canvas click handler ──────────────────────────────────────
  const handleCanvasClick = (e) => {
    if (pendingMarkPlacement && drawCanvasRef.current) {
      const rect = drawCanvasRef.current.getBoundingClientRect();
      const scaleX = drawCanvasRef.current.width / rect.width;
      const scaleY = drawCanvasRef.current.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      updateAnnotations((p) => [
        ...p,
        {
          id: Date.now(),
          type: "number",
          value: pendingMarkPlacement.value.toString(),
          position: { x, y },
          meta: {
            questionNo: pendingMarkPlacement.questionNo,
            placedByUser: true,
          },
        },
      ]);

      setPendingMarkPlacement(null);
      setSelectedTool(null);
      return;
    }

    if (selectedTool === "pencil" || !drawCanvasRef.current) return;

    const rect = drawCanvasRef.current.getBoundingClientRect();
    const scaleX = drawCanvasRef.current.width / rect.width;
    const scaleY = drawCanvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (["check", "cross"].includes(selectedTool)) {
      updateAnnotations((p) => [
        ...p,
        {
          id: Date.now(),
          type: "icon",
          value: selectedTool,
          position: { x, y },
        },
      ]);
    } else if (selectedTool === "text") {
      const text = prompt("Enter text:");
      if (text) {
        updateAnnotations((p) => [
          ...p,
          { id: Date.now(), type: "text", value: text, position: { x, y } },
        ]);
      }
    } else if (selectedTool === "number" && selectedQuestion) {
      const mark = prompt(
        `Enter marks for question ${selectedQuestion.QuestionNo} (0-${selectedQuestion.Marks} or type "NA"):`,
      );
      if (mark === null) return;

      if (mark === "NA") {
        updateAnnotations((p) => [
          ...p,
          { id: Date.now(), type: "number", value: "NA", position: { x, y } },
        ]);
        setQuestionScores((prev) => ({
          ...prev,
          [selectedQuestion.QuestionNo]: 0,
        }));
        toast.success(`Marked question ${selectedQuestion.QuestionNo} as NA`);
      } else {
        const num = parseFloat(mark);
        if (!isNaN(num) && num >= 0 && num <= selectedQuestion.Marks) {
          updateAnnotations((p) => [
            ...p,
            { id: Date.now(), type: "number", value: mark, position: { x, y } },
          ]);
          setQuestionScores((prev) => ({
            ...prev,
            [selectedQuestion.QuestionNo]: num,
          }));
          toast.success(
            `Assigned ${num} marks to question ${selectedQuestion.QuestionNo}`,
          );
        } else {
          toast.error(
            `Please enter a valid number between 0 and ${selectedQuestion.Marks} or "NA"`,
          );
        }
      }
    }
  };

  // ── Mark assignment ───────────────────────────────────────────
  const handleMarkAssignment = (mark) => {
    if (!selectedQuestion) {
      toast.error("Please select a question first");
      return;
    }

    const no = selectedQuestion.QuestionNo;
    const max = selectedQuestion.Marks;

    if (mark === "NA") {
      setQuestionScores((prev) => ({ ...prev, [no]: 0 }));
      setPendingMarkPlacement({ questionNo: no, value: "NA" });
      setSelectedTool("number");
      toast("Click on the paper to place the mark");
      return;
    }

    const num = parseFloat(mark);
    if (isNaN(num) || num < 0 || num > max) {
      toast.error(`Must be between 0 and ${max}`);
      return;
    }

    setQuestionScores((prev) => ({ ...prev, [no]: num }));
    setPendingMarkPlacement({ questionNo: no, value: num });
    setSelectedTool("number");
    toast("Click on the paper to place the mark");
  };

  // ── Annotation tool handler ───────────────────────────────────
  const handleAnnotationMap = (i) => {
    const tools = ["check", "cross", "text", "pencil", "number", null, null];
    if (i === 5) return updateAnnotations((p) => p.slice(0, -1));
    if (i === 6) return updateAnnotations([]);
    const tool = tools[i];
    setSelectedTool((prev) => (prev === tool ? null : tool));
  };

  // ── Paper finish ──────────────────────────────────────────────
  const handlePaperFinish = () => {
    if (visitedPages < totalPages) {
      setErrorDialog({
        open: true,
        title: "Pages Not Visited",
        message: "VISIT ALL PAGES BEFORE FINISHING",
      });
      return;
    }

    if (!qp?.data) {
      setErrorDialog({
        open: true,
        title: "Data Error",
        message: "Question paper not loaded",
      });
      return;
    }

    const leaves = getAllLeafQuestions(qp.data);
    const unmarked = leaves.filter((q) => questionScores[q] === undefined);

    if (unmarked.length > 0) {
      setErrorDialog({
        open: true,
        title: "Missing Marks",
        message: "ANNOTATE ALL QUESTIONS",
      });
      return;
    }

    setFinishDialogOpen(true);
  };

  const confirmFinish = async () => {
    setLoading(true);
    try {
      const finalTotal = calculateTotalScoreWithOptionals(
        qp.data,
        questionScores,
        parseFloat(qp.totalMarks || 0),
      );

      const rawTotal = Object.values(questionScores).reduce(
        (s, v) => s + (parseFloat(v) || 0),
        0,
      );

      if (rawTotal > finalTotal) {
        toast.info(`Score auto-adjusted to ${finalTotal}`);
      }

      setTotalScore(finalTotal);

      const normalizeAnnotations = (annotations, scale) => {
        const result = {};
        Object.entries(annotations).forEach(([page, pageAnnots]) => {
          result[page] = pageAnnots.map(ann => {
            if (ann.type === "drawing") {
              return {
                ...ann,
                value: ann.value.map(p => ({ x: p.x / scale, y: p.y / scale })),
              };
            }
            if (ann.position) {
              return {
                ...ann,
                position: { x: ann.position.x / scale, y: ann.position.y / scale },
              };
            }
            return ann;
          });
        });
        return result;
      };

      // In confirmFinish, before building payload:
      const pdfScale = zoomLevel; // the scale used during evaluation
      const normalizedAnnotations = normalizeAnnotations(annotations, pdfScale);

      const payload = {
        totalMarks: finalTotal,
        annotations: normalizedAnnotations, // ← normalized, not raw
        result: questionScores,
        isEvaluated: true,
      };

      const requests = [
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/answer-sheet/update/${uuid}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          },
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/answer-sheet/status/${uuid}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: "Completed" }),
          },
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/eval/status/${uuid}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              status: "Completed",
              isChecked: "Evaluated",
              marks: finalTotal,
            }),
          },
        ),
      ];

      const results = await Promise.all(requests);
      if (!results.every((r) => r.ok)) throw new Error("Submit failed");

      toast.success(`Evaluation completed · Total ${finalTotal}`);
      setTimeout(() => router.back(), 1200);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit evaluation");
    } finally {
      setLoading(false);
      setFinishDialogOpen(false);
    }
  };

  // ── Paper reject ──────────────────────────────────────────────
  const confirmReject = async () => {
    if (!rejectReason) return;
    setLoading(true);
    try {
      const requests = [
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/answer-sheet/status/${uuid}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: "Rejected", reason: rejectReason }),
          },
        ),
      ];

      const results = await Promise.all(requests);
      if (!results.every((r) => r.ok)) throw new Error("Reject failed");

      toast.success("Paper rejected successfully");
      setTimeout(() => router.back(), 1200);
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject paper");
    } finally {
      setLoading(false);
      setRejectDialogOpen(false);
      setRejectReason("");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 backdrop-blur-sm overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-200/10 to-cyan-200/10 rounded-full blur-3xl" />
      </div>

      {/* ✅ Reject dialog is now defined outside — no more re-creation bug */}
      <RejectPaperDialog
        isOpen={rejectDialogOpen}
        onClose={() => {
          setRejectDialogOpen(false);
          setRejectReason("");
        }}
        onConfirm={confirmReject}
        reason={rejectReason}
        setReason={setRejectReason}
        loading={loading}
      />

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-br from-white to-gray-50/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/30 flex flex-col items-center"
            >
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                  <RotateCw className="h-10 w-10 text-white animate-spin" />
                </div>
                <div className="absolute inset-0 border-4 border-blue-200/50 rounded-full animate-ping" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Saving Evaluation
              </h3>
              <p className="text-gray-600 text-center max-w-sm">
                Please wait while we save your progress...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialogs */}
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
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-xl border-b border-white/30 shadow-lg"
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/evaluate/home/check/${id}`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 rounded-full bg-white/60 backdrop-blur-sm hover:bg-white/80 border-white/50 shadow-sm"
                >
                  <ArrowLeftIcon className="w-4 h-4" /> Back
                </Button>
              </Link>
              <div className="hidden sm:block h-6 w-px bg-gradient-to-b from-gray-300/50 to-transparent" />
              <div>
                <h1 className="font-bold text-lg bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {qp?.name || "Answer Sheet Evaluation"}
                </h1>
                <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                  {revisitCount > 0 && (
                    <Badge className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200">
                      Revisit #{revisitCount}/5
                    </Badge>
                  )}
                  <span className="flex items-center gap-1">
                    <TimerIcon className="w-3.5 h-3.5" /> 00:11:22
                  </span>
                  <span className="flex items-center gap-1">
                    <WifiIcon className="w-3.5 h-3.5" /> {speed} Mbps
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="outline"
                className="rounded-full bg-white/60 backdrop-blur-sm border-white/50"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    className="rounded-full bg-white/60 backdrop-blur-sm border-white/50 lg:hidden"
                  >
                    <MenuIcon className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="bg-white/95 backdrop-blur-lg"
                >
                  <SheetHeader>
                    <SheetTitle>Tools & Navigation</SheetTitle>
                    <SheetDescription>
                      Quick access to evaluation tools
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold mb-3">
                        Quick Marks
                      </h3>
                      <div className="grid grid-cols-4 gap-2">
                        {MARKS.map((m) => (
                          <Button
                            key={m}
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAssignment(m)}
                            className="text-xs"
                          >
                            {m}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold mb-3">
                        Annotations
                      </h3>
                      <div className="grid grid-cols-4 gap-2">
                        {ANNOTATIONS.map((icon, i) => (
                          <Button
                            key={i}
                            size="icon"
                            variant="outline"
                            onClick={() => handleAnnotationMap(i)}
                          >
                            {icon}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="hidden lg:flex w-20 xl:w-80 bg-gradient-to-b from-white/70 to-white/40 backdrop-blur-lg border-r border-white/30 flex-col overflow-y-auto flex-shrink-0"
        >
          <div className="p-4 border-b border-white/30">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <PencilIcon className="w-4 h-4" />
              <span className="hidden xl:inline">Annotation Tools</span>
            </h2>
          </div>

          <div className="flex-1 p-4 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-600 hidden xl:block">
                  QUICK MARKS
                </h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Assign marks to selected question</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
                {MARKS.map((m) => {
                  const isActive =
                    selectedQuestion &&
                    questionScores[selectedQuestion.QuestionNo] ===
                    (m === "NA" ? 0 : m);
                  return (
                    <motion.div
                      key={m}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAssignment(m)}
                        className={`text-xs h-9 w-full transition-all duration-300 ${isActive
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg border-blue-500"
                          : "bg-white/60 backdrop-blur-sm border-white/50 hover:bg-white/80"
                          }`}
                      >
                        {m}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-gray-600 hidden xl:block">
                ANNOTATION TOOLS
              </h3>
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {ANNOTATIONS.map((icon, i) => {
                  const tool = ["check", "cross", "text", "pencil", "number"][
                    i
                  ];
                  const isActive = selectedTool === tool;
                  const isAction = i >= 5;
                  return (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleAnnotationMap(i)}
                        className={`h-12 w-12 rounded-xl transition-all duration-300 ${isActive
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg border-blue-500"
                          : isAction
                            ? "bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 border-rose-200 hover:bg-rose-200"
                            : "bg-white/60 backdrop-blur-sm border-white/50 hover:bg-white/80"
                          }`}
                      >
                        {icon}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-600 hidden xl:block">
                  QUESTIONS
                </h3>
                <Badge className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 text-xs">
                  {Object.keys(questionScores).length} Scored
                </Badge>
              </div>
              <div className="border rounded-xl overflow-hidden bg-white/40 backdrop-blur-sm">
                <div className="max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 backdrop-blur-sm">
                      <TableRow>
                        <TableHead className="text-center text-xs py-3 font-semibold">
                          Q.No
                        </TableHead>
                        <TableHead className="text-center text-xs py-3 font-semibold">
                          Out of
                        </TableHead>
                        <TableHead className="text-center text-xs py-3 font-semibold">
                          Score
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {qp ? (
                        renderQuestionHierarchyTable(
                          qp.data,
                          setSelectedQuestion,
                          questionScores,
                          selectedQuestion,
                        )
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center text-sm py-4"
                          >
                            <div className="animate-pulse flex flex-col items-center gap-2">
                              <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24"></div>
                              <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16"></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Main PDF Viewer */}
        <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-gray-100/50 to-gray-200/30">
          <div className="bg-gradient-to-r from-white/70 to-white/40 backdrop-blur-lg border-b border-white/30 p-3">
            <div className="flex items-center justify-between max-w-6xl mx-auto">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-full bg-white/60 backdrop-blur-sm border-white/50 h-9 w-9"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </Button>
                  <span className="font-medium text-sm bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="rounded-full bg-white/60 backdrop-blur-sm border-white/50 h-9 w-9"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </Button>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.2))}
                    className="rounded-full bg-white/60 backdrop-blur-sm border-white/50 h-9 w-9"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium w-16 text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setZoomLevel((z) => Math.min(3, z + 0.2))}
                    className="rounded-full bg-white/60 backdrop-blur-sm border-white/50 h-9 w-9"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    window.open(
                      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/qp-key/view/qp/${qpKey?.qpPdfPath
                        .split("/")
                        .pop()}`,
                      "_blank",
                    )
                  }
                  className="gap-2 rounded-full bg-white/60 backdrop-blur-sm border-white/50"
                >
                  <EyeIcon className="w-4 h-4" /> View PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    window.open(
                      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/qp-key/view/key/${qpKey?.qpPdfPath
                        .split("/")
                        .pop()}`,
                      "_blank",
                    )
                  }
                  className="gap-2 rounded-full bg-white/60 backdrop-blur-sm border-white/50"
                >
                  <EyeIcon className="w-4 h-4" /> View Key
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 bg-gradient-to-br from-gray-100/50 to-gray-200/30">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-5xl mx-auto bg-white/60 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 overflow-hidden"
            >
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="block w-full h-auto shadow-inner"
                />
                <canvas
                  ref={drawCanvasRef}
                  className="absolute inset-0 w-full h-full cursor-crosshair"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onClick={handleCanvasClick}
                  style={{
                    cursor:
                      selectedTool === "pencil"
                        ? "crosshair"
                        : selectedTool
                          ? "pointer"
                          : "default",
                  }}
                />
              </div>
            </motion.div>
          </div>
        </main>

        {/* Right Sidebar */}
        <motion.aside
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="hidden lg:flex w-80 bg-gradient-to-b from-white/70 to-white/40 backdrop-blur-lg border-l border-white/30 flex-col overflow-y-auto flex-shrink-0"
        >
          <div className="p-4 border-b border-white/30">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <CalculatorIcon className="w-4 h-4" />
              Evaluation Summary
            </h2>
          </div>

          <div className="flex-1 p-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-50/70 to-indigo-50/70 backdrop-blur-sm rounded-xl border border-blue-100/50 p-4"
            >
              <h4 className="font-bold text-sm text-blue-800 mb-3 flex items-center gap-2">
                <FileTextIcon className="w-4 h-4" />
                {selectedQuestion
                  ? `Question ${selectedQuestion.QuestionNo}`
                  : "Select Question"}
              </h4>
              {selectedQuestion ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      Marks Assigned
                    </span>
                    <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm">
                      {questionScores[selectedQuestion.QuestionNo] ?? 0} /{" "}
                      {selectedQuestion.Marks}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-700 line-clamp-3 bg-white/50 p-3 rounded-lg">
                    {selectedQuestion.QuestionText ||
                      "No description available"}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-600">
                  Click a question from the list to view details and assign
                  marks.
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-emerald-50/70 to-green-50/70 backdrop-blur-sm rounded-xl border border-emerald-100/50 p-5 text-center"
            >
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Total Score
              </p>
              <div className="space-y-2">
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  {totalScore.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  out of {qp?.totalMarks || 0} marks
                </p>
              </div>
              <Progress
                value={(totalScore / (qp?.totalMarks || 100)) * 100}
                className="h-2 mt-4 bg-gradient-to-r from-emerald-200 to-green-200"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <Button
                size="lg"
                onClick={handlePaperFinish}
                disabled={revisitCount >= 5}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {revisitCount > 0 ? (
                  <>
                    <CheckCircleIcon className="mr-2 h-5 w-5" />
                    Finish (Revisit #{revisitCount})
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="mr-2 h-5 w-5" />
                    Finish Evaluation
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setRejectDialogOpen(true)}
                className="w-full rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 border-rose-200 hover:bg-rose-100"
              >
                <AlertCircleIcon className="mr-2 h-5 w-5" />
                Reject Paper
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm rounded-xl border border-white/30 p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <GridIcon className="w-4 h-4" />
                  Pages Overview
                </h4>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500"></div>
                    <span>Visited ({visitedPages})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"></div>
                    <span>Remaining ({totalPages - visitedPages})</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: totalPages }, (_, i) => {
                  const pageNum = i + 1;
                  const hasAnnotations = !!annotations[pageNum]?.length;
                  const isCurrent = pageNum === currentPage;

                  let bgClass = "bg-gradient-to-r from-amber-500 to-orange-500";
                  if (hasAnnotations)
                    bgClass = "bg-gradient-to-r from-emerald-500 to-green-500";
                  if (isCurrent)
                    bgClass = "bg-gradient-to-r from-blue-500 to-indigo-600";

                  return (
                    <motion.div
                      key={pageNum}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Badge
                        onClick={() => setCurrentPage(pageNum)}
                        className={`cursor-pointer text-xs h-8 w-8 flex items-center justify-center text-white ${bgClass} hover:shadow-lg transition-all duration-300 rounded-lg`}
                      >
                        {pageNum}
                      </Badge>
                    </motion.div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-white/30">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Progress</span>
                  <span>{Math.round((visitedPages / totalPages) * 100)}%</span>
                </div>
                <Progress
                  value={(visitedPages / totalPages) * 100}
                  className="h-2 mt-2 bg-gradient-to-r from-gray-200 to-gray-300"
                />
              </div>
            </motion.div>
          </div>
        </motion.aside>

        {/* Mobile Bottom Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-white/90 to-white/80 backdrop-blur-xl border-t border-white/30 shadow-lg">
          <div className="p-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 mb-1">
                  {currentPage}/{totalPages}
                </Badge>
                <p className="text-xs text-gray-600">Page</p>
              </div>
              <div className="text-center">
                <Badge className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 mb-1">
                  {totalScore.toFixed(1)}
                </Badge>
                <p className="text-xs text-gray-600">Score</p>
              </div>
              <div className="text-center">
                <Button
                  size="sm"
                  onClick={handlePaperFinish}
                  className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs"
                >
                  Finish
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
