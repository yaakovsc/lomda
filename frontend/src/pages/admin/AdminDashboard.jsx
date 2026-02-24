import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import api from '../../utils/api';
import { Users, BookOpen, ClipboardList, CheckCircle, XCircle, TrendingUp, Clock, AlertCircle } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, sub, color = 'var(--primary)' }) => (
  <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1.25rem 1.5rem' }}>
    <div style={{ width: 48, height: 48, borderRadius: '12px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600, marginTop: '0.2rem' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{sub}</div>}
    </div>
  </div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setStats(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><div className="loading-screen"><div className="spinner" /></div></Layout>;

  return (
    <Layout>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.35rem' }}>לוח בקרה</h1>
          <p style={{ color: 'var(--text-secondary)' }}>סקירה כללית של מצב ההדרכה והציות</p>
        </div>

        {/* Compliance gauge */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
          borderRadius: 'var(--radius)', padding: '2rem', marginBottom: '1.5rem', color: 'white',
          display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', fontWeight: 800, color: stats?.complianceRate >= 80 ? '#2ecc71' : '#e74c3c' }}>
              {stats?.complianceRate}%
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>שיעור ציות</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ height: 12, background: 'rgba(255,255,255,0.2)', borderRadius: '99px', overflow: 'hidden', marginBottom: '0.5rem' }}>
              <div style={{ height: '100%', background: stats?.complianceRate >= 80 ? '#2ecc71' : '#e74c3c', width: `${stats?.complianceRate}%`, borderRadius: '99px', transition: 'width 1s ease' }} />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem' }}>
              {stats?.examPassed} מתוך {stats?.activeUsers} עובדים פעילים השלימו את ההדרכה ועברו את הבחינה
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard icon={Users} label="עובדים פעילים" value={stats?.activeUsers} color="var(--primary)" />
          <StatCard icon={BookOpen} label="השלימו הדרכה" value={stats?.trainingCompleted} color="var(--info)" />
          <StatCard icon={CheckCircle} label="עברו בחינה" value={stats?.examPassed} color="var(--success)" />
          <StatCard icon={XCircle} label="נכשלו" value={stats?.examFailed} color="var(--danger)" />
          <StatCard icon={Clock} label="טרם התחילו" value={stats?.trainingNotStarted} color="var(--warning)" sub="מהדרכה" />
          <StatCard icon={AlertCircle} label="לאחר הדרכה" value={stats?.examPending} color="var(--accent)" sub="טרם נבחנו" />
        </div>

        {/* Recent attempts */}
        {stats?.recentAttempts?.length > 0 && (
          <div className="card card-lg">
            <h2 style={{ fontSize: '1.05rem', marginBottom: '1.25rem' }}>ניסיונות בחינה אחרונים</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>שם עובד</th>
                    <th>מחלקה</th>
                    <th>ציון</th>
                    <th>תוצאה</th>
                    <th>תאריך</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentAttempts.map(att => (
                    <tr key={att.id}>
                      <td style={{ fontWeight: 600 }}>{att.user?.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{att.user?.department || '—'}</td>
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
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/report')}>
                דוח מלא
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin/users')}>
                ניהול עובדים
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
