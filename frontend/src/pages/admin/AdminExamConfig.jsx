import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/common/Layout';
import api from '../../utils/api';
import { Settings, CheckCircle, AlertTriangle, Save, Lock, HeartHandshake, HardHat } from 'lucide-react';

const TABS = [
  { type: 'cyber',  label: 'אבטחת מידע',          Icon: Lock },
  { type: 'haras',  label: 'מניעת הטרדה מינית',   Icon: HeartHandshake },
  { type: 'safety', label: 'בטיחות במקום העבודה', Icon: HardHat },
];

// ── Toggle switch component ───────────────────────────────────────
const ToggleSwitch = ({ checked, onChange, label, disabled }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: disabled ? 'default' : 'pointer', userSelect: 'none' }}>
    <div
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: 46, height: 26, borderRadius: 13,
        background: checked ? 'var(--success)' : '#cbd5e1',
        position: 'relative', transition: 'background 0.2s',
        flexShrink: 0, cursor: disabled ? 'default' : 'pointer',
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: '50%', background: 'white',
        position: 'absolute', top: 3, transition: 'right 0.2s',
        right: checked ? 3 : 23,
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: checked ? 'var(--success)' : 'var(--text-secondary)' }}>
      {label}
    </span>
  </label>
);

export default function AdminExamConfig() {
  const [activeTab, setActiveTab] = useState('cyber');
  const [questions, setQuestions] = useState([]);
  const [config, setConfig] = useState({ selectedQuestionIds: [], randomizeOrder: true, passingScore: 8, enabled: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async (type) => {
    setLoading(true);
    setMsg(''); setError('');
    try {
      const [qRes, cRes] = await Promise.all([
        api.get(`/admin/questions?type=${type}`),
        api.get(`/admin/exam-config?type=${type}`),
      ]);
      setQuestions(qRes.data);
      setConfig({
        selectedQuestionIds: cRes.data.selectedQuestionIds || [],
        randomizeOrder: cRes.data.randomizeOrder !== false,
        passingScore: cRes.data.passingScore || 8,
        enabled: cRes.data.enabled !== false,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(activeTab); }, [activeTab, load]);

  const handleToggle = async (newEnabled) => {
    setToggling(true);
    setMsg(''); setError('');
    try {
      await api.patch('/admin/exam-config/toggle', { trainingType: activeTab, enabled: newEnabled });
      setConfig(prev => ({ ...prev, enabled: newEnabled }));
      setMsg(newEnabled ? 'המודול הופעל בהצלחה' : 'המודול הושבת בהצלחה');
    } catch (err) {
      setError(err.response?.data?.error || 'שגיאה בשמירה');
    } finally {
      setToggling(false);
    }
  };

  const toggleQuestion = (id) => {
    setConfig(prev => {
      const ids = prev.selectedQuestionIds;
      if (ids.includes(id)) return { ...prev, selectedQuestionIds: ids.filter(x => x !== id) };
      if (ids.length >= 10) return prev;
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
      await api.put('/admin/exam-config', { ...config, trainingType: activeTab });
      setMsg('הגדרות הבחינה נשמרו בהצלחה');
    } catch (err) {
      setError(err.response?.data?.error || 'שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  const examQuestions = questions.filter(q => !q.isLearning);
  const selected = config.selectedQuestionIds;
  const categoryMap = {};
  examQuestions.forEach(q => {
    if (!categoryMap[q.category]) categoryMap[q.category] = [];
    categoryMap[q.category].push(q);
  });

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Settings size={22} color="var(--primary)" />
          <h1 style={{ fontSize: '1.5rem' }}>הגדרות בחינה</h1>
        </div>

        {/* Module tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: '1.5rem', borderBottom: '2px solid var(--border)' }}>
          {TABS.map(t => (
            <button
              key={t.type}
              onClick={() => setActiveTab(t.type)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.7rem 1.5rem', border: 'none', background: 'none',
                fontFamily: 'inherit', fontSize: '0.93rem',
                fontWeight: activeTab === t.type ? 700 : 500,
                color: activeTab === t.type ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                borderBottom: `3px solid ${activeTab === t.type ? 'var(--primary)' : 'transparent'}`,
                marginBottom: '-2px', transition: 'all 0.15s',
              }}
            >
              <t.Icon size={16} />{t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-screen"><div className="spinner" /></div>
        ) : (
          <>
            {/* Module enable/disable toggle */}
            <div className="card" style={{
              marginBottom: '1.25rem', padding: '1rem 1.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
              background: config.enabled ? 'white' : '#fef9f0',
              border: `1px solid ${config.enabled ? 'var(--border)' : '#fbbf24'}`,
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>הפעלת מודול</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                  {config.enabled
                    ? 'המודול פעיל — מופיע בתפריט העובד ובמסך הבחירה'
                    : 'המודול מושבת — מוסתר מהעובדים'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {toggling && <span className="spinner spinner-sm" />}
                <ToggleSwitch
                  checked={config.enabled}
                  onChange={handleToggle}
                  label={config.enabled ? 'פעיל' : 'מושבת'}
                  disabled={toggling}
                />
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              בחר 10 שאלות מתוך {examQuestions.length} שאלות לבחינה
            </p>

            {msg   && <div className="alert alert-success" style={{ marginBottom: '1rem' }}><CheckCircle size={14} />{msg}</div>}
            {error && <div className="alert alert-error"   style={{ marginBottom: '1rem' }}><AlertTriangle size={14} />{error}</div>}

            {/* Config options */}
            <div className="card" style={{ marginBottom: '1.25rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', padding: '1.25rem 1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.92rem', fontWeight: 500 }}>
                <input type="checkbox" checked={config.randomizeOrder}
                  onChange={e => setConfig(p => ({ ...p, randomizeOrder: e.target.checked }))}
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
              background: selected.length === 10 ? '#f0fdf4' : '#eff6ff',
              border: `2px solid ${selected.length === 10 ? '#86efac' : '#93c5fd'}`,
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
                          {q.questionText.length > 120 ? q.questionText.slice(0, 120) + '…' : q.questionText}
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
                {saving
                  ? <span className="spinner spinner-sm" style={{ borderTopColor: 'white' }} />
                  : <><Save size={18} />שמור הגדרות בחינה</>}
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
