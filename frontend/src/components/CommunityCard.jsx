import React from 'react';
import { MapPin, Phone, ExternalLink, MessageCircle } from 'lucide-react';

const CommunityCard = ({ community, onAskQuery }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5 mt-4 animate-fade-in">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        {community.type}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mt-1">{community.name}</h3>
                </div>
                <div className="flex items-center text-gray-500 text-xs font-semibold">
                    <MapPin size={14} className="mr-1" />
                    {community.coverageDistricts[0]}, {community.coverageStates[0]}
                </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {community.description}
            </p>

            <div className="space-y-2 mb-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Self-Service Resources</h4>
                {community.resources.map((res, i) => (
                    <a
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors group"
                    >
                        <span className="text-sm font-bold text-gray-700 group-hover:text-orange-900">{res.label}</span>
                        <ExternalLink size={16} className="text-gray-400 group-hover:text-orange-500" />
                    </a>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <a
                    href={`tel:${community.contactPhone}`}
                    className="flex items-center justify-center gap-2 border-2 border-orange-100 text-orange-600 font-bold py-3 rounded-xl hover:bg-orange-50 transition-colors"
                >
                    <Phone size={18} /> Call
                </a>
                <button
                    onClick={() => onAskQuery(community)}
                    className="flex items-center justify-center gap-2 bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 shadow-md shadow-orange-200 active:scale-95 transition-all"
                >
                    <MessageCircle size={18} /> Ask Community
                </button>
            </div>
        </div>
    );
};

export default CommunityCard;
