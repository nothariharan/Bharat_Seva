const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const { pdfCoordinates, templatesMap } = require('../config/pdfCoordinates');
const { templateMap, fieldMappings, numericFieldsByTemplate, textStyle } = require('../config/pdfMappings');

const normalizeLocaleDigits = (value = '') => value
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632)) // Arabic-Indic
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776)) // Eastern Arabic-Indic
    .replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - 2406)) // Devanagari
    .replace(/[௦-௯]/g, (d) => String(d.charCodeAt(0) - 3046)); // Tamil digits

const normalizeNumericText = (value = '') => {
    const raw = normalizeLocaleDigits(String(value).toLowerCase());
    const wordMap = {
        zero: '0', oh: '0', o: '0',
        one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9',
        ek: '1', do: '2', teen: '3', tin: '3', char: '4', chaar: '4', paanch: '5', panch: '5', chhe: '6', saat: '7', aath: '8', nau: '9',
        ஒன்று: '1', இரண்டு: '2', மூன்று: '3', நான்கு: '4', ஐந்து: '5', ஆறு: '6', ஏழு: '7', எட்டு: '8', ஒன்பது: '9', பூஜ்யம்: '0',
        onnu: '1', rendu: '2', moondru: '3', naangu: '4', aindhu: '5', aaru: '6', ezhu: '7', ettu: '8', onbadhu: '9'
    };

    const tokens = raw
        .replace(/[^a-z0-9\u0900-\u097F\u0B80-\u0BFF\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);

    const resolved = tokens.map((token) => {
        if (/^\d+$/.test(token)) return token;
        return wordMap[token] || '';
    }).join('');

    const directDigits = raw.replace(/\D/g, '');
    return (resolved || directDigits).replace(/\D/g, '');
};

const sanitizeForPdf = (value = '') => String(value)
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, textStyle.maxChars);

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

const generatePdf = async (req, res) => {
    try {
        const { template_id, formData } = req.body;

        if (!template_id || !formData || typeof formData !== 'object') {
            return res.status(400).json({ error: 'template_id and formData are required' });
        }

        const templateRelativePath = templateMap[template_id];
        const templateFieldMap = fieldMappings[template_id];

        if (!templateRelativePath || !templateFieldMap) {
            return res.status(400).json({ error: 'Invalid or unsupported template_id' });
        }

        const templatePath = path.join(__dirname, '..', '..', templateRelativePath);
        if (!fs.existsSync(templatePath)) {
            return res.status(404).json({ error: 'Template PDF not found' });
        }

        const existingPdfBytes = fs.readFileSync(templatePath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const page = pdfDoc.getPages()[0];

        const numericFields = new Set(numericFieldsByTemplate[template_id] || []);
        const normalizedFormData = { ...formData };
        if (template_id === 'form_6b' && normalizedFormData.electorNameTop && !normalizedFormData.electorNameBottom) {
            normalizedFormData.electorNameBottom = normalizedFormData.electorNameTop;
        }

        const drawCheckmark = (coordinate) => {
            page.drawText('X', {
                x: coordinate.x + 2,
                y: coordinate.y + 1,
                size: 10,
                color: rgb(0, 0, 0)
            });
        };

        for (const [fieldKey, rawValue] of Object.entries(normalizedFormData)) {
            const coordinate = templateFieldMap[fieldKey];
            if (!coordinate) continue;

            if (coordinate.type === 'checkboxGroup') {
                const selectedOption = String(rawValue || '').trim();
                if (!selectedOption) continue;
                const optionCoordinate = coordinate.options?.[selectedOption];
                if (!optionCoordinate) continue;
                drawCheckmark(optionCoordinate);
                continue;
            }

            if (coordinate.type === 'digitBoxes') {
                const digitsOnly = normalizeNumericText(rawValue);
                if (!digitsOnly) continue;

                const maxDigits = coordinate.maxDigits || 12;
                const step = coordinate.boxStep || 26;
                const startX = coordinate.x;
                const baselineY = coordinate.y;
                const fontSize = coordinate.size || textStyle.size;

                for (let i = 0; i < Math.min(digitsOnly.length, maxDigits); i += 1) {
                    const char = digitsOnly[i];
                    page.drawText(char, {
                        x: startX + (i * step),
                        y: baselineY,
                        size: fontSize,
                        color: rgb(0, 0, 0)
                    });
                }
                continue;
            }

            let value = sanitizeForPdf(rawValue);
            if (numericFields.has(fieldKey)) value = normalizeNumericText(value);
            if (!value) continue;

            const textCoordinate = coordinate.type === 'text' || !coordinate.type ? coordinate : null;
            if (!textCoordinate) continue;

            try {
                page.drawText(value, {
                    x: textCoordinate.x,
                    y: textCoordinate.y,
                    size: textCoordinate.size || textStyle.size,
                    lineHeight: textCoordinate.lineHeight || textStyle.lineHeight,
                    maxWidth: textCoordinate.maxWidth,
                    color: rgb(0, 0, 0)
                });
            } catch (drawError) {
                const asciiFallback = value.replace(/[^\x20-\x7E]/g, '').trim();
                if (!asciiFallback) continue;
                page.drawText(asciiFallback, {
                    x: textCoordinate.x,
                    y: textCoordinate.y,
                    size: textCoordinate.size || textStyle.size,
                    lineHeight: textCoordinate.lineHeight || textStyle.lineHeight,
                    maxWidth: textCoordinate.maxWidth,
                    color: rgb(0, 0, 0)
                });
                console.warn(`Fallback used for field "${fieldKey}" due to draw error:`, drawError.message);
            }
        }

        const pdfBytes = await pdfDoc.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=filled_${template_id}.pdf`);
        return res.status(200).send(Buffer.from(pdfBytes));
    } catch (error) {
        console.error('Error generating PDF:', error);
        return res.status(500).json({ error: 'Could not generate PDF. Please try again.' });
    }
};

module.exports = { fillPdf, calibratePdf, generatePdf };
