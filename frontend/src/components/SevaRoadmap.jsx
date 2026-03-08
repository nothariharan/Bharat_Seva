import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, MapPin, FileEdit, ChevronDown, ChevronUp } from 'lucide-react';

const SevaRoadmap = ({ steps, language, onFormStepClick, onLocationStepClick, audioMode, speakResponse, documentRequired }) => {
    const [expandedStepId, setExpandedStepId] = useState(null);
    const [journeyStarted, setJourneyStarted] = useState(false);
    const [localSteps, setLocalSteps] = useState(steps || []);

    useEffect(() => {
        const savedProgress = localStorage.getItem(`journey_${steps?.[0]?.id}`);
        if (savedProgress) {
            const parsed = JSON.parse(savedProgress);
            setLocalSteps(parsed.steps);
            setJourneyStarted(true);
        } else {
            setLocalSteps(steps || []);
        }
    }, [steps]);

    const handleStartJourney = () => {
        setJourneyStarted(true);
        const progress = {
            startTime: new Date().toISOString(),
            steps: localSteps.map((s) => ({ ...s, status: s.status === 'complete' ? 'complete' : 'pending' }))
        };
        localStorage.setItem(`journey_${steps?.[0]?.id}`, JSON.stringify(progress));

        if (audioMode) {
            speakResponse(language === 'hi-IN' ? 'Aapki yatra shuru ho gayi hai.' : 'Your journey has started.');
        }
    };

    const toggleStepStatus = (id) => {
        const newSteps = localSteps.map((s) => (s.id === id ? { ...s, status: s.status === 'complete' ? 'pending' : 'complete' } : s));
        setLocalSteps(newSteps);
        localStorage.setItem(`journey_${steps?.[0]?.id}`, JSON.stringify({ steps: newSteps }));
    };

    useEffect(() => {
        if (audioMode && steps && steps.length > 0) {
            const readSteps = async () => {
                speakResponse(language === 'hi-IN' ? 'Yeh aapki karya yojana ke charan hain.' : 'Here are the steps in your action plan.');
                await new Promise((r) => setTimeout(r, 1800));
                for (let i = 0; i < steps.length; i += 1) {
                    const step = steps[i];
                    const stepText = language === 'hi-IN'
                        ? `Charan ${i + 1}: ${step.title}. ${step.description}`
                        : `Step ${i + 1}: ${step.title}. ${step.description}`;
                    speakResponse(stepText);
                    setExpandedStepId(step.id);
                    await new Promise((r) => setTimeout(r, 4200));
                }
            };
            readSteps();
        }
    }, [audioMode, steps, language, speakResponse]);

    const toggleStep = (id) => {
        setExpandedStepId((prev) => (prev === id ? null : id));
    };

    const getStatusIcon = (status) => {
        if (status === 'complete') return <CheckCircle className="text-green-500 w-6 h-6 z-10 bg-white rounded-full" />;
        if (status === 'in_progress') return <span className="w-4 h-4 rounded-full bg-orange-500 animate-pulse z-10 border-2 border-white"></span>;
        return <Circle className="text-gray-300 w-6 h-6 z-10 bg-white rounded-full" />;
    };

    const labels = {
        'en-IN': { fill: 'Fill this Form Digitally', loc: 'Show Nearest Office', start: 'Start Seva Journey', tracking: 'Journey Progress' },
        'hi-IN': { fill: 'Is Form ko Digital Bharein', loc: 'Nazdeeki Karyalay Dikhayein', start: 'Seva Yatra Shuru Karein', tracking: 'Yatra Ki Pragati' }
    };
    const t = labels[language] || labels['en-IN'];

    return (
        <div className="w-full max-w-5xl mx-auto py-6">
            {!journeyStarted && (
                <div className="mb-8 p-6 bg-orange-50 border-2 border-orange-200 border-dashed rounded-3xl text-center">
                    <p className="text-orange-900 font-bold mb-4">
                        {language === 'hi-IN' ? 'Pragati track karne ke liye apni yatra shuru karein' : 'Start your journey to track progress'}
                    </p>
                    <button
                        onClick={handleStartJourney}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-black py-4 px-10 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-xl"
                    >
                        {t.start}
                    </button>
                </div>
            )}

            {journeyStarted && (
                <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <span className="font-black text-gray-800 uppercase tracking-widest text-sm">{t.tracking}</span>
                    <div className="flex gap-1">
                        {localSteps.map((s, i) => (
                            <div key={i} className={`w-3 h-3 rounded-full ${s.status === 'complete' ? 'bg-green-500' : 'bg-gray-200'}`} />
                        ))}
                    </div>
                </div>
            )}

            <div className="relative pl-6">
                <div className="absolute left-9 top-6 bottom-6 w-px bg-gray-200"></div>

                {localSteps.map((step) => {
                    const isExpanded = expandedStepId === step.id;
                    return (
                        <div key={step.id} className="relative mb-6">
                            <div
                                className={`flex gap-4 cursor-pointer p-4 rounded-xl border transition-all duration-300 ${isExpanded ? 'bg-orange-50/50 border-orange-200 shadow-md' : 'bg-white border-transparent hover:border-gray-100 hover:shadow-sm'}`}
                                onClick={() => toggleStep(step.id)}
                            >
                                <div className="flex flex-col items-center mt-1">
                                    {journeyStarted ? (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleStepStatus(step.id); }}
                                            className="z-10 bg-white rounded-full transition-transform hover:scale-110"
                                        >
                                            {getStatusIcon(step.status)}
                                        </button>
                                    ) : getStatusIcon(step.status)}
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
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onFormStepClick(
                                                        step.formId,
                                                        step.id,
                                                        step.fieldsNeeded || documentRequired?.fields_needed || [],
                                                        documentRequired?.name || null
                                                    );
                                                }}
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
