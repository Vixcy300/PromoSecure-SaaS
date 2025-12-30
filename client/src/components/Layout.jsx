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
  HiMoon
} from 'react-icons/hi';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

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
      default:
        return [];
    }
  };

  const getRoleBadge = () => {
    const badges = {
      admin: { icon: HiShieldCheck, color: '#ef4444', label: 'Admin', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
      manager: { icon: HiOfficeBuilding, color: '#7c3aed', label: 'Manager', gradient: 'linear-gradient(135deg, #7c3aed, #6366f1)' },
      promoter: { icon: HiCamera, color: '#22c55e', label: 'Promoter', gradient: 'linear-gradient(135deg, #22c55e, #16a34a)' },
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
          <span className="logo-icon">🔒</span>
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
            <span className="logo-icon">🔒</span>
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
        <Outlet />
      </main>

      <style>{`
        .layout {
          display: flex;
          min-height: 100vh;
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
