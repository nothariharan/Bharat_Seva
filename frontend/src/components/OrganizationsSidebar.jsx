import React from 'react';
import { Building2, Search } from 'lucide-react';

const OrganizationsSidebar = ({ organizations = [], loading = false }) => {
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
                        placeholder="Search local NGOs..."
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-40 space-y-3 opacity-50">
                        <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
                        <p className="text-sm font-bold text-gray-400">Finding local support...</p>
                    </div>
                ) : organizations.length > 0 ? (
                    organizations.map(org => (
                        <div key={org.id} className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm hover:shadow-md hover:border-orange-200 transition-all cursor-pointer group">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-bold bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                    {org.type}
                                </span>
                            </div>
                            <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">{org.name}</h3>
                            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed font-medium">
                                {org.description}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 opacity-60">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                            <Building2 size={32} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">No organizations yet</p>
                            <p className="text-xs text-gray-500 mt-1 font-medium italic">Ask a query to find communities matching your needs</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-orange-50/30 border-t border-orange-50">
                <button className="w-full bg-white border-2 border-orange-500/50 text-orange-600 font-bold py-2 rounded-xl text-xs hover:bg-orange-500 hover:text-white transition-all shadow-sm">
                    Register your Service
                </button>
            </div>
        </div>
    );
};

export default OrganizationsSidebar;
