import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Mic, FileText, Download, Loader2, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { endpoints } from '../config/api';

const FIELD_LABELS = {
    electorNameTop: { en: 'Name of Elector', hi: 'Name of Elector' },
    constituencyName: { en: 'Assembly/Parliamentary Constituency', hi: 'Constituency Name' },
    epicNumber: { en: 'EPIC Number', hi: 'EPIC Number' },
    aadhaarChoice: { en: 'Aadhaar Availability', hi: 'Aadhaar Availability' },
    aadhaarNumber: { en: 'Aadhaar Number', hi: 'Aadhaar Number' },
    supportingDocument: { en: 'Supporting Document', hi: 'Supporting Document' },
    mobileOrEmail: { en: 'E-mail ID / Mobile Number', hi: 'E-mail ID / Mobile Number' },
    place: { en: 'Place', hi: 'Place' },
    date: { en: 'Date', hi: 'Date' },
    customerName: { en: 'Customer Name', hi: 'Customer Name' },
    accountNumber: { en: 'Account Number', hi: 'Account Number' },
    mobile: { en: 'Mobile Number', hi: 'Mobile Number' },
    address: { en: 'Address', hi: 'Address' }
};

const NUMERIC_FIELDS = new Set(['aadhaarNumber', 'mobile', 'accountNumber']);

const FORM_6B_DOC_OPTIONS = [
    { key: 'mgnrega_job_card', label: 'MGNREGA Job Card' },
    { key: 'bank_post_passbook', label: 'Passbook with photograph issued by Bank/Post Office' },
    { key: 'health_insurance_smart_card', label: 'Health Insurance Smart Card (Ministry of Labour scheme)' },
    { key: 'driving_license', label: 'Driving License' },
    { key: 'pan_card', label: 'PAN Card' },
    { key: 'rgi_npr_smart_card', label: 'Smart Card issued by RGI under NPR' },
    { key: 'indian_passport', label: 'Indian Passport' },
    { key: 'pension_document', label: 'Pension document with photograph' },
    { key: 'service_identity_card', label: 'Service Identity Card (Central/State Govt/PSU/Public Limited Companies)' },
    { key: 'official_identity_card', label: 'Official Identity Card issued to MPs/MLAs/MLCs' },
    { key: 'udid_card', label: 'UDID Card (M/o Social Justice and Empowerment, Govt of India)' }
];

const normalizeLocaleDigits = (value = '') => value
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - 2406))
    .replace(/[௦-௯]/g, (d) => String(d.charCodeAt(0) - 3046));

const normalizeNumericAnswer = (raw = '') => {
    const text = normalizeLocaleDigits(String(raw).toLowerCase());
    const wordMap = {
        zero: '0', oh: '0', one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9',
        ek: '1', do: '2', teen: '3', tin: '3', char: '4', chaar: '4', paanch: '5', panch: '5', chhe: '6', saat: '7', aath: '8', nau: '9',
        onnu: '1', rendu: '2', moondru: '3', naangu: '4', aindhu: '5', aaru: '6', ezhu: '7', ettu: '8', onbadhu: '9'
    };
    const tokens = text.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
    const tokenDigits = tokens.map((token) => (/^\d+$/.test(token) ? token : (wordMap[token] || ''))).join('');
    return (tokenDigits || text.replace(/\D/g, '')).replace(/\D/g, '');
};

const SmartFormAssistant = ({ templateId, fieldsNeeded = [], language, documentName = 'Document Form', onComplete }) => {
    const [formData, setFormData] = useState({});
    const [typedAnswer, setTypedAnswer] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPdfBlobUrl, setGeneratedPdfBlobUrl] = useState('');
    const [docAccordionOpen, setDocAccordionOpen] = useState(true);
    const recognitionRef = useRef(null);

    const langCode = language?.code || 'en-IN';
    const normalizedFields = useMemo(() => (Array.isArray(fieldsNeeded) ? fieldsNeeded.filter(Boolean) : []), [fieldsNeeded]);

    const getFieldLabel = (fieldKey) => FIELD_LABELS[fieldKey]?.en || fieldKey;
    const docLabelByKey = (key) => FORM_6B_DOC_OPTIONS.find((d) => d.key === key)?.label || key;

    const sanitizeForField = (field, value) => {
        if (!value) return '';
        if (NUMERIC_FIELDS.has(field)) return normalizeNumericAnswer(value);
        return String(value).replace(/\s+/g, ' ').trim();
    };

    const isFieldFilled = (field) => Boolean(String(formData[field] || '').trim());
    const aadhaarChoice = formData.aadhaarChoice || '';

    const requiredFields = useMemo(() => {
        const base = [...normalizedFields];
        if (templateId !== 'form_6b') return base;
        return base.filter((field) => {
            if (field === 'aadhaarNumber' && aadhaarChoice === 'no_aadhaar') return false;
            if (field === 'supportingDocument' && aadhaarChoice === 'has_aadhaar') return false;
            return true;
        });
    }, [templateId, normalizedFields, aadhaarChoice]);

    const currentField = requiredFields.find((field) => !isFieldFilled(field)) || null;
    const allFieldsCaptured = requiredFields.length > 0 && requiredFields.every(isFieldFilled);
    const currentFieldIndex = currentField ? requiredFields.indexOf(currentField) + 1 : requiredFields.length;

    useEffect(() => {
        if (!currentField) return;
        const question = NUMERIC_FIELDS.has(currentField)
            ? `Please provide ${getFieldLabel(currentField)} in digits.`
            : `Please provide ${getFieldLabel(currentField)}.`;
        try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(question);
            utterance.lang = langCode;
            window.speechSynthesis.speak(utterance);
        } catch (_) {
            // no-op
        }
        setTypedAnswer(formData[currentField] || '');
    }, [currentField, langCode]);

    useEffect(() => () => {
        if (recognitionRef.current) recognitionRef.current.abort();
        if (generatedPdfBlobUrl) URL.revokeObjectURL(generatedPdfBlobUrl);
    }, [generatedPdfBlobUrl]);

    const saveFieldValue = (field, rawValue) => {
        const cleaned = sanitizeForField(field, rawValue);
        if (!cleaned) {
            setError(NUMERIC_FIELDS.has(field) ? 'Please provide digits only for this field.' : 'Please provide a valid value.');
            return false;
        }
        setFormData((prev) => ({ ...prev, [field]: cleaned }));
        setTypedAnswer('');
        setError('');
        return true;
    };

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
            const transcript = event.results?.[0]?.[0]?.transcript?.trim() || '';
            if (!transcript) return;
            saveFieldValue(currentField, transcript);
        };
        recognition.onerror = () => setError('Voice input failed. Please try again.');
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    const generateDocument = async () => {
        if (!templateId) return setError('Missing template id.');
        if (!allFieldsCaptured) return setError('Please fill all required fields before generating.');

        setIsGenerating(true);
        setError('');
        try {
            const payload = { ...formData };
            if (templateId === 'form_6b' && payload.electorNameTop && !payload.electorNameBottom) {
                payload.electorNameBottom = payload.electorNameTop;
            }

            const response = await axios.post(endpoints.generatePdf, { template_id: templateId, formData: payload }, { responseType: 'blob' });
            if (generatedPdfBlobUrl) URL.revokeObjectURL(generatedPdfBlobUrl);
            const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            setGeneratedPdfBlobUrl(url);

            const link = document.createElement('a');
            link.href = url;
            link.download = `filled_${templateId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            setError(err?.response?.data?.error || 'Failed to generate PDF. Please retry.');
        } finally {
            setIsGenerating(false);
        }
    };

    const renderLeftInput = (field) => {
        if (field === 'aadhaarChoice') {
            return (
                <div className="mt-1 flex flex-col gap-2 text-sm">
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="aadhaarChoice"
                            checked={formData.aadhaarChoice === 'has_aadhaar'}
                            onChange={() => setFormData((prev) => ({ ...prev, aadhaarChoice: 'has_aadhaar', supportingDocument: '' }))}
                        />
                        I can provide Aadhaar Number
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="aadhaarChoice"
                            checked={formData.aadhaarChoice === 'no_aadhaar'}
                            onChange={() => setFormData((prev) => ({ ...prev, aadhaarChoice: 'no_aadhaar', aadhaarNumber: '' }))}
                        />
                        I do not have Aadhaar, I will provide alternate document
                    </label>
                </div>
            );
        }

        if (field === 'supportingDocument') {
            return (
                <select
                    value={formData.supportingDocument || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, supportingDocument: e.target.value }))}
                    className="w-full mt-1 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800"
                >
                    <option value="">Select document</option>
                    {FORM_6B_DOC_OPTIONS.map((opt) => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
                </select>
            );
        }

        return (
            <input
                value={formData[field] || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, [field]: sanitizeForField(field, e.target.value) }))}
                inputMode={NUMERIC_FIELDS.has(field) ? 'numeric' : 'text'}
                className="w-full mt-1 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800"
                placeholder={NUMERIC_FIELDS.has(field) ? 'Digits only' : 'Type here'}
            />
        );
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="w-full md:w-1/2 bg-orange-50 p-6 border-r border-orange-100">
                <div className="bg-white rounded-xl border border-orange-100 shadow-sm p-5 min-h-[520px]">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="text-orange-600" size={20} />
                        <h2 className="text-lg font-bold text-gray-800">{documentName}</h2>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">All text fields are directly editable.</p>
                    <div className="space-y-3">
                        {requiredFields.map((field) => {
                            const active = field === currentField && !allFieldsCaptured;
                            return (
                                <div key={field} className={`rounded-lg border p-3 ${active ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-white'}`}>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">{getFieldLabel(field)}</p>
                                    {renderLeftInput(field)}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="w-full md:w-1/2 p-6 flex flex-col justify-center items-center text-center min-h-[520px]">
                {!allFieldsCaptured && currentField && currentField !== 'supportingDocument' && currentField !== 'aadhaarChoice' && (
                    <>
                        <p className="text-sm font-semibold text-orange-600 mb-2">{`Question ${currentFieldIndex} / ${requiredFields.length}`}</p>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">{`Please provide ${getFieldLabel(currentField)}`}</h3>
                        <input
                            value={typedAnswer}
                            onChange={(e) => setTypedAnswer(sanitizeForField(currentField, e.target.value))}
                            inputMode={NUMERIC_FIELDS.has(currentField) ? 'numeric' : 'text'}
                            className="w-full max-w-sm border border-gray-300 rounded-lg px-4 py-3 text-base mb-4"
                            placeholder={NUMERIC_FIELDS.has(currentField) ? 'Enter digits' : 'Type answer'}
                        />
                        <div className="flex gap-3">
                            <button onClick={() => saveFieldValue(currentField, typedAnswer)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-5 rounded-xl shadow-lg">
                                Save
                            </button>
                            <button onClick={handleVoiceCapture} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
                                <Mic size={24} />
                            </button>
                        </div>
                    </>
                )}

                {!allFieldsCaptured && currentField === 'aadhaarChoice' && (
                    <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-5">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Do you have Aadhaar Number?</h3>
                        <div className="flex flex-col gap-2 text-left">
                            <button className={`px-4 py-3 rounded-lg border ${aadhaarChoice === 'has_aadhaar' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`} onClick={() => setFormData((p) => ({ ...p, aadhaarChoice: 'has_aadhaar', supportingDocument: '' }))}>
                                Yes, I can provide Aadhaar Number
                            </button>
                            <button className={`px-4 py-3 rounded-lg border ${aadhaarChoice === 'no_aadhaar' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`} onClick={() => setFormData((p) => ({ ...p, aadhaarChoice: 'no_aadhaar', aadhaarNumber: '' }))}>
                                No, I will submit an alternate document
                            </button>
                        </div>
                    </div>
                )}

                {!allFieldsCaptured && currentField === 'supportingDocument' && (
                    <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-5 text-left">
                        <button onClick={() => setDocAccordionOpen((v) => !v)} className="w-full flex items-center justify-between text-lg font-bold text-gray-900">
                            <span>Which document are you ready to submit?</span>
                            {docAccordionOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        {docAccordionOpen && (
                            <div className="mt-4 max-h-72 overflow-auto space-y-2">
                                {FORM_6B_DOC_OPTIONS.map((opt) => (
                                    <label key={opt.key} className="flex items-start gap-2 p-2 border rounded-lg cursor-pointer hover:bg-orange-50">
                                        <input
                                            type="radio"
                                            name="supportingDocument"
                                            checked={formData.supportingDocument === opt.key}
                                            onChange={() => setFormData((prev) => ({ ...prev, supportingDocument: opt.key }))}
                                            className="mt-1"
                                        />
                                        <span className="text-sm text-gray-800">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {allFieldsCaptured && (
                    <>
                        <CheckCircle2 className="text-green-600 mb-3" size={56} />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">All required details captured.</h3>
                        <p className="text-sm text-gray-600 mb-6">Generate and download your complete Form 6B PDF.</p>
                        <button onClick={generateDocument} disabled={isGenerating} className="bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-bold py-3 px-6 rounded-xl shadow-lg flex items-center gap-2">
                            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : null}
                            {isGenerating ? 'Generating...' : 'Generate Document'}
                        </button>
                        {generatedPdfBlobUrl && (
                            <>
                                <a href={generatedPdfBlobUrl} download={`filled_${templateId}.pdf`} className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg inline-flex items-center gap-2">
                                    <Download size={18} />
                                    Download PDF
                                </a>
                                <button onClick={() => onComplete && onComplete(formData)} className="mt-3 text-sm text-gray-700 underline">
                                    Back to Plan
                                </button>
                            </>
                        )}
                    </>
                )}

                {templateId === 'form_6b' && formData.supportingDocument && (
                    <p className="mt-4 text-xs text-gray-500">Selected document: {docLabelByKey(formData.supportingDocument)}</p>
                )}
                {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
            </div>
        </div>
    );
};

export default SmartFormAssistant;
