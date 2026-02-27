import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const IDLE_MS = 5 * 60 * 1000; // 5 minutes of inactivity → force logout
import {
  Home, BarChart2,
  Users, Settings, LogOut, Menu, X, Shield, CloudDownload
} from 'lucide-react';

const NavLink = ({ to, icon: Icon, label, onClick, badge }) => {
  const location = useLocation();
  const active = location.pathname === to || location.pathname.startsWith(to + '/');
  return (
    <Link
      to={to}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        padding: '0.65rem 1rem', borderRadius: '8px', textDecoration: 'none',
        color: active ? 'white' : 'rgba(255,255,255,0.75)',
        background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
        fontWeight: active ? 700 : 500, fontSize: '0.92rem',
        transition: 'all 0.2s', marginBottom: '2px',
      }}
      onMouseOver={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
      onMouseOut={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <Icon size={18} />
      <span style={{ flex: 1 }}>{label}</span>
      {badge && (
        <span style={{
          width: 10, height: 10, borderRadius: '50%', background: 'var(--danger)',
          flexShrink: 0, animation: 'pulseBadge 1.4s ease-in-out infinite',
        }} />
      )}
    </Link>
  );
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const timerRef = useRef(null);
  const isAdmin = user?.role === 'admin';

  // Poll for update status (admin only, every 5 min)
  const checkUpdate = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const { data } = await api.get('/admin/update/status');
      setUpdateAvailable(!!data.updateAvailable);
    } catch { /* ignore */ }
  }, [isAdmin]);

  useEffect(() => {
    checkUpdate();
    const interval = setInterval(checkUpdate, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkUpdate]);

  // ── Idle timeout: logout after 5 minutes of no activity ──────
  useEffect(() => {
    if (!user) return;

    const reset = () => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        logout();
        navigate('/login?expired=1');
      }, IDLE_MS);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset(); // start timer immediately

    return () => {
      clearTimeout(timerRef.current);
      events.forEach(e => window.removeEventListener(e, reset));
    };
  }, [user, logout, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '1.5rem 1rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ background: 'white', borderRadius: '10px', padding: '6px', display: 'flex', width: 44, height: 44, flexShrink: 0 }}>
            <img src="/giron.png" alt="גירון" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>הדרכת אבטחה</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem' }}>גירון פיתוח ובניה בע"מ</div>
          </div>
        </div>
        {/* User info */}
        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.6rem 0.75rem' }}>
          <div style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>{user?.name}</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
            {user?.department || (isAdmin ? 'מנהל מערכת' : 'עובד')}
          </div>
        </div>
      </div>

      {/* Navigation — admin only */}
      <nav style={{ flex: 1, padding: '0 0.75rem' }}>
        {isAdmin && (
          <>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', fontWeight: 700, padding: '0.75rem 0.5rem 0.25rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>ניהול</div>
            <NavLink to="/admin" icon={Home} label="לוח בקרה" onClick={() => setMobileOpen(false)} />
            <NavLink to="/admin/users" icon={Users} label="ניהול עובדים" onClick={() => setMobileOpen(false)} />
            <NavLink to="/admin/exam-config" icon={Settings} label="הגדרות בחינה" onClick={() => setMobileOpen(false)} />
            <NavLink to="/admin/report" icon={BarChart2} label="דוח ציות" onClick={() => setMobileOpen(false)} />
            <NavLink to="/admin/update" icon={CloudDownload} label="עדכון מערכת" onClick={() => setMobileOpen(false)} badge={updateAvailable} />
          </>
        )}
      </nav>

      {/* Logout */}
      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          width: '100%', padding: '0.65rem 1rem', borderRadius: '8px',
          background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit',
          transition: 'all 0.2s',
        }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'white'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
        >
          <LogOut size={18} />
          <span>יציאה</span>
        </button>

        {/* Developer credit */}
        <div style={{ marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '2px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <img src="/kobi-logo.png" alt="קובי שלזינגר" style={{ width: 44, height: 44, objectFit: 'contain', objectPosition: 'center', flexShrink: 0, opacity: 0.85 }} />
          <div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.68rem', marginBottom: '0.1rem' }}>פיתוח ויישום</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.78rem', fontWeight: 600 }}>קובי שלזינגר</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.68rem' }}>ליווי פרוייקטים</div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.68rem', direction: 'ltr' }}>054-5664594</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Desktop Sidebar */}
      <aside style={{
        width: 240, background: 'linear-gradient(180deg, var(--primary-dark) 0%, var(--primary) 100%)',
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 100,
        boxShadow: '0 0 30px rgba(0,0,0,0.15)',
      }} className="desktop-sidebar">
        {sidebarContent}
      </aside>

      {/* Mobile Header */}
      <header style={{
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0, height: 56,
        background: 'linear-gradient(90deg, var(--primary-dark), var(--primary))',
        zIndex: 200, alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem',
      }} className="mobile-header">
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 4 }}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontWeight: 700 }}>
          <Shield size={18} />
          הדרכת אבטחה | גירון
        </div>
        <div style={{ width: 32 }} />
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 150,
          background: 'rgba(0,0,0,0.5)',
        }} onClick={() => setMobileOpen(false)}>
          <div style={{
            width: 240, height: '100%',
            background: 'linear-gradient(180deg, var(--primary-dark) 0%, var(--primary) 100%)',
            position: 'absolute', right: 0,
          }} onClick={e => e.stopPropagation()}>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{ flex: 1, marginRight: 240, minHeight: '100vh', padding: '2rem' }} className="main-content">
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-header { display: flex !important; }
          .main-content { margin-right: 0 !important; padding: 4rem 1rem 1rem !important; }
        }
        @keyframes pulseBadge {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}
