import React, { useState } from 'react';
import { Mic, Camera } from 'lucide-react';
import ActionDashboard from './ActionDashboard';
import NoticeReader from './NoticeReader';

const PulseMic = ({ isListening, onClick }) => {
  return (
    <div className="relative flex justify-center items-center my-4">
      {isListening && (
        <div className="absolute w-48 h-48 bg-orange-200 rounded-full animate-ping opacity-50"></div>
      )}
      <button
        onClick={onClick}
        className={`relative z-10 w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border-8 ${isListening ? 'bg-orange-600 border-orange-200 scale-105' : 'bg-orange-500 border-white hover:bg-orange-600 hover:scale-105 active:scale-95'}`}
      >
        <Mic size={72} className="text-white drop-shadow-md" strokeWidth={2.5} />
      </button>
    </div>
  );
};

const SuggestionChips = ({ onSelect, suggestions }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-2">
      {suggestions.map((text, i) => (
        <button
          key={i}
          onClick={() => onSelect(text)}
          className="bg-white/80 backdrop-blur-sm border border-orange-200 hover:bg-orange-50 text-orange-900 px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm"
        >
          {text}
        </button>
      ))}
    </div>
  );
};

const LandingPage = ({
  isListening,
  onStartListening,
  transcript,
  response,
  loading,
  selectedLang,
  onLangChange,
  languages,
  onChipSelect
}) => {
  const [showReader, setShowReader] = useState(false);

  const labels = {
    "en-IN": { title: "Bharat Seva", hero: "Press the mic and tell me your problem", subtitle: "I will guide you step by step in your language.", processing: "Thinking...", readNotice: "Read a Letter for Me", suggestions: ["My widow pension has stopped", "How to apply for Awas Yojana?", "Find nearest BDO office"] },
    "hi-IN": { title: "भारत सेवा", hero: "माइक दबाएं और अपनी समस्या बताएं", subtitle: "मैं आपकी भाषा में कदम-दर-कदम मार्गदर्शन करूंगा।", processing: "सोच रहा हूँ...", readNotice: "मेरे लिए एक पत्र पढ़ें", suggestions: ["मेरी विधवा पेंशन रुक गई है", "आवास योजना के लिए आवेदन कैसे करें?", "नज़दीकी BDO कार्यालय खोजें"] },
    "te-IN": { title: "భారత్ సేవా", hero: "మైక్ నొక్కి మీ సమస్యను చెప్పండి", subtitle: "నేను మీ భాషలో మీకు దశలవారీగా మార్గనిర్దేశం చేస్తాను.", processing: "ఆలోచిస్తున్నాను...", readNotice: "నా కోసం ఒక లేఖ చదవండి", suggestions: ["నా వితంతు పెన్షన్ ఆగిపోయింది", "ఆవాస్ యోజన కోసం ఎలా దరఖాస్తు చేయాలి?", "సమీప BDO కార్యాలయాన్ని కనుగొనండి"] },
    "ta-IN": { title: "பாரத் சேவா", hero: "மைக்கை அழுத்தி உங்கள் சிக்கலை கூறுங்கள்", subtitle: "உங்கள் மொழியில் படிப்படியாக நான் வழிகாட்டுவேன்.", processing: "யோசிக்கிறேன்...", readNotice: "எனக்காக ஒரு கடிதத்தைப் படியுங்கள்", suggestions: ["எனது விதவை ஓய்வூதியம் நிறுத்தப்பட்டுள்ளது", "ஆவாஸ் யோஜனாவுக்கு எப்படி விண்ணப்பிப்பது?", "அருகிலுள்ள BDO அலுவலகத்தைக் கண்டறியவும்"] },
    "kn-IN": { title: "ಭಾರತ್ ಸೇವಾ", hero: "ಮೈಕ್ ಒತ್ತಿ ಮತ್ತು ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ಹೇಳಿ", subtitle: "ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ನಾನು ಹಂತ ಹಂತವಾಗಿ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತೇನೆ.", processing: "ಯೋಚಿಸುತ್ತಿರುವೆ...", readNotice: "ನನಗಾಗಿ ಒಂದು ಪತ್ರವನ್ನು ಓದಿ", suggestions: ["ನನ್ನ ವಿಧವಾ ವೇತನ ನಿಂತಿದೆ", "ಆವಾಸ್ ಯೋಜನೆಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸುವುದು ಹೇಗೆ?", "ಹತ್ತಿರದ BDO ಕಚೇರಿ ಹುಡುಕಿ"] },
    "ml-IN": { title: "ഭാരത് സേവ", hero: "മൈക്ക് അമർത്തി നിങ്ങളുടെ പ്രശ്നം പറയുക", subtitle: "നിങ്ങളുടെ ഭാഷയിൽ ഞാൻ ഘട്ടം ഘട്ടമായി നിങ്ങളെ നയിക്കും.", processing: "ചിന്തിക്കുന്നു...", readNotice: "എനിക്കായി ഒരു കത്ത് വായിക്കുക", suggestions: ["എന്റെ വിധവാ പെൻഷൻ നിലച്ചു", "ആവാസ് യോജനയ്ക്ക് എങ്ങനെ അപേക്ഷിക്കാം?", "ഏറ്റവും അടുത്തുള്ള BDO ഓഫീസ് കണ്ടെത്തുക"] },
    "bn-IN": { title: "ভারত সেবা", hero: "মাইক টিপুন এবং আপনার সমস্যার কথা বলুন", subtitle: "আমি আপনার ভাষায় ধাপে ধাপে আপনাকে গাইড করব।", processing: "ভাবছি...", readNotice: "আমার জন্য একটি চিঠি পড়ুন", suggestions: ["আমার বিধবা ভাতা বন্ধ হয়ে গেছে", "আবাস যোজনার জন্য কীভাবে আবেদন করব?", "নিকটবর্তী BDO অফিস খুঁজুন"] },
    "mr-IN": { title: "भारत सेवा", hero: "माईक दाबा आणि तुमची समस्या सांगा", subtitle: "मी तुम्हाला तुमच्या भाषेत टप्प्याटप्प्याने मार्गदर्शन करेन.", processing: "विचार करत आहे...", readNotice: "माझ्यासाठी एक पत्र वाचा", suggestions: ["माझे विधवा पेन्शन थांबले आहे", "आवास योजनेसाठी अर्ज कसा करावा?", "जवळचे BDO कार्यालय शोधा"] },
    "gu-IN": { title: "ભારત સેવા", hero: "માઇક દબાવો અને તમારી સમસ્યા જણાવો", subtitle: "હું તમને તમારી ભાષામાં પગલું દ્વારા પગલું માર્ગદર્શન આપીશ.", processing: "વિચારી રહ્યો છું...", readNotice: "મારા માટે એક પત્ર વાંચો", suggestions: ["મારું વિધવા પેન્શન બંધ થઈ ગયું છે", "આવાસ યોજના માટે અરજી કેવી રીતે કરવી?", "નજીકની BDO ઑફિસ શોધો"] },
    "pa-IN": { title: "ਭਾਰਤ ਸੇਵਾ", hero: "ਮਾਈਕ ਦਬਾਓ ਅਤੇ ਆਪਣੀ ਸਮੱਸਿਆ ਦੱਸੋ", subtitle: "ਮੈਂ ਤੁਹਾਡੀ ਭਾਸ਼ਾ ਵਿੱਚ ਕਦਮ-ਦਰ-ਕਦਮ ਤੁਹਾਡੀ ਅਗਵਾਈ ਕਰਾਂਗਾ।", processing: "ਸੋਚ ਰਿਹਾ ਹਾਂ...", readNotice: "ਮੇਰੇ ਲਈ ਇੱਕ ਚਿੱਠੀ ਪੜ੍ਹੋ", suggestions: ["ਮੇਰੀ ਵਿਧਵਾ ਪੈਨਸ਼ਨ ਰੁਕ ਗਈ ਹੈ", "ਆਵਾਸ ਯੋਜਨਾ ਲਈ ਅਰਜ਼ੀ ਕਿਵੇਂ ਦੇਣੀ ਹੈ?", "ਨਜ਼ਦੀਕੀ BDO ਦਫ਼ਤਰ ਲੱਭੋ"] },
    "or-IN": { title: "ଭାରତ ସେବା", hero: "ମାଇକ୍ ଦବାନ୍ତୁ ଏବଂ ଆପଣଙ୍କର ସମସ୍ୟା କୁହନ୍ତୁ", subtitle: "ମୁଁ ଆପଣଙ୍କ ଭାଷାରେ ପଦକ୍ଷେପ ଅନୁଯାୟୀ ମାର୍ଗଦର୍ଶନ କରିବି |", processing: "ଭାବୁଛି...", readNotice: "ମୋ ପାଇଁ ଗୋଟିଏ ଚିଠି ପଢ଼ନ୍ତୁ", suggestions: ["ମୋର ବିଧବା ପେନ୍ସନ୍ ବନ୍ଦ ହୋଇଯାଇଛି", "ଆବାସ ଯୋଜନା ପାଇଁ କିପରି ଆବେଦନ କରିବେ?", "ନିକଟତମ BDO ଅଫିସ୍ ଖୋଜନ୍ତୁ"] },
    "ur-IN": { title: "بھارت سیوا", hero: "مائیک دبائیں اور اپنا مسئلہ بتائیں", subtitle: "میں آپ کی زبان میں قدم بہ قدم آپ کی رہنمائی کروں گا۔", processing: "سوچ رہا ہوں...", readNotice: "میرے لیے ایک خط پڑھیں", suggestions: ["میری بیوہ پنشن بند ہو گئی ہے", "آواس یوجنا کے لیے کیسے اپلائی کریں؟", "قریبی بی ڈی او آفس تلاش کریں"] }
  };

  const t = labels[selectedLang.code] || labels["hi-IN"];

  if (response && !showReader) {
    return <ActionDashboard response={response} language={selectedLang.code} onNewSearch={() => window.location.reload()} />;
  }

  if (showReader) {
    return (
      <NoticeReader
        language={selectedLang}
        onClose={() => setShowReader(false)}
        onGuideMe={(action) => {
          setShowReader(false);
          onChipSelect(action); // Automatically submit query
        }}
      />
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[100dvh] px-4 py-4 relative overflow-hidden bg-orange-50/70"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%23f97316' fill-opacity='0.1'%3E%3Cpath d='M40 0C40 22.0914 22.0914 40 0 40C22.0914 40 40 57.9086 40 80C40 57.9086 57.9086 40 80 40C57.9086 40 40 22.0914 40 0ZM40 20C40 31.0457 31.0457 40 20 40C31.0457 40 40 48.9543 40 60C40 48.9543 48.9543 40 60 40C48.9543 40 40 31.0457 40 20Z'/%3E%3C/g%3E%3C/svg%3E")`
      }}
    >
      <div className="absolute top-4 right-4 z-20">
        <select
          value={selectedLang.code}
          onChange={(e) => onLangChange(languages.find(l => l.code === e.target.value))}
          className="bg-white border border-orange-200 text-orange-900 text-sm font-bold rounded-full px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none cursor-pointer pr-8 bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23F97316%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[position:calc(100%_-_10px)_center] bg-[length:10px]"
        >
          {languages.map(l => (
            <option key={l.code} value={l.code} className="text-gray-900 bg-white">{l.label}</option>
          ))}
        </select>
      </div>

      <div className="w-full max-w-2xl flex flex-col items-center text-center mt-2 z-10">

        <h1
          className="text-5xl md:text-6xl font-normal text-gray-900 tracking-tight mb-4 select-none"
          style={{
            fontFamily: 'Samarkan',
            backgroundImage: 'linear-gradient(to right, #DAA520, #FFD700, #DAA520)',
            backgroundSize: '200% auto',
            color: '#DAA520',
            WebkitBackgroundClip: 'text',
            textShadow: '0px 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          Bharat Seva
        </h1>

        <p className="text-xl md:text-2xl font-bold text-orange-600 mb-1 bg-white/60 px-4 py-1 rounded-full backdrop-blur-sm shadow-sm inline-block">
          {t.hero}
        </p>
        <p className="text-base md:text-lg text-gray-700 font-semibold mb-2 mt-2 bg-white/50 backdrop-blur px-3 py-1 rounded-full">
          {t.subtitle}
        </p>

        {transcript && !loading && (
          <div className="w-full max-w-md bg-white/90 backdrop-blur p-4 rounded-xl shadow-sm border-l-4 border-orange-500 mb-6 animate-fade-in text-left">
            <p className="font-bold text-gray-800 text-lg italic leading-relaxed text-center">"{transcript}"</p>
          </div>
        )}

        {loading ? (
          <div className="my-8 flex flex-col items-center justify-center animate-fade-in bg-white/80 p-6 rounded-2xl backdrop-blur-sm shadow-sm">
            <div className="flex gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <p className="font-bold text-orange-800 text-lg">{t.processing}</p>
          </div>
        ) : (
          <div className="my-4">
            <PulseMic isListening={isListening} onClick={onStartListening} />
          </div>
        )}

        {!isListening && !loading && (
          <div className="w-full max-w-lg flex flex-col items-center">
            <SuggestionChips onSelect={onChipSelect} suggestions={t.suggestions} />

            <div className="mt-6 w-full px-4">
              <button
                onClick={() => setShowReader(true)}
                className="w-full bg-blue-600/90 backdrop-blur hover:bg-blue-700 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-md active:scale-95 transition-transform text-base md:text-lg"
              >
                <Camera size={20} /> {t.readNotice}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;