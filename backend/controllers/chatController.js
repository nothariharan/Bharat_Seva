const { invokeModel } = require('../services/bedrockService');

const contextChat = async (req, res) => {
    try {
        const { message, language = 'hi', currentStep, actionPlanTitle } = req.body;

        const prompt = `
You are a helpful assistant for Bharat Seva, an Indian government scheme helper.

The user is currently working on: "${actionPlanTitle}"
They are on this step: "${currentStep?.title}" — "${currentStep?.description}"

User's question: "${message}"

Answer in ${language} in 2-3 simple sentences. 
Use the simplest words possible.
If you don't know something specific, say so honestly.
Do not make up scheme details.

Respond with plain text only. No JSON, no markdown.
`;

        // Use Nova Lite here — cheaper, fast enough for chat
        const reply = await invokeModel(prompt, false);

        return res.status(200).json({ reply: reply.trim() });

    } catch (error) {
        console.error('Chat error:', error);
        return res.status(500).json({ error: 'Could not get response' });
    }
};

module.exports = { contextChat };
