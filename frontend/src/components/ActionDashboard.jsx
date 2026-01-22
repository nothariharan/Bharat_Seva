import React, { useState, useEffect } from 'react';
import { Play, Pause, MapPin, FileText, CheckCircle, ExternalLink, MessageCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ActionDashboard = ({ data, isPlaying, onToggleAudio }) => {
  if (!data) return null;

  // State to track which step is currently active (for the Right Panel)
  const [activeStep, setActiveStep] = useState(data.steps[0]);

  // Ensure activeStep resets if data changes (e.g. new search)
  useEffect(() => {
    if (data && data.steps.length > 0) {
      setActiveStep(data.steps[0]);
    }
  }, [data]);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-6 pb-20 animate-fade-in">
      
      {/* === LEFT PANEL: THE CHECKLIST (35%) === */}
      <div className="w-full md:w-1/3 space-y-4">
        
        {/* 1. Audio Player */}
        <div 
          onClick={onToggleAudio} // Make whole card clickable for easier interaction
          className={`cursor-pointer p-4 rounded-xl shadow-lg text-white flex items-center justify-between transition-all ${
            isPlaying ? 'bg-gradient-to-r from-orange-600 to-red-600 scale-[1.02]' : 'bg-gradient-to-r from-orange-500 to-orange-400'
          }`}
        >
          <div>
            <p className="text-orange-100 text-[10px] font-bold uppercase tracking-wider">AI Assistant</p>
            <p className="text-sm font-bold opacity-90">
              {isPlaying ? "Playing Summary..." : "Listen to Summary"}
            </p>
          </div>
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform">
            {isPlaying ? (
              <Pause size={18} className="text-orange-600 fill-current" />
            ) : (
              <Play size={18} className="text-orange-600 fill-current ml-0.5" />
            )}
          </button>
        </div>

        {/* 2. Steps List (Clickable) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h4 className="font-bold text-gray-800 flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500"/> Action Plan
            </h4>
          </div>
          
          <div className="divide-y divide-gray-50">
            {data.steps.map((step, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(step)}
                className={`w-full p-4 text-left transition-all hover:bg-orange-50 flex gap-3 ${
                  activeStep.text === step.text ? 'bg-orange-50 ring-1 ring-inset ring-orange-200' : ''
                }`}
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border-2 transition-colors ${
                   activeStep.text === step.text ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-gray-200 text-gray-500'
                }`}>
                  {i + 1}
                </div>
                <div>
                  <p className={`text-sm font-medium ${activeStep.text === step.text ? 'text-orange-800' : 'text-gray-600'}`}>
                    {step.text}
                  </p>
                </div>
                {activeStep.text === step.text && <ArrowRight size={16} className="text-orange-500 ml-auto self-center" />}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Documents & Location */}
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
             <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><FileText size={12}/> Documents</h4>
             <div className="flex flex-wrap gap-2">
                {data.required_documents.map((doc, i) => (
                  <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100">
                    {doc}
                  </span>
                ))}
             </div>
          </div>
        </div>

      </div>

      {/* === RIGHT PANEL: THE VISUAL GUIDE (65%) === */}
      <div className="w-full md:w-2/3">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeStep.text}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full flex flex-col"
          >
            {/* AI Generated Image Card */}
            <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 mb-4 h-64 md:h-80 relative overflow-hidden group">
              <img 
                // FIX: Added &seed=${i} to ensure every step gets a UNIQUE image
                // FIX: Added fallback text if image_prompt is missing
                src={`https://image.pollinations.ai/prompt/${encodeURIComponent(
                  activeStep.image_prompt || `Indian government office paperwork step ${activeStep.text}`
                )}?width=800&height=600&nologo=true&seed=${data.steps.findIndex(s => s === activeStep) + 100}`} 
                
                alt="AI Generated Guide"
                className="w-full h-full object-cover rounded-xl transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl flex items-end p-6">
                 <p className="text-white font-medium text-lg drop-shadow-md">
                   Visual Guide: Step {data.steps.findIndex(s => s === activeStep) + 1}
                 </p>
              </div>
            </div>

            {/* Detailed Explanation */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-grow relative">
              <h3 className="text-xl font-bold text-gray-800 mb-3">{activeStep.text}</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {activeStep.detailed_explanation}
              </p>

              {/* "Ask AI" Contextual Button */}
              <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                <p className="text-sm text-gray-400">Need more help with this step?</p>
                <button 
                  onClick={() => alert("Chatbot Integration coming in Phase 2!")}
                  className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full font-medium hover:bg-gray-800 transition-colors shadow-lg active:scale-95"
                >
                  <MessageCircle size={18} />
                  Chat Assistant
                </button>
              </div>
            </div>

          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
};

export default ActionDashboard;