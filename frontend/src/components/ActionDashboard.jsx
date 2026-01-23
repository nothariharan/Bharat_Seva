import React, { useState, useEffect } from 'react';
import { Play, Pause, FileText, CheckCircle, MessageCircle, ArrowRight, ArrowLeft, CheckSquare, Volume2, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatAssistant from './ChatAssistant'; // IMPORT THE NEW CHATBOT

// --- UI TRANSLATIONS FOR DASHBOARD ---
const DASHBOARD_LABELS = {
  "en-IN": { action_plan: "Action Plan", documents: "Documents", your_docs: "Your Attachments", step: "STEP", of: "OF", ask_ai: "Ask AI", next: "Next Step", finish: "Finish", completed: "You're all set!", success_msg: "You have reviewed all the steps. Good luck!", review: "Review Again", listen: "Listen to Summary", playing: "Playing Summary...", read_step: "Read Step" },
  "hi-IN": { action_plan: "कार्य योजना", documents: "दस्तावेज़", your_docs: "आपके संलग्नक", step: "चरण", of: "का", ask_ai: "AI से पूछें", next: "अगला चरण", finish: "समाप्त", completed: "प्रक्रिया पूरी हुई!", success_msg: "आपने सभी चरणों की समीक्षा कर ली है। शुभकामनाएँ!", review: "पुनः देखें", listen: "सारांश सुनें", playing: "सुना रहा हूँ...", read_step: "चरण सुनें" },
  "te-IN": { action_plan: "కార్యాచరణ ప్రణాళిక", documents: "పత్రాలు", your_docs: "మీ జోడింపులు", step: "దశ", of: "/", ask_ai: "AIని అడగండి", next: "తదుపరి దశ", finish: "ముగించు", completed: "సిద్ధం!", success_msg: "మీరు అన్ని దశలను సమీక్షించారు. ఆల్ ది బెస్ట్!", review: "మళ్ళీ చూడండి", listen: "సారాంశం వినండి", playing: "వినిపిస్తోంది...", read_step: "దశ వినండి" },
  "ta-IN": { action_plan: "செயல் திட்டம்", documents: "ஆவணங்கள்", your_docs: "உங்கள் இணைப்புகள்", step: "படி", of: "/", ask_ai: "AI-இடம் கேளுங்கள்", next: "அடுத்த படி", finish: "முடி", completed: "தயார்!", success_msg: "வாழ்த்துக்கள்!", review: "மீண்டும் பார்க்க", listen: "சுருக்கத்தைக் கேளுங்கள்", playing: "ஒலிக்கிறது...", read_step: "படியை வாசிக்க" },
  "kn-IN": { action_plan: "ಕ್ರಿಯಾ ಯೋಜನೆ", documents: "ದಾಖಲೆಗಳು", your_docs: "ನಿಮ್ಮ ಲಗತ್ತುಗಳು", step: "ಹಂತ", of: "/", ask_ai: "AI ಅನ್ನು ಕೇಳಿ", next: "ಮುಂದಿನ ಹಂತ", finish: "ಮುಕ್ತಾಯ", completed: "ಸಿದ್ಧವಾಗಿದೆ!", success_msg: "ಶುಭವಾಗಲಿ!", review: "ಮತ್ತೊಮ್ಮೆ ನೋಡಿ", listen: "ಸಾರಾಂಶವನ್ನು ಕೇಳಿ", playing: "ಪ್ಲೇ ಆಗುತ್ತಿದೆ...", read_step: "ಹಂತವನ್ನು ಓದಿ" },
  "ml-IN": { action_plan: "പ്രവർത്തന പദ്ധതി", documents: "രേഖകൾ", your_docs: "നിങ്ങളുടെ അറ്റാച്ച്‌മെന്റുകൾ", step: "ഘട്ടം", of: "/", ask_ai: "AI-യോട് ചോദിക്കൂ", next: "അടുത്ത ഘട്ടം", finish: "പൂർത്തിയാക്കുക", completed: "എല്ലാം ശരിയായി!", success_msg: "ആശംസകൾ!", review: "വീണ്ടും പരിശോധിക്കുക", listen: "സംഗ്രഹം കേൾക്കൂ", playing: "പ്ലേ ചെയ്യുന്നു...", read_step: "ഘട്ടം വായിക്കുക" },
  // ... (Other languages same pattern) ...
};

const ActionDashboard = ({ data, isPlaying, onToggleAudio, onSpeakStep, selectedLangCode, userDocs }) => {
  if (!data) return null;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // CHAT STATE

  const labels = DASHBOARD_LABELS[selectedLangCode] || DASHBOARD_LABELS["en-IN"];

  useEffect(() => {
    if (data && data.steps.length > 0) {
      setActiveIndex(0);
      setIsCompleted(false);
    }
  }, [data]);

  const activeStep = data.steps[activeIndex];
  const progress = ((activeIndex + 1) / data.steps.length) * 100;

  const handleNext = () => {
    if (activeIndex < data.steps.length - 1) {
      setActiveIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
      setIsCompleted(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-6 pb-20 animate-fade-in relative">
      
      {/* === LEFT PANEL === */}
      <div className="w-full md:w-1/3 space-y-4">
        
        {/* Audio Player */}
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleAudio();
          }}
          className={`w-full cursor-pointer p-4 rounded-xl shadow-lg text-white flex items-center justify-between transition-all active:scale-95 ${
            isPlaying ? 'bg-gradient-to-r from-orange-600 to-red-600 scale-[1.02]' : 'bg-gradient-to-r from-orange-500 to-orange-400'
          }`}
        >
          <div className="text-left">
            <p className="text-orange-100 text-[10px] font-bold uppercase tracking-wider">Bharat Seva AI</p>
            <p className="text-sm font-bold opacity-90">
              {isPlaying ? labels.playing : labels.listen}
            </p>
          </div>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md text-orange-600">
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </div>
        </button>

        {/* Steps List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h4 className="font-bold text-gray-800 flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500"/> {labels.action_plan}
            </h4>
            <span className="text-xs font-semibold text-gray-400">
              {activeIndex + 1}/{data.steps.length}
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {data.steps.map((step, i) => (
              <button
                key={i}
                onClick={() => { setActiveIndex(i); setIsCompleted(false); }}
                className={`w-full p-4 text-left transition-all hover:bg-orange-50 flex gap-3 ${
                  i === activeIndex ? 'bg-orange-50 ring-1 ring-inset ring-orange-200' : ''
                }`}
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border-2 transition-colors ${
                   i === activeIndex ? 'bg-orange-500 border-orange-500 text-white' : 
                   i < activeIndex ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-gray-500'
                }`}>
                  {i < activeIndex ? <CheckSquare size={12}/> : i + 1}
                </div>
                <p className={`text-sm font-medium ${i === activeIndex ? 'text-orange-800' : 'text-gray-600'}`}>
                  {step.text}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Documents & Attachments */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
             {/* Required Docs */}
             <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                    <FileText size={12}/> {labels.documents}
                </h4>
                <div className="flex flex-wrap gap-2">
                    {data.required_documents.map((doc, i) => (
                    <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100">
                        {doc}
                    </span>
                    ))}
                </div>
             </div>

             {/* User Attachments (NEW SECTION) */}
             {userDocs && userDocs.length > 0 && (
                 <div className="pt-3 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                        <Paperclip size={12}/> {labels.your_docs || "Your Attachments"}
                    </h4>
                    <div className="flex flex-col gap-1">
                        {userDocs.map((doc, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs bg-gray-50 text-gray-700 px-2 py-1.5 rounded border border-gray-200">
                            <FileText size={12} className="text-orange-500"/>
                            <span className="truncate max-w-[150px]">{doc.name}</span>
                        </div>
                        ))}
                    </div>
                 </div>
             )}
        </div>
      </div>

      {/* === RIGHT PANEL: FOCUS MODE === */}
      <div className="w-full md:w-2/3">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 h-full flex flex-col overflow-hidden relative min-h-[500px]">
          
          <div className="h-1.5 w-full bg-gray-100">
            <motion.div 
              className="h-full bg-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="flex-grow p-8 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {isCompleted ? (
                <motion.div 
                  key="completed"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center flex flex-col items-center justify-center h-full"
                >
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <CheckCircle size={48} />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">{labels.completed}</h2>
                  <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg">{labels.success_msg}</p>
                  <button 
                    onClick={() => { setActiveIndex(0); setIsCompleted(false); }}
                    className="text-orange-600 font-semibold hover:bg-orange-50 px-6 py-2 rounded-full transition-colors"
                  >
                    {labels.review}
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key={activeStep.text}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col h-full"
                >
                  <div className="mb-6 flex justify-between items-start">
                    <div>
                      <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full mb-4 tracking-wide uppercase">
                        {labels.step} {activeIndex + 1} {labels.of} {data.steps.length}
                      </span>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight">
                        {activeStep.text}
                      </h2>
                    </div>
                    <button
                      onClick={() => onSpeakStep(activeStep.text + ". " + activeStep.detailed_explanation)}
                      className="p-3 bg-orange-50 text-orange-600 rounded-full hover:bg-orange-100 transition-colors shadow-sm"
                      title={labels.read_step}
                    >
                      <Volume2 size={24} />
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8 flex-grow">
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {activeStep.detailed_explanation}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center mt-auto">
                     <button 
                       className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-xl font-semibold hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
                       onClick={() => setIsChatOpen(true)} // OPEN CHAT
                     >
                        <MessageCircle size={18} />
                        <span className="hidden sm:inline">{labels.ask_ai}</span>
                     </button>
                     
                     <div className="flex-grow hidden sm:block"></div>

                     <div className="flex gap-3 w-full sm:w-auto">
                       <button 
                         onClick={handlePrev}
                         disabled={activeIndex === 0}
                         className={`flex-1 sm:flex-none p-3 rounded-xl border border-gray-200 flex items-center justify-center transition-all ${
                           activeIndex === 0 ? 'text-gray-300 cursor-not-allowed bg-gray-50' : 'text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                         }`}
                       >
                         <ArrowLeft size={20} />
                       </button>

                       <button 
                          onClick={handleNext}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 active:scale-95 transition-all shadow-lg"
                       >
                          {activeIndex === data.steps.length - 1 ? labels.finish : labels.next}
                          <ArrowRight size={18} />
                       </button>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* CHAT ASSISTANT DRAWER */}
      <ChatAssistant 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        activeStep={activeStep}
        language={selectedLangCode}
        userDocs={userDocs}
      />

    </div>
  );
};

export default ActionDashboard;