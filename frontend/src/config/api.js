// src/config/api.js
const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const endpoints = {
    processQuery: `${API_BASE}/api/process-query`,
    scanDocument: `${API_BASE}/api/scan-document`,
    readNotice: `${API_BASE}/api/read-notice`,
    voiceSignature: `${API_BASE}/api/upload-voice-signature`,
    contextChat: `${API_BASE}/api/context-chat`,
    geoRoute: `${API_BASE}/api/geo-route`, // Mocked in backend
    sendWhatsapp: `${API_BASE}/api/send-whatsapp` // Twilio logic in backend
};
