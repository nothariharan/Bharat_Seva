import React, { useState } from 'react';
import { Building2, Search, ArrowLeft, CheckCircle, Users, Star, MessageCircle, Globe, Tag, ExternalLink } from 'lucide-react';

const OrganizationsSidebar = ({ organizations = [], loading = false, onDirectQuery }) => {
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredOrgs = organizations.filter(org =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (selectedOrg) {
        return (
            <div className="w-full h-full bg-white flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-6 border-b border-orange-50 bg-orange-50/10 flex items-center gap-4">
                    <button
                        onClick={() => setSelectedOrg(null)}
                        className="p-2 hover:bg-orange-100 rounded-full transition-colors text-orange-600"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 leading-tight">{selectedOrg.name}</h2>
                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{selectedOrg.type}</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50 text-center">
                            <CheckCircle size={18} className="mx-auto mb-1 text-blue-600" />
                            <p className="text-lg font-black text-blue-900 leading-tight">{selectedOrg.queriesAnswered || 0}</p>
                            <p className="text-[8px] font-bold text-blue-400 uppercase tracking-tighter">Answers</p>
                        </div>
                        <div className="bg-orange-50/50 p-3 rounded-2xl border border-orange-100/50 text-center">
                            <Users size={18} className="mx-auto mb-1 text-orange-600" />
                            <p className="text-lg font-black text-orange-900 leading-tight">{selectedOrg.stats?.citizenReach || 0}</p>
                            <p className="text-[8px] font-bold text-orange-400 uppercase tracking-tighter">Reach</p>
                        </div>
                        <div className="bg-yellow-50/50 p-3 rounded-2xl border border-yellow-100/50 text-center">
                            <Star size={18} className="mx-auto mb-1 text-yellow-600" />
                            <p className="text-lg font-black text-yellow-900 leading-tight">{selectedOrg.stats?.rating || '0.0'}</p>
                            <p className="text-[8px] font-bold text-yellow-400 uppercase tracking-tighter">Rating</p>
                        </div>
                    </div>

                    {/* About */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Tag size={14} className="text-orange-500" /> About Organization
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed font-medium bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                            {selectedOrg.description}
                        </p>
                    </div>

                    {/* Services/Topics */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <MessageCircle size={14} className="text-blue-500" /> Services Provided
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {selectedOrg.topics.map((topic, idx) => (
                                <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-xl border border-blue-100">
                                    {topic}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Coverage */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Globe size={14} className="text-green-500" /> Service Area
                        </h3>
                        <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                                {selectedOrg.coverageStates.map((state, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 text-[11px] font-bold rounded-lg border border-green-100">
                                        {state}
                                    </span>
                                ))}
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold italic">
                                Districts: {selectedOrg.coverageDistricts.join(', ')}
                            </p>
                        </div>
                    </div>

                    {/* Resources */}
                    {selectedOrg.resources && selectedOrg.resources.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Digital Resources</h3>
                            <div className="space-y-2">
                                {selectedOrg.resources.map((res, idx) => (
                                    <a
                                        key={idx}
                                        href={res.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-orange-200 hover:bg-orange-50/30 transition-all group"
                                    >
                                        <span className="text-xs font-bold text-gray-700 group-hover:text-orange-700">{res.label}</span>
                                        <ExternalLink size={14} className="text-gray-300 group-hover:text-orange-500" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-50 bg-gray-50/30">
                    <button
                        onClick={() => onDirectQuery(selectedOrg)}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-100 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        <MessageCircle size={20} fill="currentColor" />
                        Send Direct Query
                    </button>
                    <p className="text-[10px] text-gray-400 font-bold text-center mt-3 uppercase tracking-tighter">Response time: ~2-4 hours</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-transparent flex flex-col">
            <div className="p-6 border-b border-orange-50 bg-white/40">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Building2 className="text-orange-500" size={22} />
                    Organizations
                </h2>
                <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider">Verified Civic Partners</p>

                <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search local NGOs, services..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-medium shadow-inner"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-40 space-y-3 opacity-50">
                        <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
                        <p className="text-sm font-bold text-gray-400">Finding local support...</p>
                    </div>
                ) : filteredOrgs.length > 0 ? (
                    filteredOrgs.map(org => (
                        <div
                            key={org.id}
                            onClick={() => setSelectedOrg(org)}
                            className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm hover:shadow-md hover:border-orange-100 transition-all cursor-pointer group active:scale-98"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-black bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full uppercase tracking-tighter border border-orange-100/50">
                                    {org.type}
                                </span>
                                {org.queriesAnswered > 0 && (
                                    <span className="text-[9px] font-bold text-blue-500 flex items-center gap-1">
                                        <CheckCircle size={10} strokeWidth={3} /> {org.queriesAnswered} Answers
                                    </span>
                                )}
                            </div>
                            <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">{org.name}</h3>
                            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed font-medium italic">
                                {org.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-3">
                                {org.topics.slice(0, 2).map((t, i) => (
                                    <span key={i} className="text-[8px] font-black uppercase text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 opacity-60">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                            <Building2 size={32} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">No matching organizations</p>
                            <p className="text-xs text-gray-500 mt-1 font-medium italic">Try searching for different keywords or clear the search</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-orange-50/30 border-t border-orange-50">
                <button className="w-full bg-white border-2 border-orange-500/30 text-orange-600 font-black py-2.5 rounded-xl text-xs hover:bg-orange-500 hover:text-white transition-all shadow-sm active:scale-95 uppercase tracking-widest">
                    Register your Service
                </button>
            </div>
        </div>
    );
};

export default OrganizationsSidebar;
