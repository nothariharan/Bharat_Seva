import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, FileText, CheckCircle, MessageCircle, ArrowRight, ArrowLeft, CheckSquare, Volume2, Paperclip, Share2, X, Loader2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatAssistant from './ChatAssistant';

// --- IMPORTS FOR PDF GENERATION ---
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Essential: Bind the fonts to pdfMake
if (pdfFonts && pdfFonts.pdfMake) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
} else if (pdfFonts) {
    pdfMake.vfs = pdfFonts.vfs;
}

// --- UI TRANSLATIONS FOR DASHBOARD ---
const DASHBOARD_LABELS = {
  "en-IN": { action_plan: "Action Plan", documents: "Documents", your_docs: "Your Attachments", step: "STEP", of: "OF", ask_ai: "Ask AI", next: "Next Step", finish: "Finish", completed: "You're all set!", success_msg: "You have reviewed all the steps. Good luck!", review: "Review Again", listen: "Listen to Summary", playing: "Playing Summary...", read_step: "Read Step", whatsapp: "WhatsApp", send: "Send Now", download: "Download PDF", instructions: "Instructions", required_docs: "Required Docs" },
  "hi-IN": { action_plan: "कार्य योजना", documents: "दस्तावेज़", your_docs: "आपके संलग्नक", step: "चरण", of: "का", ask_ai: "AI से पूछें", next: "अगला चरण", finish: "समाप्त", completed: "प्रक्रिया पूरी हुई!", success_msg: "आपने सभी चरणों की समीक्षा कर ली है। शुभकामनाएँ!", review: "पुनः देखें", listen: "सारांश सुनें", playing: "सुना रहा हूँ...", read_step: "चरण सुनें", whatsapp: "व्हाट्सएप", send: "भेजें", download: "पीडीएफ डाउनलोड", instructions: "निर्देश", required_docs: "आवश्यक दस्तावेज" },
  "te-IN": { action_plan: "కార్యాచరణ ప్రణాళిక", documents: "పత్రాలు", your_docs: "మీ జోడింపులు", step: "దశ", of: "/", ask_ai: "AIని అడగండి", next: "తదుపరి దశ", finish: "ముగించు", completed: "సిద్ధం!", success_msg: "మీరు అన్ని దశలను సమీక్షించారు. ఆల్ ది బెస్ట్!", review: "మళ్ళీ చూడండి", listen: "సారాంశం వినండి", playing: "వినిపిస్తోంది...", read_step: "దశ వినండి", whatsapp: "వాట్సాప్", send: "పంపండి", download: "PDF డౌన్‌లోడ్", instructions: "సూచనలు", required_docs: "అవసరమైన పత్రాలు" },
  "ta-IN": { action_plan: "செயல் திட்டம்", documents: "ஆவணங்கள்", your_docs: "உங்கள் இணைப்புகள்", step: "படி", of: "/", ask_ai: "AI-இடம் கேளுங்கள்", next: "அடுத்த படி", finish: "முடி", completed: "தயார்!", success_msg: "வாழ்த்துக்கள்!", review: "மீண்டும் பார்க்க", listen: "சுருக்கத்தைக் கேளுங்கள்", playing: "ஒலிக்கிறது...", read_step: "படியை வாசிக்க", whatsapp: "வாட்ஸ்அப்", send: "அனுப்பு", download: "PDF பதிவிறக்கம்", instructions: "வழிமுறைகள்", required_docs: "தேவையான ஆவணங்கள்" },
  "kn-IN": { action_plan: "ಕ್ರಿಯಾ ಯೋಜನೆ", documents: "ದಾಖಲೆಗಳು", your_docs: "ನಿಮ್ಮ ಲಗತ್ತುಗಳು", step: "ಹಂತ", of: "/", ask_ai: "AI ಅನ್ನು ಕೇಳಿ", next: "ಮುಂದಿನ ಹಂತ", finish: "ಮುಕ್ತಾಯ", completed: "ಸಿದ್ಧವಾಗಿದೆ!", success_msg: "ಶುಭವಾಗಲಿ!", review: "ಮತ್ತೊಮ್ಮೆ ನೋಡಿ", listen: "ಸಾರಾಂಶವನ್ನು ಕೇಳಿ", playing: "ಪ್ಲೇ ಆಗುತ್ತಿದೆ...", read_step: "ಹಂತವನ್ನು ಓದಿ", whatsapp: "ವಾಟ್ಸಾಪ್", send: "ಕಳುಹಿಸಿ", download: "PDF ಡೌನ್‌ಲೋಡ್", instructions: "ಸೂಚನೆಗಳು", required_docs: "ಅಗತ್ಯ ದಾಖಲೆಗಳು" },
  "ml-IN": { action_plan: "പ്രവർത്തന പദ്ധതി", documents: "രേഖകൾ", your_docs: "നിങ്ങളുടെ അറ്റാച്ച്‌മെന്റുകൾ", step: "ഘട്ടം", of: "/", ask_ai: "AI-യോട് ചോദിക്കൂ", next: "അടുത്ത ഘട്ടം", finish: "പൂർത്തിയാക്കുക", completed: "എല്ലാം ശരിയായി!", success_msg: "ആശംസകൾ!", review: "വീണ്ടും പരിശോധിക്കുക", listen: "സംഗ്രഹം കേൾക്കൂ", playing: "പ്ലേ ചെയ്യുന്നു...", read_step: "ഘട്ടം വായിക്കുക", whatsapp: "വാട്ട്‌സ്ആപ്പ്", send: "അയക്കൂ", download: "PDF ഡൗൺലോഡ്", instructions: "നിർദ്ദേശങ്ങൾ", required_docs: "ആവശ്യമായ രേഖകൾ" },
  "bn-IN": { action_plan: "কর্ম পরিকল্পনা", documents: "নথি", your_docs: "আপনার সংযুক্তি", step: "ধাপ", of: "/", ask_ai: "AI জিজ্ঞাসা", next: "পরবর্তী ধাপ", finish: "শেষ", completed: "প্রস্তুত!", success_msg: "শুভকামনা!", review: "আবার দেখুন", listen: "সারাংশ শুনুন", playing: "শোনাচ্ছি...", read_step: "ধাপ পড়ুন", whatsapp: "হোয়াটসঅ্যাপ", send: "পাঠান", download: "PDF ডাউনলোড", instructions: "নির্দেশাবলী", required_docs: "প্রয়োজনীয় নথি" },
  "mr-IN": { action_plan: "कृती योजना", documents: "कागदपत्रे", your_docs: "तुमचे संलग्नक", step: "चरण", of: "/", ask_ai: "AI ला विचारा", next: "पुढचे पाऊल", finish: "समाप्त", completed: "तयार!", success_msg: "शुभेच्छा!", review: "पुन्हा पहा", listen: "सारांश ऐका", playing: "ऐकवत आहे...", read_step: "चरण वाचा", whatsapp: "व्हॉट्सअ‍ॅप", send: "पाठवा", download: "PDF डाउनलोड", instructions: "सूचना", required_docs: "आवश्यक कागदपत्रे" },
  "gu-IN": { action_plan: "કાર્ય યોજના", documents: "દસ્તાવેજો", your_docs: "તમારા જોડાણો", step: "પગલું", of: "/", ask_ai: "AI ને પૂછો", next: "આગળનું પગલું", finish: "સમાપ્ત", completed: "તૈયાર!", success_msg: "શુભેચ્છા!", review: "ફરી જુઓ", listen: "સારાંશ સાંભળો", playing: "વાગી રહ્યું છે...", read_step: "પગલું વાંચો", whatsapp: "વોટ્સએપ", send: "મોકલો", download: "PDF ડાઉનલોડ", instructions: "સૂચનાઓ", required_docs: "જરૂરી દસ્તાવેજો" },
  "pa-IN": { action_plan: "ਕਾਰਵਾਈ ਯੋਜਨਾ", documents: "ਦਸਤਾਵੇਜ਼", your_docs: "ਤੁਹਾਡੇ ਅਟੈਚਮੈਂਟ", step: "ਕਦਮ", of: "/", ask_ai: "AI ਪੁੱਛੋ", next: "ਅਗਲਾ ਕਦਮ", finish: "ਖਤਮ", completed: "ਤਿਆਰ!", success_msg: "ਸ਼ੁਭਕਾਮਨਾਵਾਂ!", review: "ਦੁਬਾਰਾ ਵੇਖੋ", listen: "ਸਾਰਾਂਸ਼ ਸੁਣੋ", playing: "ਚੱਲ ਰਿਹਾ ਹੈ...", read_step: "ਕਦਮ ਪੜ੍ਹੋ", whatsapp: "ਵਟਸਐਪ", send: "ਭੇਜੋ", download: "PDF ਡਾਊਨਲੋਡ", instructions: "ਹਦਾਇਤਾਂ", required_docs: "ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼" },
  "or-IN": { action_plan: "କାର୍ଯ୍ୟ ଯୋଜନା", documents: "ଦଲିଲ୍", your_docs: "ଆପଣଙ୍କର ସଂଲଗ୍ନକ", step: "ପଦକ୍ଷେପ", of: "/", ask_ai: "AI ପଚାରନ୍ତୁ", next: "ପରବର୍ତ୍ତୀ", finish: "ସମାପ୍ତ", completed: "ପ୍ରସ୍ତୁତ!", success_msg: "ଶୁଭେଚ୍ଛା!", review: "ପୁନଃ ଦେଖନ୍ତୁ", listen: "ସାରାଂଶ ଶୁଣନ୍ତୁ", playing: "ଚାଲୁଅଛି...", read_step: "ପଦକ୍ଷେପ ପଢନ୍ତୁ", whatsapp: "ହ୍ୱାଟ୍ସଆପ୍", send: "ପଠାନ୍ତୁ", download: "PDF ଡାଉନଲୋଡ୍", instructions: "ନିର୍ଦ୍ଦେଶାବଳୀ", required_docs: "ଆବଶ୍ୟକ ଦସ୍ତାବିଜ" },
  "ur-IN": { action_plan: "لائحہ عمل", documents: "دستاویزات", your_docs: "آپ کے منسلکات", step: "مرحلہ", of: "کا", ask_ai: "AI پوچھیں", next: "اگلا مرحلہ", finish: "ختم", completed: "تیار!", success_msg: "گڈ لک!", review: "دوبارہ دیکھیں", listen: "خلاصہ سنیں", playing: "چل رہا ہے...", read_step: "مرحلہ پڑھیں", whatsapp: "واٹس ایپ", send: "بھیجیں", download: "PDF ڈاؤن لوڈ", instructions: "ہدایات", required_docs: "مطلوبہ دستاویزات" }
};

const ActionDashboard = ({ data, isPlaying, onToggleAudio, onSpeakStep, selectedLangCode, userDocs }) => {
  if (!data) return null;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // WhatsApp Modal State
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [sendingWA, setSendingWA] = useState(false);
  
  const dashboardRef = useRef(null);

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
    if (activeIndex < data.steps.length - 1) setActiveIndex(prev => prev + 1);
    else setIsCompleted(true);
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
      setIsCompleted(false);
    }
  };

  // --- PDF DOWNLOAD HANDLER (Kept as requested) ---
  const handleDownloadPDF = () => {
    const content = [];

    // Header
    content.push({ text: 'BharatSeva Action Plan', style: 'header', alignment: 'center', margin: [0, 0, 0, 20] });
    content.push({ text: labels.action_plan, style: 'title', color: '#f97316', margin: [0, 0, 0, 10] });

    // Required Documents Section
    content.push({ text: labels.required_docs + ':', style: 'sectionHeader', margin: [0, 10, 0, 5] });
    const docList = data.required_documents.map(doc => ({ text: `• ${doc}`, style: 'listItem', margin: [10, 2, 0, 2] }));
    content.push(...docList);

    // User Documents
    if (userDocs && userDocs.length > 0) {
      content.push({ text: labels.your_docs + ':', style: 'sectionHeader', margin: [0, 10, 0, 5] });
      const userDocList = userDocs.map(doc => ({ text: `• ${doc.name}`, style: 'listItem', margin: [10, 2, 0, 2] }));
      content.push(...userDocList);
    }

    // Divider
    content.push({ canvas: [{ type: 'line', x1: 0, y1: 10, x2: 515, y2: 10, lineWidth: 1, lineColor: '#e5e7eb' }], margin: [0, 10, 0, 15] });

    // Steps
    data.steps.forEach((step, index) => {
      content.push({
        columns: [
          {
            width: 25,
            stack: [
              { canvas: [{ type: 'ellipse', x: 12, y: 8, r1: 10, r2: 10, color: '#f97316' }] },
              { text: (index + 1).toString(), absolutePosition: { x: 8, y: undefined }, color: '#ffffff', fontSize: 10, bold: true, margin: [-4, -14, 0, 0] }
            ]
          },
          {
            width: '*',
            stack: [
              { text: `${labels.step} ${index + 1}: ${step.text}`, style: 'stepTitle', margin: [0, -2, 0, 5] },
              { text: step.detailed_explanation, style: 'stepContent', margin: [0, 0, 0, 15] }
            ]
          }
        ],
        margin: [0, 5, 0, 0]
      });
    });

    // Footer
    const timestamp = new Date().toLocaleString(selectedLangCode, { dateStyle: 'medium', timeStyle: 'short' });
    content.push({
      text: [
        { text: `Generated on ${timestamp}`, fontSize: 8, color: '#9ca3af' },
        { text: '\n' },
        { text: 'Powered by BharatSeva AI', fontSize: 8, color: '#9ca3af', alignment: 'right' }
      ],
      margin: [0, 20, 0, 0]
    });

    const docDefinition = {
      content: content,
      styles: {
        header: { fontSize: 22, bold: true, color: '#ffffff', background: '#f97316', fillColor: '#f97316' },
        title: { fontSize: 18, bold: true },
        sectionHeader: { fontSize: 13, bold: true, color: '#000000' },
        listItem: { fontSize: 11, color: '#4b5563' },
        stepTitle: { fontSize: 14, bold: true, color: '#1f2937' },
        stepContent: { fontSize: 11, color: '#374151', lineHeight: 1.4 }
      },
      defaultStyle: { font: 'Roboto' },
      pageMargins: [40, 60, 40, 40],
      background: function(currentPage, pageSize) {
        return currentPage === 1 ? { canvas: [{ type: 'rect', x: 0, y: 0, w: pageSize.width, h: 50, color: '#f97316' }] } : null;
      }
    };

    const langName = selectedLangCode.split('-')[0];
    pdfMake.createPdf(docDefinition).download(`BharatSeva_Plan_${langName}_${Date.now()}.pdf`);
  };

  // --- WHATSAPP SEND HANDLER ---
  const handleSendWhatsApp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      alert("Please enter a valid phone number");
      return;
    }
    setSendingWA(true);
    
    const message = `*${labels.action_plan}*\n\n*${labels.step} ${activeIndex + 1}:* ${activeStep.text}\n\n*${labels.instructions}:*\n${activeStep.detailed_explanation}\n\n*${labels.required_docs}:*\n${data.required_documents.join(', ')}`;

    try {
      const res = await fetch('http://localhost:3000/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: `+91${phoneNumber}`,
          message: message
        })
      });
      
      const result = await res.json();
      if (result.success) {
        alert("Message sent! (Check sandbox)");
        setShowWhatsApp(false);
      } else {
        alert("Failed. Ensure you joined the Twilio Sandbox.");
      }
    } catch (err) {
      console.error(err);
      alert("Server connection failed.");
    }
    setSendingWA(false);
  };

  return (
    <div ref={dashboardRef} className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-6 pb-20 animate-fade-in relative bg-white">
      
      {/* === LEFT PANEL === */}
      <div className="w-full md:w-1/3 space-y-4">
        
        {/* Audio Player */}
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleAudio(); }}
          className={`w-full cursor-pointer p-4 rounded-xl shadow-lg text-white flex items-center justify-between transition-all active:scale-95 ${isPlaying ? 'bg-gradient-to-r from-orange-600 to-red-600 scale-[1.02]' : 'bg-gradient-to-r from-orange-500 to-orange-400'}`}
        >
          <div className="text-left">
            <p className="text-orange-100 text-[10px] font-bold uppercase tracking-wider">Bharat Seva AI</p>
            <p className="text-sm font-bold opacity-90">{isPlaying ? labels.playing : labels.listen}</p>
          </div>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md text-orange-600">
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </div>
        </button>

        {/* Steps List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h4 className="font-bold text-gray-800 flex items-center gap-2"><CheckCircle size={18} className="text-green-500"/> {labels.action_plan}</h4>
            <span className="text-xs font-semibold text-gray-400">{activeIndex + 1}/{data.steps.length}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {data.steps.map((step, i) => (
              <button key={i} onClick={() => { setActiveIndex(i); setIsCompleted(false); }} className={`w-full p-4 text-left transition-all hover:bg-orange-50 flex gap-3 ${i === activeIndex ? 'bg-orange-50 ring-1 ring-inset ring-orange-200' : ''}`}>
                <div className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border-2 transition-colors ${i === activeIndex ? 'bg-orange-500 border-orange-500 text-white' : i < activeIndex ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-gray-500'}`}>
                  {i < activeIndex ? <CheckSquare size={12}/> : i + 1}
                </div>
                <p className={`text-sm font-medium ${i === activeIndex ? 'text-orange-800' : 'text-gray-600'}`}>{step.text}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Documents Panel */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
             <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><FileText size={12}/> {labels.documents}</h4>
                <div className="flex flex-wrap gap-2">
                    {data.required_documents.map((doc, i) => (
                    <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100">{doc}</span>
                    ))}
                </div>
             </div>
             {userDocs && userDocs.length > 0 && (
                 <div className="pt-3 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><Paperclip size={12}/> {labels.your_docs}</h4>
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
            <motion.div className="h-full bg-orange-500" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
          </div>

          <div className="flex-grow p-8 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {isCompleted ? (
                <motion.div key="completed" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center flex flex-col items-center justify-center h-full">
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm"><CheckCircle size={48} /></div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">{labels.completed}</h2>
                  <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg">{labels.success_msg}</p>
                  <button onClick={() => { setActiveIndex(0); setIsCompleted(false); }} className="text-orange-600 font-semibold hover:bg-orange-50 px-6 py-2 rounded-full transition-colors">{labels.review}</button>
                </motion.div>
              ) : (
                <motion.div key={activeStep.text} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="flex flex-col h-full">
                  <div className="mb-6 flex justify-between items-start">
                    <div>
                      <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full mb-4 tracking-wide uppercase">{labels.step} {activeIndex + 1} {labels.of} {data.steps.length}</span>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight">{activeStep.text}</h2>
                    </div>
                    
                    {/* TOP ACTIONS: SPEAK & DOWNLOAD */}
                    <div className="flex gap-2">
                      <button onClick={handleDownloadPDF} className="p-3 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 transition-colors shadow-sm" title={labels.download}>
                        <Download size={20} />
                      </button>
                      <button onClick={() => onSpeakStep(activeStep.text + ". " + activeStep.detailed_explanation)} className="p-3 bg-orange-50 text-orange-600 rounded-full hover:bg-orange-100 transition-colors shadow-sm" title={labels.read_step}>
                        <Volume2 size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8 flex-grow">
                    <p className="text-gray-700 text-lg leading-relaxed">{activeStep.detailed_explanation}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center mt-auto">
                     {/* ASK AI */}
                     <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-xl font-semibold hover:bg-gray-50 active:scale-95 transition-all shadow-sm" onClick={() => setIsChatOpen(true)}>
                        <MessageCircle size={18} />
                        <span className="hidden sm:inline">{labels.ask_ai}</span>
                     </button>

                     {/* WHATSAPP */}
                     <button className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 text-green-700 px-5 py-3 rounded-xl font-semibold hover:bg-green-100 active:scale-95 transition-all shadow-sm" onClick={() => setShowWhatsApp(true)}>
                        <Share2 size={18} />
                        <span className="hidden sm:inline">{labels.whatsapp}</span>
                     </button>
                     
                     <div className="flex-grow hidden sm:block"></div>

                     {/* NAV */}
                     <div className="flex gap-3 w-full sm:w-auto">
                       <button onClick={handlePrev} disabled={activeIndex === 0} className={`flex-1 sm:flex-none p-3 rounded-xl border border-gray-200 flex items-center justify-center transition-all ${activeIndex === 0 ? 'text-gray-300 cursor-not-allowed bg-gray-50' : 'text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}>
                         <ArrowLeft size={20} />
                       </button>
                       <button onClick={handleNext} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 active:scale-95 transition-all shadow-lg">
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

      {/* CHAT DRAWER */}
      <ChatAssistant isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} activeStep={activeStep} language={selectedLangCode} userDocs={userDocs} />

      {/* WHATSAPP MODAL */}
      <AnimatePresence>
        {showWhatsApp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
              <button onClick={() => setShowWhatsApp(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600"><Share2 size={24} /></div>
                <h3 className="text-xl font-bold text-gray-800">{labels.whatsapp}</h3>
                <p className="text-sm text-gray-500 mt-1">Receive this step on your phone.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Mobile Number</label>
                  <div className="flex gap-2">
                    <span className="p-3 bg-gray-100 rounded-xl text-gray-500 font-medium">+91</span>
                    <input type="number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="9876543210" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-100 font-medium" autoFocus />
                  </div>
                </div>
                <button onClick={handleSendWhatsApp} disabled={sendingWA} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                  {sendingWA ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : <><Share2 size={18} /> {labels.send}</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ActionDashboard;