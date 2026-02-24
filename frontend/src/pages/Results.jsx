import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/common/Layout';
import api from '../utils/api';
import { CheckCircle, XCircle, Award, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

const QuestionResult = ({ result, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      border: `2px solid ${result.isCorrect ? '#86efac' : '#fca5a5'}`,
      borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '0.75rem',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '0.85rem 1rem', background: result.isCorrect ? '#f0fdf4' : '#fef2f2',
          border: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer',
          fontFamily: 'inherit', textAlign: 'right',
        }}
      >
        {result.isCorrect
          ? <CheckCircle size={18} color="#27ae60" style={{ flexShrink: 0 }} />
          : <XCircle size={18} color="#c0392b" style={{ flexShrink: 0 }} />}
        <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)', flex: 1 }}>
          {index + 1}. {result.questionText}
        </span>
        {open ? <ChevronUp size={16} color="var(--text-secondary)" /> : <ChevronDown size={16} color="var(--text-secondary)" />}
      </button>
      {open && (
        <div style={{ padding: '1rem', background: 'white', borderTop: `1px solid ${result.isCorrect ? '#bbf7d0' : '#fecaca'}` }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.6, background: '#f9fafb', padding: '0.75rem', borderRadius: '6px' }}>
            <strong>הסבר:</strong> {result.explanation}
          </p>
        </div>
      )}
    </div>
  );
};

export default function Results() {
  const { user } = useAuth();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/exam/my-result').then(({ data }) => setAttempt(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><div className="loading-screen"><div className="spinner" /></div></Layout>;

  if (!attempt && user?.examCompletedAt) {
    return (
      <Layout>
        <div style={{ maxWidth: 600, margin: '2rem auto' }}>
          <div className="alert alert-error">
            <AlertTriangle size={18} />
            לא נמצאו נתוני בחינה. פנה לסמנכ"ל מערכות המידע.
          </div>
        </div>
      </Layout>
    );
  }

  const score = attempt?.score ?? user?.examScore ?? 0;
  const total = attempt?.totalQuestions ?? 10;
  const passed = attempt?.passed ?? user?.examPassed;
  const results = attempt?.results || [];
  const pct = Math.round((score / total) * 100);

  return (
    <Layout>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Result Header */}
        <div style={{
          borderRadius: 'var(--radius)', padding: '2rem',
          background: passed
            ? 'linear-gradient(135deg, #27ae60, #2ecc71)'
            : 'linear-gradient(135deg, #c0392b, #e74c3c)',
          color: 'white', textAlign: 'center', marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-md)',
        }}>
          {passed
            ? <Award size={52} color="white" style={{ marginBottom: '0.75rem' }} />
            : <XCircle size={52} color="white" style={{ marginBottom: '0.75rem' }} />}
          <h1 style={{ color: 'white', fontSize: '1.6rem', marginBottom: '0.5rem' }}>
            {passed ? 'מזל טוב! עברת את הבחינה' : 'לא עברת את הבחינה'}
          </h1>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: 'white', margin: '0.75rem 0' }}>
            {score}/{total}
          </div>
          <div style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.85)' }}>
            {pct}% | ציון עובר: 80% (8/10)
          </div>
        </div>

        {/* Score breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'תשובות נכונות', value: score, color: 'var(--success)', icon: '✅' },
            { label: 'תשובות שגויות', value: total - score, color: 'var(--danger)', icon: '❌' },
            { label: 'ציון', value: `${pct}%`, color: passed ? 'var(--success)' : 'var(--danger)', icon: '📊' },
          ].map(item => (
            <div key={item.label} className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Not passed message */}
        {!passed && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            <AlertTriangle size={20} style={{ flexShrink: 0 }} />
            <div>
              <strong>לא עברת את הבחינה.</strong>
              <br />
              יש לפנות לסמנכ"ל מערכות המידע לאיפוס הבחינה ולקביעת מועד חוזר.
            </div>
          </div>
        )}

        {/* Questions Review */}
        {results.length > 0 && (
          <div className="card card-lg">
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: 'var(--text)' }}>
              סקירת שאלות
            </h2>
            {results.map((result, i) => (
              <QuestionResult key={result.questionId} result={result} index={i} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
