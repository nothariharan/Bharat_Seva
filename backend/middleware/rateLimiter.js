// Simple in-memory rate limiter — no Redis needed
const requestCounts = {};

const rateLimiter = (maxPerMinute = 10) => (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowStart = now - 60000;

    if (!requestCounts[ip]) requestCounts[ip] = [];

    // Remove old entries
    requestCounts[ip] = requestCounts[ip].filter(t => t > windowStart);

    if (requestCounts[ip].length >= maxPerMinute) {
        return res.status(429).json({
            error: 'Thodi der mein dobara koshish karein.',
            retryAfter: 60
        });
    }

    requestCounts[ip].push(now);
    next();
};

module.exports = { rateLimiter };
