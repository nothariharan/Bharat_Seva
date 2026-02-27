const { invokeModel } = require('../services/bedrockService');
const { buildQueryPrompt } = require('../prompts/queryPrompt');

const processQuery = async (req, res) => {
    try {
        const { transcript, language = 'hi', userContext = {} } = req.body;

        if (!transcript || transcript.trim().length === 0) {
            return res.status(400).json({ error: 'Transcript is required' });
        }

        const prompt = buildQueryPrompt(
            transcript,
            language,
            userContext.state || 'India',
            userContext.district || 'your district',
            userContext.latitude,
            userContext.longitude
        );

        // Use Nova Pro for main intent routing
        const rawResponse = await invokeModel(prompt, true);

        // Strip any accidental markdown fences
        const cleaned = rawResponse.replace(/```json|```/g, '').trim();
        const actionPlan = JSON.parse(cleaned);

        return res.status(200).json(actionPlan);

    } catch (error) {
        console.error('Query processing error:', error);
        return res.status(500).json({
            error: 'Could not process query',
            message: 'Abhi jawab nahi mil raha. Thodi der mein dobara koshish karein.'
        });
    }
};

module.exports = { processQuery };
