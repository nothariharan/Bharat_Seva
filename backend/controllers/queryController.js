const { invokeModel } = require('../services/bedrockService');
const { buildQueryPrompt } = require('../prompts/queryPrompt');
const { getMatchingCommunitiesInternal } = require('../services/communityService');

const processQuery = async (req, res) => {
    try {
        const { transcript, language = 'hi', userContext = {} } = req.body;

        if (!transcript || transcript.trim().length === 0) {
            return res.status(400).json({ error: 'Transcript is required' });
        }

        const state = userContext.state || 'India';
        const district = userContext.district || '';

        const prompt = buildQueryPrompt(
            transcript,
            language,
            state,
            district,
            userContext.latitude,
            userContext.longitude
        );

        // Run AI intent and Community matching in parallel
        const [rawAIResponse, matchingCommunities] = await Promise.all([
            invokeModel(prompt, true),
            getMatchingCommunitiesInternal(state, district, transcript)
        ]);

        // Strip any accidental markdown fences
        const cleaned = rawAIResponse.replace(/```json|```/g, '').trim();
        const actionPlan = JSON.parse(cleaned);

        // Attach matching communities
        return res.status(200).json({
            ...actionPlan,
            matchingCommunities
        });

    } catch (error) {
        console.error('Query processing error:', error);
        return res.status(500).json({
            error: 'Could not process query',
            message: 'Abhi jawab nahi mil raha. Thodi der mein dobara koshish karein.'
        });
    }
};

const notifyCitizen = async (req, res) => {
    try {
        const { phoneNumber, orgName } = req.body;

        // This would use the twilioClient defined in server.js
        // For now, we simulate the success response
        console.log(`[Twilio Mock] Sending SMS to ${phoneNumber}: Bharat Seva: The ${orgName} has received your request and will call you shortly.`);

        res.json({ success: true, message: 'Notification sent to citizen' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send notification' });
    }
};

module.exports = { processQuery, notifyCitizen };
