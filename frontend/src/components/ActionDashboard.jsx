import React, { useState } from 'react';
import axios from 'axios';
import { Volume2, VolumeX, ArrowLeft, Download, MessageCircle, MessageSquare } from 'lucide-react';
import DiagnosticTicket from './DiagnosticTicket';
import SevaRoadmap from './SevaRoadmap';
import SmartFormAssistant from './SmartFormAssistant';
import VoiceSignature from './VoiceSignature';
import LastMileCard from './LastMileCard';
import ChatSidebar from './ChatSidebar';
import { endpoints } from '../config/api';

const ActionDashboard = ({ response, language, onNewSearch }) => {
  const [view, setView] = useState('main'); // 'main', 'form', 'signature'
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeStepId, setActiveStepId] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = (text) => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    if (!text) return;

    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleExportTXT = () => {
    setIsExporting(true);
    let content = `Bharat Seva - Action Plan\n=========================\n\n`;
    content += `Summary:\n${response.summary_speech || response.audioSummary}\n\n`;

    if (response.problemAnalysis) {
      content += `Diagnosis:\n`;
      content += `- Issue: ${response.problemAnalysis.detectedIssue}\n`;
      content += `- Cause: ${response.problemAnalysis.rootCause}\n`;
      content += `- Department: ${response.problemAnalysis.department}\n\n`;
    }

    content += `Steps to Resolution:\n`;
    response.steps.forEach((step, idx) => {
      content += `${idx + 1}. ${step.title}\n   ${step.description}\n`;
      if (step.breakdown && step.breakdown.length > 0) {
        step.breakdown.forEach(b => content += `     * ${b}\n`);
      }
      content += `\n`;
    });

    if (response.requiredDocuments && response.requiredDocuments.length > 0) {
      content += `Required Documents:\n`;
      response.requiredDocuments.forEach(doc => {
        content += `- ${doc.name} (${doc.isRequired ? 'Required' : 'Optional'})\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Bharat_Seva_Plan.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsExporting(false);
  };

  const handleFormClick = (stepId) => {
    setActiveStepId(stepId);
    setView('form');
  };

  const handleLocationClick = async (stepId) => {
    // Mock fetching location data
    try {
      const res = await axios.post(endpoints.geoRoute, { lat: 28.61, lng: 77.2, officeType: "bdo" });
      setLocationData(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch location");
    }
  };

  const handleFormComplete = (answers) => {
    console.log("Form answers:", answers);
    setView('signature');
  };

  const handleSignatureComplete = (qrCodeData) => {
    console.log("Signature uploaded. QR:", qrCodeData);
    // Mark step as complete in UI (Simplified for prototype)
    if (activeStepId) {
      const step = response.steps.find(s => s.id === activeStepId);
      if (step) step.status = 'complete';
    }
    setView('main');
  };

  const handleExportWhatsApp = async () => {
    setIsExporting(true);
    try {
      let message = response.audioSummary + "\n\nSteps:\n";
      response.steps.forEach(s => { message += "- " + s.title + "\n"; });

      const res = await axios.post(endpoints.sendWhatsapp, {
        phoneNumber: "+919999999999", // Mock number
        message: message
      });
      alert(`Sent to WhatsApp with sid: ${res.data.sid}`);
    } catch (err) {
      console.error(err);
      alert("WhatsApp export failed");
    }
    setIsExporting(false);
  };

  const t = {
    title: language === "en-IN" ? "Action Plan" : "कार्य योजना",
    newSearch: language === "en-IN" ? "New Search" : "नया सवाल",
    summaryTitle: language === "en-IN" ? "Summary (Listen)" : "सारांश (सुनें)",
    docsRequired: language === "en-IN" ? "Documents Needed" : "ज़रूरी दस्तावेज़"
  };

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center pt-6 px-4 pb-20 fade-in"
      style={{
        backgroundColor: '#E0F7FA', // Light cyan background
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%2300BCD4' fill-opacity='0.05'%3E%3Cpath d='M40 0C40 22.0914 22.0914 40 0 40C22.0914 40 40 57.9086 40 80C40 57.9086 57.9086 40 80 40C57.9086 40 40 22.0914 40 0ZM40 20C40 31.0457 31.0457 40 20 40C31.0457 40 40 48.9543 40 60C40 48.9543 48.9543 40 60 40C48.9543 40 40 31.0457 40 20Z'/%3E%3C/g%3E%3C/svg%3E")`
      }}
    >

      {/* Top Navigation */}
      <div className="w-full max-w-5xl mb-6 flex justify-between items-center bg-white/90 backdrop-blur p-4 rounded-xl shadow-sm border border-orange-100 z-10">
        <button
          onClick={view === 'main' ? onNewSearch : () => setView('main')}
          className="flex items-center gap-2 text-gray-700 hover:text-orange-600 font-bold transition-colors"
        >
          <ArrowLeft size={20} />
          {view === 'main' ? t.newSearch : 'Back'}
        </button>
        <h1
          className="text-2xl md:text-3xl font-normal text-center select-none"
          style={{
            fontFamily: 'Samarkan',
            backgroundImage: 'linear-gradient(to right, #DAA520, #FFD700, #DAA520)',
            backgroundSize: '200% auto',
            color: '#DAA520',
            WebkitBackgroundClip: 'text',
            textShadow: '0px 1px 2px rgba(0,0,0,0.1)'
          }}
        >
          Bharat Seva
        </h1>
        <div className="w-20"></div> {/* Spacer for centering */}
      </div>

      {view === 'main' && (
        <div className="w-full max-w-5xl flex flex-col gap-6">

          {/* Diagnostic Ticket (If Intent is ACTION or grievance-like, backend provides problemAnalysis) */}
          {response.problemAnalysis && (
            <DiagnosticTicket analysis={response.problemAnalysis} language={language} />
          )}

          {/* Audio Summary Card */}
          <div className="bg-white/95 backdrop-blur p-6 rounded-xl border border-orange-100 shadow-sm flex items-start gap-4 z-10">
            <button
              onClick={() => speak(response.summary_speech || response.audioSummary)}
              className={`p-4 rounded-full shrink-0 shadow-inner transition-colors ${isPlaying ? 'bg-orange-500 text-white animate-pulse' : 'bg-orange-100 text-orange-600 hover:bg-orange-200'}`}
            >
              {isPlaying ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{t.summaryTitle}</h3>
              <p className="text-lg text-gray-800 font-medium leading-relaxed">{response.summary_speech || response.audioSummary}</p>
            </div>
          </div>

          {/* Seva Roadmap (Steps) */}
          <div className="bg-white/95 backdrop-blur p-6 rounded-xl border border-gray-100 shadow-sm mt-2 z-10 seva-roadmap">
            <h3 className="text-2xl font-extrabold text-gray-900 mb-6">{t.title}</h3>
            <SevaRoadmap
              steps={response.steps}
              language={language}
              onFormStepClick={handleFormClick}
              onLocationStepClick={handleLocationClick}
            />
          </div>

          {/* Location Data Overlay (if fetched) */}
          {locationData && (
            <div className="w-full max-w-5xl mx-auto mt-2">
              <LastMileCard officeData={locationData} language={language} />
            </div>
          )}

          {/* Required Documents Component */}
          {response.requiredDocuments && response.requiredDocuments.length > 0 && (
            <div className="bg-white/95 backdrop-blur p-6 rounded-xl border border-gray-100 shadow-sm mt-2 z-10">
              <h3 className="text-lg font-bold text-gray-800 mb-4">{t.docsRequired}</h3>
              <ul className="space-y-3">
                {response.requiredDocuments.map((doc, i) => (
                  <li key={i} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded max-w-[80px] text-center shrink-0">
                      {doc.isRequired ? "REQUIRED" : "OPTIONAL"}
                    </span>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Export / Share Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6 z-10 export-toolbar">
            <button
              onClick={handleExportTXT}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 bg-white/90 backdrop-blur border-2 border-orange-600 text-orange-600 font-bold py-3 px-8 rounded-xl hover:bg-orange-50 transition-colors shadow-sm disabled:opacity-50"
            >
              <Download size={20} />
              Save Document (TXT)
            </button>
            <button
              onClick={handleExportWhatsApp}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-wait"
            >
              <MessageCircle size={20} />
              Send to WhatsApp
            </button>
          </div>

        </div>
      )}

      {view === 'form' && (
        <div className="w-full max-w-6xl mt-4">
          <SmartFormAssistant language={{ code: language }} onComplete={handleFormComplete} />
        </div>
      )}

      {view === 'signature' && (
        <div className="w-full max-w-2xl mt-12 mx-auto">
          <VoiceSignature language={{ code: language }} onComplete={handleSignatureComplete} />
        </div>
      )}

      {/* Floating Ask AI Button */}
      {view === 'main' && (
        <button
          className="floating-chat-button fixed bottom-6 left-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-xl flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95"
          onClick={() => setIsChatOpen(true)}
        >
          <MessageSquare size={24} />
          <span className="font-bold hidden md:inline">Ask AI</span>
        </button>
      )}

      {/* Chat Sidebar */}
      <ChatSidebar
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentStep={response.steps?.find(s => s.id === activeStepId) || response.steps?.[0]}
        actionPlan={response}
        language={language}
      />

    </div>
  );
};

export default ActionDashboard;