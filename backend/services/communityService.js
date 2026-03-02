const { classifyTopic } = require('../services/aiService');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../config/communities.json');

const getMatchingCommunitiesInternal = async (state, district, transcript) => {
    try {
        if (!fs.existsSync(DB_PATH)) return [];
        const communities = JSON.parse(fs.readFileSync(DB_PATH, 'utf8')).filter(c => c.active);

        // 1. Geographic Filter
        let matches = communities.filter(c => {
            const stateMatch = c.coverageStates.includes(state) || c.coverageStates.includes('All India');
            const districtMatch = !district || c.coverageDistricts.includes(district) || c.coverageDistricts.length === 0;
            return stateMatch && districtMatch;
        });

        // 2. Topic Filter
        const { topics, confidence } = await classifyTopic(transcript);
        if (confidence > 0.5) {
            matches = matches.filter(c =>
                c.topics.some(topic => topics.includes(topic))
            );
        }

        return matches;
    } catch (error) {
        console.error('Community matching error:', error);
        return [];
    }
};

module.exports = { getMatchingCommunitiesInternal };
