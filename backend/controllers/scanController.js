const { invokeVisionModel } = require('../services/bedrockService');

const DOCUMENT_PROMPTS = {
    aadhaar: `Extract these fields from this Aadhaar card image. 
    Return JSON only: { "name": "", "dob": "", "address": "", "uid_last4": "", "document_type": "aadhaar" }
    If this is NOT an Aadhaar card, return: { "document_type": "wrong", "detected_as": "what you see" }`,

    passbook: `Extract these fields from this bank passbook image.
    Return JSON only: { "name": "", "account_number": "", "ifsc": "", "bank_name": "", "document_type": "passbook" }
    If this is NOT a bank passbook, return: { "document_type": "wrong", "detected_as": "what you see" }`,

    generic: `Identify this document and extract key fields.
    Return JSON only: { "document_type": "detected type", "fields": { "key": "value" } }`
};

const REJECTION_MESSAGES = {
    hi: (detected) => `Yeh ${detected} lagta hai. Kripaya sahi document dikhayein.`,
    en: (detected) => `This appears to be a ${detected}. Please show the correct document.`,
    ta: (detected) => `Ithu ${detected} pola therikirathu. Correct document kaattungal.`,
};

const scanDocument = async (req, res) => {
    try {
        const { imageBase64, expectedDocumentType = 'aadhaar', language = 'hi' } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ error: 'Image is required' });
        }

        const promptText = DOCUMENT_PROMPTS[expectedDocumentType] || DOCUMENT_PROMPTS.generic;

        // Compress check: base64 of a phone photo can be 3-5MB
        // Warn if too large (Bedrock has limits)
        const estimatedBytes = (imageBase64.length * 3) / 4;
        if (estimatedBytes > 4 * 1024 * 1024) {
            return res.status(400).json({ error: 'Image too large. Please use a clearer, closer photo.' });
        }

        const rawResponse = await invokeVisionModel(imageBase64, 'jpeg', promptText);
        const cleaned = rawResponse.replace(/```json|```/g, '').trim();
        const result = JSON.parse(cleaned);

        if (result.document_type === 'wrong') {
            const rejectFn = REJECTION_MESSAGES[language] || REJECTION_MESSAGES.hi;
            return res.status(200).json({
                isCorrectDocument: false,
                documentTypeDetected: result.detected_as,
                extractedFields: {},
                rejectionMessage: rejectFn(result.detected_as),
            });
        }

        return res.status(200).json({
            isCorrectDocument: true,
            documentTypeDetected: result.document_type,
            extractedFields: result,
            rejectionMessage: null,
        });

    } catch (error) {
        console.error('Scan error:', error);
        return res.status(500).json({ error: 'Could not read document' });
    }
};

module.exports = { scanDocument };
