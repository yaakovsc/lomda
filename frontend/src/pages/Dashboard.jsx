import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/common/Layout';
import {
  BookOpen, ClipboardList, CheckCircle, XCircle, Clock,
  AlertTriangle, ChevronLeft, Shield, Award, Lock
} from 'lucide-react';

const StatusBadge = ({ user }) => {
  if (user.examPassed) return <span className="badge badge-success"><CheckCircle size={12} />עבר בחינה</span>;
  if (user.examCompletedAt && !user.examPassed) return <span className="badge badge-danger"><XCircle size={12} />נכשל בבחינה</span>;
  if (user.trainingCompletedAt) return <span className="badge badge-warning"><Clock size={12} />ממתין לבחינה</span>;
  if (user.trainingStartedAt) return <span className="badge badge-info"><Clock size={12} />הדרכה בתהליך</span>;
  return <span className="badge badge-gray"><AlertTriangle size={12} />טרם התחיל</span>;
};

const StepCard = ({ step, title, desc, icon: Icon, status, action, actionLabel, actionIcon }) => {
  const colors = {
    done: { bg: '#f0fdf4', border: '#86efac', icon: '#27ae60' },
    active: { bg: '#eff6ff', border: '#93c5fd', icon: '#1a3a6b' },
    locked: { bg: '#f9fafb', border: '#e5e7eb', icon: '#9ca3af' },
  };
  const c = colors[status] || colors.locked;

  return (
    <div style={{
      background: c.bg, border: `2px solid ${c.border}`,
      borderRadius: 'var(--radius)', padding: '1.5rem',
      display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: '12px',
        background: `${c.icon}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={24} color={c.icon} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ background: c.icon, color: 'white', width: 22, height: 22, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{step}</span>
          <h3 style={{ fontSize: '1rem', color: 'var(--text)' }}>{title}</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: action ? '1rem' : 0 }}>{desc}</p>
        {action && status !== 'locked' && (
          <button className={`btn ${status === 'done' && !actionIcon ? 'btn-ghost btn-sm' : 'btn-primary'}`} onClick={action} style={{ gap: '0.4rem' }}>
            {actionIcon && <span style={{ marginLeft: '0.2rem' }}>{actionIcon}</span>}
            {actionLabel}
            {status !== 'done' && <ChevronLeft size={16} />}
          </button>
        )}
        {status === 'locked' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.82rem', fontStyle: 'italic' }}>
            <Lock size={13} />
            השלם את ההדרכה תחילה
          </div>
        )}
      </div>
      {status === 'done' && (
        <CheckCircle size={22} color="#27ae60" style={{ flexShrink: 0 }} />
      )}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const trainingDone = !!user?.trainingCompletedAt;
  const examDone = !!user?.examCompletedAt;
  const examPassed = !!user?.examPassed;

  // Training button logic:
  // • Training not done → go to /training
  // • Training done + exam not done (includes admin-unlocked) → jump directly to /exam
  // • Training done + exam done → review training
  const handleTrainingClick = () => {
    if (trainingDone && !examDone) {
      navigate('/exam');
    } else {
      navigate('/training');
    }
  };

  const trainingActionLabel = () => {
    if (trainingDone && !examDone) return 'גש לבחינה';
    if (trainingDone && examDone) return 'צפה בהדרכה שוב';
    if (user?.trainingStartedAt) return 'המשך הדרכה';
    return 'התחל הדרכה';
  };

  const trainingStatus = trainingDone ? 'done' : 'active';

  // Exam step is always info-only; no direct action button
  const examStatus = examDone ? 'done' : trainingDone ? 'active' : 'locked';
  const examDesc = examDone
    ? (examPassed ? `עברת! ציון: ${user?.examScore}/10` : `נכשלת. ציון: ${user?.examScore}/10 (נדרש 8/10)`)
    : trainingDone
      ? 'לחץ על "גש לבחינה" בלחצן ההדרכה למעלה כדי להתחיל.'
      : '10 שאלות מהאגם. ציון עובר: 8/10. לא ניתן לחזור לשאלה קודמת.';

  return (
    <Layout>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Shield size={28} color="var(--primary)" />
            <h1 style={{ fontSize: '1.6rem' }}>שלום, {user?.name}</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>ברוך הבא למערכת הדרכת אבטחת המידע של גירון</p>
          <div style={{ marginTop: '0.75rem' }}>
            <StatusBadge user={user} />
          </div>
        </div>

        {/* Passed banner */}
        {examPassed && (
          <div style={{
            background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
            borderRadius: 'var(--radius)', padding: '1.5rem 2rem',
            marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'white',
          }}>
            <Award size={40} color="white" />
            <div>
              <h2 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '0.25rem' }}>מעולה! עברת את הבחינה</h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.92rem' }}>
                ציון: {user?.examScore}/10 | ציון עובר: 8/10
              </p>
            </div>
            <button className="btn" onClick={() => navigate('/results')}
              style={{ marginRight: 'auto', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
              צפה בתוצאות
            </button>
          </div>
        )}

        {/* Failed banner */}
        {examDone && !examPassed && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
            <XCircle size={20} />
            <div>
              <strong>לא עברת את הבחינה.</strong> ציון: {user?.examScore}/10 (נדרש 8/10).
              <br />
              <span style={{ fontSize: '0.88rem' }}>יש לפנות לסמנכ"ל מערכות המידע לאיפוס הבחינה.</span>
            </div>
          </div>
        )}

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <StepCard
            step={1}
            title="מודול הדרכה"
            desc={
              trainingDone && !examDone
                ? 'ההדרכה הושלמה. לחץ להתחיל את הבחינה.'
                : `למד על אבטחת מידע בגירון — כ-15 דקות. תוכן מידע ותרחישים אינטראקטיביים.${trainingDone ? ' (הושלם)' : user?.trainingStartedAt ? ' (בתהליך)' : ''}`
            }
            icon={BookOpen}
            status={trainingStatus}
            action={handleTrainingClick}
            actionLabel={trainingActionLabel()}
          />

          <StepCard
            step={2}
            title="בחינת אבטחת מידע"
            desc={examDesc}
            icon={ClipboardList}
            status={examStatus}
            action={examDone ? () => navigate('/results') : null}
            actionLabel={examDone ? 'צפה בתוצאות' : null}
          />
        </div>

        {/* Info box */}
        <div className="alert alert-info" style={{ marginTop: '2rem' }}>
          <Shield size={18} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: '0.88rem' }}>
            <strong>מדיניות אבטחה:</strong> מתן סיסמאות, התקנת תוכנה לא מאושרת, חיבור USB לא מוכר,
            ושמירת קבצים מקומית — כולם אסורים ומחייבים אישור סמנכ"ל מערכות המידע.
            לכל שאלה פנה לחברת <strong>Agas</strong> — חברת ה-IT המאשרת של גירון.
          </div>
        </div>
      </div>
    </Layout>
  );
}
