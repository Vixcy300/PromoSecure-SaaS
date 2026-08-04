import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiHome,
  HiUsers,
  HiCollection,
  HiLogout,
  HiShieldCheck,
  HiOfficeBuilding,
  HiCamera,
  HiMenuAlt2,
  HiX,
  HiQuestionMarkCircle,
  HiDocumentText,
  HiBriefcase,
  HiMap,
  HiChartBar,
  HiChat,
  HiSun,
  HiMoon,
  HiSpeakerphone
} from 'react-icons/hi';
import api from '../services/api';

const Layout = () => {
  const { user, logout, isImpersonating, stopImpersonation } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [activeAnnouncements, setActiveAnnouncements] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await api.get('/users/announcements/active');
        setActiveAnnouncements(res.data.announcements || []);
      } catch (e) {
        console.error('Failed to fetch platform broadcasts');
      }
    };
    if (user) {
      fetchBanners();
    }
  }, [user]);

  // Theme Toggle Effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { to: '/admin', icon: HiHome, label: 'Dashboard', end: true },
          { to: '/admin/managers', icon: HiOfficeBuilding, label: 'Managers' },
          { to: '/admin/promoters', icon: HiUsers, label: 'Promoters' },
          { to: '/admin/batches', icon: HiCollection, label: 'Batches & AI Audit' },
          { to: '/admin/map', icon: HiMap, label: 'Operations Map' },
          { to: '/admin/audit', icon: HiShieldCheck, label: 'Security & Logs' },
        ];
      case 'manager':
        return [
          { to: '/manager', icon: HiHome, label: 'Dashboard', end: true },
          { to: '/manager/clients', icon: HiBriefcase, label: 'Clients' },
          { to: '/manager/promoters', icon: HiUsers, label: 'Promoters' },
          { to: '/manager/batches', icon: HiCollection, label: 'Batches' },
          { to: '/manager/map', icon: HiMap, label: 'Map View' },
          { to: '/manager/analytics', icon: HiChartBar, label: 'Analytics' },
          { to: '/manager/chat', icon: HiChat, label: 'Messages' },
        ];
      case 'promoter':
        return [
          { to: '/promoter', icon: HiCamera, label: 'My Batches', end: true },
          { to: '/promoter/chat', icon: HiChat, label: 'Messages' },
        ];
      case 'client':
        return [
          { to: '/client', icon: HiBriefcase, label: 'Client Portal', end: true },
        ];
      default:
        return [];
    }
  };

  const getRoleBadge = () => {
    const badges = {
      admin: { icon: HiShieldCheck, color: '#0066CC', label: 'Admin', solid: '#0066CC' },
      manager: { icon: HiOfficeBuilding, color: '#1976d2', label: 'Manager', solid: '#1976d2' },
      promoter: { icon: HiCamera, color: '#15803d', label: 'Promoter', solid: '#15803d' },
      client: { icon: HiBriefcase, color: '#f59e0b', label: 'Client', solid: '#f59e0b' },
    };
    return badges[user?.role] || badges.promoter;
  };

  const badge = getRoleBadge();
  const navItems = getNavItems();

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="layout">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
          <HiMenuAlt2 />
        </button>
        <div className="mobile-logo">
          <span className="logo-text">PromoSecure</span>
        </div>
        <div className="mobile-user-menu">
          <button
            className="mobile-avatar-btn"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            style={{ background: badge.gradient }}
          >
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </button>
          {showMobileMenu && (
            <>
              <div className="mobile-menu-overlay" onClick={() => setShowMobileMenu(false)} />
              <div className="mobile-dropdown">
                <div className="mobile-dropdown-header">
                  <span className="dropdown-name">{user?.name}</span>
                  <span className="dropdown-role">{badge.label}</span>
                </div>
                <NavLink to="/about" className="dropdown-item" onClick={() => setShowMobileMenu(false)}>
                  <HiQuestionMarkCircle /> About Us
                </NavLink>
                <NavLink to="/privacy" className="dropdown-item" onClick={() => setShowMobileMenu(false)}>
                  <HiDocumentText /> Privacy Policy
                </NavLink>
                <button className="dropdown-item" onClick={() => { toggleTheme(); setShowMobileMenu(false); }}>
                  {theme === 'dark' ? <HiSun /> : <HiMoon />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <HiLogout /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-text">PromoSecure</span>
          </div>
          <button className="close-btn" onClick={closeSidebar}>
            <HiX />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="nav-section-title">Main Menu</span>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
                onClick={closeSidebar}
              >
                <item.icon className="nav-icon" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="nav-section">
            <span className="nav-section-title">Support</span>
            <NavLink to="/privacy" className="nav-item" onClick={closeSidebar}>
              <HiDocumentText className="nav-icon" />
              <span>Privacy Policy</span>
            </NavLink>
            <NavLink to="/help" className="nav-item" onClick={closeSidebar}>
              <HiQuestionMarkCircle className="nav-icon" />
              <span>Help & FAQ</span>
            </NavLink>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar" style={{ background: badge.gradient }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">
                <badge.icon style={{ fontSize: '0.7rem' }} />
                {badge.label}
              </span>
            </div>
            <button className="btn btn-icon btn-ghost" onClick={toggleTheme} title="Toggle Theme" style={{ marginRight: '0.5rem' }}>
              {theme === 'dark' ? <HiSun /> : <HiMoon />}
            </button>
            <button className="btn btn-icon btn-ghost logout-btn" onClick={handleLogout} title="Logout">
              <HiLogout />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {isImpersonating && (
          <div className="impersonation-banner">
            <div className="impersonation-text">
              <span className="pulse-warning">⚠️</span>
              <span>
                <strong>Super Admin Impersonation Mode:</strong> Currently viewing platform as <strong>{user?.name}</strong> ({user?.companyName || user?.role})
              </span>
            </div>
            <button className="exit-impersonation-btn" onClick={stopImpersonation}>
              Exit &amp; Return to Super Admin
            </button>
          </div>
        )}

        {/* Global Platform Broadcasts */}
        {activeAnnouncements.map(ann => (
          <div key={ann._id} className={`global-sys-banner ${ann.priority}`}>
            <div className="banner-icon-side">
              <HiSpeakerphone size={20} />
            </div>
            <div className="banner-content">
              <strong>{ann.title}</strong>
              <p>{ann.message}</p>
            </div>
            <button className="banner-close" onClick={() => setActiveAnnouncements(prev => prev.filter(a => a._id !== ann._id))}>
              <HiX />
            </button>
          </div>
        ))}

        <Outlet />
      </main>

      <style>{`
        .layout {
          display: flex;
          min-height: 100vh;
        }

        .impersonation-banner {
          background: linear-gradient(135deg, #d97706, #b45309);
          color: #ffffff;
          padding: 10px 20px;
          border-radius: 12px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          box-shadow: 0 4px 14px rgba(217, 119, 6, 0.25);
          font-size: 0.92rem;
          flex-wrap: wrap;
        }

        .impersonation-text {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .global-sys-banner {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px 20px;
          border-radius: 16px;
          margin-bottom: 24px;
          position: relative;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2);
          animation: bannerSlideDown 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          transform-origin: top;
        }

        @keyframes bannerSlideDown {
          0% { opacity: 0; transform: translateY(-20px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }

        .global-sys-banner.critical {
          background: rgba(254, 242, 242, 0.85);
          border: 1px solid rgba(254, 202, 202, 0.5);
          color: #991b1b;
          animation: bannerSlideDown 0.5s ease-out forwards, pulseGlow 2s infinite;
        }
        .global-sys-banner.critical .banner-icon-side { color: #dc2626; }
        .global-sys-banner.critical .banner-close { color: #dc2626; background: rgba(220, 38, 38, 0.1); }

        .global-sys-banner.high, .global-sys-banner.warning {
          background: rgba(255, 251, 235, 0.85);
          border: 1px solid rgba(253, 230, 138, 0.5);
          color: #92400e;
        }
        .global-sys-banner.high .banner-icon-side { color: #d97706; }
        .global-sys-banner.high .banner-close { color: #d97706; background: rgba(217, 119, 6, 0.1); }

        .global-sys-banner.info, .global-sys-banner.medium, .global-sys-banner.low {
          background: rgba(239, 246, 255, 0.85);
          border: 1px solid rgba(191, 219, 254, 0.5);
          color: #1e40af;
        }
        .global-sys-banner.info .banner-icon-side { color: #2563eb; }
        .global-sys-banner.info .banner-close { color: #2563eb; background: rgba(37, 99, 235, 0.1); }

        .banner-icon-side {
          padding-top: 2px;
          font-size: 1.2rem;
        }

        .banner-content {
          flex: 1;
        }
        .banner-content strong {
          display: block;
          font-size: 1rem;
          margin-bottom: 4px;
          letter-spacing: -0.01em;
        }
        .banner-content p {
          margin: 0;
          font-size: 0.9rem;
          opacity: 0.9;
          line-height: 1.5;
        }

        .banner-close {
          border: none;
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        .banner-close:hover {
          transform: scale(1.1);
          filter: brightness(0.9);
        }

        .pulse-warning {
          font-size: 1.1rem;
          animation: pulse 1.5s infinite;
        }

        .exit-impersonation-btn {
          background: #ffffff;
          color: #92400e;
          border: none;
          padding: 6px 14px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .exit-impersonation-btn:hover {
          background: #fef3c7;
          transform: translateY(-1px);
        }

        /* Mobile Header */
        .mobile-header {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          padding: 0 1rem;
          align-items: center;
          justify-content: space-between;
          z-index: 90;
        }

        .menu-btn {
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
        }

        .mobile-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .mobile-avatar {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.9rem;
          color: white;
        }

        /* Sidebar */
        .sidebar {
          width: 280px;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          z-index: 100;
          transition: transform 0.3s var(--ease-smooth);
        }

        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          z-index: 99;
          backdrop-filter: blur(4px);
        }

        .close-btn {
          display: none;
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 1.5rem;
          cursor: pointer;
        }

        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon {
          font-size: 1.75rem;
        }

        .logo-text {
          font-size: 1.25rem;
          font-weight: 800;
          background: var(--brand-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
        }

        .nav-section {
          margin-bottom: 1.5rem;
        }

        .nav-section-title {
          display: block;
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.75rem;
          padding-left: 0.75rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding: 0.875rem 1rem;
          color: var(--text-secondary);
          border-radius: var(--radius-lg);
          transition: all var(--transition-fast);
          text-decoration: none;
          margin-bottom: 0.25rem;
        }

        .nav-item:hover {
          color: var(--text-primary);
          background: var(--bg-glass-hover);
        }

        .nav-item.active {
          color: white;
          background: var(--brand-gradient);
          box-shadow: var(--shadow-glow-sm);
        }

        .nav-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .user-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--bg-tertiary);
          border-radius: var(--radius-lg);
        }

        .user-avatar {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }

        .user-details {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 600;
          font-size: 0.9rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .logout-btn {
          flex-shrink: 0;
        }

        .main-content {
          flex: 1;
          margin-left: 280px;
          min-height: 100vh;
        }

        /* Mobile Responsive */
        @media (max-width: 1024px) {
          .mobile-header {
            display: flex;
          }

          .sidebar {
            transform: translateX(-100%);
          }

          .sidebar.open {
            transform: translateX(0);
          }

          .sidebar-overlay {
            display: block;
          }

          .close-btn {
            display: block;
          }

          .main-content {
            margin-left: 0;
            padding-top: 60px;
          }
        }

        /* Mobile User Menu */
        .mobile-user-menu {
          position: relative;
        }

        .mobile-avatar-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: var(--brand-primary);
          border: none;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
        }

        .mobile-menu-overlay {
          position: fixed;
          inset: 0;
          z-index: 998;
        }

        .mobile-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 200px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          z-index: 999;
          overflow: hidden;
        }

        .mobile-dropdown-header {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
        }

        .dropdown-name {
          font-weight: 600;
          font-size: 0.95rem;
        }

        .dropdown-role {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          width: 100%;
          border: none;
          background: none;
          color: var(--text-secondary);
          font-size: 0.9rem;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s;
        }

        .dropdown-item:hover {
          background: var(--bg-tertiary);
        }

        .dropdown-item.logout {
          color: var(--error);
          border-top: 1px solid var(--border-color);
        }
      `}</style>
    </div>
  );
};

export default Layout;
