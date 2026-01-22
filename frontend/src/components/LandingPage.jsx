import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PulseMic from './PulseMic';
import SuggestionChips from './SuggestionChips';
import ActionDashboard from './ActionDashboard';

// --- UI TRANSLATIONS ---
const UI_TEXT = {
  "en-IN": { greeting: "Namaste,", hero: "How can I help?", tap_mic: "Tap the mic to speak in your language", listening: "Listening...", processing: "Analyzing...", hint: 'Try saying "My pension hasn\'t arrived"', new_search: "New Search", suggestions: ["Ration Card Application", "Street Light Issue", "PM Kisan Status", "Pension Not Received", "Water Problem"] },
  "hi-IN": { greeting: "नमस्ते,", hero: "मैं आपकी क्या सेवा कर सकता हूँ?", tap_mic: "अपनी भाषा में बोलने के लिए माइक दबाएं", listening: "सुन रहा हूँ...", processing: "विश्लेषण कर रहा हूँ...", hint: 'बोलें "मेरी पेंशन नहीं आई है"', new_search: "नई खोज", suggestions: ["राशन कार्ड आवेदन", "स्ट्रीट लाइट की समस्या", "पीएम किसान स्थिति", "पेंशन नहीं मिली", "पानी की समस्या"] },
  "te-IN": { greeting: "నమస్కారం,", hero: "నేను మీకు ఎలా సహాయపడగలను?", tap_mic: "మాట్లాడటానికి మైక్ నొక్కండి", listening: "వినబడుతోంది...", processing: "పరిశీలిస్తోంది...", hint: 'చెప్పండి "నా పెన్షన్ రాలేదు"', new_search: "కొత్త శోధన", suggestions: ["రేషన్ కార్డ్ అప్లికేషన్", "వీధి దీపల సమస్య", "పిఎం కిసాన్ స్థితి", "పెన్షన్ రాలేదు", "నీటి సమస్య"] },
  "ta-IN": { greeting: "வணக்கம்,", hero: "நான் உங்களுக்கு எப்படி உதவ முடியும்?", tap_mic: "பேச மைக்கை தட்டவும்", listening: "கேட்கிறது...", processing: "ஆய்வு செய்கிறது...", hint: 'சொல்லுங்கள் "என் ஓய்வூதியம் வரவில்லை"', new_search: "புதிய தேடல்", suggestions: ["ரேషన్ கார்டு விண்ணப்பம்", "தெரு விளக்கு பிரச்சனை", "பிஎம் கிசான் நிலை", "ஓய்வூதியம் பெறவில்லை", "தண்ணீர் பிரச்சனை"] },
  "kn-IN": { greeting: "ನಮಸ್ಕಾರ,", hero: "ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ?", tap_mic: "ಮಾತನಾಡಲು ಮೈಕ್ ಟ್ಯಾಪ್ ಮಾಡಿ", listening: "ಕೇಳುತ್ತಿದೆ...", processing: "ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...", hint: 'ಹೇಳಿ "ನನ್ನ ಪಿಂಚಣಿ ಬಂದಿಲ್ಲ"', new_search: "ಹೊಸ ಹುಡುಕಾಟ", suggestions: ["ಪಡಿತರ ಚೀಟಿ ಅರ್ಜಿ", "ಬೀದಿ ದೀಪದ ಸಮಸ್ಯೆ", "ಪಿಎಂ ಕಿಸಾನ್ ಸ್ಥಿತಿ", "ಪಿಂಚಣಿ ಬಂದಿಲ್ಲ", "ನೀರಿನ ಸಮಸ್ಯೆ"] },
  "ml-IN": { greeting: "നമസ്കാരം,", hero: "എനിക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാനാകും?", tap_mic: "സംസാരിക്കാൻ മൈക്ക് ടാപ്പ് ചെയ്യുക", listening: "കേൾക്കുന്നു...", processing: "വിശകലനം ചെയ്യുന്നു...", hint: 'പറയൂ "എന്റെ പെൻഷൻ വന്നില്ല"', new_search: "പുതിയ തിരയൽ", suggestions: ["റേഷൻ കാർഡ് അപേക്ഷ", "തെരുവ് വിളക്ക് പ്രശ്നം", "പിഎം കിസാൻ നില", "പെൻഷൻ ലഭിച്ചില്ല", "ജല പ്രശ്നം"] },
  // NEW LANGUAGES ADDED
  "bn-IN": { greeting: "নমস্কার,", hero: "আমি আপনাকে কিভাবে সাহায্য করতে পারি?", tap_mic: "মাইক ট্যাপ করে বলুন", listening: "শুনছি...", processing: "বিশ্লেষণ...", hint: 'বলুন "আমার পেনশন আসেনি"', new_search: "নতুন খোঁজ", suggestions: ["রেশন কার্ড আবেদন", "রাস্তার আলো", "পেনশন", "জলের সমস্যা"] },
  "mr-IN": { greeting: "नमस्कार,", hero: "मी तुम्हाला कशी मदत करू शकतो?", tap_mic: "बोलण्यासाठी माइक टॅप करा", listening: "ऐकत आहे...", processing: "थांबा...", hint: 'म्हणा "पेन्शन आली नाही"', new_search: "नवीन शोध", suggestions: ["रेशन कार्ड", "रस्त्यावरचे दिवे", "पाणी समस्या", "पेन्शन"] },
  "gu-IN": { greeting: "નમસ્તે,", hero: "હું તમને કેવી રીતે મદદ કરી શકું?", tap_mic: "બોલવા માટે માઇક દબાવો", listening: "સાંભળું છું...", processing: "વિશ્લેષણ...", hint: 'બોલો "પેન્શન નથી આવ્યું"', new_search: "નવી શોધ", suggestions: ["રેશન કાર્ડ", "સ્ટ્રીટ લાઈટ", "પેન્શન", "પાણી"] },
  "pa-IN": { greeting: "ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ,", hero: "ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?", tap_mic: "ਬੋਲਣ ਲਈ ਮਾਈਕ ਦਬਾਓ", listening: "ਸੁਣ ਰਿਹਾ ਹਾਂ...", processing: "ਉਡੀਕ ਕਰੋ...", hint: 'ਕਹੋ "ਪੈਨਸ਼ਨ ਨਹੀਂ ਆਈ"', new_search: "ਨਵੀਂ ਖੋਜ", suggestions: ["ਰਾਸ਼ਨ ਕਾਰਡ", "ਸਟਰੀਟ ਲਾਈਟ", "ਪੈਨਸ਼ਨ", "ਪਾਣੀ"] },
  "or-IN": { greeting: "ନମସ୍କାର,", hero: "ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?", tap_mic: "କହିବାକୁ ମାଇକ୍ ଦବାନ୍ତୁ", listening: "ଶୁଣୁଛି...", processing: "ଅପେକ୍ଷା କରନ୍ତୁ...", hint: 'କୁହନ୍ତୁ "ପେନସନ ଆସିନାହିଁ"', new_search: "ନୂତନ ସନ୍ଧାନ", suggestions: ["ରାସନ କାର୍ଡ", "ଷ୍ଟ୍ରିଟ୍ ଲାଇଟ୍", "ପେନସନ", "ଜଳ ସମସ୍ୟା"] },
  "ur-IN": { greeting: "آداب،", hero: "میں آپ کی کیسے مدد کر سکتا ہوں؟", tap_mic: "بولنے کے لیے مائیک دبائیں", listening: "سن رہا ہوں...", processing: "تجزیہ...", hint: 'کہیں "پنشن نہیں آئی"', new_search: "نئی تلاش", suggestions: ["راشن کارڈ", "اسٹریٹ لائٹ", "پنشن", "پانی کا مسئلہ"] }
};

const LandingPage = ({ 
  isListening, 
  onStartListening, 
  transcript, 
  response, 
  loading,
  selectedLang, 
  onLangChange, 
  languages,
  onChipSelect 
}) => {
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  // Get current language text or default to English
  const t = UI_TEXT[selectedLang.code] || UI_TEXT["en-IN"];

  // DYNAMIC FONT SIZE: Shrink text for Indian languages to fit on one line
  const isEnglish = selectedLang.code === "en-IN";
  const heroFontSize = isEnglish ? "text-4xl" : "text-2xl sm:text-3xl"; 

  // --- RESULT VIEW ---
  if (response) {
    return (
      <div className="w-full max-w-md mx-auto p-4 pt-8 animate-fade-in">
        <div className="mb-6 flex justify-between items-end">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Result</h1>
                <p className="text-xs text-gray-500">Based on your query</p>
            </div>
            <button onClick={() => window.location.reload()} className="text-xs text-orange-600 font-semibold bg-orange-50 px-3 py-1 rounded-full active:scale-95 transition-transform">
                {t.new_search}
            </button>
        </div>
        <ActionDashboard 
            data={response} 
            isPlaying={true} 
            onToggleAudio={() => setIsPlaying(!isPlaying)}
        />
      </div>
    );
  }

  // --- MAIN LANDING VIEW ---
  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto pt-6 relative overflow-hidden">
      
      {/* 1. Header with Logo & Language Selector */}
      <div className="flex justify-between items-center px-4 mt-4 relative z-50">
        
        {/* LOGO */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-5xl font-normal bg-clip-text text-transparent select-none"
          style={{
            fontFamily: 'Samarkan',
            backgroundImage: 'linear-gradient(to right, #DAA520, #FFD700, #DAA520)', 
            backgroundSize: '200% auto',
            color: '#DAA520',
            WebkitBackgroundClip: 'text',
            textShadow: '0px 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          Bharat Seva
        </motion.h1>

        {/* LANGUAGE DROPDOWN */}
        <div className="relative">
          <button 
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-orange-100 hover:border-orange-200 transition-colors active:bg-orange-50"
          >
            <Globe size={14} className="text-orange-600"/>
            <span className="text-xs font-bold text-gray-700">{selectedLang.label}</span>
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isLangMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 h-64 overflow-y-auto"
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLangChange(lang);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-xs font-medium hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-0 ${
                      selectedLang.code === lang.code ? 'text-orange-600 bg-orange-50/50' : 'text-gray-600'
                    }`}
                  >
                    {lang.label} <span className="text-gray-300 text-[10px] ml-1">({lang.name})</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. Hero Text (FIXED LAYOUT) */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mt-12 px-2 text-center mb-8"
      >
        <h2 className="text-2xl font-light text-gray-500 mb-1">
            {t.greeting}
        </h2>
        
        {/* HERO HEADER: Force Single Line + Dynamic Size */}
        <motion.h3 
            animate={{ opacity: [1, 0.85, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className={`${heroFontSize} font-bold text-gray-800 leading-tight tracking-tight py-2 whitespace-nowrap overflow-visible`}
        >
            {t.hero}
        </motion.h3>
        
        <p className="text-gray-900 font-medium text-sm mt-4">
            {t.tap_mic}
        </p>
      </motion.div>

      {/* 3. The Pulse Mic */}
      <div className="flex-grow flex flex-col items-center justify-center -mt-6">
        <PulseMic 
            isListening={isListening} 
            onClick={onStartListening} 
        />
        
        {/* Animated Transcript Feedback */}
        <div className="h-20 mt-8 w-full px-6 text-center flex items-center justify-center">
            <AnimatePresence mode="wait">
              {isListening ? (
                  <motion.p 
                    key="listening"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-orange-500 font-medium animate-pulse text-lg"
                  >
                    {t.listening}
                  </motion.p>
              ) : loading ? (
                   <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-2 text-orange-600 font-medium"
                   >
                      <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs tracking-widest uppercase opacity-80">{t.processing}</span>
                   </motion.div>
              ) : transcript ? (
                  <motion.p 
                    key="transcript"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="text-gray-800 font-medium italic text-lg leading-relaxed"
                  >
                    "{transcript}"
                  </motion.p>
              ) : (
                  <motion.p 
                    key="hint"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-gray-400 text-sm font-light"
                  >
                    {t.hint}
                  </motion.p>
              )}
            </AnimatePresence>
        </div>
      </div>

      {/* 4. Suggestions */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring' }}
        className="mb-8 w-full"
      >
        <SuggestionChips 
            onSelect={onChipSelect} 
            suggestions={t.suggestions} 
        />
      </motion.div>

    </div>
  );
};

export default LandingPage;