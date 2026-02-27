const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Use Nova Lite for simple Q&A (cheaper), Nova Pro for complex intent routing
const invokeModel = async (prompt, useProModel = true) => {
    const modelId = useProModel
        ? process.env.BEDROCK_MODEL_ID      // Nova Pro
        : process.env.BEDROCK_LITE_MODEL_ID; // Nova Lite

    const payload = {
        modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
            messages: [{ role: 'user', content: [{ text: prompt }] }],
            inferenceConfig: {
                maxTokens: 1500,      // keep low to save credits
                temperature: 0.3,     // low temp = consistent structured output
            },
        }),
    };

    const command = new InvokeModelCommand(payload);
    const response = await client.send(command);
    const result = JSON.parse(Buffer.from(response.body).toString());
    return result.output.message.content[0].text;
};

// Vision model call for document OCR
const invokeVisionModel = async (imageBase64, mimeType, promptText) => {
    const payload = {
        modelId: process.env.BEDROCK_MODEL_ID, // Nova Pro supports vision
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
            messages: [{
                role: 'user',
                content: [
                    {
                        image: {
                            format: mimeType.includes('png') ? 'png' : 'jpeg',
                            source: { bytes: Buffer.from(imageBase64, 'base64') },
                        },
                    },
                    { text: promptText },
                ],
            }],
            inferenceConfig: { maxTokens: 800, temperature: 0.1 },
        }),
    };

    const command = new InvokeModelCommand(payload);
    const response = await client.send(command);
    const result = JSON.parse(Buffer.from(response.body).toString());
    return result.output.message.content[0].text;
};

module.exports = { invokeModel, invokeVisionModel };
