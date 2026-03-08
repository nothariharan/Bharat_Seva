const axios = require('axios');

const BACKEND_URL = 'http://localhost:3000/api';

async function simulateQueries() {
    console.log("🚀 Starting Janata Pulse Verification...");

    const testQueries = [
        { transcript: "Pani ganda aa raha hai", topic: "Dirty Water", district: "Nashik", lat: 20.0, lng: 73.8 },
        { transcript: "Water is yellow and smells", topic: "Dirty Water", district: "Nashik", lat: 20.1, lng: 73.9 },
        { transcript: "Drinking water issue in our area", topic: "Dirty Water", district: "Nashik", lat: 20.05, lng: 73.85 },
        { transcript: "Tap water is muddy", topic: "Dirty Water", district: "Nashik", lat: 19.98, lng: 73.78 },
        { transcript: "Is there a water crisis?", topic: "Dirty Water", district: "Nashik", lat: 20.02, lng: 73.82 }
    ];

    console.log("📝 Submitting 5 queries for 'Dirty Water' in 'Nashik'...");

    for (const q of testQueries) {
        try {
            await axios.post(`${BACKEND_URL}/process-query`, {
                transcript: q.transcript,
                userContext: {
                    district: q.district,
                    state: "Maharashtra",
                    latitude: q.lat,
                    longitude: q.lng
                }
            });
            process.stdout.write(".");
        } catch (err) {
            console.error("\n❌ Query failed:", err.message);
        }
    }

    console.log("\n✅ Queries submitted. Fetching Pulse Data...");

    try {
        const res = await axios.get(`${BACKEND_URL}/pulse`);
        const pulse = res.data;

        console.log("📊 Pulse Aggregate:", JSON.stringify(pulse, null, 2));

        const nashikWater = pulse.alerts.find(a => a.district === 'Nashik' && a.status === 'CRITICAL');

        if (nashikWater) {
            console.log("🔥 SUCCESS: Red Alert detected for Nashik (Dirty Water)!");
        } else {
            console.log("⚠️ WARNING: Red Alert not detected. Check aggregation logic.");
        }
    } catch (err) {
        console.error("❌ Failed to fetch pulse data:", err.message);
    }
}

simulateQueries();
