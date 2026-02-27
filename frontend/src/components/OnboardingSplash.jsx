import React, { useState, useEffect } from 'react';

const ONBOARDING_LANGUAGES = [
    "Welcome", "स्वागतम", "స్వాగతం", "வரவேற்பு", "ಸ್ವಾಗತ",
    "સ્વાગત", "ਸਵਾਗਤ ਹੈ", "স্বাগতম", "ସ୍ଵାଗତମ୍", "خوش آمدید"
];

const OnboardingSplash = ({ onComplete }) => {
    const [langIndex, setLangIndex] = useState(0);
    const [fade, setFade] = useState(true);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (langIndex >= ONBOARDING_LANGUAGES.length) {
            setIsClosing(true);
            const closeTimer = setTimeout(() => {
                onComplete();
            }, 700); // Wait for the slide-up animation to finish
            return () => clearTimeout(closeTimer);
        }

        const timer = setTimeout(() => {
            setFade(false); // trigger fade out
            setTimeout(() => {
                setLangIndex(prev => prev + 1);
                setFade(true); // trigger fade in
            }, 30); // very fast transition out
        }, 150); // faster than before (was 250ms)

        return () => clearTimeout(timer);
    }, [langIndex, onComplete]);

    if (langIndex >= ONBOARDING_LANGUAGES.length && !isClosing) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] transition-transform duration-700 ease-in-out ${isClosing ? '-translate-y-full' : 'translate-y-0'}`}
        >
            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                <div
                    className={`text-yellow-400 text-5xl sm:text-7xl font-semibold tracking-wide transition-opacity duration-100 ${fade && !isClosing ? 'opacity-100' : 'opacity-0'}`}
                    style={{ textShadow: '0 0 15px rgba(255,255,0,0.6)' }}
                >
                    {ONBOARDING_LANGUAGES[Math.min(langIndex, ONBOARDING_LANGUAGES.length - 1)]}
                </div>
            </div>
        </div>
    );
};

export default OnboardingSplash;
