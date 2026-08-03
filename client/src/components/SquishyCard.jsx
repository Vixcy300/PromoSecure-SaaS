import React from 'react';
import { motion } from "framer-motion";
import { HiCheck } from 'react-icons/hi';

export const SquishyCard = ({ plan, onAction, delay = 0 }) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay, duration: 0.6 }}
        whileHover="hover"
        className={`sc-container ${plan.popular ? 'sc-popular' : ''}`}
      >
        <div className="sc-content">
          {plan.discount && <span className="sc-discount">{plan.discount}</span>}
          {plan.popular && <span className="sc-badge">Most Popular</span>}
          
          <span className="sc-plan-name">
            {plan.name}
          </span>
          <motion.span
            initial={{ scale: 0.85 }}
            variants={{
              hover: {
                scale: 1,
              },
            }}
            transition={{
              duration: 1,
              ease: "backInOut",
            }}
            className="sc-price-block"
          >
            {plan.price}
            {plan.period && <span className="sc-period">/{plan.period}</span>}
          </motion.span>
          <p className="sc-description">
            {plan.description}
          </p>

          <ul className="sc-features">
             {plan.features.slice(0, 4).map((feature, i) => (
                 <li key={i}>
                     <HiCheck className="sc-check" />
                     <span>{feature}</span>
                 </li>
             ))}
             {plan.features.length > 4 && (
                 <li className="sc-more-features">
                     + {plan.features.length - 4} more features
                 </li>
             )}
          </ul>
        </div>
        <button onClick={plan.action || onAction} className="sc-button">
          {plan.cta}
        </button>
        <Background />
      </motion.div>
      <style>{`
        .sc-container {
          position: relative;
          min-height: 32rem;
          height: 100%;
          width: 100%;
          flex-shrink: 0;
          overflow: hidden;
          border-radius: 1.25rem;
          background-color: var(--brand-primary, #0066CC);
          padding: 2rem 1.75rem 5.5rem;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .sc-popular {
          background-color: #0052a3;
          border: 2px solid rgba(255, 255, 255, 0.4);
          transform: scale(1.03);
          z-index: 10;
          box-shadow: 0 16px 40px rgba(0, 102, 204, 0.3);
        }

        .sc-content {
          position: relative;
          z-index: 10;
          color: white;
          flex: 1;
        }

        .sc-discount {
          position: absolute;
          top: -10px;
          right: -10px;
          background: #ef4444;
          color: white;
          padding: 0.35rem 0.85rem;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 800;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
        }

        .sc-badge {
          display: inline-block;
          width: max-content;
          border-radius: 99px;
          background-color: rgba(255, 255, 255, 0.35);
          padding: 0.25rem 0.85rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .sc-plan-name {
          display: inline-block;
          width: max-content;
          border-radius: 99px;
          background-color: rgba(255, 255, 255, 0.2);
          padding: 0.2rem 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
          margin-bottom: 0.75rem;
        }

        .sc-price-block {
          display: block;
          margin: 0.5rem 0;
          transform-origin: top left;
          font-family: inherit;
          font-size: 2.5rem;
          font-weight: 900;
          line-height: 1.2;
          color: #ffffff;
        }

        .sc-period {
          font-size: 1.1rem;
          font-weight: 500;
          opacity: 0.85;
        }

        .sc-description {
          margin-bottom: 1.5rem;
          opacity: 0.95;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .sc-features {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .sc-features li {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 0.6rem;
          font-size: 0.9rem;
          opacity: 0.95;
        }

        .sc-more-features {
          font-style: italic;
          opacity: 0.8;
          font-size: 0.85rem !important;
          padding-left: 1.5rem;
        }

        .sc-check {
          color: #4ade80;
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .sc-button {
          position: absolute;
          bottom: 1.5rem;
          left: 1.5rem;
          right: 1.5rem;
          z-index: 20;
          border-radius: 0.75rem;
          border: none;
          background-color: #ffffff !important;
          padding: 0.875rem 1rem;
          text-align: center;
          font-family: inherit;
          font-weight: 800;
          font-size: 0.95rem;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: #0f172a !important;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
          transition: all 0.2s ease;
          cursor: pointer;
          width: calc(100% - 3rem);
        }

        .sc-button:hover {
          background-color: #f8fafc !important;
          color: #0066CC !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
        }
      `}</style>
    </>
  );
};

const Background = () => {
  return (
    <motion.svg
      width="320"
      height="384"
      viewBox="0 0 320 384"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', inset: 0, zIndex: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      variants={{
        hover: {
          scale: 1.5,
        },
      }}
      transition={{
        duration: 1,
        ease: "backInOut",
      }}
    >
      <motion.circle
        variants={{
          hover: {
            scaleY: 0.5,
            y: -25,
          },
        }}
        transition={{
          duration: 1,
          ease: "backInOut",
          delay: 0.2,
        }}
        cx="160.5"
        cy="114.5"
        r="101.5"
        fill="#262626"
      />
      <motion.ellipse
        variants={{
          hover: {
            scaleY: 2.25,
            y: -25,
          },
        }}
        transition={{
          duration: 1,
          ease: "backInOut",
          delay: 0.2,
        }}
        cx="160.5"
        cy="265.5"
        rx="101.5"
        ry="43.5"
        fill="#262626"
      />
    </motion.svg>
  );
};
