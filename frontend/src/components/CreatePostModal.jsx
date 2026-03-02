import React, { useState, useRef } from 'react';
import { X, Send, AlertCircle, Info, Mic, Square, Loader2, Sparkles, User, MapPin, Tag } from 'lucide-react';
import axios from 'axios';

const CreatePostModal = ({ isOpen, onClose, currentUser, onPostCreated, selectedLang }) => {
    const [content, setContent] = useState('');
    const [topic, setTopic] = useState('General');
    const [state, setState] = useState('All India');
    const [loading, setLoading] = useState(false);
    const [recording, setRecording] = useState(false);
    const [transcribing, setTranscribing] = useState(false);
    const [error, setError] = useState(null);

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    const topics = ['General', 'Legal Aid', 'Agriculture', 'Healthcare', 'Education', 'Social Welfare'];
    const states = ['All India', 'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Bihar', 'West Bengal'];

    const labels = {
        "en-IN": {
            title: "Share Civic Wisdom",
            placeholder: "What would you like to share with the community?",
            topic: "Select Topic",
            state: "Select State",
            submit: "Post Wisdom",
            cancel: "Cancel",
            anonymous: "Anonymous Citizen",
            identity: "Posting as",
            moderationNote: "All posts are moderated by AI to ensure safety and helpfulness.",
            voiceToPost: "Voice-to-Post",
            recordingLabel: "Recording...",
            stopLabel: "Stop & Transcribe",
            transcribingLabel: "AI is transcribing...",
            useVoice: "Record your story instead of writing"
        },
        "hi-IN": {
            title: "नागरिक ज्ञान साझा करें",
            placeholder: "आप समुदाय के साथ क्या साझा करना चाहेंगे?",
            topic: "विषय चुनें",
            state: "राज्य चुनें",
            submit: "पोस्ट करें",
            cancel: "रद्द करें",
            anonymous: "अनाम नागरिक",
            identity: "के रूप में पोस्ट",
            moderationNote: "सुरक्षा और सहायता सुनिश्चित करने के लिए सभी पोस्ट एआई द्वारा संचालित होते हैं।",
            voiceToPost: "वॉइस-टू-पोस्ट",
            recordingLabel: "रिकॉर्डिंग...",
            stopLabel: "रुकें और ट्रांसक्राइब करें",
            transcribingLabel: "एआई ट्रांसक्राइब कर रहा है...",
            useVoice: "लिखने के बजाय अपनी कहानी रिकॉर्ड करें"
        }
    };

    const t = labels[selectedLang?.code] || labels["hi-IN"];

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                await handleTranscribe(audioBlob);
            };

            mediaRecorderRef.current.start();
            setRecording(true);
            setError(null);
        } catch (err) {
            console.error("Recording error:", err);
            setError("Mic access denied or error starting recording.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            setRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleTranscribe = async (audioBlob) => {
        setTranscribing(true);
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob);
            formData.append('language', selectedLang?.code || 'en-IN');

            const res = await axios.post('http://localhost:3000/api/social/posts/transcribe', formData);
            if (res.data.text) {
                setContent(prev => prev ? prev + ' ' + res.data.text : res.data.text);
            }
        } catch (err) {
            setError("Failed to transcribe audio. Please try typing.");
        } finally {
            setTranscribing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const postData = {
                authorName: currentUser?.name || 'Citizen',
                authorType: currentUser ? 'Operator' : 'Citizen',
                content,
                state,
                topic
            };

            await axios.post('http://localhost:3000/api/social/posts', postData);
            setContent('');
            onPostCreated();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 md:p-10">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose}></div>

            <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-[2rem] sm:rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col md:flex-row border border-white/20">

                {/* Left Side: Identity & Context */}
                <div className="w-full md:w-[35%] bg-gray-50/80 p-6 sm:p-8 md:p-10 border-r border-gray-100 flex flex-col justify-between overflow-y-auto">
                    <div className="mb-8">
                        <div className="p-4 bg-white inline-flex rounded-3xl shadow-sm border border-orange-100 mb-6 group hover:scale-110 transition-transform duration-300">
                            <Sparkles className="text-orange-500" size={36} />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-3">
                            {t.title}
                        </h2>
                        <p className="text-gray-500 font-bold text-xs uppercase tracking-wider leading-relaxed opacity-80">
                            {t.moderationNote}
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 group">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                                <User size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.identity}</p>
                                <p className="font-bold text-gray-800">{currentUser?.name || t.anonymous}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 flex items-center gap-1">
                                    <Tag size={12} className="text-orange-500" /> {t.topic}
                                </label>
                                <select
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    className="w-full p-4 bg-white border border-gray-100 rounded-2xl font-bold text-gray-700 outline-none focus:ring-4 focus:ring-orange-100 transition-all cursor-pointer hover:border-orange-200"
                                >
                                    {topics.map(tp => <option key={tp} value={tp}>{tp}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 flex items-center gap-1">
                                    <MapPin size={12} className="text-orange-500" /> {t.state}
                                </label>
                                <select
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    className="w-full p-4 bg-white border border-gray-100 rounded-2xl font-bold text-gray-700 outline-none focus:ring-4 focus:ring-orange-100 transition-all cursor-pointer hover:border-orange-200"
                                >
                                    {states.map(st => <option key={st} value={st}>{st}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Editor */}
                <form onSubmit={handleSubmit} className="flex-1 p-6 sm:p-8 md:p-10 flex flex-col bg-white overflow-y-auto">
                    <div className="flex justify-end mb-4">
                        <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-gray-600 hover:rotate-90">
                            <X size={24} />
                        </button>
                    </div>

                    {error && (
                        <div className="flex items-start gap-3 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 mb-6 animate-in slide-in-from-top-2">
                            <AlertCircle className="shrink-0 mt-0.5" size={20} />
                            <p className="text-sm font-bold">{error}</p>
                        </div>
                    )}

                    <div className="flex-1 relative flex flex-col min-h-[250px] mb-6">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={t.placeholder}
                            required
                            className="flex-1 w-full p-6 sm:p-8 bg-gray-50/40 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-[2rem] outline-none transition-all font-medium text-lg sm:text-xl text-gray-800 placeholder:text-gray-300 resize-none shadow-inner"
                        ></textarea>

                        {/* Voice Controls Integration */}
                        <div className="absolute right-6 bottom-6 flex items-center gap-3">
                            {recording ? (
                                <button
                                    type="button"
                                    onClick={stopRecording}
                                    className="px-6 py-4 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-200 flex items-center gap-3 animate-pulse active:scale-95 transition-all"
                                >
                                    <Square size={20} fill="currentColor" />
                                    {t.stopLabel}
                                </button>
                            ) : transcribing ? (
                                <div className="px-6 py-4 bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-200 flex items-center gap-3 transition-all">
                                    <Loader2 size={24} className="animate-spin" />
                                    {t.transcribingLabel}
                                </div>
                            ) : (
                                <div className="group relative">
                                    <div className="absolute bottom-full right-0 mb-4 w-56 p-4 bg-gray-900 border border-white/10 text-white text-[11px] font-bold rounded-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none transform translate-y-2 group-hover:translate-y-0 shadow-2xl">
                                        <p className="leading-relaxed">{t.useVoice}</p>
                                        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-gray-900 rotate-45 border-r border-b border-white/10"></div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={startRecording}
                                        className="p-5 sm:p-6 bg-orange-500 hover:bg-orange-600 text-white rounded-3xl transition-all active:scale-90 shadow-2xl shadow-orange-200 group-hover:scale-110 relative"
                                    >
                                        <div className="absolute -inset-1 bg-orange-500/20 rounded-3xl animate-ping group-hover:hidden"></div>
                                        <Mic size={32} strokeWidth={2.5} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold rounded-2xl transition-all active:scale-95"
                        >
                            {t.cancel}
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !content.trim()}
                            className="flex-1 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 disabled:from-orange-300 disabled:to-orange-400 disabled:cursor-not-allowed text-white text-lg font-black rounded-2xl shadow-[0_20px_40px_-10px_rgba(249,115,22,0.4)] flex items-center justify-center gap-3 transition-all active:scale-95 hover:shadow-orange-300"
                        >
                            {loading ? (
                                <Loader2 className="w-8 h-8 animate-spin" />
                            ) : (
                                <>
                                    <Send size={24} />
                                    {t.submit}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePostModal;
