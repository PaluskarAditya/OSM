const { PDFDocument, rgb } = require('pdf-lib');

const maskFirstPage = async (pdfBuffer) => {
    try {
        const pdfDoc = await PDFDocument.load(pdfBuffer);

        const pages = pdfDoc.getPages();
        if (pages.length === 0) {
            throw new Error("PDF has no pages");
        }

        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();

        // Draw a white rectangle covering the entire first page
        // This effectively "masks" or blacks out the sensitive info (roll no, name, etc.)
        firstPage.drawRectangle({
            x: 0,
            y: 0,
            width: width,
            height: height,
            color: rgb(1, 1, 1),     // Pure white
            opacity: 1,              // Fully opaque
            blendMode: 'Normal',
        });

        // Optional: Add a subtle "MASKED" watermark so evaluator knows it's intentional
        // (Uncomment if you want this)
        /*
        const helveticaFont = await pdfDoc.embedFont('Helvetica-Bold');
        firstPage.drawText('MASKED - CANDIDATE INFO HIDDEN', {
          x: width / 2 - 180,
          y: height / 2,
          size: 28,
          font: helveticaFont,
          color: rgb(0.7, 0.7, 0.7),   // Light gray
          opacity: 0.6,
          rotate: degrees(315),        // Diagonal for better visibility
        });
        */

        const modifiedPdfBytes = await pdfDoc.save();
        return Buffer.from(modifiedPdfBytes);

    } catch (error) {
        console.error("Error masking first page:", error);
        throw error;   // Let the upload handler catch it
    }
};

module.exports = maskFirstPage;