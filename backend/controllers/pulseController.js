const QueryLog = require('../models/QueryLog');

const saveLog = async (logEntry) => {
    try {
        await QueryLog.create({
            id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            ...logEntry
        });
    } catch (err) {
        console.error("Error saving query log to MongoDB:", err);
    }
};

const getPulseData = async (req, res) => {
    try {
        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Filter last 24h via Database
        const recentQueries = await QueryLog.find({
            timestamp: { $gt: last24h }
        });

        // Aggregate by District and Topic
        const aggregation = {};

        recentQueries.forEach(q => {
            const district = q.district || 'Unknown';
            const topic = q.topic || 'General';
            const key = `${district}|${topic}`;

            if (!aggregation[key]) {
                aggregation[key] = {
                    district,
                    topic,
                    count: 0,
                    lat: q.latitude,
                    lng: q.longitude,
                    queries: []
                };
            }
            aggregation[key].count += 1;
            aggregation[key].queries.push(q.transcript);

            if (q.latitude && q.longitude) {
                aggregation[key].lat = q.latitude;
                aggregation[key].lng = q.longitude;
            }
        });

        // Threshold for "Red Alert"
        const CRISIS_THRESHOLD = 5;
        const alerts = Object.values(aggregation).map(item => ({
            ...item,
            status: item.count >= CRISIS_THRESHOLD ? 'CRITICAL' : 'MONITORING',
            severity: Math.min(item.count / CRISIS_THRESHOLD, 2)
        }));

        res.json({
            timestamp: now.toISOString(),
            alerts: alerts.sort((a, b) => b.count - a.count),
            totalQueries24h: recentQueries.length
        });

    } catch (error) {
        console.error('Pulse aggregation error:', error);
        res.status(500).json({ error: 'Failed to aggregate pulse data' });
    }
};

module.exports = { saveLog, getPulseData };
