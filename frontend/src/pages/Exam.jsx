import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/common/Layout';
import api from '../utils/api';
import {
  ClipboardList, AlertTriangle, ChevronLeft, CheckCircle, Send,
  Lock, BookOpen,
} from 'lucide-react';

// ─── Exam Question Component ────────────────────────────────────
const ExamQuestion = ({ question, questionNum, total, onAnswer }) => {
  const [selected, setSelected] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const isMultiple = question.type === 'multiple';

  const handleSelect = (optId) => {
    if (isMultiple) {
      setSelected(prev =>
        prev.includes(optId) ? prev.filter(x => x !== optId) : [...prev, optId]
      );
    } else {
      setSelected([optId]);
    }
  };

  const handleSubmit = async () => {
    if (selected.length === 0 || submitting) return;
    setSubmitting(true);
    await onAnswer(question.id, selected);
  };

  const isLast = questionNum === total;

  return (
    <div style={{ animation: 'slideInRight 0.35s ease' }}>
      {/* Question counter */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)',
      }}>
        <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.92rem' }}>
          שאלה {questionNum} מתוך {total}
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {Array.from({ length: total }, (_, i) => (
            <div key={i} style={{
              width: 24, height: 6, borderRadius: '3px',
              background: i < questionNum - 1 ? 'var(--success)' : i === questionNum - 1 ? 'var(--primary)' : 'var(--border)',
            }} />
          ))}
        </div>
      </div>

      {/* Question text */}
      <div style={{
        background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
        padding: '1.25rem', marginBottom: '1.5rem',
        borderRight: '4px solid var(--primary)',
      }}>
        {isMultiple && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <CheckCircle size={14} />
            ייתכנו מספר תשובות נכונות
          </div>
        )}
        <p style={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.6, color: 'var(--text)' }}>
          {question.questionText}
        </p>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
        {question.options.map((opt) => {
          const isSelected = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              style={{
                background: isSelected ? '#eff6ff' : 'white',
                border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '0.9rem 1rem',
                textAlign: 'right', fontFamily: 'inherit', fontSize: '0.92rem',
                cursor: 'pointer', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                color: isSelected ? 'var(--primary)' : 'var(--text)',
              }}
            >
              <span style={{
                width: 22, height: 22, border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: isMultiple ? '4px' : '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isSelected ? 'var(--primary)' : 'transparent',
              }}>
                {isSelected && (isMultiple
                  ? <CheckCircle size={14} color="white" />
                  : <span style={{ width: 8, height: 8, background: 'white', borderRadius: '50%', display: 'block' }} />
                )}
              </span>
              <span style={{ fontWeight: isSelected ? 600 : 400 }}>{opt.text}</span>
            </button>
          );
        })}
      </div>

      {/* Warning */}
      <div className="alert alert-warning" style={{ marginBottom: '1.25rem', fontSize: '0.83rem' }}>
        <Lock size={14} style={{ flexShrink: 0 }} />
        לא ניתן לחזור לשאלה קודמת לאחר מעבר לשאלה הבאה.
      </div>

      <button
        className={`btn btn-lg ${isLast ? 'btn-success' : 'btn-primary'} btn-block`}
        onClick={handleSubmit}
        disabled={selected.length === 0 || submitting}
      >
        {submitting ? <span className="spinner spinner-sm" style={{ borderTopColor: 'white' }} /> :
          isLast ? <><Send size={16} />הגש בחינה</> : <>שמור ועבור לשאלה הבאה <ChevronLeft size={16} /></>}
      </button>
    </div>
  );
};

// ─── Main Exam Page ─────────────────────────────────────────────
export default function Exam() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const trainingType = searchParams.get('type') || 'cyber';

  const [state, setState] = useState('loading'); // loading | choice | instructions | active | submitting | done | error
  const [attemptId, setAttemptId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNum, setQuestionNum] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await api.get('/training/my-progress');
        const progress = data.find(p => p.trainingType === trainingType) || {};

        if (!progress.trainingCompletedAt) {
          navigate(`/training?type=${trainingType}`);
          return;
        }
        if (progress.examPassed) {
          navigate(`/results?type=${trainingType}`);
          return;
        }
        if (progress.examLockedByAdmin) {
          setError('הגישה לבחינה חסומה. אנא פנה למנהל המערכת לשחרור.');
          setState('error');
          return;
        }
      } catch (err) {
        // If progress fetch fails, let the server guard startExam
      }
      setState('choice');
    };
    init();
  }, [trainingType]);

  const startExam = async () => {
    setState('loading');
    try {
      const { data } = await api.post(`/exam/start?type=${trainingType}`);
      setAttemptId(data.attemptId);
      setCurrentQuestion(data.question);
      setTotalQuestions(data.totalQuestions);
      setQuestionNum(data.currentQuestion + 1);
      setState('active');
    } catch (err) {
      setError(err.response?.data?.error || 'שגיאה בהפעלת הבחינה');
      setState('error');
    }
  };

  const submitAnswer = useCallback(async (questionId, answer) => {
    try {
      const { data } = await api.post(`/exam/${attemptId}/answer`, { questionId, answer });

      if (data.done) {
        // All answered — submit for grading
        setState('submitting');
        const res = await api.post(`/exam/${attemptId}/submit`);
        setResults(res.data);
        setState('done');
      } else {
        setCurrentQuestion(data.nextQuestion);
        setQuestionNum(data.nextIndex + 1);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'שגיאה בשמירת תשובה');
    }
  }, [attemptId]);

  if (state === 'loading' || state === 'submitting') {
    return (
      <Layout>
        <div className="loading-screen">
          <div className="spinner"></div>
          <span>{state === 'submitting' ? 'בודק תשובות...' : 'טוען בחינה...'}</span>
        </div>
      </Layout>
    );
  }

  if (state === 'error') {
    return (
      <Layout>
        <div style={{ maxWidth: 600, margin: '2rem auto' }}>
          <div className="alert alert-error">
            <AlertTriangle size={20} />
            <div>
              <strong>שגיאה:</strong> {error}
              <br />
              <span style={{ fontSize: '0.88rem' }}>אנא פנה לסמנכ"ל מערכות המידע.</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (state === 'done' && results) {
    navigate(`/results?type=${trainingType}`);
    return null;
  }

  const moduleTitle = trainingType === 'haras' ? 'מניעת הטרדה מינית' : trainingType === 'safety' ? 'בטיחות במקום העבודה' : 'אבטחת מידע';

  return (
    <Layout>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ width: 100, height: 100, background: 'white', borderRadius: '20px', padding: '0.6rem', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
              <img src="/bakie.png" alt="בָּקִיא" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <ClipboardList size={22} color="var(--primary)" />
            <h1 style={{ fontSize: '1.4rem' }}>בחינה — {moduleTitle}</h1>
          </div>
        </div>

        {/* Choice: redo training or go to exam */}
        {state === 'choice' && (
          <div className="card card-lg" style={{ textAlign: 'center' }}>
            <ClipboardList size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--text)' }}>
              מוכן לבחינה?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
              סיימת את מודול ההדרכה. האם תרצה לחזור ולעיין בחומר לפני הבחינה, או להמשיך ישירות לבחינה?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                className="btn btn-primary btn-lg btn-block"
                onClick={() => setState('instructions')}
              >
                המשך לבחינה <ChevronLeft size={18} />
              </button>
              <button
                className="btn btn-outline btn-lg btn-block"
                onClick={() => navigate(`/training?review=1&type=${trainingType}`)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <BookOpen size={18} />
                חזור לעיין בחומר ההדרכה
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        {state === 'instructions' && (
          <div className="card card-lg">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
              הוראות הבחינה
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {[
                ['🎯', 'ציון עובר: 8 מתוך 10 (80%)'],
                ['🔒', 'לא ניתן לחזור לשאלה קודמת'],
                ['⏱️', 'אין הגבלת זמן'],
                ['📧', 'תקבל אישור בדואר אלקטרוני עם התוצאה'],
                ['🔄', 'לא ניתן לגשת שנית ללא אישור מנהל'],
              ].map(([icon, text]) => (
                <div key={text} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem 1rem', fontSize: '0.92rem',
                }}>
                  <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
            <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <span>ודא שיש לך 15 דקות פנויות ושאין הפרעות לפני שתתחיל.</span>
            </div>
            <button className="btn btn-primary btn-lg btn-block" onClick={startExam}>
              התחל בחינה <ChevronLeft size={18} />
            </button>
          </div>
        )}

        {/* Active Exam */}
        {state === 'active' && currentQuestion && (
          <div className="card card-lg">
            <ExamQuestion
              key={currentQuestion.id}
              question={currentQuestion}
              questionNum={questionNum}
              total={totalQuestions}
              onAnswer={submitAnswer}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
