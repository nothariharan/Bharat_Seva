const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const { pdfCoordinates, templatesMap } = require('../config/pdfCoordinates');

// New Calibration Endpoint for Testing Exact Checkmark/Text Alignment
const calibratePdf = async (req, res) => {
    try {
        const { templateId } = req.body;
        if (!templateId || !templatesMap[templateId]) {
            return res.status(400).json({ error: 'Valid templateId required' });
        }

        const templateFilename = templatesMap[templateId];
        const templatePath = path.join(__dirname, '..', '..', templateFilename);
        if (!fs.existsSync(templatePath)) return res.status(404).json({ error: 'Template not found' });

        const existingPdfBytes = fs.readFileSync(templatePath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        const coords = pdfCoordinates[templateId];

        for (const [fieldId, fieldData] of Object.entries(coords)) {
            // Check if it's a nested object (like radio/checkboxes)
            if (fieldData.type === undefined) {
                // Nested checkboxes
                for (const [optionName, optionData] of Object.entries(fieldData)) {
                    if (optionData.type === 'checkbox') {
                        // Draw red box around coordinates to see where they land
                        firstPage.drawRectangle({
                            x: optionData.x,
                            y: optionData.y,
                            width: 10,
                            height: 10,
                            borderColor: rgb(1, 0, 0),
                            borderWidth: 1
                        });
                        // Label it small
                        firstPage.drawText(optionName, { x: optionData.x + 12, y: optionData.y, size: 6, color: rgb(1, 0, 0) });
                    }
                }
            } else if (fieldData.type === 'text') {
                // Draw red Text to see where it lands
                firstPage.drawText(`[${fieldId}]`, {
                    x: fieldData.x,
                    y: fieldData.y,
                    size: 8,
                    color: rgb(0, 0, 1), // Blue for text
                });
            }
        }

        const pdfBytes = await pdfDoc.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=calibrated_${templateFilename}`);
        return res.status(200).send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error('Error in calibration:', error);
        return res.status(500).json({ error: 'Calibration failed' });
    }
};


const fillPdf = async (req, res) => {
    try {
        const { templateId, formData } = req.body;

        if (!templateId || !formData) {
            return res.status(400).json({ error: 'templateId and formData are required' });
        }

        const templateFilename = templatesMap[templateId];
        if (!templateFilename || !pdfCoordinates[templateId]) {
            return res.status(400).json({ error: 'Invalid or unsupported templateId' });
        }

        const templatePath = path.join(__dirname, '..', '..', templateFilename);

        if (!fs.existsSync(templatePath)) {
            return res.status(404).json({ error: `Template PDF ${templateFilename} not found in root directory` });
        }

        const existingPdfBytes = fs.readFileSync(templatePath);

        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        const coords = pdfCoordinates[templateId];

        // Process frontend answers against backend mapping
        for (const [fieldId, value] of Object.entries(formData)) {
            const mapInfo = coords[fieldId];
            if (!mapInfo || !value) continue; // Skip if we don't know where to put it or it's empty

            // If it's a direct mapping (like 'text' type)
            if (mapInfo.type === 'text') {
                firstPage.drawText(String(value), {
                    x: mapInfo.x,
                    y: mapInfo.y,
                    size: 10,
                    color: rgb(0, 0, 0),
                });
            }
            // If it's a nested mapping (like 'radio' or 'checkbox' groups)
            else if (mapInfo[value] && mapInfo[value].type === 'checkbox') {
                // The answer value corresponds to a key in the nested object (e.g. Value "Male" points to mapInfo["Male"])
                const checkmarkX = mapInfo[value].x;
                const checkmarkY = mapInfo[value].y;

                // Draw a simple checkmark/X
                firstPage.drawText("✓", {
                    x: checkmarkX,
                    y: checkmarkY,
                    size: 14,
                    color: rgb(0, 0, 0),
                });
            }
        }

        const pdfBytes = await pdfDoc.save();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=filled_${templateFilename}`);
        return res.status(200).send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error('Error filling PDF:', error);
        return res.status(500).json({
            error: 'Could not generate PDF. Please try again.'
        });
    }
};

module.exports = { fillPdf, calibratePdf };
