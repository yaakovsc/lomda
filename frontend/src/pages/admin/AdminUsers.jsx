import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/common/Layout';
import api from '../../utils/api';
import {
  UserPlus, Search, CheckCircle, XCircle,
  Clock, RotateCcw, Key, Trash2, AlertTriangle, X, Copy, Eye, EyeOff, Lock
} from 'lucide-react';

const StatusBadge = ({ user }) => {
  if (user.examPassed) return <span className="badge badge-success"><CheckCircle size={11} />עבר</span>;
  if (user.examCompletedAt && user.examLockedByAdmin) return <span className="badge badge-danger"><Lock size={11} />נעול</span>;
  if (user.examCompletedAt) return <span className="badge badge-danger"><XCircle size={11} />נכשל</span>;
  if (user.examLockedByAdmin) return <span className="badge badge-warning"><Lock size={11} />בבחינה</span>;
  if (user.trainingCompletedAt) return <span className="badge badge-warning"><Clock size={11} />לפני בחינה</span>;
  if (user.trainingStartedAt) return <span className="badge badge-info"><Clock size={11} />בהדרכה</span>;
  return <span className="badge badge-gray">לא התחיל</span>;
};

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

  const isReset = mode === 'reset';

  return (
    <Modal title={isReset ? 'סיסמה אופסה' : 'סיסמה זמנית נוצרה'} onClose={onClose}>
      <div className="modal-body">
        <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
          <CheckCircle size={14} />
          {isReset ? <>הסיסמה של <strong>{name}</strong> אופסה בהצלחה</> : <>המשתמש <strong>{name}</strong> נוצר בהצלחה</>}
        </div>
        <p style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          יש למסור את הסיסמה הזמנית הזו למשתמש. לאחר הכניסה מומלץ לשנות אותה.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.75rem 1rem' }}>
          <span style={{ flex: 1, fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '0.05em', direction: 'ltr', textAlign: 'left' }}>
            {show ? password : '•'.repeat(password.length)}
          </span>
          <button onClick={() => setShow(s => !s)} title={show ? 'הסתר' : 'הצג'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.25rem' }}>
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button onClick={copy} title="העתק"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? 'var(--success)' : 'var(--text-secondary)', padding: '0.25rem' }}>
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
            <AlertTriangle size={14} />
            הסיסמה הזמנית תוצג מיד לאחר יצירת המשתמש.
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

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [msg, setMsg] = useState('');
  const [resetPassword, setResetPassword] = useState(null); // { name, password }

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

  const action = async (type, userId, userName) => {
    const labels = {
      resetExam: 'שחרור לבחינה נוספת', resetPassword: 'איפוס סיסמה', delete: 'מחיקת המשתמש'
    };
    if (!window.confirm(`האם לבצע ${labels[type]}?`)) return;
    setActionLoading(`${type}-${userId}`);
    try {
      const endpoints = {
        resetExam: `/admin/users/${userId}/reset-exam`,
        resetPassword: `/admin/users/${userId}/reset-password`,
        delete: `/admin/users/${userId}`,
      };
      const method = type === 'delete' ? 'delete' : 'post';
      const { data } = await api[method](endpoints[type]);
      if (type === 'resetPassword' && data.tempPassword) {
        setResetPassword({ name: userName, password: data.tempPassword, mode: 'reset' });
      } else {
        setMsg(data.message || 'הפעולה בוצעה');
        setTimeout(() => setMsg(''), 4000);
      }
      loadUsers();
    } catch (err) {
      setMsg(err.response?.data?.error || 'שגיאה');
      setTimeout(() => setMsg(''), 4000);
    } finally {
      setActionLoading('');
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>ניהול עובדים</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{users.length} עובדים</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <UserPlus size={16} />הוסף עובד
          </button>
        </div>

        {msg && <div className={`alert ${msg.includes('שגיאה') ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: '1rem' }}><CheckCircle size={14} />{msg}</div>}

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
                <th>סטטוס</th>
                <th>ניסיונות</th>
                <th>כניסה אחרונה</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: 'auto' }} /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>לא נמצאו עובדים</td></tr>
              ) : users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', direction: 'ltr' }}>{u.email}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.department || '—'}</td>
                  <td><StatusBadge user={u} /></td>
                  <td style={{ textAlign: 'center' }}>{u.examAttempts || 0}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.83rem' }}>
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('he-IL') : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button title="שחרר לבחינה נוספת" className="btn btn-ghost btn-sm"
                        disabled={!!actionLoading} onClick={() => action('resetExam', u.id, u.name)}
                        style={{ padding: '0.4rem' }}>
                        <RotateCcw size={14} color="var(--warning)" />
                      </button>
                      <button title="איפוס סיסמה" className="btn btn-ghost btn-sm"
                        disabled={!!actionLoading} onClick={() => action('resetPassword', u.id, u.name)}
                        style={{ padding: '0.4rem' }}>
                        <Key size={14} color="var(--primary)" />
                      </button>
                      {u.role !== 'admin' && (
                        <button title="מחק עובד" className="btn btn-ghost btn-sm"
                          disabled={!!actionLoading} onClick={() => action('delete', u.id)}
                          style={{ padding: '0.4rem' }}>
                          <Trash2 size={14} color="var(--danger)" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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
