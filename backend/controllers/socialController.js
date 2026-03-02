const fs = require('fs');
const path = require('path');
const { moderatePost } = require('../services/aiService');
const { transcribeAudio } = require('../services/transcribeService');

const POSTS_DB = path.join(__dirname, '../config/posts.json');

const getPosts = () => {
    if (!fs.existsSync(POSTS_DB)) return [];
    return JSON.parse(fs.readFileSync(POSTS_DB, 'utf8'));
};

const savePosts = (data) => {
    fs.writeFileSync(POSTS_DB, JSON.stringify(data, null, 2));
};

// Seed initial posts
if (!fs.existsSync(POSTS_DB)) {
    const seed = [
        {
            id: 'p-001',
            authorName: 'Delhi Legal Aid Clinic',
            authorType: 'Operator',
            content: ' सुप्रीम कोर्ट ने आदेश दिया है कि विधवा पेंशन के लिए मृत्यु प्रमाण पत्र को नोटरी करने की आवश्यकता नहीं है - सादी कॉपी पर्याप्त है।',
            state: 'Delhi',
            topic: 'Legal Aid',
            upvotes: 47,
            timestamp: new Date().toISOString()
        }
    ];
    savePosts(seed);
}

const getKnowledgeBoard = async (req, res) => {
    try {
        const { state, topic } = req.query;
        let posts = getPosts();

        if (state) posts = posts.filter(p => p.state === state || p.state === 'All India');
        if (topic) posts = posts.filter(p => p.topic === topic);

        res.json(posts.sort((a, b) => b.upvotes - a.upvotes));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
};

const createPost = async (req, res) => {
    try {
        const { authorName, authorType, content, state, topic } = req.body;

        // 1. AI Moderation
        const moderation = await moderatePost(content);
        if (moderation.status === 'REJECTED') {
            return res.status(400).json({
                error: 'Post rejected by AI moderation',
                reason: moderation.reason
            });
        }

        const posts = getPosts();
        const newPost = {
            id: `p-${Date.now()}`,
            authorName,
            authorType,
            content: moderation.cleaned_content,
            state: state || 'All India',
            topic: topic || 'General',
            upvotes: 0,
            timestamp: new Date().toISOString()
        };

        posts.push(newPost);
        savePosts(posts);
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create post' });
    }
};

const upvotePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const posts = getPosts();
        const postIndex = posts.findIndex(p => p.id === postId);

        if (postIndex === -1) return res.status(404).json({ error: 'Post not found' });

        posts[postIndex].upvotes += 1;
        savePosts(posts);
        res.json({ success: true, upvotes: posts[postIndex].upvotes });
    } catch (error) {
        res.status(500).json({ error: 'Failed to upvote' });
    }
};

const transcribePost = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Audio file is required' });
        const { language } = req.body;
        const text = await transcribeAudio(req.file.buffer, language);
        res.json({ text });
    } catch (error) {
        res.status(500).json({ error: 'Transcription failed' });
    }
};

module.exports = { getKnowledgeBoard, createPost, upvotePost, transcribePost };
