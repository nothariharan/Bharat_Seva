import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Mic, UploadCloud, CheckCircle, Loader2, PenLine } from 'lucide-react';
import { endpoints } from '../config/api';

const VoiceSignature = ({ language, onComplete }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [uploadState, setUploadState] = useState('idle'); // idle, uploading, done
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                setAudioBlob(audioBlob);
                handleUpload(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            alert("Microphone access denied or error occurred.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleUpload = async (blob) => {
        setUploadState('uploading');

        const formData = new FormData();
        formData.append('audio', blob, 'signature.wav');

        try {
            const res = await axios.post(endpoints.voiceSignature, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUploadState('done');
            onComplete(res.data.qrCodeData); // Pass QR back
        } catch (err) {
            console.error(err);
            alert("Upload failed. Attempting to proceed without voice signature.");
            setUploadState('done');
            onComplete(null);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center animate-fade-in border border-gray-100">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2"><PenLine size={28} className="text-orange-500" /> Confirm Your Application</h2>

            <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 mb-8 w-full max-w-md">
                <p className="text-sm font-bold text-orange-800 uppercase tracking-widest mb-2 opacity-70">Please say the following out loud:</p>
                <p className="text-xl md:text-2xl font-medium text-gray-900 leading-relaxed italic">
                    "Main confirm karta/karti hoon ki yeh sab jaankari sahi hai."
                </p>
            </div>

            <div className="w-full max-w-sm mb-6 flex flex-col items-center">
                {uploadState === 'idle' ? (
                    <button
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        onTouchStart={startRecording}
                        onTouchEnd={stopRecording}
                        className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${isRecording
                            ? 'bg-orange-500 scale-95 shadow-inner'
                            : 'bg-orange-100 hover:bg-orange-200 shadow-lg'
                            }`}
                    >
                        <Mic size={48} className={isRecording ? 'text-white' : 'text-orange-600'} />
                        {isRecording && (
                            <span className="absolute w-32 h-32 rounded-full border-4 border-orange-500 animate-ping opacity-50"></span>
                        )}
                    </button>
                ) : uploadState === 'uploading' ? (
                    <div className="flex flex-col items-center text-orange-600">
                        <Loader2 size={48} className="animate-spin mb-4" />
                        <p className="font-bold text-lg">Saving Signature...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-green-600">
                        <CheckCircle size={48} className="mb-4" />
                        <p className="font-bold text-lg">Signature Saved!</p>
                    </div>
                )}
            </div>

            <p className="text-gray-500 font-medium">
                {isRecording ? "Release to Send" : uploadState === 'idle' ? "Press and hold to record" : "Your voice is your signature."}
            </p>
        </div>
    );
};

export default VoiceSignature;
