import { useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Sparkles } from "./ui/sparkles";
import { TimelineContent } from "./ui/timeline-animation";
import { VerticalCutReveal } from "./ui/vertical-cut-reveal";
import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { HiCheck, HiSparkles, HiArrowRight, HiShieldCheck } from "react-icons/hi";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// PromoSecure pricing plans with tailored INR pricing
const plans = [
  {
    name: "Trial",
    description:
      "Explore all features free for 14 days — no credit card required.",
    price: 0,
    yearlyPrice: 0,
    buttonText: "Request Demo Access",
    buttonVariant: "outline",
    popular: false,
    badge: null,
    includes: [
      "What's included:",
      "Full access to all features",
      "Up to 3 Promoters",
      "100 photos included",
      "Pre-populated sample data",
      "Email support",
      "AI face blurring",
    ],
  },
  {
    name: "Pro",
    description:
      "Best for growing agencies — special 50% discount for a limited time.",
    price: 1249,
    yearlyPrice: 11990,
    buttonText: "Start Pro Plan",
    buttonVariant: "default",
    popular: true,
    badge: "50% OFF",
    includes: [
      "Everything in Trial, plus:",
      "Unlimited Managers & Promoters",
      "Unlimited photos",
      "Advanced analytics dashboard",
      "Priority WhatsApp support",
      "Full API access",
      "Custom agency branding",
      "Instant Excel & PDF exports",
    ],
  },
  {
    name: "Enterprise",
    description:
      "Custom solutions for large organizations with dedicated SLA & account manager.",
    price: null,
    yearlyPrice: null,
    buttonText: "Contact Sales",
    buttonVariant: "outline",
    popular: false,
    badge: null,
    includes: [
      "Everything in Pro, plus:",
      "Custom integrations & webhooks",
      "Dedicated account manager",
      "99.9% uptime SLA guarantee",
      "On-premise / private cloud deploy",
      "Live team training & onboarding",
      "Full white-label portal",
      "24/7 priority phone support",
    ],
  },
];

/* ─── Ultra High-Contrast, Crystal Clear Pricing Switch ─── */
const PricingSwitch = ({ onSwitch }) => {
  const [selected, setSelected] = useState("0");

  const handleSwitch = (value) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className="flex justify-center my-3 sm:my-5">
      <div
        className="relative z-10 mx-auto flex items-center w-fit rounded-full border border-neutral-700/90 p-1 sm:p-1.5 backdrop-blur-lg shadow-2xl shadow-black/80"
        style={{ backgroundColor: "#121212" }}
      >
        <button
          type="button"
          onClick={() => handleSwitch("0")}
          style={{ background: "transparent", color: selected === "0" ? "#ffffff" : "#a3a3a3" }}
          className={cn(
            "relative z-10 h-9 sm:h-10 rounded-full px-5 sm:px-7 text-xs sm:text-sm font-bold transition-colors duration-200 cursor-pointer flex items-center justify-center border-0 outline-none select-none",
            selected === "0" ? "!text-white font-extrabold" : "!text-neutral-400 hover:!text-white font-medium"
          )}
        >
          {selected === "0" && (
            <motion.span
              layoutId="pricing-switch-pill"
              className="absolute inset-0 rounded-full border-2 border-blue-400 shadow-lg shadow-blue-600/60 z-0"
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                backgroundColor: "#2563eb"
              }}
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
            />
          )}
          <span className="relative z-10 !text-white">Monthly</span>
        </button>

        <button
          type="button"
          onClick={() => handleSwitch("1")}
          style={{ background: "transparent", color: selected === "1" ? "#ffffff" : "#a3a3a3" }}
          className={cn(
            "relative z-10 h-9 sm:h-10 rounded-full px-5 sm:px-7 text-xs sm:text-sm font-bold transition-colors duration-200 cursor-pointer flex items-center justify-center gap-1.5 border-0 outline-none select-none",
            selected === "1" ? "!text-white font-extrabold" : "!text-neutral-400 hover:!text-white font-medium"
          )}
        >
          {selected === "1" && (
            <motion.span
              layoutId="pricing-switch-pill"
              className="absolute inset-0 rounded-full border-2 border-blue-400 shadow-lg shadow-blue-600/60 z-0"
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                backgroundColor: "#2563eb"
              }}
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
            />
          )}
          <span className="relative z-10 !text-white">Yearly</span>
          <span
            className="relative z-10 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-300 border border-emerald-400/40 rounded-full tracking-tight"
            style={{ backgroundColor: "rgba(16, 185, 129, 0.25)" }}
          >
            50% OFF
          </span>
        </button>
      </div>
    </div>
  );
};

/* ─── Main PromoSecure Pricing Section ─── */
export default function PromoSecurePricing({ onPlanAction, onScrollToDemo }) {
  const [isYearly, setIsYearly] = useState(false);
  const pricingRef = useRef(null);

  const revealVariants = {
    visible: (i) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.2,
        duration: 0.45,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const togglePricingPeriod = (value) =>
    setIsYearly(Number.parseInt(value) === 1);

  const handlePlanAction = (plan) => {
    if (plan.name === "Trial" || plan.name === "Enterprise") {
      onScrollToDemo?.();
    } else {
      onPlanAction?.(plan);
    }
  };

  return (
    <div
      className="min-h-screen w-full relative bg-black overflow-hidden select-none"
      ref={pricingRef}
      style={{ backgroundColor: "#000000" }}
    >
      {/* ── Background Grid + Sparkles ── */}
      <TimelineContent
        animationNum={4}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="absolute top-0 left-0 right-0 h-96 w-full overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)] pointer-events-none z-0"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff2c_1px,transparent_1px),linear-gradient(to_bottom,#3a3a3a01_1px,transparent_1px)] bg-[size:70px_80px]" />
        <Sparkles
          density={1200}
          direction="bottom"
          speed={0.9}
          color="#FFFFFF"
          className="absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)]"
        />
      </TimelineContent>

      {/* ── Dual Blue Glow Ellipses (Centered and safely clipped) ── */}
      <TimelineContent
        animationNum={5}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="absolute left-0 top-[-100px] w-full h-[110vh] overflow-hidden pointer-events-none z-0"
      >
        <div className="relative w-full h-full">
          <div
            className="absolute left-1/2 -translate-x-1/2 top-0 w-[600px] sm:w-[1000px] md:w-[1400px] lg:w-[1800px] h-[600px] sm:h-[1000px] md:h-[1400px] lg:h-[1800px] rounded-full pointer-events-none"
            style={{
              border: "160px solid #3131f5",
              filter: "blur(90px)",
              WebkitFilter: "blur(90px)",
              opacity: 0.85,
            }}
          />
          <div
            className="absolute left-1/2 -translate-x-1/2 top-0 w-[600px] sm:w-[1000px] md:w-[1400px] lg:w-[1800px] h-[600px] sm:h-[1000px] md:h-[1400px] lg:h-[1800px] rounded-full pointer-events-none"
            style={{
              border: "160px solid #3131f5",
              filter: "blur(90px)",
              WebkitFilter: "blur(90px)",
              opacity: 0.85,
            }}
          />
        </div>
      </TimelineContent>

      {/* ── Radial Blue Ambient Glow ── */}
      <div
        className="absolute top-0 left-[5%] right-[5%] w-[90%] h-[700px] pointer-events-none z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 30%, #206ce8 0%, transparent 65%)",
          opacity: 0.45,
          mixBlendMode: "screen",
        }}
      />

      {/* ── Header ── */}
      <article className="text-center mb-6 pt-20 sm:pt-28 md:pt-32 max-w-3xl mx-auto space-y-3 px-4 relative z-20">
        <div
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1 backdrop-blur-sm"
          style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
        >
          <HiSparkles className="text-blue-400" />
          <span>Flexible Pricing</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
          <VerticalCutReveal
            splitBy="words"
            staggerDuration={0.12}
            staggerFrom="first"
            reverse={true}
            containerClassName="justify-center text-center flex-wrap"
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 40,
              delay: 0,
            }}
          >
            Plans that work best for your team
          </VerticalCutReveal>
        </h2>

        <TimelineContent
          as="p"
          animationNum={0}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="text-neutral-300 text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed"
        >
          Trusted by promotional agencies across India. Simple transparent pricing with zero hidden fees.
        </TimelineContent>

        <TimelineContent
          as="div"
          animationNum={1}
          timelineRef={pricingRef}
          customVariants={revealVariants}
        >
          <PricingSwitch onSwitch={togglePricingPeriod} />
        </TimelineContent>
      </article>

      {/* ── Plan Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 max-w-5xl gap-6 py-6 mx-auto px-4 sm:px-6 relative z-20">
        {plans.map((plan, index) => {
          const isPro = plan.popular;
          const displayPrice = isYearly ? plan.yearlyPrice : plan.price;

          return (
            <TimelineContent
              key={plan.name}
              as="div"
              animationNum={2 + index}
              timelineRef={pricingRef}
              customVariants={revealVariants}
              className="flex flex-col"
            >
              <Card
                className={cn(
                  "relative flex flex-col justify-between h-full rounded-2xl transition-all duration-300",
                  isPro
                    ? "border-2 border-blue-500/80 shadow-[0_0_50px_rgba(37,99,235,0.45)] ring-1 ring-blue-400/40 md:-translate-y-2"
                    : "border border-neutral-800 hover:border-neutral-700 shadow-2xl shadow-black/80"
                )}
                style={{
                  backgroundColor: isPro ? "#111116" : "#0d0d10",
                  backgroundImage: isPro
                    ? "linear-gradient(180deg, #161622 0%, #0d0d13 100%)"
                    : "linear-gradient(180deg, #141416 0%, #09090b 100%)",
                }}
              >
                {/* Popular / Discount Badges */}
                {isPro && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30">
                    <span
                      className="text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-lg shadow-red-500/40 uppercase tracking-wide"
                      style={{ background: "linear-gradient(135deg, #dc2626, #ea580c)" }}
                    >
                      50% OFF
                    </span>
                    <span
                      className="text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-lg shadow-blue-500/40 uppercase tracking-wide"
                      style={{ background: "linear-gradient(135deg, #2563eb, #4f46e5)" }}
                    >
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader className="text-left p-6 sm:p-7 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      {plan.name}
                    </h3>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 my-3">
                    {displayPrice === null ? (
                      <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        Custom
                      </span>
                    ) : (
                      <>
                        <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-baseline">
                          <span className="text-2xl sm:text-3xl mr-0.5 text-blue-400">₹</span>
                          <NumberFlow
                            value={displayPrice}
                            className="text-3xl sm:text-4xl font-extrabold text-white"
                          />
                        </span>
                        <span className="text-neutral-400 text-xs sm:text-sm font-medium">
                          {plan.price === 0
                            ? "/ 14 days"
                            : isYearly
                            ? "/ year"
                            : "/ month"}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Savings hint for yearly */}
                  {isPro && isYearly && (
                    <div className="inline-block mb-2">
                      <span
                        className="text-xs font-semibold text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-md"
                        style={{ backgroundColor: "rgba(16, 185, 129, 0.15)" }}
                      >
                        Save ₹{(plan.price * 12 - plan.yearlyPrice).toLocaleString("en-IN")} annually
                      </span>
                    </div>
                  )}

                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed min-h-[38px]">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="p-6 sm:p-7 pt-2 flex flex-col justify-between flex-grow">
                  {/* Action Button - 100% Solid Contrast, No Default White Background */}
                  <button
                    type="button"
                    onClick={() => handlePlanAction(plan)}
                    style={{
                      backgroundColor: isPro ? "#2563eb" : "#202025",
                      backgroundImage: isPro
                        ? "linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #4f46e5 100%)"
                        : "linear-gradient(180deg, #2a2a32 0%, #18181c 100%)",
                      color: "#ffffff",
                      border: isPro ? "1px solid rgba(147, 197, 253, 0.6)" : "1px solid #3f3f46",
                    }}
                    className={cn(
                      "w-full py-3.5 px-5 text-sm sm:text-base font-extrabold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg",
                      isPro
                        ? "!text-white shadow-blue-600/50 hover:shadow-blue-500/70 hover:scale-[1.02]"
                        : "!text-white hover:border-neutral-400 hover:scale-[1.02]"
                    )}
                  >
                    <span className="!text-white font-bold tracking-wide">{plan.buttonText}</span>
                    <HiArrowRight className="text-base !text-white flex-shrink-0" />
                  </button>

                  {/* Feature Checklist */}
                  <div className="space-y-3 pt-5 mt-4 border-t border-neutral-800/90">
                    <h4 className="font-semibold text-xs sm:text-sm text-neutral-200 tracking-wide uppercase">
                      {plan.includes[0]}
                    </h4>
                    <ul className="space-y-2.5">
                      {plan.includes.slice(1).map((feature, fi) => (
                        <li
                          key={fi}
                          className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300"
                        >
                          <span
                            className={cn(
                              "h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                              isPro
                                ? "text-blue-400 border border-blue-500/40"
                                : "text-neutral-400 border border-neutral-700"
                            )}
                            style={{
                              backgroundColor: isPro ? "rgba(59, 130, 246, 0.2)" : "rgba(38, 38, 38, 0.8)",
                            }}
                          >
                            <HiCheck className="text-[10px]" />
                          </span>
                          <span className="leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TimelineContent>
          );
        })}
      </div>

      {/* ── Trust Security Note Footer ── */}
      <div className="text-center pb-12 pt-4 relative z-20 px-4">
        <p
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-neutral-400 border border-neutral-800/80 px-4 py-2 rounded-full backdrop-blur-md"
          style={{ backgroundColor: "rgba(18, 18, 18, 0.7)" }}
        >
          <HiShieldCheck className="text-emerald-400 text-base" />
          <span>Enterprise Grade Privacy • Cancel Anytime • Instant Activation</span>
        </p>
      </div>
    </div>
  );
}
