import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WelcomeIntro from './components/WelcomeIntro';
import LandingPage from './components/LandingPage';

// Define languages here to pass down
const LANGUAGES = [
  { name: "English", code: "en-IN", label: "English" },
  { name: "Hindi", code: "hi-IN", label: "हिंदी" },
  { name: "Telugu", code: "te-IN", label: "తెలుగు" },
  { name: "Tamil", code: "ta-IN", label: "தமிழ்" },
  { name: "Kannada", code: "kn-IN", label: "ಕನ್ನಡ" },
  { name: "Malayalam", code: "ml-IN", label: "മലയാളം" },
];

const App = () => {
  // --- STATE MANAGEMENT ---
  const [showWelcome, setShowWelcome] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[1]); // Default to Hindi
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- FIX: Append /api/chat to the base URL ---
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL 
    ? `${import.meta.env.VITE_BACKEND_URL}/api/chat` 
    : "http://localhost:3000/api/chat";

  // --- CORE LOGIC ---

  // 1. Handle Voice Input
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Browser not supported. Please use Chrome.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = selectedLang.code;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript(""); // Clear old transcript
    };
    
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      // Slight delay to let user see their text before sending
      setTimeout(() => fetchSolution(text), 1000);
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // 2. Handle Text Input (from Chips)
  const handleChipSelect = (text) => {
    setTranscript(text);
    fetchSolution(text);
  };

  // 3. API Call to Backend
  const fetchSolution = async (text) => {
    setLoading(true);
    setResponse(null); // Reset previous response
    try {
      const res = await axios.post(BACKEND_URL, {
        query: text,
        language: selectedLang.name
      });
      setResponse(res.data);
      // Auto-speak the summary when response arrives
      if (res.data.summary_speech) {
        speakResponse(res.data.summary_speech);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to connect to backend. Is 'node server.js' running?");
    }
    setLoading(false);
  };

  // 4. Text-to-Speech Output
  const speakResponse = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLang.code;
    window.speechSynthesis.speak(utterance);
  };

  // --- RENDER ---

  // 1. Show Welcome Screen first
  if (showWelcome) {
    return <WelcomeIntro onComplete={() => setShowWelcome(false)} />;
  }

  // 2. Show Main App
  return (
    <div className="min-h-screen bg-orange-50 font-sans text-gray-900">
      <LandingPage 
        isListening={isListening}
        onStartListening={startListening}
        transcript={transcript}
        response={response}
        loading={loading}
        selectedLang={selectedLang}
        onLangChange={setSelectedLang}
        languages={LANGUAGES}
        onChipSelect={handleChipSelect}
      />
    </div>
  );
};

export default App;