import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import api from '../../utils/api';
import {
  Users, BookOpen, CheckCircle, XCircle, Clock, AlertCircle,
  Lock, HeartHandshake, HardHat,
} from 'lucide-react';

const TABS = [
  { type: 'cyber',  label: 'אבטחת מידע',          Icon: Lock },
  { type: 'haras',  label: 'מניעת הטרדה מינית',   Icon: HeartHandshake },
  { type: 'safety', label: 'בטיחות במקום העבודה', Icon: HardHat },
];

const MODULE_LABEL = { cyber: 'אבטחת מידע', haras: 'מניעת הטרדה', safety: 'בטיחות בעבודה' };
const MODULE_ICON  = { cyber: Lock, haras: HeartHandshake, safety: HardHat };

const StatCard = ({ icon: Icon, label, value, sub, color = 'var(--primary)' }) => (
  <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1.25rem 1.5rem' }}>
    <div style={{ width: 48, height: 48, borderRadius: '12px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color, lineHeight: 1 }}>{value ?? '—'}</div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600, marginTop: '0.2rem' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{sub}</div>}
    </div>
  </div>
);

const ComplianceBar = ({ label, Icon, stats }) => {
  if (!stats) return <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 100 }}><div className="spinner" /></div>;
  const rate = stats.complianceRate ?? 0;
  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
      borderRadius: 'var(--radius)', padding: '1.5rem', color: 'white',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem', fontWeight: 600 }}>
        <Icon size={15} />
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1, color: rate >= 80 ? '#2ecc71' : '#e74c3c' }}>
            {rate}%
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginTop: '0.2rem' }}>שיעור ציות</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ height: 10, background: 'rgba(255,255,255,0.2)', borderRadius: '99px', overflow: 'hidden', marginBottom: '0.4rem' }}>
            <div style={{ height: '100%', background: rate >= 80 ? '#2ecc71' : '#e74c3c', width: `${rate}%`, borderRadius: '99px', transition: 'width 1s ease' }} />
          </div>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem' }}>
            {stats.examPassed} / {stats.activeUsers} עובדים עברו את הבחינה
          </p>
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [cyberStats, setCyberStats] = useState(null);
  const [harasStats, setHarasStats] = useState(null);
  const [safetyStats, setSafetyStats] = useState(null);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [activeTab, setActiveTab] = useState('cyber');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard?type=cyber'),
      api.get('/admin/dashboard?type=haras'),
      api.get('/admin/dashboard?type=safety'),
      api.get('/admin/dashboard?type=all'),
    ]).then(([cRes, hRes, sRes, allRes]) => {
      setCyberStats(cRes.data);
      setHarasStats(hRes.data);
      setSafetyStats(sRes.data);
      setRecentAttempts(allRes.data.recentAttempts || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><div className="loading-screen"><div className="spinner" /></div></Layout>;

  const statsMap = { cyber: cyberStats, haras: harasStats, safety: safetyStats };
  const activeStats = statsMap[activeTab];

  return (
    <Layout>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.35rem' }}>לוח בקרה</h1>
          <p style={{ color: 'var(--text-secondary)' }}>סקירה כללית של מצב ההדרכה והציות</p>
        </div>

        {/* Per-module compliance bars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <ComplianceBar label="אבטחת מידע"          Icon={Lock}           stats={cyberStats} />
          <ComplianceBar label="מניעת הטרדה מינית"   Icon={HeartHandshake} stats={harasStats} />
          <ComplianceBar label="בטיחות במקום העבודה" Icon={HardHat}        stats={safetyStats} />
        </div>

        {/* Module tabs for stat cards */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {TABS.map(t => (
            <button
              key={t.type}
              className={`btn btn-sm ${activeTab === t.type ? 'btn-primary' : 'btn-ghost'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--border)' }}
              onClick={() => setActiveTab(t.type)}
            >
              <t.Icon size={14} />{t.label}
            </button>
          ))}
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard icon={Users}       label="עובדים פעילים"  value={activeStats?.activeUsers}        color="var(--primary)" />
          <StatCard icon={BookOpen}    label="השלימו הדרכה"   value={activeStats?.trainingCompleted}  color="var(--info)" />
          <StatCard icon={CheckCircle} label="עברו בחינה"     value={activeStats?.examPassed}         color="var(--success)" />
          <StatCard icon={XCircle}     label="נכשלו"          value={activeStats?.examFailed}         color="var(--danger)" />
          <StatCard icon={Clock}       label="טרם התחילו"     value={activeStats?.trainingNotStarted} color="var(--warning)" sub="מהדרכה" />
          <StatCard icon={AlertCircle} label="לאחר הדרכה"     value={activeStats?.examPending}        color="var(--accent)"  sub="טרם נבחנו" />
        </div>

        {/* Recent attempts with module column */}
        {recentAttempts.length > 0 && (
          <div className="card card-lg">
            <h2 style={{ fontSize: '1.05rem', marginBottom: '1.25rem' }}>ניסיונות בחינה אחרונים</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>שם עובד</th>
                    <th>מחלקה</th>
                    <th>מודול</th>
                    <th>ציון</th>
                    <th>תוצאה</th>
                    <th>תאריך</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAttempts.map(att => {
                    const ModIcon = MODULE_ICON[att.trainingType] || Lock;
                    return (
                      <tr key={att.id}>
                        <td style={{ fontWeight: 600 }}>{att.user?.name}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{att.user?.department || '—'}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            <ModIcon size={13} />
                            {MODULE_LABEL[att.trainingType] || att.trainingType}
                          </div>
                        </td>
                        <td style={{ fontWeight: 700 }}>{att.score}/{att.totalQuestions}</td>
                        <td>
                          {att.passed
                            ? <span className="badge badge-success"><CheckCircle size={11} />עבר</span>
                            : <span className="badge badge-danger"><XCircle size={11} />נכשל</span>}
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          {new Date(att.completedAt).toLocaleDateString('he-IL')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/report')}>דוח מלא</button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin/users')}>ניהול עובדים</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
