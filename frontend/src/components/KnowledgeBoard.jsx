import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ThumbsUp, MessageSquare, Plus } from 'lucide-react';
import CreatePostModal from './CreatePostModal';
import { endpoints } from '../config/api';

const KnowledgeBoard = ({ selectedLang, currentUser, onCreatePost, refreshTrigger }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedState, setSelectedState] = useState('All');
    const [selectedTopic, setSelectedTopic] = useState('All');

    const labels = {
        "en-IN": { header: "Civic Knowledge Board", upvote: "Helpful", filter: "Filter by State", create: "Create Post" },
        "hi-IN": { header: "नागरिक ज्ञान बोर्ड", upvote: "सहायक", filter: "राज्य द्वारा फ़िल्टर करें", create: "पोस्ट लिखें" },
    };

    const t = labels[selectedLang?.code] || labels["hi-IN"];

    const fetchPosts = async () => {
        try {
            const res = await axios.get(endpoints.posts);
            setPosts(res.data);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
        }
        setLoading(false);
    };

    const handleUpvote = async (postId) => {
        try {
            await axios.post(`${endpoints.posts}/${postId}/upvote`);
            setPosts(posts.map(p => p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p));
        } catch (error) {
            console.error("Upvote failed:", error);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [refreshTrigger]);

    const states = ['All', ...new Set(posts.map(p => p.state))];
    const topics = ['All', ...new Set(posts.map(p => p.topic))];

    const filteredPosts = posts.filter(post => {
        const stateMatch = selectedState === 'All' || post.state === selectedState;
        const topicMatch = selectedTopic === 'All' || post.topic === selectedTopic;
        return stateMatch && topicMatch;
    });

    if (loading) return <div className="p-8 text-center text-gray-400 font-bold italic">Loading Civic Wisdom...</div>;

    return (
        <div className="w-full h-full bg-transparent flex flex-col">
            <div className="p-6 border-b border-orange-50 bg-white/40 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <MessageSquare className="text-orange-500" size={22} />
                        {t.header}
                    </h2>
                    <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-widest">Collective Civic Wisdom</p>
                </div>
                <button
                    onClick={onCreatePost}
                    className="p-2 bg-orange-500 text-white rounded-xl shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all active:scale-95 flex items-center gap-1 text-[11px] font-black uppercase tracking-tight"
                    title={t.create}
                >
                    <Plus size={16} strokeWidth={3} />
                    <span className="hidden sm:inline">{t.create}</span>
                </button>
            </div>

            <div className="p-4 bg-orange-50/30 border-b border-orange-100 flex flex-wrap gap-3 items-center">
                <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
                    <span className="text-[9px] font-black text-orange-400 uppercase tracking-tighter ml-1">State</span>
                    <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="w-full bg-white border border-orange-100 rounded-lg py-1.5 px-3 text-[11px] font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-200 transition-all cursor-pointer shadow-sm"
                    >
                        {states.sort().map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
                    <span className="text-[9px] font-black text-orange-400 uppercase tracking-tighter ml-1">Topic</span>
                    <select
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        className="w-full bg-white border border-orange-100 rounded-lg py-1.5 px-3 text-[11px] font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-200 transition-all cursor-pointer shadow-sm"
                    >
                        {topics.sort().map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {filteredPosts.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-400 font-bold italic">No posts found for these filters.</p>
                        <button
                            onClick={() => { setSelectedState('All'); setSelectedTopic('All'); }}
                            className="mt-4 text-orange-500 font-black text-xs uppercase tracking-widest hover:underline"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    filteredPosts.map(post => (
                        <div key={post.id} className="bg-white/90 p-4 rounded-2xl shadow-sm border border-orange-50 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex flex-col gap-1">
                                    <h3 className="font-bold text-gray-900 text-sm">{post.authorName}</h3>
                                    <div className="flex items-center gap-2 text-[9px] font-bold text-gray-500">
                                        <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full uppercase">
                                            {post.state}
                                        </span>
                                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase">
                                            {post.topic}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-700 text-[13px] leading-relaxed mb-3 font-medium">
                                {post.content}
                            </p>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                <button
                                    onClick={() => handleUpvote(post.id)}
                                    className="flex items-center gap-1.5 text-[11px] font-bold text-orange-600 hover:bg-orange-50 px-2 py-1 rounded-lg transition-colors"
                                >
                                    <ThumbsUp size={14} />
                                    <span>{post.upvotes} {t.upvote}</span>
                                </button>
                                <span className="text-[10px] text-gray-400 font-bold">
                                    {new Date(post.timestamp).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    )))}
            </div>

        </div>
    );
};

export default KnowledgeBoard;
