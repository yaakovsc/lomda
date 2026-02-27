import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Training from './pages/Training';
import Exam from './pages/Exam';
import Results from './pages/Results';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminExamConfig from './pages/admin/AdminExamConfig';
import AdminReport from './pages/admin/AdminReport';
import AdminUpdate from './pages/admin/AdminUpdate';

// ─── Maintenance Overlay ─────────────────────────────────────────────────────
const MaintenanceOverlay = () => {
  const [visible, setVisible] = useState(false);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const handler = (e) => { setVisible(true); setInfo(e.detail); };
    window.addEventListener('maintenance', handler);
    return () => window.removeEventListener('maintenance', handler);
  }, []);

  const retry = async () => {
    try {
      const r = await fetch('/api/health');
      if (r.ok) { setVisible(false); setInfo(null); }
      else setTimeout(retry, 5000);
    } catch { setTimeout(retry, 5000); }
  };

  if (!visible) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(15,25,50,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'white', borderRadius: 20, padding: '2.5rem 2rem', maxWidth: 420, width: '90%',
        textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🔧</div>
        <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary)', margin: '0 0 0.5rem' }}>המערכת תחת עידכון</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0 0 0.5rem' }}>
          {info?.message || 'המערכת עוברת עדכון תוכנה. נא להיכנס מחדש בעוד מספר דקות.'}
        </p>
        {info?.estimatedMinutes && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 1.5rem' }}>
            זמן עדכון משוער: ~{info.estimatedMinutes} דקות
          </p>
        )}
        <button className="btn btn-primary" onClick={retry} style={{ width: '100%' }}>
          נסה שוב
        </button>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <span>טוען...</span>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

// Smart home: regular users skip the dashboard entirely
const UserHome = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.examCompletedAt) return <Navigate to="/results" replace />;
  if (user.trainingCompletedAt) return <Navigate to="/exam" replace />;
  return <Navigate to="/training" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (user) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

    <Route path="/" element={<UserHome />} />
    <Route path="/training" element={<ProtectedRoute><Training /></ProtectedRoute>} />
    <Route path="/exam" element={<ProtectedRoute><Exam /></ProtectedRoute>} />
    <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />

    <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
    <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
    <Route path="/admin/exam-config" element={<ProtectedRoute adminOnly><AdminExamConfig /></ProtectedRoute>} />
    <Route path="/admin/report" element={<ProtectedRoute adminOnly><AdminReport /></ProtectedRoute>} />
    <Route path="/admin/update" element={<ProtectedRoute adminOnly><AdminUpdate /></ProtectedRoute>} />

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MaintenanceOverlay />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
