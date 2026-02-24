import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const expired = params.get('expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.examCompletedAt) {
        navigate('/results');
      } else if (user.trainingCompletedAt) {
        navigate('/exam');
      } else {
        navigate('/training');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'אירעה שגיאה. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f2347 0%, #1a3a6b 50%, #2554a3 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      {/* Background pattern */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.05,
        backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)',
        backgroundSize: '30px 30px',
      }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        {/* Logo area */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 100, height: 100, background: 'white',
            borderRadius: '20px', marginBottom: '1rem',
            padding: '0.6rem', boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
          }}>
            <img src="/giron.png" alt="גירון" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            הדרכת אבטחת מידע
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem' }}>
            גירון פיתוח ובניה בע"מ
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'white', borderRadius: 'var(--radius)', padding: '2.5rem',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1.75rem', color: 'var(--text)' }}>
            כניסה למערכת
          </h2>

          {expired && (
            <div className="alert alert-warning" style={{ marginBottom: '1.25rem' }}>
              <AlertCircle size={16} />
              פג תוקף הסשן. אנא התחבר/י מחדש.
            </div>
          )}

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="on">
            <div className="form-group">
              <label className="form-label" htmlFor="email">כתובת אימייל</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  style={{ paddingRight: '2.5rem' }}
                  placeholder="name@giron.co.il"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  autoComplete="email"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label" htmlFor="password">סיסמה</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingRight: '2.5rem', paddingLeft: '2.5rem' }}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0 }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block"
              disabled={loading}
            >
              {loading ? <><span className="spinner spinner-sm" style={{ borderTopColor: 'white' }} />טוען...</> : 'כניסה'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            שכחת סיסמה?{' '}
            <a href="/request-reset" style={{ color: 'var(--primary)', fontWeight: 600 }}>לחץ כאן</a>
          </p>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginTop: '1.5rem' }}>
          מערכת פנימית מאובטחת | גירון פיתוח ובניה בע"מ
        </p>
      </div>
    </div>
  );
}
