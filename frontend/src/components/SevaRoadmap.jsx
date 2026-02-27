import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, MapPin, FileEdit, ChevronDown, ChevronUp } from 'lucide-react';

const SevaRoadmap = ({ steps, language, onFormStepClick, onLocationStepClick }) => {
    const [expandedStepId, setExpandedStepId] = useState(null);

    useEffect(() => {
        // Auto-play summary or first step could be added here
    }, []);

    const toggleStep = (id) => {
        if (expandedStepId === id) setExpandedStepId(null);
        else setExpandedStepId(id);
    };

    const getStatusIcon = (status) => {
        if (status === 'complete') return <CheckCircle className="text-green-500 w-6 h-6 z-10 bg-white rounded-full" />;
        if (status === 'in_progress') return <span className="w-4 h-4 rounded-full bg-orange-500 animate-pulse z-10 border-2 border-white"></span>;
        return <Circle className="text-gray-300 w-6 h-6 z-10 bg-white rounded-full" />;
    };

    const labels = {
        "en-IN": { fill: "Fill Form Now", loc: "Show Nearest Office" },
        "hi-IN": { fill: "अब फॉर्म भरें", loc: "नज़दीकी कार्यालय दिखाएं" }
    };
    const t = labels[language] || labels["hi-IN"];

    return (
        <div className="w-full max-w-5xl mx-auto py-6">
            <div className="relative pl-6">
                {/* Vertical timeline line */}
                <div className="absolute left-9 top-6 bottom-6 w-px bg-gray-200"></div>

                {steps.map((step, index) => {
                    const isExpanded = expandedStepId === step.id;

                    return (
                        <div key={step.id} className="relative mb-6">
                            <div
                                className={`flex gap-4 cursor-pointer p-4 rounded-xl border transition-all duration-300 ${isExpanded ? 'bg-orange-50/50 border-orange-200 shadow-md' : 'bg-white border-transparent hover:border-gray-100 hover:shadow-sm'}`}
                                onClick={() => toggleStep(step.id)}
                            >
                                <div className="flex flex-col items-center mt-1">
                                    {getStatusIcon(step.status)}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <h4 className={`text-lg font-bold ${step.status === 'complete' ? 'text-gray-400' : 'text-gray-800'}`}>
                                            {step.title}
                                        </h4>
                                        {isExpanded ? <ChevronUp className="text-gray-400" size={20} /> : <ChevronDown className="text-gray-400" size={20} />}
                                    </div>

                                    <p className={`text-sm mt-1 ${step.status === 'complete' ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {step.description}
                                    </p>

                                    {/* Expanded Content */}
                                    <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                                        {step.breakdown && step.breakdown.length > 0 && (
                                            <ul className="mb-4 bg-white p-4 rounded-lg border border-gray-100 space-y-2">
                                                {step.breakdown.map((item, idx) => (
                                                    <li key={idx} className="text-sm font-medium text-gray-700 flex gap-2 items-start">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0"></span>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {step.type === 'form' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onFormStepClick(step.id); }}
                                                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                                            >
                                                <FileEdit size={18} />
                                                {t.fill}
                                            </button>
                                        )}

                                        {step.type === 'location' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onLocationStepClick(step.id); }}
                                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                                            >
                                                <MapPin size={18} />
                                                {t.loc}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SevaRoadmap;
