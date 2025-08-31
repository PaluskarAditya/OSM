"use client";

import { useState, useRef, useEffect } from "react";

// import { fabric } from "fabric";

// Set up PDF.js worker


const PdfToPngConverter = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pngDataUrl, setPngDataUrl] = useState(null);
  const [status, setStatus] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const pdfCanvasRef = useRef(null);
  const pngCanvasRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setStatus(
        'PDF uploaded successfully. Click "Convert to PNG" to proceed.'
      );
      setPngDataUrl(null);

      // Preview PDF
      const reader = new FileReader();
      reader.onload = async (e) => {
        const pdfData = new Uint8Array(e.target.result);
        await renderPdfPage(pdfData, 1);
      };
      reader.readAsArrayBuffer(file);
    } else {
      setStatus("Please upload a valid PDF file.");
    }
  };

  const renderPdfPage = async (pdfData, pageNumber) => {
    try {
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = pdfCanvasRef.current;
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;
    } catch (error) {
      console.error("Error rendering PDF:", error);
      setStatus("Error rendering PDF: " + error.message);
    }
  };

  const convertPdfToPng = async () => {
    if (!pdfFile) {
      setStatus("Please upload a PDF file first");
      return;
    }

    setIsConverting(true);
    setStatus("Converting...");

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const pdfData = new Uint8Array(e.target.result);
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 });

        // Create off-screen canvas for rendering
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        // Convert to data URL
        const dataUrl = canvas.toDataURL("image/png");
        setPngDataUrl(dataUrl);

        // Update preview canvas
        const pngCanvas = pngCanvasRef.current;
        const pngContext = pngCanvas.getContext("2d");
        pngCanvas.width = canvas.width;
        pngCanvas.height = canvas.height;

        // Draw the image on canvas
        const img = new Image();
        img.onload = () => {
          pngContext.drawImage(img, 0, 0);
          setStatus("Conversion successful! PNG image generated from PDF.");
        };
        img.src = dataUrl;

        setIsConverting(false);
      };
      reader.readAsArrayBuffer(pdfFile);
    } catch (error) {
      console.error("Error converting PDF to PNG:", error);
      setStatus("Error converting PDF: " + error.message);
      setIsConverting(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>PDF to PNG Converter</h1>
        <p>Upload a PDF file and convert it to PNG images</p>
      </div>

      <div className="content">
        <div
          className="upload-section"
          onClick={() => document.getElementById("pdf-upload").click()}
        >
          <div className="upload-icon">
            <i className="fas fa-file-pdf"></i>
          </div>
          <h3>Click to upload a PDF file</h3>
          <p>Or drag and drop your PDF here</p>
          <input
            type="file"
            id="pdf-upload"
            accept=".pdf"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
        </div>

        <button
          id="convert-btn"
          className="button"
          disabled={!pdfFile || isConverting}
          onClick={convertPdfToPng}
        >
          <i className="fas fa-sync-alt"></i>
          {isConverting ? "Converting..." : "Convert to PNG"}
        </button>

        {status && (
          <div
            className={`status ${
              status.includes("successful")
                ? "success"
                : status.includes("Error")
                ? "error"
                : ""
            }`}
          >
            {status}
          </div>
        )}

        <div className="preview-section">
          <div className="preview-card">
            <div className="preview-header">PDF Preview</div>
            <div className="preview-content">
              {!pdfFile ? (
                <p>No PDF uploaded</p>
              ) : (
                <canvas ref={pdfCanvasRef}></canvas>
              )}
            </div>
          </div>

          <div className="preview-card">
            <div className="preview-header">PNG Preview</div>
            <div className="preview-content">
              {!pngDataUrl ? (
                <p>No PNG generated</p>
              ) : (
                <canvas ref={pngCanvasRef} />
              )}
            </div>
          </div>
        </div>

        <div className="info-section">
          <div className="info-title">
            <i className="fas fa-info-circle"></i> How to convert PDF buffer to
            PNG in Next.js
          </div>
          <p>
            This component shows how to convert a PDF file to PNG images using
            PDF.js in a Next.js client component.
          </p>

          <div className="code-block">
            {`// 1. Get PDF file as ArrayBuffer (from upload or API response)
const pdfBuffer = await file.arrayBuffer();

// 2. Get PDF document
const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;

// 3. Get first page
const page = await pdf.getPage(1);

// 4. Set scale for rendering
const viewport = page.getViewport({ scale: 2.0 });

// 5. Create canvas for PDF rendering
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
canvas.height = viewport.height;
canvas.width = viewport.width;

// 6. Render PDF page to canvas
await page.render({
  canvasContext: context,
  viewport: viewport
}).promise;

// 7. Convert canvas to PNG data URL
const pngDataUrl = canvas.toDataURL('image/png');

// 8. Use the PNG data URL as needed`}
          </div>

          <p>
            For multi-page PDFs, you would iterate through all pages and convert
            each one to a PNG image.
          </p>
        </div>
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .header {
          background: #2c3e50;
          color: white;
          padding: 20px;
          text-align: center;
        }

        .content {
          padding: 30px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .upload-section {
          border: 2px dashed #bdc3c7;
          border-radius: 8px;
          padding: 30px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
        }

        .upload-section:hover {
          border-color: #3498db;
          background: #f8f9fa;
        }

        .upload-icon {
          font-size: 50px;
          color: #3498db;
          margin-bottom: 15px;
        }

        .button {
          padding: 12px 25px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .button:hover:not(:disabled) {
          background: #2980b9;
        }

        .button:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }

        .preview-section {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-top: 20px;
        }

        .preview-card {
          flex: 1;
          min-width: 300px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
        }

        .preview-header {
          background: #f8f9fa;
          padding: 15px;
          border-bottom: 1px solid #e0e0e0;
          font-weight: 500;
        }

        .preview-content {
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
          background: #f9f9f9;
        }

        canvas {
          max-width: 100%;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }

        .info-section {
          background: #e8f4fc;
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
        }

        .info-title {
          font-size: 18px;
          margin-bottom: 15px;
          color: #2c3e50;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .code-block {
          background: #2c3e50;
          color: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          overflow-x: auto;
          font-family: monospace;
          font-size: 14px;
          line-height: 1.5;
          margin-top: 15px;
          white-space: pre-wrap;
        }

        .status {
          padding: 15px;
          border-radius: 5px;
          margin-top: 20px;
          text-align: center;
          font-weight: 500;
        }

        .status.success {
          background: #d4edda;
          color: #155724;
        }

        .status.error {
          background: #f8d7da;
          color: #721c24;
        }

        @media (max-width: 768px) {
          .preview-section {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default PdfToPngConverter;
