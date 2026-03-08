const { classifyTopic } = require('./aiService');
const Post = require('../models/Post');

const getPosts = async () => {
    try {
        return await Post.find().sort({ timestamp: -1 });
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
};

/**
 * Fetches relevant community insights (highly upvoted posts) 
 * for a given query and location.
 */
const getRelevantInsights = async (transcript, state, topic = null) => {
    try {
        let query = {};

        // 1. Filter by location (State)
        if (state) {
            query.state = { $in: [state, 'All India'] };
        }

        // 2. Filter by topic (if provided or via classification)
        let matchedTopic = topic;
        if (!matchedTopic) {
            const classification = await classifyTopic(transcript);
            if (classification.confidence > 0.4) {
                matchedTopic = classification.topics[0];
            }
        }

        if (matchedTopic) {
            query.topic = matchedTopic;
        }

        // 3. Sort by upvotes and return top 3
        const posts = await Post.find(query)
            .sort({ upvotes: -1 })
            .limit(3);

        return posts.map(p => ({
            content: p.content,
            author: p.authorName,
            upvotes: p.upvotes
        }));

    } catch (error) {
        console.error('Insight retrieval error:', error);
        return [];
    }
};

module.exports = { getRelevantInsights, getPosts };
