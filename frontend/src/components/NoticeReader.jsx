import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { X, Camera, Volume2, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { endpoints } from '../config/api';

const NoticeReader = ({ language, onClose, onGuideMe }) => {
    const webcamRef = useRef(null);
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImage(imageSrc);
        processImage(imageSrc);
    }, [webcamRef]);

    const processImage = async (base64) => {
        setLoading(true);
        try {
            const res = await axios.post(endpoints.readNotice, {
                imageBase64: base64,
                language: language.name
            });
            setResult(res.data);
            speak(res.data.simplifiedSummary);
        } catch (error) {
            console.error(error);
            alert("Failed to read notice.");
            setImage(null);
        }
        setLoading(false);
    };

    const speak = (text) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language.code;
        window.speechSynthesis.speak(utterance);
    };

    const videoConstraints = {
        facingMode: "environment"
    };

    return (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col">
            <div className="flex justify-between items-center p-4 bg-black/50 absolute top-0 w-full z-10">
                <h2 className="text-white font-bold">Bharat Seva Lens</h2>
                <button onClick={onClose} className="text-white bg-white/20 p-2 rounded-full">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 relative bg-black flex flex-col justify-center">
                {!image ? (
                    <>
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                            className="w-full h-full object-cover"
                        />
                        {/* Viewfinder overlay */}
                        <div className="absolute inset-0 border-[40px] border-black/50 pointer-events-none">
                            <div className="w-full h-full border-2 border-dashed border-white/70"></div>
                        </div>

                        <div className="absolute bottom-10 w-full flex justify-center">
                            <button
                                onClick={capture}
                                className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-gray-300 active:scale-95 transition-transform"
                            >
                                <Camera size={24} className="text-gray-900" />
                            </button>
                        </div>
                    </>
                ) : loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-white">
                        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="font-bold text-lg animate-pulse">Padh raha hoon...</p>
                    </div>
                ) : result ? (
                    <div className="bg-white m-4 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[80%]">
                        <div className="bg-orange-50 p-4 border-b border-orange-100 flex justify-between items-center">
                            <h3 className="font-bold text-orange-800">Patr Ka Matlab (Summary)</h3>
                            <button onClick={() => speak(result.simplifiedSummary)} className="p-2 bg-orange-200 text-orange-700 rounded-full">
                                <Volume2 size={20} />
                            </button>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto align-middle flex items-center">
                            <p className="text-2xl font-medium text-gray-800 leading-relaxed text-center w-full">
                                {result.simplifiedSummary}
                            </p>
                        </div>

                        {result.actionRequired && (
                            <div className="p-6 bg-red-50 border-t border-red-100">
                                <p className="font-bold text-red-800 mb-2">Kya Karna Hai? (Action Required)</p>
                                <p className="text-red-600 mb-4">You need to complete: {result.actionType} within {result.deadline}.</p>
                                <button
                                    onClick={() => { onClose(); onGuideMe(result.actionType); }}
                                    className="w-full bg-red-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-700"
                                >
                                    <ArrowRight size={20} />
                                    Aage Ki Madad Chahiye? (Guide Me)
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => { setImage(null); setResult(null); }}
                            className="m-4 mt-0 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold active:bg-gray-200"
                        >
                            Scan Another
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default NoticeReader;
