require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const twilio = require('twilio'); // IMPORT TWILIO

const app = express();
app.use(cors({
    origin: '*', // Allow ANY frontend
    methods: ['GET', 'POST', 'OPTIONS'], // Allow these methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Allow these headers
}));
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Twilio
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Define Safety Settings Global
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

// Helper function to extract JSON from messy text
const cleanAndParseJSON = (text) => {
  try {
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1) {
      throw new Error("No JSON object found in response");
    }

    const jsonString = text.substring(startIndex, endIndex + 1);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("JSON Parse Error. Raw Text was:", text);
    throw error;
  }
};

// --- SMART GENERATION HELPER ---
async function generateWithFallback(prompt) {
  try {
    // 1. Try Primary: Gemini 2.5 Flash Lite
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-lite", 
      safetySettings 
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    // 2. Fallback to Gemini 2.0 Flash
    if (error.status === 429 || error.status === 503 || error.message.includes("429")) {
      console.warn("⚠️ Flash-Lite Busy. Switching to Fallback (gemini-2.0-flash)...");
      const fallbackModel = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash", 
        safetySettings 
      });
      const fallbackResult = await fallbackModel.generateContent(prompt);
      return fallbackResult.response.text();
    }
    throw error; 
  }
}

// --- ROUTE 1: MAIN SEARCH (PLAN GENERATOR) ---
app.post('/api/chat', async (req, res) => {
  const { query, language } = req.body;
  const userLang = language || "English";

  console.log(`Received Query: "${query}" in Language: "${userLang}"`);

  try {
    const prompt = `
      You are **"Bharat Seva"**, a highly experienced Indian public service assistant.

      You help people from ANY part of India — rural or urban, literate or illiterate — who may speak in ANY Indian language or a mix of languages (Hindi, English, Hinglish, Tamil, Telugu, Bengali, Marathi, Kannada, Malayalam, Gujarati, Punjabi, Urdu, etc.).

      The user may:
      - Speak casually or emotionally
      - Be unclear or incomplete
      - Not know scheme names
      - Describe problems indirectly

      Your responsibility is to calmly understand and guide them.

      --------------------------------------------------
      USER INPUT
      --------------------------------------------------
      User Query: "${query}"
      Preferred Language: "${userLang}"

      --------------------------------------------------
      YOUR TASKS (DO ALL)
      --------------------------------------------------

      1. **Language Detection**
          - Detect the actual language used by the user.
          - Respond fully in the user's preferred language (or detected language if preference is unclear).

      2. **Intent Classification**
          Classify into ONE:
          - "grievance" → service not working, delay, rejection, corruption, complaint
          - "scheme" → eligibility, benefits, application for government schemes
          - "information" → how something works, where to go, rules, procedures

      3. **Context Understanding**
          - Infer whether the issue is likely:
            - Central Government
            - State Government
            - Local body (Panchayat / Municipality / Corporation)
          - If state-specific information is required but state is unknown:
            - Give a **general India-wide answer**
            - Clearly mention that exact steps may vary by state

      4. **Solution Generation (Updated)**
          - Give **clear, step-by-step actions**.
          - **CRITICAL STEP COUNT RULE:** Determine the exact number of steps based on the task's real complexity.
            - If it is simple (e.g., checking status), use 3-4 steps.
            - If it is complex (e.g., applying for a new card, land mutation), **use 6-10 steps**.
            - **Do NOT artificially restrict yourself to 4 steps.**
          - For each step, provide a **detailed explanation** and a **visual description** (image prompt) so we can generate an educational image for the user.
          - Assume the user has:
            - A basic phone
            - Possibly no email
            - Limited technical knowledge
          - Prefer **offline + online options**
          - Avoid bureaucratic language

      5. **Document Guidance**
          - List only **commonly required documents**
          - If unsure, say "May be required" instead of guessing

      6. **Tone Rules**
          - Calm
          - Respectful
          - Reassuring
          - Simple enough to be spoken aloud

      --------------------------------------------------
      STRICT OUTPUT FORMAT (IMPORTANT)
      --------------------------------------------------

      Return ONLY valid JSON.
      NO markdown.
      NO explanations.
      NO extra text.

      JSON STRUCTURE:
      {
        "detected_language": "string",

        "intent_type": "grievance | scheme | information",

        "summary_speech": "Very simple, friendly summary (max 2 sentences) written for voice output in ${userLang}.",

        "steps": [
          {
            "id": 1,
            "text": "Short actionable step title in ${userLang}",
            "detailed_explanation": "Simple, clear explanation of how to do this step in ${userLang}.",
            "image_prompt": "A photorealistic educational scene showing: [Describe the action in English for an AI image generator]. No text in image."
          },
          {
            "id": 2,
            "text": "Next step title...",
            "detailed_explanation": "Next explanation...",
            "image_prompt": "Image description..."
          }
        ],

        "required_documents": [
          "Document 1 in ${userLang}",
          "Document 2 in ${userLang}"
        ],

        "authority_office": "Most relevant office or department name in ${userLang}",

        "additional_help": "Optional helpline, portal, or local office advice in ${userLang}"
      }
    `;

    const responseText = await generateWithFallback(prompt);
    const jsonData = cleanAndParseJSON(responseText);

    res.json(jsonData);

  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ 
      error: "Something went wrong",
      details: error.message 
    });
  }
});

// --- ROUTE 2: CONTEXTUAL CHATBOT ---
app.post('/api/chat-context', async (req, res) => {
  const { query, currentStep, language, context } = req.body;
  console.log(`Chat Query: "${query}" | Step: "${currentStep}"`);

  try {
    const prompt = `
      You are **Bharat Sahayak**, a helpful Indian government service assistant.
      
      CONTEXT:
      The user is currently navigating a process and is stuck on this specific step: "${currentStep}".
      User Language: "${language}".
      User Query: "${query}"
      
      INSTRUCTIONS:
      1. Reply in "${language}".
      2. Keep it short, encouraging, and specific to the step they are on.
      3. Do not introduce yourself again, just answer the doubt.
      
      Output JSON ONLY: { "answer": "your answer here" }
    `;

    const responseText = await generateWithFallback(prompt);
    const jsonData = cleanAndParseJSON(responseText);

    res.json(jsonData);

  } catch (error) {
    console.error("Chatbot Error:", error);
    res.status(500).json({ error: "Failed to fetch answer" });
  }
});

// --- ROUTE 3: TWILIO WHATSAPP INTEGRATION ---
app.post('/api/send-whatsapp', async (req, res) => {
  const { phoneNumber, message } = req.body;
  console.log(`Sending WhatsApp to ${phoneNumber}`);

  try {
    const response = await twilioClient.messages.create({
      body: `🇮🇳 *Bharat Seva Action Plan*\n\n${message}\n\n_Generated by AI for Rural India_`,
      from: 'whatsapp:+14155238886', // This is the Twilio Sandbox Number
      to: `whatsapp:${phoneNumber}`
    });
    
    console.log("WhatsApp sent:", response.sid);
    res.json({ success: true, sid: response.sid });
  } catch (error) {
    console.error("Twilio Error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bharat Seva Backend running on http://localhost:${PORT}`);
});