import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/common/Layout';
import api from '../../utils/api';
import { BookOpen, ChevronDown, ChevronUp, Save, CheckCircle, AlertTriangle, Plus, Trash2, Lock, HeartHandshake, HardHat } from 'lucide-react';

const TABS = [
  { type: 'cyber',  label: 'אבטחת מידע',          Icon: Lock },
  { type: 'haras',  label: 'מניעת הטרדה מינית',   Icon: HeartHandshake },
  { type: 'safety', label: 'בטיחות במקום העבודה', Icon: HardHat },
];

// ── Inline slide editor ───────────────────────────────────────────
function SlideEditor({ slide, onSaved }) {
  const [title, setTitle]       = useState(slide.title);
  const [content, setContent]   = useState(slide.content);
  const [keyPoints, setKeyPoints] = useState([...(slide.keyPoints || [])]);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState('');
  const [error, setError]       = useState('');

  const dirty =
    title !== slide.title ||
    content !== slide.content ||
    JSON.stringify(keyPoints) !== JSON.stringify(slide.keyPoints || []);

  const save = async () => {
    setSaving(true); setMsg(''); setError('');
    try {
      const { data } = await api.put(`/admin/slides/${slide.id}`, { title, content, keyPoints });
      setMsg('נשמר');
      onSaved(data);
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  const updatePoint = (i, val) => setKeyPoints(prev => prev.map((p, idx) => idx === i ? val : p));
  const addPoint    = () => setKeyPoints(prev => [...prev, '']);
  const removePoint = (i) => setKeyPoints(prev => prev.filter((_, idx) => idx !== i));

  return (
    <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border)', background: '#fafbfc' }}>
      {/* Title */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
          כותרת
        </label>
        <input
          className="form-input"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      {/* Content */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
          תוכן
        </label>
        <textarea
          className="form-input"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={3}
          style={{ width: '100%', resize: 'vertical', lineHeight: 1.6 }}
        />
      </div>

      {/* Key Points */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          נקודות מפתח
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {keyPoints.map((pt, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 800, paddingTop: '0.6rem', flexShrink: 0 }}>✓</span>
              <textarea
                className="form-input"
                value={pt}
                onChange={e => updatePoint(i, e.target.value)}
                rows={2}
                style={{ flex: 1, resize: 'vertical', fontSize: '0.88rem', lineHeight: 1.5 }}
              />
              <button
                onClick={() => removePoint(i)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '0.5rem', flexShrink: 0 }}
                title="מחק נקודה"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <button
            className="btn btn-ghost btn-sm"
            onClick={addPoint}
            style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}
          >
            <Plus size={14} /> הוסף נקודה
          </button>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          className="btn btn-primary btn-sm"
          onClick={save}
          disabled={saving || !dirty}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          {saving ? <span className="spinner spinner-sm" style={{ borderTopColor: 'white' }} /> : <Save size={14} />}
          שמור
        </button>
        {msg   && <span style={{ color: 'var(--success)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><CheckCircle size={14} />{msg}</span>}
        {error && <span style={{ color: 'var(--danger)',  fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><AlertTriangle size={14} />{error}</span>}
      </div>
    </div>
  );
}

// ── Single slide row ──────────────────────────────────────────────
function SlideRow({ slide: initialSlide }) {
  const [open, setOpen]     = useState(false);
  const [slide, setSlide]   = useState(initialSlide);

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem', overflow: 'hidden' }}>
      {/* Header row — click to expand */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.75rem 1rem', background: open ? '#eff6ff' : 'white',
          border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right',
          borderBottom: open ? '1px solid var(--border)' : 'none',
          transition: 'background 0.15s',
        }}
      >
        <span style={{
          minWidth: 28, height: 28, borderRadius: '50%',
          background: 'var(--primary)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.78rem', fontWeight: 700, flexShrink: 0,
        }}>
          {slide.orderIndex}
        </span>
        <span style={{ flex: 1, fontWeight: 600, fontSize: '0.92rem', color: 'var(--text)' }}>
          {slide.title}
        </span>
        {open ? <ChevronUp size={16} color="var(--text-secondary)" /> : <ChevronDown size={16} color="var(--text-secondary)" />}
      </button>

      {open && <SlideEditor slide={slide} onSaved={setSlide} />}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────
export default function AdminSlides() {
  const [activeTab, setActiveTab] = useState('cyber');
  const [slides, setSlides]       = useState([]);
  const [loading, setLoading]     = useState(true);

  const load = useCallback(async (type) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/slides?type=${type}`);
      setSlides(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(activeTab); }, [activeTab, load]);

  return (
    <Layout>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <BookOpen size={22} color="var(--primary)" />
          <h1 style={{ fontSize: '1.5rem' }}>עריכת שקפי הדרכה</h1>
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
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1rem' }}>
              {slides.length} שקפים — לחץ על שקף כדי לפתוח עריכה
            </p>
            {slides.map(slide => <SlideRow key={slide.id} slide={slide} />)}
          </div>
        )}
      </div>
    </Layout>
  );
}
