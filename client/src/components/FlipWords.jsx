import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export const FlipWords = ({
  words = ["Securely.", "Privately.", "Instantly.", "Accurately."],
  duration = 2500,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!words || words.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, duration);

    return () => clearInterval(timer);
  }, [words, duration]);

  const currentWord = words[currentIndex] || words[0];

  return (
    <span className="inline-block relative overflow-hidden align-baseline" style={{ verticalAlign: 'bottom' }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentWord}
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
          transition={{
            duration: 0.45,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={`inline-block font-extrabold tracking-tight ${className}`}
          style={{
            display: 'inline-block',
            background: 'var(--brand-gradient, linear-gradient(135deg, #0066CC 0%, #1976d2 100%))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'var(--brand-primary, #0066CC)',
          }}
        >
          {currentWord}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

