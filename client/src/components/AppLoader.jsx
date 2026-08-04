import { motion } from 'framer-motion';
import { HiShieldCheck } from 'react-icons/hi';
import AITextLoading from './ui/ai-text-loading';

export default function AppLoader({
  texts = [
    "Loading PromoSecure...",
    "Securing Privacy...",
    "Initializing AI Models...",
    "Preparing Dashboard...",
    "Almost Ready...",
  ],
  subtitle = "Enterprise-Grade Privacy-First Verification"
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black select-none overflow-hidden">
      {/* Background ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(37,99,235,0.22) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Brand Icon with Pulse Effect */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative mb-4"
      >
        <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-[0_0_40px_rgba(37,99,235,0.6)] border border-blue-400/40">
          <HiShieldCheck className="w-11 h-11 text-white" />
        </div>
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-2xl border-2 border-blue-400 pointer-events-none"
        />
      </motion.div>

      {/* Shimmer AI Text Loading */}
      <AITextLoading texts={texts} interval={1800} />

      {/* Subtitle */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.3 }}
          className="text-xs sm:text-sm text-neutral-400 font-medium tracking-wide mt-[-8px] text-center px-4"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
