import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function DropdownNavigation({ navItems }) {
  const [openMenu, setOpenMenu] = React.useState(null);
  const [isHover, setIsHover] = useState(null);

  const handleHover = (menuLabel) => {
    setOpenMenu(menuLabel);
  };

  return (
    <>
      <ul className="dn-nav-list">
        {navItems.map((navItem) => (
          <li
            key={navItem.label}
            className="dn-nav-item"
            onMouseEnter={() => handleHover(navItem.label)}
            onMouseLeave={() => handleHover(null)}
          >
            {navItem.link ? (
              <a
                href={navItem.link}
                className={`dn-nav-btn ${navItem.className || ''}`}
                onMouseEnter={() => setIsHover(navItem.id)}
                onMouseLeave={() => setIsHover(null)}
              >
                <span>{navItem.label}</span>
                {(isHover === navItem.id || openMenu === navItem.label) && (
                  <motion.div
                    layoutId="hover-bg"
                    className="dn-hover-bg"
                    style={{ borderRadius: 99 }}
                  />
                )}
              </a>
            ) : (
              <button
                className="dn-nav-btn"
                onMouseEnter={() => setIsHover(navItem.id)}
                onMouseLeave={() => setIsHover(null)}
              >
                <span>{navItem.label}</span>
                {navItem.subMenus && (
                  <ChevronDown
                    className={`dn-chevron ${openMenu === navItem.label ? "rotate-180" : ""}`}
                  />
                )}
                {(isHover === navItem.id || openMenu === navItem.label) && (
                  <motion.div
                    layoutId="hover-bg"
                    className="dn-hover-bg"
                    style={{ borderRadius: 99 }}
                  />
                )}
              </button>
            )}

            <AnimatePresence>
              {openMenu === navItem.label && navItem.subMenus && (
                <div className="dn-dropdown-container">
                  <motion.div
                    className="dn-dropdown-panel"
                    layoutId="menu"
                  >
                    <div className="dn-dropdown-grid">
                      {navItem.subMenus.map((sub) => (
                        <motion.div layout className="dn-sub-section" key={sub.title}>
                          <h3 className="dn-sub-title">
                            {sub.title}
                          </h3>
                          <ul className="dn-sub-list">
                            {sub.items.map((item) => {
                              const Icon = item.icon;
                              return (
                                <li key={item.label}>
                                  <a
                                    href={item.href || "#"}
                                    className="dn-item-link group"
                                  >
                                    <div className="dn-item-icon group-hover-icon">
                                      {Icon && <Icon className="dn-icon" />}
                                    </div>
                                    <div className="dn-item-text">
                                      <p className="dn-item-label">
                                        {item.label}
                                      </p>
                                      <p className="dn-item-desc">
                                        {item.description}
                                      </p>
                                    </div>
                                  </a>
                                </li>
                              );
                            })}
                          </ul>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </li>
        ))}
      </ul>
      <style>{`
        .dn-nav-list {
          position: relative;
          display: flex;
          align-items: center;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .dn-nav-item {
          position: relative;
        }

        .dn-nav-btn {
          font-size: 0.95rem;
          font-weight: 500;
          padding: 0.5rem 1rem;
          display: flex;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          color: var(--text-secondary, #616161);
          background: transparent;
          border: none;
          position: relative;
          text-decoration: none;
          transition: color 0.3s;
          white-space: nowrap;
        }

        .dn-nav-btn:hover {
          color: var(--text-primary, #212121);
        }

        .dn-nav-btn.discount-link {
          color: #d32f2f;
          font-weight: 600;
        }

        .dn-nav-btn span, .dn-nav-btn svg {
          position: relative;
          z-index: 10;
        }

        .dn-chevron {
          height: 1rem;
          width: 1rem;
          transition: transform 0.3s;
        }

        .dn-chevron.rotate-180 {
          transform: rotate(180deg);
        }

        .dn-hover-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background-color: var(--bg-secondary, #f5f5f5);
          border-radius: 99px;
          z-index: 0;
        }

        .dn-dropdown-container {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          top: 100%;
          padding-top: 1rem;
          z-index: 50;
        }

        .dn-dropdown-panel {
          background-color: var(--bg-primary, #ffffff);
          border: 1px solid var(--border-color, #e0e0e0);
          padding: 1.5rem;
          border-radius: 16px;
          width: max-content;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .dn-dropdown-grid {
          display: flex;
          width: fit-content;
          flex-shrink: 0;
          gap: 3rem;
          overflow: hidden;
        }

        .dn-sub-section {
          width: 100%;
        }

        .dn-sub-title {
          margin-bottom: 1.25rem;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted, #9e9e9e);
        }

        .dn-sub-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .dn-item-link {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          text-decoration: none;
        }

        .dn-item-icon {
          border: 1px solid var(--border-color, #e0e0e0);
          color: var(--text-primary, #212121);
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          flex-shrink: 0;
          transition: background-color 0.3s, color 0.3s;
          background-color: var(--bg-secondary, #f5f5f5);
        }

        .dn-icon {
          height: 1.25rem;
          width: 1.25rem;
          flex-shrink: 0;
        }

        .dn-item-link.group:hover .group-hover-icon {
          background-color: var(--brand-primary, #0066cc);
          color: #ffffff;
          border-color: var(--brand-primary, #0066cc);
        }

        .dn-item-text {
          line-height: 1.3;
          width: max-content;
        }

        .dn-item-label {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary, #212121);
          margin: 0;
          flex-shrink: 0;
        }

        .dn-item-desc {
          font-size: 0.85rem;
          color: var(--text-muted, #9e9e9e);
          margin: 0;
          margin-top: 0.25rem;
          flex-shrink: 0;
          transition: color 0.3s;
          max-width: 200px;
          white-space: normal;
        }

        .dn-item-link.group:hover .dn-item-desc {
          color: var(--text-secondary, #616161);
        }
      `}</style>
    </>
  );
}
