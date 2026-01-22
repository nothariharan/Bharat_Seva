require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to extract JSON from messy text
const cleanAndParseJSON = (text) => {
  try {
    // 1. Find the first '{' and the last '}'
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1) {
      throw new Error("No JSON object found in response");
    }

    // 2. Extract just the JSON part
    const jsonString = text.substring(startIndex, endIndex + 1);

    // 3. Parse it
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("JSON Parse Error. Raw Text was:", text);
    throw error; // Re-throw to handle in the main route
  }
};

app.post('/api/chat', async (req, res) => {
  const { query, language } = req.body;
  const userLang = language || "English";

  console.log(`Received Query: "${query}" in Language: "${userLang}"`);

  try {
    // Use Flash model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      // SAFETY SETTINGS: Prevent blocking of harmless queries
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ]
    });

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

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // USE THE ROBUST PARSER
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bharat Seva Backend running on http://localhost:${PORT}`);
});