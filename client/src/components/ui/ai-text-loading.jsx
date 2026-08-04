"use client";

/**
 * @author: @kokonutui
 * @description: AI Text Loading
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function AITextLoading({
  texts = [
    "Loading PromoSecure...",
    "Securing Privacy...",
    "Initializing AI Models...",
    "Preparing Dashboard...",
    "Almost Ready...",
  ],
  className,
  interval = 1800,
}) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval, texts.length]);

  return (
    <div className="flex items-center justify-center p-4 sm:p-8">
      <motion.div
        animate={{ opacity: 1 }}
        className="relative w-full px-4 py-2"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTextIndex}
            initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              backgroundPosition: ["200% center", "-200% center"],
            }}
            exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
            transition={{
              opacity: { duration: 0.35 },
              y: { duration: 0.35 },
              filter: { duration: 0.35 },
              backgroundPosition: {
                duration: 3,
                ease: "linear",
                repeat: Infinity,
              },
            }}
            className={cn(
              "flex min-w-max justify-center whitespace-nowrap bg-[length:200%_100%] bg-gradient-to-r from-white via-blue-400 to-white bg-clip-text font-bold text-2xl sm:text-3xl text-transparent select-none tracking-tight",
              className
            )}
            style={{
              backgroundImage: "linear-gradient(90deg, #ffffff 0%, #60a5fa 50%, #ffffff 100%)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {texts[currentTextIndex]}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
