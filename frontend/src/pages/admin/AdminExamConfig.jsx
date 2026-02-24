import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import api from '../../utils/api';
import { Settings, CheckCircle, AlertTriangle, Save, Info } from 'lucide-react';

export default function AdminExamConfig() {
  const [questions, setQuestions] = useState([]);
  const [config, setConfig] = useState({ selectedQuestionIds: [], randomizeOrder: true, passingScore: 8 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/admin/questions'),
      api.get('/admin/exam-config'),
    ]).then(([qRes, cRes]) => {
      setQuestions(qRes.data);
      setConfig({
        selectedQuestionIds: cRes.data.selectedQuestionIds || [],
        randomizeOrder: cRes.data.randomizeOrder !== false,
        passingScore: cRes.data.passingScore || 8,
      });
    }).finally(() => setLoading(false));
  }, []);

  const toggleQuestion = (id) => {
    setConfig(prev => {
      const ids = prev.selectedQuestionIds;
      if (ids.includes(id)) {
        return { ...prev, selectedQuestionIds: ids.filter(x => x !== id) };
      }
      if (ids.length >= 10) return prev; // max 10
      return { ...prev, selectedQuestionIds: [...ids, id] };
    });
  };

  const save = async () => {
    if (config.selectedQuestionIds.length !== 10) {
      setError('יש לבחור בדיוק 10 שאלות לבחינה');
      return;
    }
    setSaving(true); setError(''); setMsg('');
    try {
      await api.put('/admin/exam-config', config);
      setMsg('הגדרות הבחינה נשמרו בהצלחה');
    } catch (err) {
      setError(err.response?.data?.error || 'שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout><div className="loading-screen"><div className="spinner" /></div></Layout>;

  const selected = config.selectedQuestionIds;
  const categoryMap = {};
  questions.forEach(q => {
    if (!categoryMap[q.category]) categoryMap[q.category] = [];
    categoryMap[q.category].push(q);
  });

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Settings size={22} color="var(--primary)" />
            <h1 style={{ fontSize: '1.5rem' }}>הגדרות בחינה</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>בחר 10 שאלות מתוך {questions.length} שאלות לבחינה</p>
        </div>

        {msg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}><CheckCircle size={14} />{msg}</div>}
        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}><AlertTriangle size={14} />{error}</div>}

        {/* Config options */}
        <div className="card" style={{ marginBottom: '1.25rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', padding: '1.25rem 1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.92rem', fontWeight: 500 }}>
            <input type="checkbox" checked={config.randomizeOrder} onChange={e => setConfig(p => ({ ...p, randomizeOrder: e.target.checked }))}
              style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--primary)' }} />
            ערבוב סדר שאלות
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.92rem', fontWeight: 500 }}>ציון עובר:</span>
            <select className="form-input" style={{ width: 80 }} value={config.passingScore}
              onChange={e => setConfig(p => ({ ...p, passingScore: parseInt(e.target.value) }))}>
              {[6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n}/10</option>)}
            </select>
          </div>
        </div>

        {/* Progress indicator */}
        <div style={{
          background: selected.length === 10 ? '#f0fdf4' : selected.length > 10 ? '#fef2f2' : '#eff6ff',
          border: `2px solid ${selected.length === 10 ? '#86efac' : selected.length > 10 ? '#fca5a5' : '#93c5fd'}`,
          borderRadius: 'var(--radius-sm)', padding: '0.85rem 1.25rem',
          marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: selected.length === 10 ? 'var(--success)' : 'var(--primary)' }}>
            {selected.length}/10
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
            {selected.length === 10 ? 'מצוין! בחרת 10 שאלות' : `נדרש ${10 - selected.length} שאלות נוספות`}
          </span>
          {selected.length === 10 && (
            <button className="btn btn-primary btn-sm" onClick={save} disabled={saving} style={{ marginRight: 'auto' }}>
              {saving ? <span className="spinner spinner-sm" /> : <><Save size={14} />שמור</>}
            </button>
          )}
        </div>

        {/* Questions by category */}
        {Object.entries(categoryMap).map(([cat, qs]) => (
          <div key={cat} className="card" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.92rem' }}>{cat}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>({qs.length} שאלות)</span>
            </div>
            {qs.map(q => {
              const isSelected = selected.includes(q.id);
              const isDisabled = !isSelected && selected.length >= 10;
              return (
                <div
                  key={q.id}
                  onClick={() => !isDisabled && toggleQuestion(q.id)}
                  style={{
                    padding: '0.75rem 0.5rem', borderRadius: '6px',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.5 : 1,
                    background: isSelected ? '#eff6ff' : 'transparent',
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    marginBottom: '0.25rem', transition: 'background 0.15s',
                  }}
                >
                  <div style={{
                    width: 22, height: 22, border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: '4px', background: isSelected ? 'var(--primary)' : 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
                  }}>
                    {isSelected && <CheckCircle size={14} color="white" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text)', fontWeight: isSelected ? 600 : 400, lineHeight: 1.5 }}>
                      {q.questionText.length > 120 ? q.questionText.slice(0, 120) + '...' : q.questionText}
                    </span>
                    <span style={{ marginRight: '0.5rem' }}>
                      <span className={`badge ${q.type === 'multiple' ? 'badge-info' : 'badge-gray'}`} style={{ fontSize: '0.7rem' }}>
                        {q.type === 'multiple' ? 'מרובה' : 'יחידה'}
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button className="btn btn-primary btn-lg" onClick={save} disabled={saving || selected.length !== 10}>
            {saving ? <span className="spinner spinner-sm" style={{ borderTopColor: 'white' }} /> : <><Save size={18} />שמור הגדרות בחינה</>}
          </button>
        </div>
      </div>
    </Layout>
  );
}
