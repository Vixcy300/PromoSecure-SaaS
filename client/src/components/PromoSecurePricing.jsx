import { useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Sparkles } from "./ui/sparkles";
import { TimelineContent } from "./ui/timeline-animation";
import { VerticalCutReveal } from "./ui/vertical-cut-reveal";
import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// PromoSecure plans – INR pricing
const plans = [
  {
    name: "Trial",
    description:
      "Explore all features free for 14 days — no credit card required.",
    price: 0,
    yearlyPrice: 0,
    buttonText: "Request Demo Access",
    buttonVariant: "outline",
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
      "Best for growing agencies — 50% off for a limited time.",
    price: 1249,
    yearlyPrice: 11990,
    buttonText: "Start Pro Plan",
    buttonVariant: "default",
    popular: true,
    includes: [
      "Everything in Trial, plus:",
      "Unlimited Managers & Promoters",
      "Unlimited photos",
      "Advanced analytics dashboard",
      "Priority WhatsApp support",
      "API access",
      "Custom branding",
      "Export to Excel / PDF",
    ],
  },
  {
    name: "Enterprise",
    description:
      "Custom solutions for large organizations with dedicated SLA.",
    price: null,
    yearlyPrice: null,
    buttonText: "Contact Sales",
    buttonVariant: "outline",
    includes: [
      "Everything in Pro, plus:",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "On-premise deployment",
      "Training & onboarding",
      "White-label option",
      "24 / 7 phone support",
    ],
  },
];

/* ─── Pricing Switch ─── */
const PricingSwitch = ({ onSwitch }) => {
  const [selected, setSelected] = useState("0");

  const handleSwitch = (value) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className="flex justify-center">
      <div className="relative z-10 mx-auto flex w-fit rounded-full bg-neutral-900 border border-gray-700 p-1">
        <button
          onClick={() => handleSwitch("0")}
          className={cn(
            "relative z-10 w-fit h-10 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
            selected === "0" ? "text-white" : "text-gray-200"
          )}
        >
          {selected === "0" && (
            <motion.span
              layoutId="switch"
              className="absolute top-0 left-0 h-10 w-full rounded-full border-4 shadow-sm shadow-blue-600 border-blue-600 bg-gradient-to-t from-blue-500 to-blue-600"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">Monthly</span>
        </button>

        <button
          onClick={() => handleSwitch("1")}
          className={cn(
            "relative z-10 w-fit h-10 flex-shrink-0 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
            selected === "1" ? "text-white" : "text-gray-200"
          )}
        >
          {selected === "1" && (
            <motion.span
              layoutId="switch"
              className="absolute top-0 left-0 h-10 w-full rounded-full border-4 shadow-sm shadow-blue-600 border-blue-600 bg-gradient-to-t from-blue-500 to-blue-600"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2">Yearly</span>
        </button>
      </div>
    </div>
  );
};

/* ─── Main Component ─── */
export default function PromoSecurePricing({ onPlanAction, onScrollToDemo }) {
  const [isYearly, setIsYearly] = useState(false);
  const pricingRef = useRef(null);

  const revealVariants = {
    visible: (i) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.4,
        duration: 0.5,
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
      className="min-h-screen mx-auto relative bg-black overflow-x-hidden"
      ref={pricingRef}
    >
      {/* ── Grid lines + Sparkles background ── */}
      <TimelineContent
        animationNum={4}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="absolute top-0 h-96 w-screen overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)]"
      >
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#ffffff2c_1px,transparent_1px),linear-gradient(to_bottom,#3a3a3a01_1px,transparent_1px)] bg-[size:70px_80px]" />
        <Sparkles
          density={1800}
          direction="bottom"
          speed={1}
          color="#FFFFFF"
          className="absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)]"
        />
      </TimelineContent>

      {/* ── Blue glow ellipses (exact #3131f5 from reference) ── */}
      <TimelineContent
        animationNum={5}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="absolute left-0 top-[-114px] w-full h-[113.625vh] flex flex-col items-start justify-start content-start flex-none flex-nowrap gap-2.5 overflow-hidden p-0 z-0"
      >
        <div className="framer-1i5axl2">
          <div
            className="absolute left-[-568px] right-[-568px] top-0 h-[2053px] flex-none rounded-full"
            style={{
              border: "200px solid #3131f5",
              filter: "blur(92px)",
              WebkitFilter: "blur(92px)",
            }}
          />
          <div
            className="absolute left-[-568px] right-[-568px] top-0 h-[2053px] flex-none rounded-full"
            style={{
              border: "200px solid #3131f5",
              filter: "blur(92px)",
              WebkitFilter: "blur(92px)",
            }}
          />
        </div>
      </TimelineContent>

      {/* ── Header ── */}
      <article className="text-center mb-6 pt-32 max-w-3xl mx-auto space-y-2 relative z-50">
        <h2 className="text-4xl font-medium text-white">
          <VerticalCutReveal
            splitBy="words"
            staggerDuration={0.15}
            staggerFrom="first"
            reverse={true}
            containerClassName="justify-center"
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
          className="text-gray-300"
        >
          Trusted by agencies across India. Simple pricing, no hidden fees.
          Explore which option is right for you.
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

      {/* ── Radial blue gradient overlay ── */}
      <div
        className="absolute top-0 left-[10%] right-[10%] w-[80%] h-full z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, #206ce8 0%, transparent 70%)",
          opacity: 0.6,
          mixBlendMode: "multiply",
        }}
      />

      {/* ── Plan Cards ── */}
      <div className="grid md:grid-cols-3 max-w-5xl gap-4 py-6 mx-auto px-4">
        {plans.map((plan, index) => (
          <TimelineContent
            key={plan.name}
            as="div"
            animationNum={2 + index}
            timelineRef={pricingRef}
            customVariants={revealVariants}
          >
            <Card
              className={cn(
                "relative text-white border-neutral-800",
                plan.popular
                  ? "bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 shadow-[0px_-13px_300px_0px_#0900ff] z-20"
                  : "bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 z-10"
              )}
            >
              {/* Badges */}
              {plan.popular && (
                <div className="absolute -top-3 right-4 flex gap-2">
                  <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    50% OFF
                  </span>
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-left">
                <div className="flex justify-between">
                  <h3 className="text-3xl mb-2">{plan.name}</h3>
                </div>
                <div className="flex items-baseline">
                  {plan.price === null ? (
                    <span className="text-4xl font-semibold">Custom</span>
                  ) : (
                    <>
                      <span className="text-4xl font-semibold">
                        ₹
                        <NumberFlow
                          value={isYearly ? plan.yearlyPrice : plan.price}
                          className="text-4xl font-semibold"
                        />
                      </span>
                      <span className="text-gray-300 ml-1">
                        /{isYearly ? "year" : "month"}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-300 mb-4">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="pt-0">
                <button
                  onClick={() => handlePlanAction(plan)}
                  className={cn(
                    "w-full mb-6 p-4 text-xl rounded-xl transition-all duration-200 hover:scale-[1.02]",
                    plan.popular
                      ? "bg-gradient-to-t from-blue-500 to-blue-600 shadow-lg shadow-blue-800 border border-blue-500 text-white"
                      : plan.buttonVariant === "outline"
                        ? "bg-gradient-to-t from-neutral-950 to-neutral-600 shadow-lg shadow-neutral-900 border border-neutral-800 text-white"
                        : ""
                  )}
                >
                  {plan.buttonText}
                </button>

                <div className="space-y-3 pt-4 border-t border-neutral-700">
                  <h4 className="font-medium text-base mb-3">
                    {plan.includes[0]}
                  </h4>
                  <ul className="space-y-2">
                    {plan.includes.slice(1).map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center gap-2"
                      >
                        <span className="h-2.5 w-2.5 bg-neutral-500 rounded-full grid place-content-center" />
                        <span className="text-sm text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TimelineContent>
        ))}
      </div>
    </div>
  );
}
