import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, TrendingUp, MapPin, AlertTriangle, Users, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const JanataPulse = ({ selectedLang, onMaximize }) => {
    const [pulseData, setPulseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedAlert, setSelectedAlert] = useState(null);

    useEffect(() => {
        const fetchPulse = async () => {
            try {
                const res = await axios.get('http://localhost:3000/api/pulse');
                setPulseData(res.data);
                // Select the first critical alert if any
                const critical = res.data.alerts.find(a => a.status === 'CRITICAL');
                if (critical) setSelectedAlert(critical);
            } catch (err) {
                console.error("Failed to fetch pulse data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPulse();
        const interval = setInterval(fetchPulse, 30000); // Polling every 30s
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-white/50 backdrop-blur-sm">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-orange-900 font-bold">Aggregating Citizen Pulse...</p>
            </div>
        );
    }

    const criticalAlerts = pulseData?.alerts.filter(a => a.status === 'CRITICAL') || [];

    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-hidden font-sans">
            {/* Header */}
            <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 rounded-xl">
                            <ShieldAlert className="text-orange-600" size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800">Janata Pulse</h2>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Citizen Mood & Crisis Detection (Last 24h)</p>
                </div>
                {onMaximize && (
                    <button
                        onClick={onMaximize}
                        className="p-3 bg-slate-100 hover:bg-orange-50 text-slate-600 hover:text-orange-600 rounded-xl transition-all shadow-sm group"
                    >
                        <ExternalLink size={20} className="group-hover:scale-110 transition-transform" />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <TrendingUp className="text-blue-500 mb-2" size={20} />
                        <div className="text-2xl font-black text-slate-800">{pulseData?.totalQueries24h || 0}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Citizen Queries</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <AlertTriangle className="text-red-500 mb-2" size={20} />
                        <div className="text-2xl font-black text-slate-800">{criticalAlerts.length}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Active Alerts</div>
                    </div>
                </div>

                {/* Heatmap Overlay */}
                <div className="relative bg-orange-50 aspect-[4/3] rounded-3xl overflow-hidden shadow-inner group border-2 border-orange-100 flex items-center justify-center">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/India_location_map.svg/1024px-India_location_map.svg.png"
                        alt="India Map"
                        className="absolute inset-0 w-full h-full object-contain opacity-20 pointer-events-none"
                    />

                    {/* Pulsing Markers */}
                    {pulseData?.alerts.map((alert, idx) => {
                        const isCritical = alert.status === 'CRITICAL';
                        // Map random positions for demo since we don't have real map projections
                        const left = alert.lng ? `${((alert.lng - 68) / (97 - 68)) * 100}%` : `${20 + (idx * 15) % 60}%`;
                        const top = alert.lat ? `${(100 - ((alert.lat - 8) / (37 - 8)) * 100)}%` : `${30 + (idx * 20) % 50}%`;

                        return (
                            <motion.div
                                key={idx}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2"
                                style={{ left, top }}
                                onClick={() => setSelectedAlert(alert)}
                            >
                                {isCritical && (
                                    <div className="absolute w-12 h-12 -left-6 -top-6 bg-red-500/30 rounded-full animate-ping"></div>
                                )}
                                <div className={`relative w-4 h-4 rounded-full border-2 border-white shadow-lg ${isCritical ? 'bg-red-500' : 'bg-orange-400'}`}></div>

                                <AnimatePresence>
                                    {selectedAlert === alert && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white p-2 rounded-lg shadow-xl border border-slate-200 whitespace-nowrap z-10"
                                        >
                                            <div className="text-[10px] font-black text-slate-800">{alert.district}</div>
                                            <div className="text-[8px] font-bold text-red-600 uppercase">{alert.topic}</div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}

                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live Crisis Heatmap</span>
                        </div>
                    </div>
                </div>

                {/* Crisis Feed */}
                <div className="space-y-3">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        Active Issues
                        <span className="w-2 h-2 bg-slate-300 rounded-full"></span>
                    </h3>

                    {pulseData?.alerts.length === 0 ? (
                        <div className="p-10 text-center bg-white rounded-2xl border border-slate-100">
                            <TrendingUp className="mx-auto text-slate-200 mb-2" size={32} />
                            <p className="text-slate-400 text-xs font-bold">No significant clusters detected yet.</p>
                        </div>
                    ) : (
                        pulseData.alerts.map((alert, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedAlert(alert)}
                                className={`group p-4 rounded-2xl border transition-all cursor-pointer ${selectedAlert === alert ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-50' : 'bg-white border-slate-200 hover:border-orange-300 shadow-sm'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-slate-800">{alert.district}</span>
                                            {alert.status === 'CRITICAL' && (
                                                <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">Red Alert</span>
                                            )}
                                        </div>
                                        <div className="text-xs font-bold text-slate-500">{alert.topic}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-black text-slate-800">{alert.count}</div>
                                        <div className="text-[8px] font-bold text-slate-400 uppercase">Queries</div>
                                    </div>
                                </div>

                                {selectedAlert === alert && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="mt-3 pt-3 border-t border-slate-100"
                                    >
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Sample Queries:</p>
                                        <div className="space-y-1">
                                            {alert.queries.slice(0, 3).map((q, i) => (
                                                <div key={i} className="text-xs bg-slate-50 p-2 rounded-lg text-slate-700 border border-slate-100 italic">
                                                    "{q.length > 60 ? q.substring(0, 60) + '...' : q}"
                                                </div>
                                            ))}
                                        </div>
                                        <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                                            Send Notification <ExternalLink size={14} />
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default JanataPulse;
