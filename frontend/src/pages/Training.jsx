import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/common/Layout';
import api from '../utils/api';
import { slides } from '../data/slides';
import {
  ChevronLeft, ChevronRight, CheckCircle, XCircle,
  BookOpen, HelpCircle, Trophy,
} from 'lucide-react';

// ─── Interactive Question Component ────────────────────────────
const InteractiveQuestion = ({ question, onNext, onPrev, isFirst }) => {
  const [selected, setSelected] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const isMultiple = question.type === 'multiple';

  const handleSelect = (optId) => {
    if (submitted) return;
    if (isMultiple) {
      setSelected(prev =>
        prev.includes(optId) ? prev.filter(x => x !== optId) : [...prev, optId]
      );
    } else {
      setSelected([optId]);
    }
  };

  const handleSubmit = () => {
    if (selected.length === 0) return;
    setSubmitted(true);
  };

  const isCorrect = submitted &&
    selected.length === question.correctAnswers.length &&
    [...selected].sort().join(',') === [...question.correctAnswers].sort().join(',');

  return (
    <div style={{ animation: 'slideInRight 0.35s ease' }}>
      <div style={{
        background: '#f0f4ff', borderRadius: 'var(--radius-sm)',
        padding: '1rem 1.25rem', marginBottom: '1.25rem',
        borderRight: '4px solid var(--primary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>
          <HelpCircle size={16} />
          {isMultiple ? 'תרחיש — מספר תשובות נכונות' : 'תרחיש — תשובה אחת נכונה'}
        </div>
        <p style={{ fontWeight: 600, color: 'var(--text)', lineHeight: 1.5 }}>{question.questionText}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
        {question.options.map(opt => {
          const isSelected = selected.includes(opt.id);
          const isCorrectOption = question.correctAnswers.includes(opt.id);
          let bg = 'white', border = 'var(--border)', color = 'var(--text)';

          if (submitted) {
            if (isCorrectOption) { bg = '#f0fdf4'; border = '#86efac'; color = '#166534'; }
            else if (isSelected && !isCorrectOption) { bg = '#fef2f2'; border = '#fca5a5'; color = '#991b1b'; }
          } else if (isSelected) {
            bg = '#eff6ff'; border = 'var(--primary)'; color = 'var(--primary)';
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              style={{
                background: bg, border: `2px solid ${border}`, color,
                borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem',
                textAlign: 'right', fontFamily: 'inherit', fontSize: '0.92rem',
                cursor: submitted ? 'default' : 'pointer', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: '0.6rem',
              }}
            >
              <span style={{
                width: 22, height: 22, border: `2px solid ${border}`,
                borderRadius: isMultiple ? '4px' : '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                background: isSelected ? (submitted ? (isCorrectOption ? '#27ae60' : '#ef4444') : 'var(--primary)') : 'transparent',
              }}>
                {submitted && isCorrectOption && <CheckCircle size={14} color="white" />}
                {submitted && isSelected && !isCorrectOption && <XCircle size={14} color="white" />}
                {!submitted && isSelected && <span style={{ width: 10, height: 10, background: 'white', borderRadius: '50%', display: 'block' }} />}
              </span>
              <span style={{ fontWeight: isSelected ? 600 : 400 }}>{opt.text}</span>
            </button>
          );
        })}
      </div>

      {!submitted && (
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-outline btn-sm" onClick={onPrev} disabled={isFirst}>
            <ChevronRight size={16} /> קודם
          </button>
          <button
            className="btn btn-primary"
            disabled={selected.length === 0}
            onClick={handleSubmit}
          >
            בדוק תשובה
          </button>
        </div>
      )}

      {submitted && (
        <div style={{ animation: 'slideInRight 0.3s ease' }}>
          <div className={`alert ${isCorrect ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1rem' }}>
            {isCorrect ? <CheckCircle size={18} /> : <XCircle size={18} />}
            <div>
              <strong>{isCorrect ? 'נכון! ' : 'לא נכון. '}</strong>
              {question.explanation}
            </div>
          </div>
          <button className="btn btn-primary" onClick={onNext}>
            המשך <ChevronLeft size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

// slide id (1-based) → zero-padded 3-digit index, picks jpg for 1-10, png for 11-26
function slideImageSrc(slideId) {
  const idx = String(slideId - 1).padStart(3, '0');
  return slideId <= 10 ? `/slide-images/slide-${idx}.jpg` : `/slide-images/slide-${idx}.png`;
}

// ─── Slide Component ────────────────────────────────────────────
const SlideView = ({ slide, onNext, onPrev, isFirst, isLast, completing }) => {
  return (
    <div style={{ animation: 'slideInRight 0.35s ease' }}>
      {/* Illustration from PDF */}
      <div style={{
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        marginBottom: '1.25rem',
        background: `linear-gradient(135deg, ${slide.color}10, ${slide.color}04)`,
        border: `1px solid ${slide.color}25`,
        display: 'flex',
        justifyContent: 'center',
      }}>
        <img
          src={slideImageSrc(slide.id)}
          alt={slide.title}
          style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'contain', display: 'block' }}
        />
      </div>

      {/* Content */}
      <div style={{
        background: `linear-gradient(135deg, ${slide.color}15, ${slide.color}05)`,
        border: `1px solid ${slide.color}30`, borderRadius: 'var(--radius-sm)',
        padding: '1.25rem', marginBottom: '1.25rem',
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>{slide.icon}</div>
        <h2 style={{ color: slide.color, fontSize: '1.2rem', marginBottom: '0.6rem' }}>{slide.title}</h2>
        <p style={{ color: 'var(--text)', lineHeight: 1.7, fontSize: '0.93rem' }}>{slide.content}</p>
      </div>

      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        {slide.keyPoints.map((point, i) => (
          <li key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
            background: 'white', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '0.65rem 1rem',
            fontSize: '0.9rem', lineHeight: 1.5,
          }}>
            <span style={{ color: slide.color, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>✓</span>
            {point}
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
        <button className="btn btn-outline btn-sm" onClick={onPrev} disabled={isFirst}>
          <ChevronRight size={16} /> קודם
        </button>
        <button
          className={`btn ${isLast ? 'btn-success' : 'btn-primary'}`}
          onClick={onNext}
          disabled={completing}
        >
          {completing ? <span className="spinner spinner-sm" /> :
            isLast ? <><Trophy size={16} />סיים והמשך לבחינה</> :
              <>הבא <ChevronLeft size={16} /></>}
        </button>
      </div>
    </div>
  );
};

// ─── Main Training Page ─────────────────────────────────────────
export default function Training() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reviewMode = searchParams.get('review') === '1';

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingDone, setLoadingDone] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [curriculum, setCurriculum] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        await api.post('/training/start');
        const { data } = await api.get('/training/questions');
        setQuestions(data);

        const combined = [
          ...slides.map(s => ({ type: 'slide', data: s })),
          ...data.map(q => ({ type: 'question', data: q })),
        ];
        setCurriculum(combined);

        // Review mode (came from exam choice screen) → always start from beginning
        if (reviewMode) {
          setCurrentIndex(0);
        } else {
          const savedProgress = user?.trainingSlideProgress || 0;
          setCurrentIndex(savedProgress < combined.length ? savedProgress : 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDone(true);
      }
    };
    init();
  }, []);

  const saveProgress = useCallback(async (index) => {
    try { await api.post('/training/progress', { slideIndex: index }); } catch {}
  }, []);

  const goNext = async () => {
    const next = currentIndex + 1;
    if (next >= curriculum.length) {
      await handleComplete();
    } else {
      setCurrentIndex(next);
      saveProgress(next);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await api.post('/training/complete');
      await refreshUser();
      navigate('/exam');
    } catch {
      setCompleting(false);
    }
  };

  if (!loadingDone || curriculum.length === 0) {
    return (
      <Layout>
        <div className="loading-screen">
          <div className="spinner"></div>
          <span>טוען תוכן הדרכה...</span>
        </div>
      </Layout>
    );
  }

  const current = curriculum[currentIndex];
  const overallProgress = Math.round(((currentIndex + 1) / curriculum.length) * 100);
  const isLast = currentIndex === curriculum.length - 1;

  return (
    <Layout>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ width: 100, height: 100, background: 'white', borderRadius: '20px', padding: '0.6rem', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
              <img src="/giron.png" alt="גירון" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
            <BookOpen size={22} color="var(--primary)" />
            <h1 style={{ fontSize: '1.4rem' }}>מודול הדרכה</h1>
            <span style={{ marginRight: 'auto', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              {currentIndex + 1} / {curriculum.length}
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${overallProgress}%` }} />
          </div>
          <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {overallProgress}% הושלם
          </div>
        </div>

        {/* Content Card */}
        <div className="card card-lg" style={{ marginBottom: '1.5rem' }}>
          {current.type === 'slide' ? (
            <SlideView
              slide={current.data}
              onNext={isLast ? handleComplete : goNext}
              onPrev={goPrev}
              isFirst={currentIndex === 0}
              isLast={isLast}
              completing={completing}
            />
          ) : (
            <InteractiveQuestion
              key={current.data.id}
              question={current.data}
              onNext={isLast ? handleComplete : goNext}
              onPrev={goPrev}
              isFirst={currentIndex === 0}
            />
          )}
        </div>

        {/* Progress pills — uniform color */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
          {curriculum.map((item, i) => {
            const done = i < currentIndex;
            const active = i === currentIndex;
            return (
              <div
                key={i}
                title={`${i + 1} / ${curriculum.length}`}
                style={{
                  width: active ? 14 : 10,
                  height: active ? 14 : 10,
                  borderRadius: '50%',
                  background: (done || active) ? 'var(--primary)' : 'var(--border)',
                  opacity: done ? 0.7 : active ? 1 : 0.35,
                  transition: 'all 0.3s',
                  marginTop: active ? 0 : 2,
                }}
              />
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
