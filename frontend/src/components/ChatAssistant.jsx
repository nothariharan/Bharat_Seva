import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Mic, Bot, Paperclip, Loader2, FileText } from 'lucide-react'; // Removed Trash2 unused import
import { motion, AnimatePresence } from 'framer-motion';

const ChatAssistant = ({ isOpen, onClose, activeStep, language, userDocs }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [localAttachments, setLocalAttachments] = useState([]); 
  
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null); 

  // --- AUTO SCROLL ---
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  // --- INITIAL GREETING ---
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const docCount = (userDocs?.length || 0) + localAttachments.length;
      setMessages([{
        role: 'bot',
        text: `Namaste! I am ready to help you with "${activeStep?.text}". \n\nI see ${docCount} documents attached. What specific doubt do you have?`
      }]);
    }
  }, [isOpen, activeStep, userDocs, localAttachments]);

  // --- FILE HANDLING ---
  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      setLocalAttachments(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  // --- REAL SPEECH RECOGNITION ---
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice input is not supported in this browser. Try Chrome/Edge.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = language || 'en-IN'; // Dynamic Language
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + " " + transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech Error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => setIsRecording(false);

    recognition.start();
  };

  // --- SEND MESSAGE ---
  const handleSend = async () => {
    if (!input.trim() && localAttachments.length === 0) return;

    const userMsg = { role: 'user', text: input, attachments: localAttachments };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLocalAttachments([]); 
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/chat-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMsg.text,
          currentStep: activeStep?.text,
          language: language, 
          context: messages.slice(-3) 
        })
      });
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.answer }]);

    } catch (err) {
      console.error(err);
      setTimeout(() => {
        setMessages(prev => [...prev, { 
            role: 'bot', 
            text: `(Offline Mode) I can't reach the server right now, but I understood your query in ${language}. Please ensure backend is running.` 
        }]);
        setLoading(false);
      }, 1000);
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[450px] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-100"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-orange-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                    <Bot size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800">Bharat Sahayak</h3>
                    <p className="text-xs text-gray-500">Contextual AI Assistant</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50/20">
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-gray-900 text-white rounded-tr-none' 
                      : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex gap-1 mt-1 justify-end">
                      {msg.attachments.map((file, idx) => (
                        <span key={idx} className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Paperclip size={8} /> {file.name.substring(0, 8)}...
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                    <Loader2 size={18} className="animate-spin text-orange-500"/>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100 bg-white">
              
              {/* Attachments Preview */}
              {(localAttachments.length > 0 || (userDocs && userDocs.length > 0)) && (
                <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
                   {userDocs && userDocs.map((doc, i) => (
                      <div key={`global-${i}`} className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded text-xs text-orange-700 border border-orange-100 whitespace-nowrap">
                          <FileText size={10} /> {doc.name.substring(0, 10)}...
                      </div>
                   ))}
                   {localAttachments.map((doc, i) => (
                      <div key={`local-${i}`} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 border border-gray-200 whitespace-nowrap">
                          <FileText size={10} /> {doc.name.substring(0, 10)}...
                          <button onClick={() => setLocalAttachments(prev => prev.filter((_, idx) => idx !== i))}><X size={10}/></button>
                      </div>
                   ))}
                </div>
              )}

              {/* Input Controls - Fixed Alignment */}
              <div className="flex items-end gap-2">
                <input 
                  type="file" 
                  multiple 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileSelect}
                />
                
                {/* Clip Button */}
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="p-3 bg-gray-50 rounded-xl text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-colors border border-gray-200 flex-shrink-0"
                  style={{ height: '46px', width: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Paperclip size={20} />
                </button>

                {/* Text Area */}
                <div className="flex-grow relative">
                    <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if(e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder={`Ask in ${language?.split('-')[0] || 'English'}...`}
                        className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-100 border border-gray-200 resize-none leading-relaxed"
                        style={{ minHeight: '46px', maxHeight: '100px', height: '46px' }} 
                    />
                </div>
                
                {/* Send / Mic Button */}
                {input.trim() || localAttachments.length > 0 ? (
                    <button 
                      onClick={handleSend}
                      className="p-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors shadow-lg active:scale-95 flex-shrink-0"
                      style={{ height: '46px', width: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Send size={20} />
                    </button>
                ) : (
                    <button 
                      onClick={startListening}
                      className={`p-3 rounded-xl transition-colors shadow-lg active:scale-95 flex-shrink-0 ${
                        isRecording 
                          ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-100' 
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                      style={{ height: '46px', width: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Mic size={20} />
                    </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatAssistant;