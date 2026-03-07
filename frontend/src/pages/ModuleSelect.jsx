import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/common/Layout';
import api from '../utils/api';

const MODULES = [
  {
    type: 'cyber',
    title: 'אבטחת מידע',
    icon: '🔐',
    bg: 'linear-gradient(135deg, #0f2347 0%, #1a3a6b 100%)',
    totalItems: 26,
  },
  {
    type: 'haras',
    title: 'מניעת הטרדה מינית',
    icon: '🛡️',
    bg: 'linear-gradient(135deg, #1a3a6b 0%, #2554a3 100%)',
    totalItems: 26,
  },
  {
    type: 'safety',
    title: 'בטיחות במקום העבודה',
    icon: '🦺',
    bg: 'linear-gradient(135deg, #2554a3 0%, #3b6fd4 100%)',
    totalItems: 26,
  },
];

function getAction(progress, type) {
  if (!progress || !progress.trainingStartedAt) return `/training?type=${type}`;
  if (!progress.trainingCompletedAt) return `/training?type=${type}`;
  if (!progress.examCompletedAt) return `/exam?type=${type}`;
  return `/results?type=${type}`;
}

export default function ModuleSelect() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progressList, setProgressList] = useState([]);
  const [enabledTypes, setEnabledTypes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/training/my-progress'),
      api.get('/training/modules'),
    ]).then(([progRes, modRes]) => {
      setProgressList(progRes.data);
      setEnabledTypes(modRes.data.filter(m => m.enabled).map(m => m.trainingType));
    }).catch(() => {
      setEnabledTypes(MODULES.map(m => m.type));
    }).finally(() => setLoading(false));
  }, []);

  const getProgress = (type) => progressList.find(p => p.trainingType === type);

  if (loading) {
    return (
      <Layout>
        <div className="loading-screen">
          <div className="spinner" />
        </div>
      </Layout>
    );
  }

  const visibleModules = MODULES.filter(m => !enabledTypes || enabledTypes.includes(m.type));

  return (
    <Layout>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{
              width: 90, height: 90, background: 'white', borderRadius: '18px',
              padding: '0.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
            }}>
              <img src="/bakie.png" alt="בָּקִיא" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>מרכז ההדרכות</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            שלום, {user?.name}. בחר מודול הדרכה.
          </p>
        </div>

        {/* Module buttons — horizontal row of squares */}
        <div style={{
          display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap',
        }}>
          {visibleModules.map((mod) => {
            const progress = getProgress(mod.type);
            const route = getAction(progress, mod.type);
            return (
              <button
                key={mod.type}
                onClick={() => navigate(route)}
                style={{
                  width: 180, height: 180,
                  background: mod.bg,
                  border: 'none', borderRadius: '18px',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: '0.75rem', cursor: 'pointer',
                  boxShadow: '0 4px 18px rgba(0,0,0,0.15)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.22)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,0,0,0.15)';
                }}
              >
                <span style={{ fontSize: '2.8rem', lineHeight: 1 }}>{mod.icon}</span>
                <span style={{
                  color: 'white', fontWeight: 700, fontSize: '0.95rem',
                  textAlign: 'center', lineHeight: 1.3, padding: '0 0.5rem',
                }}>
                  {mod.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
