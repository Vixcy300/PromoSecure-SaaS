import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Sparkles } from "./ui/sparkles";
import { VerticalCutReveal } from "./ui/vertical-cut-reveal";
import NumberFlow from "@number-flow/react";

// PromoSecure plans – prices in INR (₹)
const plans = [
  {
    name: "Trial",
    description: "Explore all features free for 14 days — no credit card required.",
    price: 0,
    yearlyPrice: 0,
    priceSuffix: "/14 days",
    yearlyPriceSuffix: "/14 days",
    buttonText: "Request Demo Access",
    buttonVariant: "outline",
    popular: false,
    currency: "₹",
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
    description: "Best for growing agencies — 50% off for a limited time.",
    price: 1249,
    yearlyPrice: 11990,
    priceSuffix: "/month",
    yearlyPriceSuffix: "/year",
    buttonText: "Start Pro Plan",
    buttonVariant: "default",
    popular: true,
    currency: "₹",
    badge: "50% OFF",
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
    description: "Custom solutions for large organizations with dedicated SLA.",
    price: null,
    yearlyPrice: null,
    priceSuffix: "",
    yearlyPriceSuffix: "",
    buttonText: "Contact Sales",
    buttonVariant: "outline",
    popular: false,
    currency: "₹",
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

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const PricingSwitch = ({ onSwitch }) => {
  const [selected, setSelected] = useState("0");

  const handleSwitch = (value) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className="flex justify-center">
      <div className="relative z-10 mx-auto flex w-fit rounded-full bg-neutral-900 border border-gray-700 p-1">
        {[
          ["0", "Monthly"],
          ["1", "Yearly"],
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => handleSwitch(val)}
            className={cn(
              "relative z-10 h-10 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
              selected === val ? "text-white" : "text-gray-400"
            )}
          >
            {selected === val && (
              <motion.span
                layoutId="pricing-switch"
                className="absolute top-0 left-0 h-10 w-full rounded-full border-4 shadow-sm shadow-blue-600 border-blue-600 bg-gradient-to-t from-blue-500 to-blue-600"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const PlanCard = ({ plan, index, isYearly, onAction }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  const priceVal = isYearly ? plan.yearlyPrice : plan.price;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.55, delay: index * 0.18 }}
    >
      <Card
        className={cn(
          "relative text-white border-neutral-800 h-full",
          plan.popular
            ? "bg-gradient-to-b from-neutral-800 via-neutral-900 to-neutral-900 shadow-[0px_-13px_300px_0px_#0900ff] z-20"
            : "bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 z-10"
        )}
      >
        {plan.badge && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            {plan.badge}
          </span>
        )}
        {plan.popular && (
          <span className="absolute -top-3 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            Popular
          </span>
        )}

        <CardHeader className="text-left">
          <h3 className="text-3xl font-semibold mb-2">{plan.name}</h3>
          <div className="flex items-baseline gap-1 mb-1">
            {priceVal === null ? (
              <span className="text-4xl font-bold">Custom</span>
            ) : (
              <>
                <span className="text-4xl font-bold">
                  {plan.currency}
                  <NumberFlow
                    value={priceVal}
                    className="text-4xl font-bold"
                  />
                </span>
                <span className="text-gray-400 text-sm">
                  {isYearly ? plan.yearlyPriceSuffix : plan.priceSuffix}
                </span>
              </>
            )}
          </div>
          {plan.popular && isYearly && (
            <span className="text-xs text-green-400 font-semibold">
              Save ₹{(plan.price * 12 - plan.yearlyPrice).toLocaleString("en-IN")} vs monthly
            </span>
          )}
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">{plan.description}</p>
        </CardHeader>

        <CardContent className="pt-0">
          <button
            onClick={onAction}
            className={cn(
              "w-full mb-6 py-3 px-4 text-base font-semibold rounded-xl transition-all duration-200",
              plan.popular
                ? "bg-gradient-to-t from-blue-600 to-blue-500 shadow-lg shadow-blue-900 border border-blue-500 text-white hover:shadow-blue-700 hover:scale-[1.02]"
                : "bg-gradient-to-t from-neutral-950 to-neutral-700 shadow-lg shadow-neutral-900 border border-neutral-700 text-white hover:border-neutral-500 hover:scale-[1.02]"
            )}
          >
            {plan.buttonText}
          </button>

          <div className="space-y-3 pt-4 border-t border-neutral-700">
            <h4 className="font-semibold text-sm text-gray-300 mb-2">
              {plan.includes[0]}
            </h4>
            <ul className="space-y-2">
              {plan.includes.slice(1).map((feature, fi) => (
                <li key={fi} className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                  <span className="text-sm text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function PromoSecurePricing({ onPlanAction, onScrollToDemo }) {
  const [isYearly, setIsYearly] = useState(false);
  const sectionRef = useRef(null);
  const headerInView = useInView(sectionRef, { once: true });

  const togglePricingPeriod = (value) => setIsYearly(parseInt(value) === 1);

  const handlePlanAction = (plan) => {
    if (plan.name === "Trial" || plan.name === "Enterprise") {
      onScrollToDemo?.();
    } else {
      onPlanAction?.(plan);
    }
  };

  return (
    <div
      ref={sectionRef}
      className="relative min-h-screen mx-auto bg-black overflow-x-hidden py-20 px-4"
    >
      {/* Background grid + sparkles */}
      <div className="absolute top-0 h-96 w-full overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)] pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#3a3a3a10_1px,transparent_1px)] bg-[size:70px_80px]" />
        <Sparkles
          density={900}
          direction="bottom"
          speed={0.8}
          color="#FFFFFF"
          className="absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)]"
        />
      </div>

      {/* Blue glow ellipses */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[80%] h-[60%] pointer-events-none" style={{
        background: "radial-gradient(circle at center, #206ce8 0%, transparent 65%)",
        opacity: 0.25,
        mixBlendMode: "screen",
      }} />

      {/* Header */}
      <motion.article
        initial={{ opacity: 0, y: -24, filter: "blur(10px)" }}
        animate={headerInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 max-w-3xl mx-auto space-y-4 relative z-10"
      >
        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-600/20 border border-blue-600/40 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
          Simple Pricing
        </span>
        <h2 className="text-4xl font-bold text-white leading-tight">
          <VerticalCutReveal
            splitBy="words"
            staggerDuration={0.12}
            staggerFrom="first"
            reverse={true}
            containerClassName="justify-center"
            transition={{ type: "spring", stiffness: 250, damping: 40, delay: 0 }}
          >
            Plans that work best for your team
          </VerticalCutReveal>
        </h2>
        <p className="text-gray-400 text-lg">
          Simple pricing. No hidden fees. Cancel anytime.
        </p>
        <PricingSwitch onSwitch={togglePricingPeriod} />
      </motion.article>

      {/* Plan cards */}
      <div className="grid md:grid-cols-3 max-w-5xl gap-6 mx-auto relative z-10">
        {plans.map((plan, index) => (
          <PlanCard
            key={plan.name}
            plan={plan}
            index={index}
            isYearly={isYearly}
            onAction={() => handlePlanAction(plan)}
          />
        ))}
      </div>

      {/* Annual billing note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={headerInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="text-center text-gray-500 text-sm mt-8 relative z-10"
      >
        💡 Switch to yearly billing and save up to <span className="text-green-400 font-semibold">20%</span>
      </motion.p>
    </div>
  );
}
