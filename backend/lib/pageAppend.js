const { PDFDocument, rgb, degrees } = require('pdf-lib');
const { StandardFonts } = require('pdf-lib');
const sharp = require('sharp');
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const maskFirstPage = async (pdfBuffer) => {
    try {
        const pdfDoc = await PDFDocument.load(pdfBuffer);

        const pages = pdfDoc.getPages();
        if (pages.length === 0) {
            throw new Error("PDF has no pages");
        }

        // --- Step 1: Rasterize ONLY the first page to an image via Ghostscript ---
        // This nukes the text layer entirely — no copy-paste possible after this
        const tmpDir = os.tmpdir();
        const inputPath = path.join(tmpDir, `input_${Date.now()}.pdf`);
        const outputImagePath = path.join(tmpDir, `page1_${Date.now()}.png`);

        fs.writeFileSync(inputPath, pdfBuffer);

        execSync(
            `gs -dNOPAUSE -dBATCH -dFirstPage=1 -dLastPage=1 \
            -sDEVICE=png16m -r150 \
            -sOutputFile=${outputImagePath} \
            ${inputPath}`,
            { stdio: 'pipe' }
        );

        // --- Step 2: Apply blur to the rasterized image using sharp ---
        const blurredImageBuffer = await sharp(outputImagePath)
            .blur(28)                          // Strong gaussian blur
            .modulate({ brightness: 1.05 })    // Slightly brighten so it looks frosted
            .png()
            .toBuffer();

        // --- Step 3: Rebuild a new PDF ---
        // First page = blurred image (no text layer!) + "Document Masked" overlay
        // Remaining pages = original untouched
        const newPdfDoc = await PDFDocument.create();

        // Embed the blurred image
        const blurredImage = await newPdfDoc.embedPng(blurredImageBuffer);
        const { width, height } = pages[0].getSize();

        const firstPage = newPdfDoc.addPage([width, height]);
        firstPage.drawImage(blurredImage, {
            x: 0,
            y: 0,
            width,
            height,
        });

        // --- Step 4: Add "Document Masked" badge on top of the blurred image ---
        const font = await newPdfDoc.embedFont(StandardFonts.HelveticaBold);
        const subFont = await newPdfDoc.embedFont(StandardFonts.Helvetica);

        const text = 'Document Masked';
        const fontSize = 32;
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const textHeight = font.heightAtSize(fontSize);

        const pillPadX = 24;
        const pillPadY = 14;

        // Dark pill background
        firstPage.drawRectangle({
            x: width / 2 - textWidth / 2 - pillPadX,
            y: height / 2 - textHeight / 2 - pillPadY,
            width: textWidth + pillPadX * 2,
            height: textHeight + pillPadY * 2,
            color: rgb(0.15, 0.15, 0.25),
            opacity: 0.88,
            borderRadius: 8,
        });

        firstPage.drawText(text, {
            x: width / 2 - textWidth / 2,
            y: height / 2 - textHeight / 2,
            size: fontSize,
            font,
            color: rgb(1, 1, 1),
            opacity: 1,
        });

        // Sub-label
        const subText = 'Sensitive information has been hidden';
        const subFontSize = 11;
        const subTextWidth = subFont.widthOfTextAtSize(subText, subFontSize);

        firstPage.drawText(subText, {
            x: width / 2 - subTextWidth / 2,
            y: height / 2 - textHeight / 2 - 28,
            size: subFontSize,
            font: subFont,
            color: rgb(0.85, 0.85, 0.9),
            opacity: 0.9,
        });

        // --- Step 5: Copy remaining pages from original PDF as-is ---
        if (pages.length > 1) {
            const remainingPageIndices = Array.from(
                { length: pages.length - 1 },
                (_, i) => i + 1
            );
            const copiedPages = await newPdfDoc.copyPagesFrom(pdfDoc, remainingPageIndices);
            copiedPages.forEach(page => newPdfDoc.addPage(page));
        }

        // --- Cleanup temp files ---
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputImagePath);

        const modifiedPdfBytes = await newPdfDoc.save();
        return Buffer.from(modifiedPdfBytes);

    } catch (error) {
        console.error("Error masking first page:", error);
        throw error;
    }
};

module.exports = maskFirstPage;