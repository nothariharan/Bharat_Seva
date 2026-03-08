const { classifyTopic } = require('../services/aiService');
const Community = require('../models/Community');

const getMatchingCommunitiesInternal = async (state, district, transcript) => {
    try {
        // 1. Geographic Filter (In Database)
        let query = {
            active: true,
            coverageStates: { $in: [state, 'All India'] }
        };

        if (district) {
            query.$or = [
                { coverageDistricts: district },
                { coverageDistricts: { $size: 0 } }
            ];
        }

        let matches = await Community.find(query);

        // 2. Topic Filter (Post-processing for flexibility with AI classification)
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
