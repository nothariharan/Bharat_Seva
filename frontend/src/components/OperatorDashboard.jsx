import React, { useState } from 'react';
import axios from 'axios';
import { LayoutDashboard, Inbox, BookOpen, Settings, LogOut, TrendingUp, CheckCircle, MessageSquare, User, Globe, Shield, Loader2 } from 'lucide-react';
import KnowledgeBoard from './KnowledgeBoard';
import CreatePostModal from './CreatePostModal';
import { endpoints } from '../config/api';

const OperatorDashboard = ({ operator: initialOperator, onLogout }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [notifying, setNotifying] = useState(null);
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [operator, setOperator] = useState(initialOperator);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        description: '',
        topics: '',
        coverageDistricts: '',
        coverageStates: '',
        contactPhone: '',
        resources: ''
    });

    // Fetch full data on mount
    React.useEffect(() => {
        const fetchFullData = async () => {
            try {
                const res = await axios.get(endpoints.communities);
                const fullOrg = res.data.find(c => c.id === operator.id || c.name === operator.name);
                if (fullOrg) {
                    setOperator(fullOrg);
                    setFormData({
                        description: fullOrg.description || '',
                        topics: fullOrg.topics ? fullOrg.topics.join(', ') : '',
                        coverageDistricts: fullOrg.coverageDistricts ? fullOrg.coverageDistricts.join(', ') : '',
                        coverageStates: fullOrg.coverageStates ? fullOrg.coverageStates.join(', ') : '',
                        contactPhone: fullOrg.contactPhone || '',
                        resources: fullOrg.resources ? JSON.stringify(fullOrg.resources, null, 2) : '[]'
                    });
                }
            } catch (err) {
                console.error("Failed to fetch full org data", err);
            }
        };
        fetchFullData();
    }, [operator.id, operator.name]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            let parsedResources = [];
            try {
                parsedResources = JSON.parse(formData.resources);
            } catch (pErr) {
                alert("Invalid JSON in Resources field. Please check format.");
                setIsSaving(false);
                return;
            }

            const updated = {
                ...operator,
                description: formData.description,
                topics: formData.topics.split(',').map(t => t.trim()).filter(t => t),
                coverageDistricts: formData.coverageDistricts.split(',').map(d => d.trim()).filter(d => d),
                coverageStates: formData.coverageStates.split(',').map(s => s.trim()).filter(s => s),
                contactPhone: formData.contactPhone,
                resources: parsedResources
            };
            const res = await axios.put(`${endpoints.communities}/${operator.id}`, updated);
            setOperator(res.data.community);
            alert("Profile updated successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleContact = async (name, phone) => {
        setNotifying(phone);
        try {
            await axios.post(endpoints.notifyCitizen, {
                phoneNumber: phone,
                orgName: operator.name
            });
            alert(`Notification sent to ${name} via SMS/WhatsApp!`);
        } catch (err) {
            alert("Failed to send notification.");
        } finally {
            setNotifying(null);
        }
    };

    const StatsCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
                    <Icon size={24} />
                </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            <p className="text-gray-500 font-medium">{title}</p>
        </div>
    );

    const SettingsView = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100">
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center text-orange-600">
                        <User size={40} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900">{operator.name}</h3>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Official Operator Profile</p>
                    </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Organization Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all min-h-[120px]"
                                placeholder="Describe what your organization does..."
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Expertise Topics (Comma separated)</label>
                                <input
                                    type="text"
                                    value={formData.topics}
                                    onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                    placeholder="e.g. Farmer Welfare, Legal Aid"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Contact Phone</label>
                                <input
                                    type="text"
                                    value={formData.contactPhone}
                                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                    placeholder="Organization contact number"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Coverage States (Comma separated)</label>
                            <input
                                type="text"
                                value={formData.coverageStates}
                                onChange={(e) => setFormData({ ...formData, coverageStates: e.target.value })}
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                placeholder="e.g. Maharashtra, Delhi"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Coverage Districts (Comma separated)</label>
                            <input
                                type="text"
                                value={formData.coverageDistricts}
                                onChange={(e) => setFormData({ ...formData, coverageDistricts: e.target.value })}
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                placeholder="e.g. Nashik, Pune"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Digital Resources (JSON Array)</label>
                        <textarea
                            value={formData.resources}
                            onChange={(e) => setFormData({ ...formData, resources: e.target.value })}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-mono text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all min-h-[150px]"
                            placeholder='[{"label": "Link", "url": "https://..."}]'
                        />
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Format: {'[{"label": "Name", "url": "URL"}]'}</p>
                    </div>

                    <div className="pt-8 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-8 py-3 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Settings size={20} />}
                            Update Profile Details
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const RequestItem = ({ name, location, query, phone }) => (
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-gray-50/50 rounded-2xl border border-gray-100 gap-4 mb-3">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-400 border border-gray-100">
                    <User size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900">{name}</h4>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{location}</p>
                </div>
            </div>

            <div className="flex-1 px-4">
                <p className="text-sm font-medium text-gray-700">"{query}"</p>
            </div>

            <button
                onClick={() => handleContact(name, phone)}
                disabled={notifying === phone}
                className="px-6 py-2.5 bg-gray-900 text-white font-black rounded-xl hover:bg-black transition-all active:scale-95 text-xs flex items-center gap-2 disabled:opacity-50"
            >
                {notifying === phone ? <Loader2 className="w-4 h-4 animate-spin" /> : <Inbox size={16} />}
                Contact User
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-6 flex flex-col h-screen sticky top-0">
                <div className="mb-10">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">Operator Portal</h1>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Bharat Seva</p>
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'inbox', label: 'Query Inbox', icon: Inbox },
                        { id: 'knowledge', label: 'Knowledge Board', icon: MessageSquare },
                        { id: 'resources', label: 'Resource Hub', icon: BookOpen },
                        { id: 'settings', label: 'Profile Settings', icon: Settings },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === item.id
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                                : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600'
                                }`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <button
                    onClick={onLogout}
                    className="mt-6 flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all"
                >
                    <LogOut size={20} /> Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900">Welcome, {operator.name}</h2>
                        <p className="text-gray-500 font-medium">Serving {operator.district}, {operator.state}</p>
                    </div>
                </header>

                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatsCard title="Total Queries" value="23" icon={Inbox} color="blue" />
                            <StatsCard title="Answered" value="21" icon={CheckCircle} color="green" />
                            <StatsCard title="Citizen Reach" value="340" icon={TrendingUp} color="orange" />
                        </div>

                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-8 rounded-3xl text-white shadow-xl shadow-orange-100">
                            <h3 className="text-2xl font-black mb-2">Welcome back to Bharat Seva</h3>
                            <p className="text-orange-50 font-medium opacity-90 max-w-xl">
                                Your organization is currently helping citizens in <b>{operator.coverageDistricts?.join(', ') || operator.district}</b>.
                                Check the Query Inbox to respond to new requests.
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'inbox' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900">Query Inbox</h3>
                                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Approve or Reject citizen help requests</p>
                                </div>
                                <div className="bg-orange-100 text-orange-600 px-4 py-2 rounded-xl font-black text-sm">
                                    2 New Requests
                                </div>
                            </div>

                            <div className="space-y-4">
                                <RequestItem
                                    name="Ramesh Kumar"
                                    location="Nashik East"
                                    query="Widow pension stopped since January"
                                    phone="+91 9876543210"
                                />
                                <RequestItem
                                    name="Sunita Deshmukh"
                                    location="Vihig"
                                    query="How to apply for new Ration Card?"
                                    phone="+91 8888877777"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'knowledge' && (
                    <div className="h-[calc(100vh-250px)] bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden animate-fade-in">
                        <KnowledgeBoard
                            selectedLang={{ code: 'en-IN' }}
                            currentUser={operator}
                            onCreatePost={() => setIsCreatePostModalOpen(true)}
                            refreshTrigger={refreshTrigger}
                        />
                    </div>
                )}

                {activeTab === 'settings' && <SettingsView />}

                {activeTab === 'resources' && (
                    <div className="flex items-center justify-center min-h-[400px] bg-white rounded-2xl border border-dashed border-gray-300">
                        <p className="text-gray-400 font-bold">RESOURCE HUB View is coming soon in the next sprint.</p>
                    </div>
                )}
            </main>

            <CreatePostModal
                isOpen={isCreatePostModalOpen}
                onClose={() => setIsCreatePostModalOpen(false)}
                currentUser={operator}
                onPostCreated={() => setRefreshTrigger(prev => prev + 1)}
                selectedLang={{ code: 'en-IN' }}
            />
        </div>
    );
};

export default OperatorDashboard;
