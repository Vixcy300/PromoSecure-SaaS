import { forwardRef, useRef } from "react";
import { motion, useInView } from "framer-motion";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * TimelineContent – scroll-triggered animated wrapper.
 * Uses `useInView` on the parent `timelineRef` to trigger staggered reveals.
 * `animationNum` controls stagger delay within `customVariants`.
 */
const TimelineContent = forwardRef(
  (
    {
      children,
      as: Component = "div",
      animationNum = 0,
      timelineRef,
      customVariants,
      className,
      ...rest
    },
    ref
  ) => {
    const localRef = useRef(null);
    const observeRef = timelineRef || localRef;
    const inView = useInView(observeRef, { once: true, margin: "-10% 0px" });

    const MotionComp = motion[Component] || motion.div;

    return (
      <MotionComp
        ref={ref}
        className={cn(className)}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        custom={animationNum}
        variants={customVariants}
        {...rest}
      >
        {children}
      </MotionComp>
    );
  }
);

TimelineContent.displayName = "TimelineContent";

export { TimelineContent };
export default TimelineContent;
