const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Community = require('../models/Community');
const Post = require('../models/Post');
const QueryLog = require('../models/QueryLog');

dotenv.config();

const migrate = async () => {
    await connectDB();

    try {
        // 1. Migrate Communities
        const communitiesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/communities.json'), 'utf8'));
        await Community.deleteMany({});
        await Community.insertMany(communitiesData);
        console.log('✅ Communities migrated');

        // 2. Migrate Posts
        const postsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/posts.json'), 'utf8'));
        await Post.deleteMany({});
        await Post.insertMany(postsData);
        console.log('✅ Posts migrated');

        // 3. Migrate Query Logs
        const logsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/queryLogs.json'), 'utf8'));
        await QueryLog.deleteMany({});
        await QueryLog.insertMany(logsData);
        console.log('✅ Query Logs migrated');

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
