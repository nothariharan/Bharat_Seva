const axios = require('axios');

async function verify() {
    console.log("--- Verifying Bharat Seva Elevation ---");

    try {
        // 1. Verify Middleman Alert & Pulse Summary
        console.log("1. Testing Middleman Alert...");
        const res = await axios.post('http://localhost:3000/api/process-query', {
            transcript: "Mujhe Awas Yojana chahiye lekin agent 5000 rupaye ghoos maang raha hai",
            language: "Hindi",
            userContext: { state: "Maharashtra", district: "Nashik" }
        }, { timeout: 30000 });

        if (res.data.proactiveAlert && res.data.proactiveAlert.type === 'MIDDLEMAN_WARNING') {
            console.log("✅ Middleman Alert Detected!");
            console.log("   Alert Title:", res.data.proactiveAlert.title);
        } else {
            console.log("❌ Middleman Alert NOT Detected.");
            console.log("   Response JSON snippet:", JSON.stringify(res.data).substring(0, 200));
        }

        // 2. Verify Pulse Summary
        console.log("2. Testing Pulse API...");
        const pulseRes = await axios.get('http://localhost:3000/api/pulse', { timeout: 30000 });
        if (pulseRes.data && pulseRes.data.totalQueries24h >= 0) {
            console.log("✅ Pulse API active! Total Queries:", pulseRes.data.totalQueries24h);
        } else {
            console.log("❌ Pulse API returned invalid data.");
        }

    } catch (err) {
        console.error("❌ Verification failed:", err.message);
    }
}

verify();
