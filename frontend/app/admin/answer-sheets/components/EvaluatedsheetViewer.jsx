"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Loader2,
  FileCheck2,
  RotateCw,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Add roundRect to CanvasRenderingContext2D if not exists
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r);
    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    return this;
  };
}

// Draw all annotations onto a canvas context
function drawAnnotations(ctx, pageAnnotations) {
  if (!pageAnnotations || pageAnnotations.length === 0) return;

  pageAnnotations.forEach((a) => {
    ctx.save();
    
    try {
      if (a.type === "drawing" && a.value?.length > 0) {
        ctx.strokeStyle = a.color || "red";
        ctx.lineWidth = a.lineWidth || 8;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(a.value[0].x, a.value[0].y);
        a.value.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      } 
      else if (a.type === "icon") {
        const isCheck = a.value === "check";
        ctx.strokeStyle = isCheck ? "#16a34a" : "#dc2626";
        ctx.fillStyle = isCheck ? "#16a34a" : "#dc2626";
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        
        if (isCheck) {
          // Draw checkmark
          ctx.moveTo(a.position.x - 30, a.position.y);
          ctx.lineTo(a.position.x - 10, a.position.y + 25);
          ctx.lineTo(a.position.x + 40, a.position.y - 30);
        } else {
          // Draw X
          ctx.moveTo(a.position.x - 30, a.position.y - 30);
          ctx.lineTo(a.position.x + 30, a.position.y + 30);
          ctx.moveTo(a.position.x + 30, a.position.y - 30);
          ctx.lineTo(a.position.x - 30, a.position.y + 30);
        }
        ctx.stroke();
      } 
      else if (a.type === "text") {
        ctx.font = `bold ${a.fontSize || 32}px Arial`;
        ctx.fillStyle = a.color || "blue";
        ctx.fillText(a.value, a.position.x, a.position.y);
      } 
      else if (a.type === "number") {
        ctx.font = `bold ${a.fontSize || 36}px Arial`;
        const metrics = ctx.measureText(a.value);
        const pad = 10;
        const h = 40;
        
        // Background highlight
        ctx.fillStyle = "rgba(220, 38, 38, 0.12)";
        ctx.beginPath();
        ctx.roundRect(
          a.position.x - pad,
          a.position.y - h + 6,
          metrics.width + pad * 2,
          h,
          8
        );
        ctx.fill();
        
        // Text
        ctx.fillStyle = a.color || "#dc2626";
        ctx.fillText(a.value, a.position.x, a.position.y);
      }
    } catch (err) {
      console.error("Error drawing annotation:", err);
    }
    
    ctx.restore();
  });
}

export default function EvaluatedSheetViewer({
  pdfUrl,
  annotations = {}, // Now expecting object keyed by page numbers
  result = {},
  totalMarks = 0,
  candidateName = "Candidate",
  fileName = "answer-sheet",
}) {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(0.6);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);

  // Load PDF
  useEffect(() => {
    if (!pdfUrl) return;
    
    setIsLoading(true);
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    
    loadingTask.promise
      .then((doc) => {
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("PDF load error:", error);
        toast.error("Failed to load PDF");
        setIsLoading(false);
      });
    
    return () => loadingTask.destroy?.();
  }, [pdfUrl]);

  // Render one page + annotations
  const renderPage = useCallback(
    async (doc, pageNum, scale, canvas) => {
      if (!doc || !canvas) return;

      // Cancel any ongoing render
      if (renderTaskRef.current) {
        try {
          await renderTaskRef.current.cancel();
        } catch (err) {
          // Ignore cancellation errors
        }
        renderTaskRef.current = null;
      }

      try {
        const page = await doc.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const renderTask = page.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = renderTask;
        
        await renderTask.promise;
        
        // Draw annotations for this page
        const pageAnnotations = annotations[String(pageNum)] || [];
        if (pageAnnotations.length > 0) {
          drawAnnotations(ctx, pageAnnotations);
        }
      } catch (err) {
        if (err?.name !== "RenderingCancelledException") {
          console.error("Render error:", err);
        }
      } finally {
        renderTaskRef.current = null;
      }
    },
    [annotations]
  );

  // Re-render when page, zoom, or annotations change
  useEffect(() => {
    if (pdfDoc && canvasRef.current && !isLoading) {
      renderPage(pdfDoc, currentPage, zoom, canvasRef.current);
    }
  }, [pdfDoc, currentPage, zoom, renderPage, isLoading]);

  // Download as annotated PDF
  const handleDownloadPDF = async () => {
    if (!pdfDoc) return;
    
    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      const printScale = 2.0;
      const offscreen = document.createElement("canvas");
      let offscreenTask = null;

      const renderOffscreenPage = async (pageNum) => {
        if (offscreenTask) {
          offscreenTask.cancel();
          offscreenTask = null;
        }
        
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: printScale });
        offscreen.width = viewport.width;
        offscreen.height = viewport.height;

        const ctx = offscreen.getContext("2d");
        ctx.clearRect(0, 0, offscreen.width, offscreen.height);

        const task = page.render({ canvasContext: ctx, viewport });
        offscreenTask = task;
        await task.promise;
        offscreenTask = null;

        // Draw annotations for this page
        const pageAnnotations = annotations[String(pageNum)] || [];
        if (pageAnnotations.length > 0) {
          drawAnnotations(ctx, pageAnnotations);
        }
      };

      const pdf = new jsPDF({ unit: "px", compress: true });
      let firstPage = true;

      for (let p = 1; p <= pdfDoc.numPages; p++) {
        setDownloadProgress(Math.round((p / pdfDoc.numPages) * 90));
        await renderOffscreenPage(p);

        const imgData = offscreen.toDataURL("image/jpeg", 0.95);
        const w = offscreen.width;
        const h = offscreen.height;

        if (!firstPage) {
          pdf.addPage([w, h], w > h ? "landscape" : "portrait");
        } else {
          pdf.internal.pageSize.width = w;
          pdf.internal.pageSize.height = h;
          firstPage = false;
        }

        pdf.addImage(imgData, "JPEG", 0, 0, w, h);
      }

      setDownloadProgress(100);
      const cleanFileName = fileName.replace(/\.[^.]+$/, "");
      pdf.save(`evaluated-${cleanFileName}.pdf`);
      toast.success("Evaluated sheet downloaded successfully");
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Download failed");
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  // Calculate statistics
  const totalAnnotationsCount = Object.values(annotations).reduce(
    (sum, arr) => sum + (arr?.length || 0),
    0
  );
  
  const scoredQuestions = Object.keys(result).length;
  const earnedMarks = Object.values(result).reduce(
    (s, v) => s + (parseFloat(v) || 0),
    0
  );
  const scorePercent = totalMarks > 0 ? (earnedMarks / totalMarks) * 100 : 0;

  // Get current page annotations count
  const currentPageAnnotations = annotations[String(currentPage)] || [];
  const currentPageCount = currentPageAnnotations.length;

  return (
    <div className="flex flex-col h-full bg-white text-gray-900 rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200 gap-4 flex-wrap">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm leading-tight truncate max-w-[200px] text-gray-800">
                {candidateName}
              </p>
              <p className="text-xs text-gray-400 leading-tight">Evaluated Copy</p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 flex-wrap">
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono">
              {earnedMarks.toFixed(1)} / {totalMarks} marks
            </Badge>
            <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-xs">
              {scoredQuestions} questions
            </Badge>
            <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-xs">
              {totalAnnotationsCount} annotations
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono w-12 text-center text-gray-500 tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          <Button
            size="sm"
            onClick={handleDownloadPDF}
            disabled={isDownloading || isLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-2 text-xs px-4 shadow-sm"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {downloadProgress}%
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Score Progress Strip */}
      <div className="px-5 py-2.5 bg-white border-b border-gray-100">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-500 font-medium">Score Progress</span>
          <span className="text-xs font-semibold text-gray-700 tabular-nums">
            {scorePercent.toFixed(1)}%
          </span>
        </div>
        <Progress value={scorePercent} className="h-1.5 bg-gray-100" />
      </div>

      {/* Download Progress (only while active) */}
      {isDownloading && (
        <div className="px-5 py-2 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center gap-3">
            <p className="text-xs text-blue-600 font-medium flex-shrink-0">
              Compositing pages…
            </p>
            <Progress value={downloadProgress} className="h-1.5 flex-1 bg-blue-100" />
            <span className="text-xs font-mono text-blue-700 flex-shrink-0 tabular-nums">
              {downloadProgress}%
            </span>
          </div>
        </div>
      )}

      {/* Canvas Viewer */}
      <div className="flex-1 overflow-auto bg-gray-100 p-6 flex justify-center items-start">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 text-gray-400 py-20">
            <RotateCw className="w-9 h-9 animate-spin text-gray-300" />
            <p className="text-sm">Loading answer sheet…</p>
          </div>
        ) : (
          <div className="relative inline-block shadow-xl rounded-sm ring-1 ring-black/5">
            <canvas ref={canvasRef} className="block rounded-sm" />
            <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs font-mono px-2.5 py-1 rounded-full pointer-events-none">
              {currentPage} / {totalPages}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Pagination Bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-200 gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isLoading}
            className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 max-w-[300px] overflow-x-auto px-1">
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-7 h-7 rounded-md text-xs font-mono transition-all flex-shrink-0 ${
                  p === currentPage
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            {totalPages > 10 && (
              <span className="text-xs text-gray-400 px-1">...</span>
            )}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || isLoading}
            className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <span className="text-xs text-gray-400">
          {currentPageCount} annotation{currentPageCount !== 1 ? 's' : ''} on page {currentPage}
        </span>
      </div>
    </div>
  );
}