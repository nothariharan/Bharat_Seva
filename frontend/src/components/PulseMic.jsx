import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Square } from 'lucide-react';

const PulseMic = ({ isListening, onClick }) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Animated Ripples (Only visible when listening) */}
      {isListening && (
        <>
          <motion.div
            className="absolute rounded-full bg-orange-400 opacity-20"
            animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            style={{ width: '100%', height: '100%' }}
          />
          <motion.div
            className="absolute rounded-full bg-orange-400 opacity-20"
            animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5, ease: "easeOut" }}
            style={{ width: '100%', height: '100%' }}
          />
        </>
      )}

      {/* The Main Button */}
      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.95 }}
        animate={{ 
            scale: isListening ? 1.1 : 1,
            backgroundColor: isListening ? '#EF4444' : '#F97316' // Red when recording, Orange when idle
        }}
        className="relative z-10 p-8 rounded-full shadow-xl transition-colors duration-300 flex items-center justify-center"
      >
        {isListening ? (
            <Square size={32} color="white" fill="white" />
        ) : (
            <Mic size={40} color="white" />
        )}
      </motion.button>
    </div>
  );
};

export default PulseMic;