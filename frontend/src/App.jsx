import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OnboardingSplash from './components/OnboardingSplash';
import LandingPage from './components/LandingPage';
import OperatorDashboard from './components/OperatorDashboard';
import { endpoints } from './config/api';

// Define languages here to pass down
const LANGUAGES = [
  { name: "English", code: "en-IN", label: "English" },
  { name: "Hindi", code: "hi-IN", label: "हिंदी" },
  { name: "Telugu", code: "te-IN", label: "తెలుగు" },
  { name: "Tamil", code: "ta-IN", label: "தமிழ்" },
  { name: "Kannada", code: "kn-IN", label: "ಕನ್ನಡ" },
  { name: "Malayalam", code: "ml-IN", label: "മലയാളം" },
  { name: "Bengali", code: "bn-IN", label: "বাংলা" },
  { name: "Marathi", code: "mr-IN", label: "मराठी" },
  { name: "Gujarati", code: "gu-IN", label: "ગુજરાતી" },
  { name: "Punjabi", code: "pa-IN", label: "ਪੰਜਾਬੀ" },
  { name: "Odia", code: "or-IN", label: "ଓଡ଼ିଆ" },
  { name: "Urdu", code: "ur-IN", label: "اردو" },
];

const App = () => {
  // --- STATE MANAGEMENT ---
  const [showSplash, setShowSplash] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[1]); // Default to Hindi
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState('citizen'); // 'citizen' or 'operator'
  const [operatorData, setOperatorData] = useState(null);
  const [audioMode, setAudioMode] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeen) {
      setShowSplash(true);
    }
    // Load audio mode preference
    const savedAudioMode = localStorage.getItem('audioMode') === 'true';
    setAudioMode(savedAudioMode);
  }, []);

  const handleSplashComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowSplash(false);
  };

  const toggleAudioMode = () => {
    const newVal = !audioMode;
    setAudioMode(newVal);
    localStorage.setItem('audioMode', newVal.toString());

    // Welcome/Intro audio for the mode
    if (newVal) {
      speakResponse(selectedLang.name === 'Hindi'
        ? "ऑडियो मोड चालू है। अब मैं आपको हर जानकारी पढ़कर सुनाऊँगी।"
        : "Audio mode is on. I will now read out every information to you.");
    }
  };

  const BACKEND_URL = endpoints.processQuery;

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

    // Geolocation interception
    let userLocation = {};
    try {
      if ('geolocation' in navigator) {
        console.log("Requesting Location...");
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 8000,
            enableHighAccuracy: true
          });
        });
        userLocation = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        };
        console.log("Captured Location:", userLocation);
      }
    } catch (err) {
      console.warn("Location access denied or timeout. Janata Pulse will use district-level defaults.", err);
    }

    try {
      const res = await axios.post(BACKEND_URL, {
        transcript: text,
        language: selectedLang.name,
        userContext: {
          state: "Maharashtra", // Mocked for demo
          district: "Nashik",    // Mocked for demo
          ...userLocation
        }
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
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    // Find best voice
    const voices = window.speechSynthesis.getVoices();
    let voice = voices.find(v => v.lang === selectedLang.code && (v.name.includes("Google") || v.name.includes("Microsoft")));
    if (!voice) {
      voice = voices.find(v => v.lang.startsWith(selectedLang.code.split('-')[0]));
    }
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = selectedLang.code;
    }
    utterance.rate = selectedLang.code === 'en-IN' ? 1.0 : 0.85;
    window.speechSynthesis.speak(utterance);
  };

  // --- RENDER ---

  if (userRole === 'operator' && operatorData) {
    return <OperatorDashboard operator={operatorData} onLogout={() => { setUserRole('citizen'); setOperatorData(null); }} />;
  }

  return (
    <div className="min-h-screen bg-orange-50 font-sans text-gray-900 relative">
      {showSplash && <OnboardingSplash onComplete={handleSplashComplete} />}


      {/* Operator Login Entry Point (Hidden in plain sight for demo) */}
      <div
        className="absolute bottom-4 right-4 z-50 opacity-10 hover:opacity-100 cursor-pointer transition-opacity"
        onClick={() => {
          setUserRole('operator');
          setOperatorData({ name: "Nashik Kisan Kendra", district: "Nashik", state: "Maharashtra" });
        }}
      >
        <span className="text-[10px] font-bold text-gray-400">Operator Portal</span>
      </div>

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
        audioMode={audioMode}
        toggleAudioMode={toggleAudioMode}
        speakResponse={speakResponse}
        onOrgLogin={(data) => {
          setUserRole('operator');
          setOperatorData(data);
        }}
      />
    </div>
  );
};

export default App;