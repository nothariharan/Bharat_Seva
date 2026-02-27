const express = require('express');
const multer = require('multer');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const { processQuery } = require('../controllers/queryController');
const { scanDocument } = require('../controllers/scanController');
const { readNotice } = require('../controllers/noticeController');
const { uploadVoiceSignature } = require('../controllers/voiceSignatureController');
const { contextChat } = require('../controllers/chatController');

router.post('/process-query', processQuery);
router.post('/scan-document', scanDocument);
router.post('/read-notice', readNotice);
router.post('/upload-voice-signature', upload.single('audio'), uploadVoiceSignature);
router.post('/context-chat', contextChat);

module.exports = router;
