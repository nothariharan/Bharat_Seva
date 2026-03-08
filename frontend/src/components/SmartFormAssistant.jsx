import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { Mic, FileText, Download, Loader2, CheckCircle2 } from 'lucide-react';
import { endpoints } from '../config/api';

const FIELD_LABELS = {
    voterName: { en: 'Voter Name', hi: 'Voter Name' },
    epicNumber: { en: 'EPIC Number', hi: 'EPIC Number' },
    aadhaarNumber: { en: 'Aadhaar Number', hi: 'Aadhaar Number' },
    mobile: { en: 'Mobile Number', hi: 'Mobile Number' },
    place: { en: 'Place', hi: 'Place' },
    date: { en: 'Date', hi: 'Date' },
    customerName: { en: 'Customer Name', hi: 'Customer Name' },
    accountNumber: { en: 'Account Number', hi: 'Account Number' },
    address: { en: 'Address', hi: 'Address' }
};

const NUMERIC_FIELDS = new Set(['accountNumber', 'mobile', 'aadhaarNumber']);

const normalizeLocaleDigits = (value = '') => value
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - 2406))
    .replace(/[௦-௯]/g, (d) => String(d.charCodeAt(0) - 3046));

const normalizeNumericAnswer = (raw = '') => {
    const text = normalizeLocaleDigits(String(raw).toLowerCase());
    const wordMap = {
        zero: '0', oh: '0', o: '0',
        one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9',
        ten: '10', eleven: '11', twelve: '12',
        ek: '1', do: '2', teen: '3', tin: '3', char: '4', chaar: '4', paanch: '5', panch: '5', chhe: '6', saat: '7', aath: '8', nau: '9',
        ஒன்று: '1', இரண்டு: '2', மூன்று: '3', நான்கு: '4', ஐந்து: '5', ஆறு: '6', ஏழு: '7', எட்டு: '8', ஒன்பது: '9', பூஜ்யம்: '0',
        onnu: '1', rendu: '2', moondru: '3', naangu: '4', aindhu: '5', aaru: '6', ezhu: '7', ettu: '8', onbadhu: '9'
    };

    const tokens = text
        .replace(/[^a-z0-9\u0900-\u097F\u0B80-\u0BFF\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);

    const tokenDigits = tokens.map((token) => {
        if (/^\d+$/.test(token)) return token;
        return wordMap[token] || '';
    }).join('');

    const directDigits = text.replace(/\D/g, '');
    return (tokenDigits || directDigits).replace(/\D/g, '');
};

const SmartFormAssistant = ({ templateId, fieldsNeeded = [], language, documentName = 'Document Form', onComplete }) => {
    const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
    const [formData, setFormData] = useState({});
    const [capturedAnswers, setCapturedAnswers] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPdfBlobUrl, setGeneratedPdfBlobUrl] = useState('');
    const recognitionRef = useRef(null);

    const langCode = language?.code || 'en-IN';
    const isHindi = langCode === 'hi-IN';
    const normalizedFields = useMemo(
        () => (Array.isArray(fieldsNeeded) ? fieldsNeeded.filter(Boolean) : []),
        [fieldsNeeded]
    );
    const currentField = normalizedFields[currentFieldIndex] || null;
    const allFieldsCaptured = normalizedFields.length > 0 && currentFieldIndex >= normalizedFields.length;

    const getFieldLabel = (fieldKey) => {
        const labels = FIELD_LABELS[fieldKey];
        if (!labels) return fieldKey;
        return isHindi ? labels.hi : labels.en;
    };

    const speak = (text) => {
        try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = langCode;
            window.speechSynthesis.speak(utterance);
        } catch (_) {
            // no-op
        }
    };

    useEffect(() => {
        if (!currentField) return;
        const numericHint = NUMERIC_FIELDS.has(currentField)
            ? (isHindi ? ' Kripya number digit by digit boliye.' : ' Please speak digits one by one.')
            : '';
        const question = isHindi
            ? `Kripya apna ${getFieldLabel(currentField)} batayein.${numericHint}`
            : `Please tell me your ${getFieldLabel(currentField)}.${numericHint}`;
        speak(question);
    }, [currentField, isHindi]);

    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
            if (generatedPdfBlobUrl) {
                URL.revokeObjectURL(generatedPdfBlobUrl);
            }
        };
    }, [generatedPdfBlobUrl]);

    const handleVoiceCapture = () => {
        setError('');
        if (!currentField) return;
        if (!('webkitSpeechRecognition' in window)) {
            setError('Speech recognition is not supported in this browser. Please use Chrome.');
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = langCode;
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 3;
        recognitionRef.current = recognition;

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event) => {
            const answer = event.results?.[0]?.[0]?.transcript?.trim() || '';
            if (!answer) return;

            const normalizedAnswer = NUMERIC_FIELDS.has(currentField)
                ? normalizeNumericAnswer(answer)
                : answer.replace(/\s+/g, ' ').trim();

            setFormData((prev) => ({ ...prev, [currentField]: normalizedAnswer || answer }));
            setCapturedAnswers((prev) => [...prev, { field: currentField, value: normalizedAnswer || answer }]);
            setCurrentFieldIndex((prev) => prev + 1);
        };

        recognition.onerror = () => {
            setError(isHindi ? 'Voice input failed. Dobara koshish karein.' : 'Voice input failed. Please try again.');
        };

        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    const generateDocument = async () => {
        if (!templateId) {
            setError('Missing template id.');
            return;
        }

        setIsGenerating(true);
        setError('');

        try {
            const response = await axios.post(
                endpoints.generatePdf,
                {
                    template_id: templateId,
                    formData
                },
                { responseType: 'blob' }
            );

            if (generatedPdfBlobUrl) {
                URL.revokeObjectURL(generatedPdfBlobUrl);
            }

            const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            setGeneratedPdfBlobUrl(url);
            if (onComplete) onComplete(formData);
        } catch (err) {
            setError(err?.response?.data?.error || 'Failed to generate PDF. Please retry.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="w-full md:w-1/2 bg-orange-50 p-6 border-r border-orange-100">
                <div className="bg-white rounded-xl border border-orange-100 shadow-sm p-5 min-h-[420px]">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="text-orange-600" size={20} />
                        <h2 className="text-lg font-bold text-gray-800">{documentName}</h2>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                        {isHindi ? 'Fields collected using voice assistant:' : 'Fields collected using voice assistant:'}
                    </p>

                    <div className="space-y-3">
                        {normalizedFields.map((field, idx) => {
                            const value = formData[field];
                            const isActive = idx === currentFieldIndex && !allFieldsCaptured;
                            return (
                                <div key={field} className={`rounded-lg border p-3 ${isActive ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-white'}`}>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">{getFieldLabel(field)}</p>
                                    <p className="text-sm font-medium text-gray-800 mt-1">{value || '...'}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="w-full md:w-1/2 p-6 flex flex-col justify-center items-center text-center min-h-[420px]">
                {!allFieldsCaptured && currentField && (
                    <>
                        <p className="text-sm font-semibold text-orange-600 mb-2">
                            {isHindi ? `Prashn ${currentFieldIndex + 1} / ${normalizedFields.length}` : `Question ${currentFieldIndex + 1} / ${normalizedFields.length}`}
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900 mb-8">
                            {isHindi
                                ? `Kripya apna ${getFieldLabel(currentField)} batayein`
                                : `Please tell me your ${getFieldLabel(currentField)}`}
                        </h3>
                        <button
                            onClick={handleVoiceCapture}
                            className={`relative w-28 h-28 rounded-full flex items-center justify-center shadow-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                        >
                            <Mic size={42} />
                        </button>
                        <p className="mt-4 text-sm text-gray-500">
                            {isListening ? (isHindi ? 'Sun raha hoon...' : 'Listening...') : (isHindi ? 'Bolne ke liye tap karein' : 'Tap to speak')}
                        </p>
                    </>
                )}

                {allFieldsCaptured && (
                    <>
                        <CheckCircle2 className="text-green-600 mb-3" size={56} />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {isHindi ? 'Saare fields collect ho gaye.' : 'All fields collected.'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            {isHindi ? 'Ab document generate karein.' : 'Generate your document now.'}
                        </p>

                        <button
                            onClick={generateDocument}
                            disabled={isGenerating}
                            className="bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-bold py-3 px-6 rounded-xl shadow-lg flex items-center gap-2"
                        >
                            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : null}
                            {isGenerating ? 'Generating...' : 'Generate Document'}
                        </button>

                        {generatedPdfBlobUrl && (
                            <a
                                href={generatedPdfBlobUrl}
                                download={`filled_${templateId}.pdf`}
                                className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg inline-flex items-center gap-2"
                            >
                                <Download size={18} />
                                Download PDF
                            </a>
                        )}
                    </>
                )}

                {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
                {capturedAnswers.length > 0 && (
                    <p className="mt-4 text-xs text-gray-400">
                        {capturedAnswers.length} {isHindi ? 'answers captured' : 'answers captured'}
                    </p>
                )}
            </div>
        </div>
    );
};

export default SmartFormAssistant;
