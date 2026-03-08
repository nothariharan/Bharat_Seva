const express = require('express');
const router = express.Router();
const pulseController = require('../controllers/pulseController');

router.get('/', pulseController.getPulseData);

module.exports = router;
