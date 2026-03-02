const { invokeModel } = require('./bedrockService');

/**
 * AI Moderation for Knowledge Board posts.
 * Checks for harmful content, PII, and relevance.
 */
const moderatePost = async (content) => {
    const prompt = `
    You are an AI moderator for "Bharat Seva", a civic social platform for rural India.
    Analyze the following post content and determine if it is "SAFE" or "REJECTED".
    
    CRITERIA FOR REJECTION:
    1. HARMFUL: Hate speech, violence, illegal activities, or explicit content.
    2. PII: Personally Identifiable Information like Full Aadhaar numbers, private phone numbers (public org numbers are okay), or physical addresses of individuals.
    3. MISLEADING/SPAM: Non-civic content, advertisements, or obvious misinformation.
    4. OFF-TOPIC: Content that has nothing to do with government schemes, civic issues, local community help, or social welfare.

    POST CONTENT:
    "${content}"

    RESPONSE FORMAT (JSON ONLY):
    {
        "status": "SAFE" | "REJECTED",
        "reason": "Brief explanation if rejected, otherwise null",
        "cleaned_content": "The content with any minor PII redacted (if status is SAFE), otherwise original"
    }
    `;

    try {
        const rawResponse = await invokeModel(prompt, true);
        const cleaned = rawResponse.replace(/```json|```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (error) {
        console.error('Moderation error:', error);
        // Fail safe: reject if moderation fails
        return { status: 'REJECTED', reason: 'Moderation service error', cleaned_content: content };
    }
};

/**
 * AI Translation for operator responses.
 * Translates text to the target language used by the citizen.
 */
const translateResponse = async (text, targetLanguage) => {
    const prompt = `
    Translate the following text into ${targetLanguage}. 
    The tone should be helpful, professional, and respectful.
    Maintain any links or specific terms as is.

    TEXT:
    "${text}"

    ONLY return the translated text.
    `;

    try {
        return await invokeModel(prompt, false); // Use Lite for translation
    } catch (error) {
        console.error('Translation error:', error);
        return text; // Return original if translation fails
    }
};

/**
 * Topic matching for communities.
 * Classifies a query into a fixed taxonomy.
 */
const classifyTopic = async (query) => {
    const prompt = `
    Classify the following civic query into one or more categories from this list:
    Farmer Welfare, Women & Child Schemes, Legal Aid, Disability Benefits, Labour Rights, Education, Healthcare, Ration & Food Security, Financial Inclusion, Housing.

    QUERY:
    "${query}"

    RESPONSE FORMAT (JSON ONLY):
    {
        "topics": ["Topic1", "Topic2"],
        "confidence": 0.0 to 1.0
    }
    `;

    try {
        const rawResponse = await invokeModel(prompt, false);
        const cleaned = rawResponse.replace(/```json|```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (error) {
        console.error('Topic classification error:', error);
        return { topics: [], confidence: 0 };
    }
};

module.exports = { moderatePost, translateResponse, classifyTopic };
