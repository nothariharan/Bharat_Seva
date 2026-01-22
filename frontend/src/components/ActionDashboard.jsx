import React from 'react';
import { Play, Pause, MapPin, FileText, CheckCircle, ExternalLink } from 'lucide-react';

const ActionDashboard = ({ data, isPlaying, onToggleAudio }) => {
  if (!data) return null;

  return (
    <div className="w-full max-w-md space-y-4 animate-slide-up pb-20">
      
      {/* 1. Audio Player Card (The Primary Interaction) */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 p-5 rounded-2xl shadow-lg text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
        
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-orange-100 text-xs font-medium uppercase tracking-wider mb-1">AI Assistant</p>
            <h3 className="text-lg font-bold leading-tight">Here is what you need to do</h3>
          </div>
          <button 
            onClick={onToggleAudio}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform"
          >
            {isPlaying ? <Pause size={20} className="text-orange-600 fill-current" /> : <Play size={20} className="text-orange-600 fill-current ml-1" />}
          </button>
        </div>
        
        {/* Animated Waveform Bar (Visual decoration) */}
        {isPlaying && (
          <div className="flex gap-1 mt-4 h-4 items-end justify-center opacity-80">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="w-1 bg-white rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDuration: '0.5s' }}></div>
            ))}
          </div>
        )}
      </div>

      {/* 2. The Roadmap (Timeline) */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <CheckCircle size={18} className="text-green-500"/> Action Plan
        </h4>
        <div className="relative space-y-6 pl-2">
          {/* Vertical Line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
          
          {data.steps.map((step, i) => (
            <div key={i} className="relative flex gap-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 border-2 border-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center z-10">
                {i + 1}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed pt-0.5">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. The Backpack (Documents) */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <FileText size={18} className="text-blue-500"/> Required Documents
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {data.required_documents.map((doc, i) => (
            <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
              <span className="text-xs text-gray-700 font-medium">{doc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. The Location Card */}
      {data.authority_office && (
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-bold uppercase">Visit Office</p>
              <p className="text-sm font-semibold text-gray-800">{data.authority_office}</p>
            </div>
          </div>
          {/* Mock Navigation Button */}
          <button className="p-2 bg-white rounded-lg shadow-sm text-gray-500">
            <ExternalLink size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ActionDashboard;