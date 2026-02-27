import React from 'react';
import { MapPin, Clock, XCircle, FileText } from 'lucide-react';

const LastMileCard = ({ officeData, language }) => {
    if (!officeData) return null;

    const { officeName, address, mapsLink, distanceKm, workingHours, avoidDays, documentsToCarry } = officeData;

    const labels = {
        "en-IN": { title: "Last Mile Info", where: "WHERE TO GO", bestTime: "BEST TIME TO VISIT", docs: "CARRY THESE DOCUMENTS", avoid: "AVOID VISITING ON" },
        "hi-IN": { title: "कहाँ जाना है", where: "पता", bestTime: "जाने का सही समय", docs: "ये दस्तावेज़ साथ ले जाएँ", avoid: "इन दिनों न जाएँ" }
    };
    const t = labels[language] || labels["hi-IN"];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 space-y-4">
            <div className="border-b border-gray-100 pb-2 mb-4">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <MapPin size={20} className="text-orange-500" /> {t.title}
                </h3>
            </div>

            <div>
                <h4 className="text-xs font-bold text-gray-400 capitalize mb-1">{t.where}</h4>
                <p className="text-gray-800 font-medium text-lg">{officeName}</p>
                <p className="text-gray-600 text-sm mt-1">{address} ({distanceKm} km away)</p>
                <a href={mapsLink} target="_blank" rel="noreferrer" className="text-blue-600 text-sm font-medium mt-1 inline-block hover:underline">
                    [Open in Maps]
                </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                    <h4 className="text-xs font-bold text-gray-400 capitalize mb-1 flex items-center gap-1"><Clock size={14} /> {t.bestTime}</h4>
                    <p className="text-gray-800 text-sm font-medium">{workingHours}</p>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-red-400 capitalize mb-1 flex items-center gap-1"><XCircle size={14} /> {t.avoid}</h4>
                    <p className="text-gray-800 text-sm font-medium">{avoidDays}</p>
                </div>
            </div>

            <div className="pt-2">
                <h4 className="text-xs font-bold text-gray-400 capitalize mb-2 flex items-center gap-1"><FileText size={14} /> {t.docs}</h4>
                <ul className="space-y-1">
                    {documentsToCarry && documentsToCarry.map((doc, idx) => (
                        <li key={idx} className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                            {doc}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default LastMileCard;
