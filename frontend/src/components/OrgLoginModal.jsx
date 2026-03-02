import React, { useState } from 'react';
import { X, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

const OrgLoginModal = ({ isOpen, onClose, onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Mock Authentication for Hackathon
        setTimeout(() => {
            if (email === 'admin@kisan.org' && password === 'password123') {
                onLogin({
                    name: "Nashik Kisan Kendra",
                    district: "Nashik",
                    state: "Maharashtra",
                    email: email
                });
                onClose();
            } else {
                setError('Invalid credentials. Hint: admin@kisan.org / password123');
            }
            setLoading(false);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                <div className="bg-orange-500 p-8 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                    <div className="mt-4">
                        <h2 className="text-3xl font-extrabold">Organization Login</h2>
                        <p className="text-orange-100 font-medium mt-1">Access your service dashboard</p>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="p-8 space-y-6">
                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 animate-shake">
                            <AlertCircle size={20} className="shrink-0" />
                            <p className="text-sm font-bold">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Organization Email"
                                required
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                required
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] disabled:opacity-70 text-white font-extrabold py-4 rounded-2xl shadow-xl shadow-orange-100 transition-all flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={24} className="animate-spin" />
                                Authenticating...
                            </>
                        ) : (
                            'Log In to Dashboard'
                        )}
                    </button>

                    <div className="text-center">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                            Official Bharat Seva Partners Only
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrgLoginModal;
