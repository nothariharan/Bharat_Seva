import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, CheckCircle, Expand, Camera } from 'lucide-react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { endpoints } from '../config/api';

const formFields = [
    { id: "name", label: { "en-IN": "Full Name", "hi-IN": "पूरा नाम" }, x: 150, y: 120, w: 200, h: 25 },
    { id: "dob", label: { "en-IN": "Date of Birth", "hi-IN": "जन्म तिथि" }, x: 150, y: 160, w: 200, h: 25 },
    { id: "address", label: { "en-IN": "Address", "hi-IN": "पता" }, x: 150, y: 200, w: 300, h: 25 },
    { id: "idNumber", label: { "en-IN": "Aadhaar / ID No.", "hi-IN": "आधार नंबर" }, x: 150, y: 240, w: 200, h: 25 }
];

const mockQuestions = [
    { fieldId: "name", q: { "en-IN": "What is your full name?", "hi-IN": "आपका पूरा नाम क्या है?" } },
    { fieldId: "dob", q: { "en-IN": "What is your Date of Birth?", "hi-IN": "आपकी जन्म तिथि क्या है?" } },
    { fieldId: "address", q: { "en-IN": "Where do you live?", "hi-IN": "आपका पूरा पता क्या है?" } },
    { fieldId: "idNumber", q: { "en-IN": "What is your Aadhaar number?", "hi-IN": "आपका आधार नंबर क्या है?" } }
];

const SmartFormAssistant = ({ language, onComplete }) => {
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isRecording, setIsRecording] = useState(false);
    const [mode, setMode] = useState('scan'); // 'scan', 'camera', 'scanning', 'qa', 'done'
    const webcamRef = useRef(null);

    const speak = (text) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language.code;
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        if (mode === 'scan') {
            speak(language.code === "en-IN" ? "Do you have your Aadhaar card? We can scan it." : "क्या आपके पास आधार कार्ड है? हम उसे स्कैन कर सकते हैं।");
        } else if (mode === 'qa' && currentQIndex < mockQuestions.length) {
            speak(mockQuestions[currentQIndex].q[language.code] || mockQuestions[currentQIndex].q["hi-IN"]);
        } else if (mode === 'done') {
            speak(language.code === "en-IN" ? "Your form is complete." : "आपका फॉर्म तैयार है।");
        }
    }, [mode, currentQIndex, language]);

    const handleMicTap = () => {
        setIsRecording(true);
        setTimeout(() => {
            setIsRecording(false);
            const fieldId = mockQuestions[currentQIndex].fieldId;
            setAnswers(prev => ({ ...prev, [fieldId]: "Sample Answer " + fieldId }));

            if (currentQIndex < mockQuestions.length - 1) {
                setCurrentQIndex(prev => prev + 1);
            } else {
                setMode('done');
            }
        }, 2000);
    };

    const handleSkipScan = () => {
        setMode('qa');
    };

    const captureDocument = useCallback(async () => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        setMode('scanning');
        try {
            const res = await axios.post(endpoints.scanDocument, {
                imageBase64: imageSrc,
                expectedDocumentType: 'aadhaar',
                language: language.code.split('-')[0] // 'hi' or 'en'
            });

            if (res.data.isCorrectDocument) {
                const ext = res.data.extractedFields || {};
                const newAnswers = { ...answers };
                let lastFilledIndex = -1;

                if (ext.name) { newAnswers.name = ext.name; lastFilledIndex = Math.max(lastFilledIndex, 0); }
                if (ext.dob) { newAnswers.dob = ext.dob; lastFilledIndex = Math.max(lastFilledIndex, 1); }
                if (ext.address) { newAnswers.address = ext.address; lastFilledIndex = Math.max(lastFilledIndex, 2); }
                if (ext.uid_last4) { newAnswers.idNumber = "XXXX-XXXX-" + ext.uid_last4; lastFilledIndex = Math.max(lastFilledIndex, 3); }

                setAnswers(newAnswers);
                setCurrentQIndex(lastFilledIndex + 1);

                if (lastFilledIndex === 3) {
                    setMode('done');
                } else {
                    setMode('qa');
                }
            } else {
                alert(res.data.rejectionMessage || "Could not read document. Please try again or skip.");
                setMode('scan');
            }
        } catch (error) {
            console.error("Scan Error:", error);
            alert("Error analyzing document. Proceeding to voice Q&A.");
            setMode('qa');
        }
    }, [webcamRef, answers, language]);

    // UI Translation
    const t = {
        scanMsg: language.code === "en-IN" ? "Scan document to auto-fill 80% of form" : "आधार स्कैन करें 80% फॉर्म अपने आप भरेगा",
        scanBtn: language.code === "en-IN" ? "Scan Now" : "अभी स्कैन करें",
        skipBtn: language.code === "en-IN" ? "Skip Scanning" : "सीधा शुरू करें",
        qOf: language.code === "en-IN" ? "Q" : "सवााल",
        doneBtn: language.code === "en-IN" ? "Proceed to Sign" : "आगे बढ़ें"
    };

    return (
        <div className="flex flex-col md:flex-row h-[80vh] w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">

            {/* LEFT: PDF Form Preview */}
            <div className="w-full md:w-1/2 bg-gray-100 p-4 border-r border-gray-200 relative overflow-y-auto min-h-[50vh]">
                <div className="w-full max-w-sm mx-auto bg-white h-[600px] shadow-sm flex flex-col items-center justify-start p-8 relative">
                    <h2 className="text-xl font-bold uppercase border-b-2 border-black pb-2 mb-8 text-black">Government Form</h2>

                    <div className="w-full relative h-full">
                        {formFields.map(f => {
                            const qIdx = mockQuestions.findIndex(mq => mq.fieldId === f.id);
                            const isActive = mode === 'qa' && qIdx === currentQIndex;
                            const isFilled = answers[f.id] !== undefined;

                            return (
                                <div
                                    key={f.id}
                                    className={`absolute flex items-center p-1 rounded transition-colors duration-300 ${isActive ? 'ring-2 ring-orange-500 bg-orange-50' : isFilled ? 'bg-green-50/50' : ''}`}
                                    style={{ top: f.y, left: f.x - 100, width: "100%" }}
                                >
                                    <label className="text-xs font-bold w-24 shrink-0 text-black">{f.label[language.code] || f.label["hi-IN"]}:</label>
                                    <div className={`flex-1 border-b ${isActive ? 'border-orange-500' : 'border-gray-400'} min-h-[20px] px-2 text-sm text-blue-900 font-medium`}>
                                        {answers[f.id]}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* RIGHT: Assistant Flow */}
            <div className="w-full md:w-1/2 bg-white flex flex-col">
                {mode === 'scan' ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                        <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shadow-lg mb-6">
                            <Expand size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">{t.scanMsg}</h3>
                        <div className="space-y-4 mt-8 w-full max-w-xs">
                            <button onClick={() => setMode('camera')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all text-lg flex items-center justify-center gap-2">
                                <Camera size={24} />
                                {t.scanBtn}
                            </button>
                            <button onClick={handleSkipScan} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-xl active:scale-95 transition-all">
                                {t.skipBtn}
                            </button>
                        </div>
                    </div>
                ) : mode === 'camera' ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-black relative">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode: "environment" }}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 border-[40px] border-black/50 pointer-events-none">
                            <div className="w-full h-full border-2 border-dashed border-white/70"></div>
                        </div>
                        <div className="absolute bottom-10 w-full flex justify-center gap-4">
                            <button
                                onClick={captureDocument}
                                className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-gray-300 active:scale-95 transition-transform"
                            >
                                <Camera size={24} className="text-gray-900" />
                            </button>
                        </div>
                        <button onClick={() => setMode('scan')} className="absolute top-4 right-4 bg-white/20 p-2 rounded-full text-white">
                            X
                        </button>
                    </div>
                ) : mode === 'scanning' ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-800">
                        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <h3 className="text-2xl font-bold animate-pulse">Scanning Document...</h3>
                        <p className="text-gray-500 mt-2">Extracting data via AI</p>
                    </div>
                ) : mode === 'qa' ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in relative">
                        <div className="absolute top-8 left-8">
                            <span className="bg-orange-100 text-orange-800 text-sm font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                                {t.qOf} {currentQIndex + 1} / {mockQuestions.length}
                            </span>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 mt-12 leading-tight">
                            {mockQuestions[currentQIndex].q[language.code] || mockQuestions[currentQIndex].q["hi-IN"]}
                        </h2>

                        <button
                            onMouseDown={handleMicTap}
                            onMouseUp={() => setIsRecording(false)}
                            onTouchStart={handleMicTap}
                            onTouchEnd={() => setIsRecording(false)}
                            className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-orange-500 scale-95 shadow-inner' : 'bg-orange-100 hover:bg-orange-200 shadow-xl'}`}
                        >
                            <Mic size={48} className={isRecording ? 'text-white' : 'text-orange-600'} />
                            {isRecording && <span className="absolute w-32 h-32 rounded-full border-4 border-orange-500 animate-ping opacity-50"></span>}
                        </button>
                        <p className="mt-6 text-gray-500 font-medium">
                            {isRecording ? "Listening..." : "Hold to speak"}
                        </p>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                        <CheckCircle size={80} className="text-green-500 mb-6" />
                        <h2 className="text-3xl font-bold text-gray-800 mb-8">Form Complete!</h2>
                        <button onClick={() => onComplete(answers)} className="bg-orange-600 text-white py-4 px-8 rounded-xl font-bold shadow-xl hover:bg-orange-700 active:scale-95 text-xl">
                            {t.doneBtn}
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
};

export default SmartFormAssistant;
