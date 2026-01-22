import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { greetingsList } from "../data/greetings";

// CHANGED: Reduced to 3 seconds for a faster pace
const TOTAL_INTRO_DURATION = 3000; 

// Calculate exact duration per word to fit ALL of them in the total time
const wordDuration = TOTAL_INTRO_DURATION / greetingsList.length; 

const WelcomeIntro = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // 1. Cycle through greetings at the calculated speed
    const wordTimer = setInterval(() => {
      setCurrentIndex((prev) => {
        // Stop cycling if we've reached the end of the list
        if (prev === greetingsList.length - 1) {
            return prev; 
        }
        return prev + 1;
      });
    }, wordDuration);

    // 2. End the intro exactly when the total time is up
    const finishTimer = setTimeout(() => {
      setIsFinished(true);
      setTimeout(() => {
        onComplete?.();
      }, 800); 
    }, TOTAL_INTRO_DURATION);

    return () => {
      clearInterval(wordTimer);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "#0a0a0a" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <AnimatePresence mode="wait">
            <motion.h1
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, position: "absolute" }} 
              // Dynamic transition speed: kept snappy relative to word duration
              transition={{ duration: (wordDuration / 1000) * 0.5, ease: "linear" }} 
              style={{
                color: "#FFD700", 
                fontFamily: `"Noto Sans", system-ui, sans-serif`,
                letterSpacing: "0.05em",
                fontWeight: 500,
                textAlign: "center",
              }}
              className="text-4xl md:text-6xl flex items-center gap-2"
            >
              {greetingsList[currentIndex]?.text}
              {greetingsList[currentIndex]?.lang === "Arabic" && (
                <span style={{ fontSize: "0.6em" }}>•</span>
              )}
            </motion.h1>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeIntro;