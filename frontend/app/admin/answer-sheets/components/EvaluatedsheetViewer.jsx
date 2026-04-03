"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import jsPDF from "jspdf";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { saveAs } from "file-saver";
import { toast } from "sonner";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function drawAnnotationsOnCanvas(canvas, pageAnnotations, scale = 1) {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.save();
  ctx.scale(scale, scale);   // ← Apply scale once (cleaner & more accurate)

  (pageAnnotations || []).forEach(ann => {
    if (!ann) return;

    if (ann.type === "drawing") {
      ctx.save();
      ctx.strokeStyle = ann.color || "red";
      ctx.lineWidth = ann.lineWidth || 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      const points = ann.value || [];
      if (points.length > 0) {
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
      }
      ctx.stroke();
      ctx.restore();

    } else if (ann.type === "icon") {
      ctx.save();
      const x = ann.position?.x || 0;
      const y = ann.position?.y || 0;
      const sz = 22;                    // base size (already scaled by ctx.scale)

      ctx.strokeStyle = ann.value === "check" ? "#22c55e" : "#ef4444";
      ctx.lineWidth = 3.5;
      ctx.lineCap = "round";

      ctx.beginPath();
      if (ann.value === "check") {
        ctx.moveTo(x - sz * 0.65, y + sz * 0.05);
        ctx.lineTo(x - sz * 0.15, y + sz * 0.65);
        ctx.lineTo(x + sz * 0.75, y - sz * 0.55);
      } else {
        // X mark
        ctx.moveTo(x - sz * 0.6, y - sz * 0.6);
        ctx.lineTo(x + sz * 0.6, y + sz * 0.6);
        ctx.moveTo(x + sz * 0.6, y - sz * 0.6);
        ctx.lineTo(x - sz * 0.6, y + sz * 0.6);
      }
      ctx.stroke();
      ctx.restore();

    } else if (ann.type === "text") {
      ctx.save();
      ctx.font = `bold 20px Arial`;
      ctx.fillStyle = ann.color || "blue";
      ctx.textBaseline = "top";
      ctx.fillText(ann.value || "", ann.position?.x || 0, ann.position?.y || 0);
      ctx.restore();

    } else if (ann.type === "number") {
      ctx.save();
      ctx.font = `bold 24px Arial`;
      ctx.fillStyle = ann.color || "red";
      ctx.textBaseline = "top";
      ctx.fillText(String(ann.value || ""), ann.position?.x || 0, ann.position?.y || 0);
      ctx.restore();
    }
  });

  ctx.restore();
}

export default function EvaluatedSheetViewer({
  pdfUrl,
  annotations = {},   // { "1": [...], "2": [...] }
  result = {},
  totalMarks = 0,
  candidateName,
  fileName,
}) {
  const pdfCanvasRef = useRef(null);
  const drawCanvasRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // In EvaluatedSheetViewer, normalize incoming annotations once
  const normalizedAnnotations = useMemo(() => {
    if (!annotations) return {};

    // A4 at scale 1.0 is ~595pt wide. If coords exceed ~700, 
    // they were saved at a higher scale — normalize to scale 1.0
    const EVALUATION_SCALE = 1.6; // the scale used during evaluation
    const result = {};

    Object.entries(annotations).forEach(([page, pageAnnots]) => {
      result[page] = pageAnnots.map(ann => {
        if (ann.type === "drawing") {
          return {
            ...ann,
            value: ann.value.map(p => ({
              x: p.x / EVALUATION_SCALE,
              y: p.y / EVALUATION_SCALE,
            })),
          };
        }
        if (ann.position) {
          return {
            ...ann,
            position: {
              x: ann.position.x / EVALUATION_SCALE,
              y: ann.position.y / EVALUATION_SCALE,
            },
          };
        }
        return ann;
      });
    });

    return result;
  }, [annotations]);

  // Then use normalizedAnnotations everywhere instead of annotations

  // ── Load PDF ────────────────────────────────────────────────
  useEffect(() => {
    if (!pdfUrl) return;
    setLoading(true);
    setCurrentPage(1);

    const load = async () => {
      try {
        const res = await fetch(pdfUrl);
        const buf = await res.arrayBuffer();
        const doc = await pdfjsLib.getDocument({ data: buf }).promise;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
      } catch (err) {
        console.error("Failed to load PDF:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [pdfUrl]);

  // ── Render page + annotations whenever page or PDF changes ──
  useEffect(() => {
    if (!pdfDoc || !pdfCanvasRef.current || !drawCanvasRef.current) return;

    const render = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage);
        const baseViewport = page.getViewport({ scale: 1 });
        const containerWidth = pdfCanvasRef.current.parentElement?.clientWidth || 800;

        // Scale to fit container, max 1.5 to avoid huge canvases
        const scale = Math.min((containerWidth - 32) / baseViewport.width, 1.5);
        const viewport = page.getViewport({ scale });

        pdfCanvasRef.current.width = viewport.width;
        pdfCanvasRef.current.height = viewport.height;
        drawCanvasRef.current.width = viewport.width;
        drawCanvasRef.current.height = viewport.height;

        await page.render({
          canvasContext: pdfCanvasRef.current.getContext("2d"),
          viewport,
        }).promise;

        // Annotations are in PDF space (scale 1.0), multiply by render scale
        const pageAnnotations = annotations[String(currentPage)] || [];
        drawAnnotationsOnCanvas(drawCanvasRef.current, pageAnnotations, scale);

      } catch (err) {
        console.error("Render error:", err);
      }
    };

    render();
  }, [pdfDoc, currentPage, annotations]);

  const handleDownload = async () => {
    if (!pdfDoc) return;

    toast.loading("Generating PDF...");

    try {
      const EXPORT_SCALE = 3.0;   // Keep high for crisp text & lines

      const pdf = new jsPDF({
        unit: "pt",
        orientation: "portrait",
        compress: true,
      });

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);

        const baseVP = page.getViewport({ scale: 1 });           // Original size in points
        const exportVP = page.getViewport({ scale: EXPORT_SCALE }); // High-res render

        // Create canvases
        const pdfCanvas = document.createElement("canvas");
        const drawCanvas = document.createElement("canvas");
        const merged = document.createElement("canvas");

        pdfCanvas.width = exportVP.width;
        pdfCanvas.height = exportVP.height;
        drawCanvas.width = exportVP.width;
        drawCanvas.height = exportVP.height;
        merged.width = exportVP.width;
        merged.height = exportVP.height;

        // 1. Render original PDF page at high resolution
        await page.render({
          canvasContext: pdfCanvas.getContext("2d"),
          viewport: exportVP,
        }).promise;

        // 2. Draw annotations — **use the improved version below**
        const pageAnnotations = normalizedAnnotations[String(pageNum)] || [];
        drawAnnotationsOnCanvas(drawCanvas, pageAnnotations, EXPORT_SCALE);

        // 3. Merge PDF + Annotations
        const ctx = merged.getContext("2d");
        ctx.drawImage(pdfCanvas, 0, 0);
        ctx.drawImage(drawCanvas, 0, 0);

        // 4. Add to jsPDF — Use FULL high-res dimensions, let jsPDF downscale
        if (pageNum > 1) {
          pdf.addPage([baseVP.width, baseVP.height],
            baseVP.width > baseVP.height ? "landscape" : "portrait"
          );
        }

        pdf.addImage(
          merged.toDataURL("image/jpeg", 0.95),   // 0.95 is good balance
          "JPEG",
          0,
          0,
          baseVP.width,     // ← jsPDF will automatically scale down the high-res image
          baseVP.height
        );
      }

      const safeName = (candidateName || "evaluated-sheet")
        .replace(/[^a-zA-Z0-9]/g, "_")
        .replace(/_+/g, "_")
        .toLowerCase();

      pdf.save(`${safeName}_evaluated.pdf`);

      toast.dismiss();
      toast.success("PDF downloaded successfully");

    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.dismiss();
      toast.error("Failed to generate PDF");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading evaluated sheet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg border">
        <span className="text-sm font-medium text-gray-700">{candidateName || "—"}</span>
        <div className="flex-1" />
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
          Total: {totalMarks} marks
        </Badge>
        <Badge variant="outline" className="text-xs">
          {Object.keys(result).length} questions scored
        </Badge>
      </div>

      {/* Canvas area — PDF + annotation overlay */}
      <div className="relative border rounded-lg bg-gray-100 flex justify-center p-4">
        <div className="relative inline-block">
          {/* PDF layer */}
          <canvas ref={pdfCanvasRef} className="block shadow-md w-full" />
          {/* Annotation layer — sits on top, pointer-events none so it doesn't block scroll */}
          <canvas
            ref={drawCanvasRef}
            className="absolute inset-0 pointer-events-none w-full h-full"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline" size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium px-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline" size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Per-page annotation count */}
        <Badge variant="secondary" className="text-xs">
          {(annotations[String(currentPage)] || []).length} annotations on this page
        </Badge>

        <Button onClick={handleDownload} size="sm" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download Full PDF
        </Button>
      </div>
    </div>
  );
}