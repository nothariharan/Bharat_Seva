const express = require('express');
const multer = require('multer');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const { processQuery } = require('../controllers/queryController');
const { scanDocument } = require('../controllers/scanController');
const { readNotice } = require('../controllers/noticeController');
const { uploadVoiceSignature } = require('../controllers/voiceSignatureController');
const { contextChat } = require('../controllers/chatController');

// Civic Social Layer Controllers
const { registerCommunity, getMatchingCommunities, respondToQuery } = require('../controllers/communityController');
const { getKnowledgeBoard, createPost, upvotePost } = require('../controllers/socialController');
const { login, sendOtp } = require('../controllers/authController');

router.post('/process-query', processQuery);
router.post('/scan-document', scanDocument);
router.post('/read-notice', readNotice);
router.post('/upload-voice-signature', upload.single('audio'), uploadVoiceSignature);
router.post('/context-chat', contextChat);

// Communities
router.post('/communities/register', registerCommunity);
router.post('/communities/match', getMatchingCommunities);
router.post('/communities/respond', respondToQuery);

// Knowledge Board
router.get('/social/posts', getKnowledgeBoard);
router.post('/social/posts', createPost);
router.post('/social/posts/transcribe', upload.single('audio'), require('../controllers/socialController').transcribePost);
router.post('/social/posts/:postId/upvote', upvotePost);

// Notifications
router.post('/notify-citizen', require('../controllers/queryController').notifyCitizen);

// Auth
router.post('/auth/login', login);
router.post('/auth/send-otp', sendOtp);

module.exports = router;
