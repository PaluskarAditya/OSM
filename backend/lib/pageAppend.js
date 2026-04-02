const { PDFDocument } = require('pdf-lib');

const appendBlankPage = async (pdfBuffer) => {
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    // Get the size of the first page to match dimensions
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    // Insert a blank page at position 0 (the very first page)
    pdfDoc.insertPage(0, [width, height]);

    const modifiedPdfBytes = await pdfDoc.save();
    return Buffer.from(modifiedPdfBytes);
};

module.exports = appendBlankPage