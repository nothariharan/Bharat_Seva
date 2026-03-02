const fs = require('fs');
const path = require('path');
const { classifyTopic, translateResponse } = require('../services/aiService');

// Mock Database for Communities (seeded with data)
// In a real app, this would be MongoDB or PostgreSQL
const DB_PATH = path.join(__dirname, '../config/communities.json');

const getCommunities = () => {
    if (!fs.existsSync(DB_PATH)) return [];
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
};

const saveCommunities = (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// Seed initial data if DB doesn't exist
if (!fs.existsSync(DB_PATH)) {
    const seed = [
        {
            id: 'nas-001',
            name: 'Nashik Kisan Seva Kendra',
            type: 'NGO',
            description: 'We help farmers in Nashik with government schemes, seeds, and digital documentation.',
            coverageStates: ['Maharashtra'],
            coverageDistricts: ['Nashik'],
            topics: ['Farmer Welfare', 'Financial Inclusion'],
            resources: [
                { label: 'PM-KISAN Status Check', url: 'https://pmkisan.gov.in/' },
                { label: 'Nashik Agriculture Guide (PDF)', url: 'https://example.com/nashik-guide.pdf' }
            ],
            contactPhone: '9876543210',
            active: true
        },
        {
            id: 'del-002',
            name: 'Delhi Legal Aid Clinic',
            type: 'Legal Aid',
            description: 'Pro-bono legal services for citizens in Delhi NCR. Specializing in labour rights and housing.',
            coverageStates: ['Delhi'],
            coverageDistricts: ['Central Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
            topics: ['Legal Aid', 'Labour Rights', 'Housing'],
            resources: [
                { label: 'Know Your Rights Handbook', url: 'https://example.com/rights.pdf' }
            ],
            contactPhone: '9988776655',
            active: true
        }
    ];
    saveCommunities(seed);
}

const registerCommunity = async (req, res) => {
    try {
        const community = req.body;
        const communities = getCommunities();
        community.id = `org-${Date.now()}`;
        community.active = true;
        communities.push(community);
        saveCommunities(communities);
        res.status(201).json({ success: true, communityId: community.id });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
};

const getMatchingCommunities = async (req, res) => {
    try {
        const { state, district, query } = req.body;
        const communities = getCommunities().filter(c => c.active);

        // 1. Geographic Filter
        let matches = communities.filter(c => {
            const stateMatch = c.coverageStates.includes(state) || c.coverageStates.includes('All India');
            const districtMatch = !district || c.coverageDistricts.includes(district) || c.coverageDistricts.length === 0;
            return stateMatch && districtMatch;
        });

        // 2. Topic Filter (using AI classification)
        if (query) {
            const { topics, confidence } = await classifyTopic(query);
            if (confidence > 0.5) {
                matches = matches.filter(c =>
                    c.topics.some(topic => topics.includes(topic))
                );
            }
        }

        res.json(matches);
    } catch (error) {
        res.status(500).json({ error: 'Matching failed' });
    }
};

const respondToQuery = async (req, res) => {
    try {
        const { queryId, responseText, targetLanguage } = req.body;

        let finalResponse = responseText;
        if (targetLanguage && targetLanguage !== 'en') {
            finalResponse = await translateResponse(responseText, targetLanguage);
        }

        // In a real app, we would update the query status in DB and notify the citizen
        res.json({ success: true, translatedResponse: finalResponse });
    } catch (error) {
        res.status(500).json({ error: 'Response failed' });
    }
};

module.exports = { registerCommunity, getMatchingCommunities, respondToQuery };
