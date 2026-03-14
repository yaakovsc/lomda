import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expired, setExpired] = useState(false);

  const HEBREW_TO_EN = {
    'ש':'a','נ':'b','ב':'c','ג':'d','ק':'e','כ':'f','ע':'g','י':'h','ן':'i',
    'ח':'j','ל':'k','ך':'l','צ':'m','מ':'n','ם':'o','פ':'p','ר':'r','ד':'s',
    'א':'t','ו':'u','ה':'v','ס':'x','ט':'y','ז':'z','ץ':'.','ף':';','ת':',',
  };
  const convertEmail = (val) => val.split('').map(c => HEBREW_TO_EN[c] ?? c).join('');

  useEffect(() => {
    if (sessionStorage.getItem('auth_expired') === '1') {
      sessionStorage.removeItem('auth_expired');
      setExpired(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/modules');
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
            <img src="/bakie.png" alt="בָּקִיא" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            ״בָּקִיא״ הדרכת עובדים
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem' }}>
            קובי שלזינגר ייעוץ וליווי פרוייקטים
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
                  type="text"
                  inputMode="email"
                  className="form-input"
                  style={{ paddingRight: '2.5rem' }}
                  placeholder="name@giron.co.il"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: convertEmail(e.target.value) }))}
                  required
                  pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
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
            שכחת סיסמה? פנה למנהל המערכת לאיפוס.
          </p>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginTop: '1.5rem' }}>
          מערכת פנימית מאובטחת | קובי שלזינגר 054-5664594
        </p>
      </div>
    </div>
  );
}
