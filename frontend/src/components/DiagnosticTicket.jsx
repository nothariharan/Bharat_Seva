import React, { useState, useEffect } from 'react';
import { AlertCircle, Info, Building2, Search, Target } from 'lucide-react';

const DiagnosticTicket = ({ analysis, language }) => {
    if (!analysis) return null;

    const { detectedIssue, rootCause, department, bottleneckLevel, severityColor } = analysis;

    const colorStyles = {
        red: "bg-red-50 text-red-800 border-red-200",
        amber: "bg-amber-50 text-amber-800 border-amber-200",
        green: "bg-green-50 text-green-800 border-green-200"
    };

    const badgeStyles = {
        red: "bg-red-100 text-red-700",
        amber: "bg-amber-100 text-amber-700",
        green: "bg-green-100 text-green-700"
    };

    const dotStyles = {
        red: "bg-red-500",
        amber: "bg-amber-500",
        green: "bg-green-500"
    };

    // Pulse animation class based on severity
    const pulseClass = severityColor !== 'green' ? 'animate-pulse' : '';

    // Minimal translation for labels
    const labels = {
        "en-IN": { issue: "Issue Diagnosed", dept: "Department", cause: "Root Cause", bottleneck: "Bottleneck" },
        "hi-IN": { issue: "समस्या पहचानी गई", dept: "विभाग", cause: "मूल कारण", bottleneck: "कहाँ अटका है" },
        // Simplified for prototype, defaults to Hindi if not English
    };

    const t = labels[language] || labels["hi-IN"];

    return (
        <div className={`w-full max-w-5xl mx-auto rounded-xl border-l-4 shadow-sm mb-6 ${colorStyles[severityColor] || colorStyles.amber} transition-opacity duration-300`}>
            <div className="p-4 border-b border-white/20 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2">
                    {severityColor === 'red' ? <AlertCircle size={18} /> : <Info size={18} />} {t.issue}
                </h3>
                <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${badgeStyles[severityColor] || badgeStyles.amber}`}>
                    {detectedIssue}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/20 text-sm">
                <div className="p-4">
                    <p className="opacity-70 font-semibold mb-1 text-xs uppercase tracking-wide flex items-center gap-1"><Building2 size={14} /> {t.dept}</p>
                    <p className="font-semibold">{department}</p>
                </div>
                <div className="p-4">
                    <p className="opacity-70 font-semibold mb-1 text-xs uppercase tracking-wide flex items-center gap-1"><Search size={14} /> {t.cause}</p>
                    <p className="font-medium">{rootCause}</p>
                </div>
                <div className="p-4">
                    <p className="opacity-70 font-semibold mb-1 text-xs uppercase tracking-wide flex items-center gap-1"><Target size={14} /> {t.bottleneck}</p>
                    <p className="font-medium flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${dotStyles[severityColor] || dotStyles.amber} ${pulseClass}`}></span>
                        {bottleneckLevel}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DiagnosticTicket;
