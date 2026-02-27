const { invokeVisionModel } = require('../services/bedrockService');

const readNotice = async (req, res) => {
    try {
        const { imageBase64, language = 'hi' } = req.body;

        const prompt = `
This is a photo of a government letter or notice received by a rural Indian citizen.

Read all text in the image carefully.

Then respond in ${language} language with JSON only:
{
  "simplifiedSummary": "2-3 sentences in very simple language explaining what this letter says",
  "sender": "who sent this letter",
  "actionRequired": true or false,
  "actionType": "brief label like BANK_KYC or TAX_NOTICE or SCHEME_APPROVED",
  "deadline": "deadline mentioned if any, else null",
  "urgency": "high" or "medium" or "low"
}

Use the simplest words possible. Write as if explaining to someone who has never read a government letter.
`;

        const rawResponse = await invokeVisionModel(imageBase64, 'jpeg', prompt);
        const cleaned = rawResponse.replace(/```json|```/g, '').trim();
        const result = JSON.parse(cleaned);

        return res.status(200).json(result);

    } catch (error) {
        console.error('Notice reader error:', error);
        return res.status(500).json({ error: 'Could not read notice' });
    }
};

module.exports = { readNotice };
