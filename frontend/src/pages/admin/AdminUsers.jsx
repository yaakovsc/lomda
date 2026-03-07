import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/common/Layout';
import api from '../../utils/api';
import {
  UserPlus, Search, CheckCircle, XCircle,
  Clock, RotateCcw, Key, Trash2, AlertTriangle, X, Copy, Eye, EyeOff,
  Lock, HeartHandshake, HardHat,
} from 'lucide-react';

const MODULES = [
  { type: 'cyber',  label: 'אבטחת מידע',          Icon: Lock },
  { type: 'haras',  label: 'מניעת הטרדה מינית',   Icon: HeartHandshake },
  { type: 'safety', label: 'בטיחות במקום העבודה', Icon: HardHat },
];

const getProgress = (user, type) =>
  user.moduleProgress?.find(p => p.trainingType === type) ?? null;

const ModuleStatusBadge = ({ progress }) => {
  if (!progress?.trainingStartedAt)               return <span className="badge badge-gray">לא התחיל</span>;
  if (progress.examPassed)                         return <span className="badge badge-success"><CheckCircle size={11} />עבר</span>;
  if (progress.examCompletedAt && progress.examLockedByAdmin) return <span className="badge badge-danger"><Lock size={11} />נעול</span>;
  if (progress.examCompletedAt)                    return <span className="badge badge-danger"><XCircle size={11} />נכשל</span>;
  if (progress.trainingCompletedAt)                return <span className="badge badge-warning"><Clock size={11} />לפני בחינה</span>;
  return <span className="badge badge-info"><Clock size={11} />בהדרכה</span>;
};

// ─── Modals ──────────────────────────────────────────────────────────────────

const Modal = ({ title, children, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3 style={{ fontSize: '1rem' }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
      </div>
      {children}
    </div>
  </div>
);

const PasswordRevealModal = ({ name, password, onClose, mode }) => {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Modal title={mode === 'reset' ? 'סיסמה אופסה' : 'סיסמה זמנית נוצרה'} onClose={onClose}>
      <div className="modal-body">
        <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
          <CheckCircle size={14} />
          {mode === 'reset'
            ? <><strong>{name}</strong> — הסיסמה אופסה בהצלחה</>
            : <><strong>{name}</strong> — המשתמש נוצר בהצלחה</>}
        </div>
        <p style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          יש למסור את הסיסמה הזמנית הזו למשתמש.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.75rem 1rem' }}>
          <span style={{ flex: 1, fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '0.05em', direction: 'ltr', textAlign: 'left' }}>
            {show ? password : '•'.repeat(password.length)}
          </span>
          <button onClick={() => setShow(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.25rem' }}>
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button onClick={copy} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? 'var(--success)' : 'var(--text-secondary)', padding: '0.25rem' }}>
            <Copy size={18} />
          </button>
        </div>
        {copied && <p style={{ color: 'var(--success)', fontSize: '0.82rem', marginTop: '0.4rem' }}>הסיסמה הועתקה ✓</p>}
      </div>
      <div className="modal-footer">
        <button className="btn btn-primary" onClick={onClose}>סגור</button>
      </div>
    </Modal>
  );
};

const CreateUserModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({ name: '', email: '', department: '', role: 'employee' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdPassword, setCreatedPassword] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/admin/users', form);
      onSuccess();
      setCreatedPassword({ name: form.name, password: data.tempPassword });
    } catch (err) {
      setError(err.response?.data?.error || 'שגיאה ביצירת המשתמש');
    } finally { setLoading(false); }
  };

  if (createdPassword) {
    return <PasswordRevealModal name={createdPassword.name} password={createdPassword.password} onClose={onClose} />;
  }

  return (
    <Modal title="הוספת עובד חדש" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="modal-body">
          {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}><AlertTriangle size={14} />{error}</div>}
          {[
            { label: 'שם מלא', key: 'name', type: 'text', required: true },
            { label: 'כתובת אימייל', key: 'email', type: 'email', required: true },
            { label: 'מחלקה', key: 'department', type: 'text' },
          ].map(f => (
            <div className="form-group" key={f.key}>
              <label className="form-label">{f.label}{f.required && ' *'}</label>
              <input type={f.type} className="form-input" required={f.required}
                value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
          <div className="form-group">
            <label className="form-label">תפקיד</label>
            <select className="form-input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
              <option value="employee">עובד</option>
              <option value="admin">מנהל מערכת</option>
            </select>
          </div>
          <div className="alert alert-info" style={{ fontSize: '0.83rem' }}>
            <AlertTriangle size={14} />הסיסמה הזמנית תוצג מיד לאחר יצירת המשתמש.
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>ביטול</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner spinner-sm" /> : 'צור עובד'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [msg, setMsg] = useState({ text: '', type: 'success' });
  const [resetPassword, setResetPassword] = useState(null);

  const flash = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: 'success' }), 4000);
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get('/admin/users', { params: { search, limit: 100 } });
    setUsers(data.users);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(loadUsers, 300);
    return () => clearTimeout(t);
  }, [loadUsers]);

  // User-level actions (password reset, delete)
  const userAction = async (type, userId, userName) => {
    const labels = { resetPassword: 'איפוס סיסמה', delete: 'מחיקת המשתמש' };
    if (!window.confirm(`האם לבצע ${labels[type]} עבור ${userName}?`)) return;
    setActionLoading(`${type}-${userId}`);
    try {
      const endpoints = {
        resetPassword: `/admin/users/${userId}/reset-password`,
        delete: `/admin/users/${userId}`,
      };
      const method = type === 'delete' ? 'delete' : 'post';
      const { data } = await api[method](endpoints[type]);
      if (type === 'resetPassword' && data.tempPassword) {
        setResetPassword({ name: userName, password: data.tempPassword, mode: 'reset' });
      } else {
        flash(data.message || 'הפעולה בוצעה');
      }
      loadUsers();
    } catch (err) {
      flash(err.response?.data?.error || 'שגיאה', 'error');
    } finally {
      setActionLoading('');
    }
  };

  // Module-level action: reset exam for a specific trainingType
  const resetExam = async (userId, userName, trainingType) => {
    const moduleLabel = MODULES.find(m => m.type === trainingType)?.label || trainingType;
    if (!window.confirm(`לאפס את בחינת "${moduleLabel}" עבור ${userName}?`)) return;
    setActionLoading(`resetExam-${userId}-${trainingType}`);
    try {
      const { data } = await api.post(`/admin/users/${userId}/reset-exam`, { trainingType });
      flash(data.message || 'הבחינה אופסה');
      loadUsers();
    } catch (err) {
      flash(err.response?.data?.error || 'שגיאה', 'error');
    } finally {
      setActionLoading('');
    }
  };

  const numCols = 8; // for colspan on loading/empty rows

  return (
    <Layout>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>ניהול עובדים</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{users.length} עובדים</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <UserPlus size={16} />הוסף עובד
          </button>
        </div>

        {msg.text && (
          <div className={`alert ${msg.type === 'error' ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: '1rem' }}>
            <CheckCircle size={14} />{msg.text}
          </div>
        )}

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '1.25rem', maxWidth: 360 }}>
          <Search size={16} style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input className="form-input" style={{ paddingRight: '2.5rem' }} placeholder="חיפוש לפי שם או אימייל..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>שם</th>
                <th>אימייל</th>
                <th>מחלקה</th>
                <th>מודול</th>
                <th>סטטוס</th>
                <th style={{ textAlign: 'center' }}>ניסיונות</th>
                <th style={{ textAlign: 'center' }}>איפוס בחינה</th>
                <th>כניסה אחרונה</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={numCols} style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: 'auto' }} /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={numCols} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>לא נמצאו עובדים</td></tr>
              ) : users.flatMap(u => {
                const lastLogin = u.lastLoginAt
                  ? new Date(u.lastLoginAt).toLocaleDateString('he-IL')
                  : '—';

                return MODULES.map((mod, mi) => {
                  const progress = getProgress(u, mod.type);
                  const isFirst = mi === 0;
                  const loadKey = `resetExam-${u.id}-${mod.type}`;

                  // Subtle top border to visually group user rows
                  const rowStyle = isFirst
                    ? { borderTop: '2px solid var(--border)' }
                    : {};

                  return (
                    <tr key={`${u.id}-${mod.type}`} style={rowStyle}>
                      {/* User-level cells — only on first module row */}
                      {isFirst && (
                        <>
                          <td rowSpan={MODULES.length} style={{ fontWeight: 600, verticalAlign: 'middle' }}>{u.name}</td>
                          <td rowSpan={MODULES.length} style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', direction: 'ltr', verticalAlign: 'middle' }}>{u.email}</td>
                          <td rowSpan={MODULES.length} style={{ color: 'var(--text-secondary)', verticalAlign: 'middle' }}>{u.department || '—'}</td>
                        </>
                      )}

                      {/* Module name */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text)' }}>
                          <mod.Icon size={14} color="var(--primary)" style={{ flexShrink: 0 }} />
                          {mod.label}
                        </div>
                      </td>

                      {/* Status */}
                      <td><ModuleStatusBadge progress={progress} /></td>

                      {/* Attempts */}
                      <td style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                        {progress?.examAttempts || 0}
                      </td>

                      {/* Reset exam (per module) */}
                      <td style={{ textAlign: 'center' }}>
                        {progress?.trainingStartedAt ? (
                          <button
                            title={`איפוס בחינת ${mod.label}`}
                            className="btn btn-ghost btn-sm"
                            disabled={!!actionLoading}
                            onClick={() => resetExam(u.id, u.name, mod.type)}
                            style={{ padding: '0.4rem' }}
                          >
                            {actionLoading === loadKey
                              ? <span className="spinner spinner-sm" />
                              : <RotateCcw size={14} color="var(--warning)" />}
                          </button>
                        ) : (
                          <span style={{ color: 'var(--border)', fontSize: '0.8rem' }}>—</span>
                        )}
                      </td>

                      {/* Last login + user actions — only on first module row */}
                      {isFirst && (
                        <>
                          <td rowSpan={MODULES.length} style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', verticalAlign: 'middle' }}>
                            {lastLogin}
                          </td>
                          <td rowSpan={MODULES.length} style={{ verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              <button title="איפוס סיסמה" className="btn btn-ghost btn-sm"
                                disabled={!!actionLoading} onClick={() => userAction('resetPassword', u.id, u.name)}
                                style={{ padding: '0.4rem' }}>
                                {actionLoading === `resetPassword-${u.id}`
                                  ? <span className="spinner spinner-sm" />
                                  : <Key size={14} color="var(--primary)" />}
                              </button>
                              {u.role !== 'admin' && (
                                <button title="מחק עובד" className="btn btn-ghost btn-sm"
                                  disabled={!!actionLoading} onClick={() => userAction('delete', u.id, u.name)}
                                  style={{ padding: '0.4rem' }}>
                                  {actionLoading === `delete-${u.id}`
                                    ? <span className="spinner spinner-sm" />
                                    : <Trash2 size={14} color="var(--danger)" />}
                                </button>
                              )}
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>

        {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} onSuccess={loadUsers} />}
        {resetPassword && (
          <PasswordRevealModal
            name={resetPassword.name}
            password={resetPassword.password}
            mode={resetPassword.mode}
            onClose={() => setResetPassword(null)}
          />
        )}
      </div>
    </Layout>
  );
}
