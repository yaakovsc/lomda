import { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/common/Layout';
import api from '../../utils/api';
import {
  RefreshCw, CheckCircle, AlertTriangle, Shield, Bug,
  RotateCcw, Clock, Zap, CloudDownload,
} from 'lucide-react';

const TYPE_META = {
  critical: { label: 'עדכון קריטי', color: 'var(--danger)', bg: 'var(--danger)', Icon: AlertTriangle },
  security: { label: 'עדכון אבטחה', color: 'var(--warning)', bg: 'var(--warning)', Icon: Shield },
  bug_fix:  { label: 'תיקון באגים', color: 'var(--info)',    bg: 'var(--info)',    Icon: Bug },
};

export default function AdminUpdate() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null); // { text, type: 'success'|'error' }

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/update/status');
      setStatus(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleCheck = async () => {
    setActionLoading(true);
    try {
      const { data } = await api.post('/admin/update/check');
      setStatus(data);
      setMessage({ text: 'בדיקה הושלמה', type: 'success' });
    } catch {
      setMessage({ text: 'שגיאה בבדיקת עדכון', type: 'error' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleSchedule = async (immediate) => {
    if (!window.confirm(immediate
      ? 'המערכת תעבור למצב תחזוקה כעת. להמשיך?'
      : 'העדכון יתחיל הלילה בשעה 02:00 כשאין משתמשים פעילים. לאשר?'
    )) return;

    setActionLoading(true);
    try {
      const { data } = await api.post('/admin/update/schedule', { immediate });
      setMessage({ text: data.message, type: 'success' });
      await fetchStatus();
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'שגיאה', type: 'error' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleRevert = async () => {
    if (!window.confirm('שחזור לגרסה הקודמת — המערכת תעבור למצב תחזוקה ותיבנה מחדש. להמשיך?')) return;
    setActionLoading(true);
    try {
      const { data } = await api.post('/admin/update/revert');
      setMessage({ text: data.message, type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'שגיאה בשחזור', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <Layout>
      <div className="loading-screen"><div className="spinner" /><span>טוען...</span></div>
    </Layout>
  );

  const meta = status?.updateInfo ? (TYPE_META[status.updateInfo.type] || TYPE_META.bug_fix) : null;

  return (
    <Layout>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CloudDownload size={28} color="var(--primary)" />
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', margin: 0 }}>עדכון מערכת</h1>
              {status?.lastChecked && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  בדיקה אחרונה: {new Date(status.lastChecked).toLocaleString('he-IL')}
                </div>
              )}
            </div>
          </div>
          <button
            className="btn btn-secondary"
            onClick={handleCheck}
            disabled={actionLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <RefreshCw size={15} style={{ animation: actionLoading ? 'spin 1s linear infinite' : 'none' }} />
            בדוק עכשיו
          </button>
        </div>

        {/* Inline message */}
        {message && (
          <div style={{
            padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem',
            background: message.type === 'success' ? 'var(--success)18' : 'var(--danger)18',
            color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
            border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--danger)'}40`,
            fontWeight: 600, fontSize: '0.9rem',
          }}>
            {message.text}
          </div>
        )}

        {/* ── UP TO DATE ── */}
        {!status?.updateAvailable && !status?.maintenanceMode && (
          <div style={{
            background: 'var(--success)12', border: '1.5px solid var(--success)40',
            borderRadius: 14, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem',
            marginBottom: '1.5rem',
          }}>
            <CheckCircle size={40} color="var(--success)" strokeWidth={1.5} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--success)' }}>המערכת מעודכנת</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 2 }}>
                גרסה נוכחית: <strong>{status?.currentVersion}</strong>
                {status?.lastUpdateResult === 'OK' && ' — עדכון אחרון הצליח ✓'}
                {status?.lastUpdateResult === 'REVERTED' && ' — עדכון אחרון שוחזר אוטומטית'}
              </div>
            </div>
          </div>
        )}

        {/* ── UPDATE AVAILABLE ── */}
        {status?.updateAvailable && status.updateInfo && (
          <>
            {/* Version diff card */}
            <div style={{
              background: 'white', borderRadius: 14, padding: '1.25rem',
              boxShadow: '0 2px 16px rgba(0,0,0,0.08)', marginBottom: '1rem',
              border: `2px solid ${meta.bg}40`,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    background: `${meta.bg}18`, color: meta.color,
                    padding: '3px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700,
                    marginBottom: '0.5rem',
                  }}>
                    <meta.Icon size={13} />
                    {meta.label}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)' }}>
                    {status.updateInfo.title}
                  </div>
                  {status.updateInfo.description && status.updateInfo.description !== status.updateInfo.title && (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>
                      {status.updateInfo.description}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'left', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>גרסה נוכחית</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{status.currentVersion}</div>
                  <div style={{ fontSize: '1.2rem', color: meta.color, lineHeight: 1 }}>↓</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>גרסה חדשה</div>
                  <div style={{ fontWeight: 800, color: meta.color, fontSize: '1.05rem' }}>{status.latestVersion}</div>
                </div>
              </div>
            </div>

            {/* Changelog */}
            {status.updateInfo.changelog?.length > 0 && (
              <div style={{
                background: 'var(--bg)', borderRadius: 12, padding: '1rem 1.25rem',
                marginBottom: '1rem', border: '1px solid rgba(0,0,0,0.07)',
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                  מה השתנה
                </div>
                <ul style={{ margin: 0, paddingRight: '1.2rem', color: 'var(--text)', fontSize: '0.88rem', lineHeight: 1.7 }}>
                  {status.updateInfo.changelog.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            {!status.scheduledAt && !status.maintenanceMode && (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => handleSchedule(true)}
                  disabled={actionLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Zap size={16} />
                  שדרג עכשיו
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleSchedule(false)}
                  disabled={actionLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Clock size={16} />
                  תזמן עדכון ללילה (02:00)
                </button>
              </div>
            )}

            {/* Scheduled confirmation */}
            {status.scheduledAt && !status.maintenanceMode && (
              <div style={{
                background: 'var(--info)12', border: '1.5px solid var(--info)40',
                borderRadius: 12, padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
              }}>
                <Clock size={22} color="var(--info)" />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--info)' }}>עדכון מתוזמן</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {new Date(status.scheduledAt).toLocaleString('he-IL')} — המערכת תעדכן כשלא יהיו משתמשים פעילים
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── MAINTENANCE MODE ── */}
        {status?.maintenanceMode && (
          <div style={{
            background: 'var(--warning)12', border: '1.5px solid var(--warning)40',
            borderRadius: 12, padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
            marginBottom: '1rem',
          }}>
            <RefreshCw size={22} color="var(--warning)" style={{ animation: 'spin 2s linear infinite', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--warning)' }}>מצב תחזוקה — עדכון בתהליך</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                המערכת מתעדכנת כעת. חלון זה יתרענן אוטומטית עם השלמת העדכון.
              </div>
            </div>
          </div>
        )}

        {/* ── BACKUP & REVERT ── */}
        {status?.backupInfo && (
          <div style={{
            background: 'white', borderRadius: 12, padding: '1rem 1.25rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginTop: '1.5rem',
            border: '1px solid rgba(0,0,0,0.07)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>גיבוי אחרון</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  {new Date(status.backupInfo.date).toLocaleString('he-IL')} — תג: {status.backupInfo.tag}
                </div>
              </div>
              <button
                className="btn btn-secondary"
                onClick={handleRevert}
                disabled={actionLoading || status.maintenanceMode}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--danger)' }}
              >
                <RotateCcw size={14} />
                שחזר לגרסה קודמת
              </button>
            </div>
          </div>
        )}

        {/* Active users info */}
        {status?.activeUsers > 0 && (
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'left' }}>
            משתמשים פעילים כעת: {status.activeUsers} (העדכון ימתין עד שיתנתקו)
          </div>
        )}

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </Layout>
  );
}
