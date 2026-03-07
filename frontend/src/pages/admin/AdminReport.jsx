import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import api from '../../utils/api';
import {
  BarChart2, Download, CheckCircle, XCircle, Clock, AlertTriangle, Search,
  Lock, HeartHandshake, HardHat,
} from 'lucide-react';

const MODULES = [
  { type: 'cyber',  label: 'אבטחת מידע',          Icon: Lock },
  { type: 'haras',  label: 'מניעת הטרדה מינית',   Icon: HeartHandshake },
  { type: 'safety', label: 'בטיחות במקום העבודה', Icon: HardHat },
];

const getStatus = (progress) => {
  if (!progress?.trainingStartedAt)                              return 'notStarted';
  if (progress.examPassed)                                       return 'passed';
  if (progress.examCompletedAt && !progress.examPassed)          return 'failed';
  if (progress.trainingCompletedAt && !progress.examCompletedAt) return 'pending';
  return 'training';
};

const StatusCell = ({ progress }) => {
  const s = getStatus(progress);
  if (s === 'passed')     return <span className="badge badge-success"><CheckCircle size={11} />עבר</span>;
  if (s === 'failed')     return <span className="badge badge-danger"><XCircle size={11} />נכשל ({progress.examScore}/10)</span>;
  if (s === 'pending')    return <span className="badge badge-warning"><Clock size={11} />טרם נבחן</span>;
  if (s === 'training')   return <span className="badge badge-info"><Clock size={11} />הדרכה בתהליך</span>;
  return <span className="badge badge-gray"><AlertTriangle size={11} />לא התחיל</span>;
};

const fmt = (d) => d
  ? new Date(d).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })
  : '—';

export default function AdminReport() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterModule, setFilterModule] = useState('all');

  useEffect(() => {
    api.get('/admin/compliance-report')
      .then(({ data }) => setUsers(data))
      .finally(() => setLoading(false));
  }, []);

  // Flatten users × modules into rows
  const allRows = users.flatMap(u =>
    MODULES.map(mod => ({
      user: u,
      mod,
      progress: u.moduleProgress?.find(p => p.trainingType === mod.type) || null,
    }))
  );

  const filtered = allRows.filter(({ user: u, mod, progress }) => {
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.department || '').toLowerCase().includes(search.toLowerCase());
    const matchModule = filterModule === 'all' || mod.type === filterModule;
    const matchStatus = filterStatus === 'all' || getStatus(progress) === filterStatus;
    return matchSearch && matchModule && matchStatus;
  });

  const stats = {
    total:      filtered.length,
    passed:     filtered.filter(r => getStatus(r.progress) === 'passed').length,
    failed:     filtered.filter(r => getStatus(r.progress) === 'failed').length,
    pending:    filtered.filter(r => getStatus(r.progress) === 'pending').length,
    notStarted: filtered.filter(r => getStatus(r.progress) === 'notStarted').length,
  };

  const downloadCsv = () => {
    const headers = ['שם,אימייל,מחלקה,מודול,סטטוס,ציון,ניסיונות,תאריך הדרכה,תאריך בחינה'];
    const rows = filtered.map(({ user: u, mod, progress: p }) => [
      `"${u.name}"`,
      u.email,
      `"${u.department || ''}"`,
      mod.label,
      p?.examPassed ? 'עבר' : p?.examCompletedAt ? 'נכשל' : p?.trainingCompletedAt ? 'טרם נבחן' : p?.trainingStartedAt ? 'בהדרכה' : 'לא התחיל',
      p?.examScore ?? '',
      p?.examAttempts || 0,
      fmt(p?.trainingCompletedAt),
      fmt(p?.examCompletedAt),
    ].join(','));
    const csv = [...headers, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `giron-compliance-${new Date().toLocaleDateString('he-IL').replace(/\//g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <BarChart2 size={22} color="var(--primary)" />
              <h1 style={{ fontSize: '1.5rem' }}>דוח ציות</h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{filtered.length} שורות מוצגות</p>
          </div>
          <button className="btn btn-outline" onClick={downloadCsv}>
            <Download size={16} />הורד CSV
          </button>
        </div>

        {/* Module filter tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <button
            className={`btn btn-sm ${filterModule === 'all' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ border: '1px solid var(--border)' }}
            onClick={() => setFilterModule('all')}
          >
            כל המודולים
          </button>
          {MODULES.map(m => (
            <button
              key={m.type}
              className={`btn btn-sm ${filterModule === m.type ? 'btn-primary' : 'btn-ghost'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', border: '1px solid var(--border)' }}
              onClick={() => setFilterModule(m.type)}
            >
              <m.Icon size={13} />{m.label}
            </button>
          ))}
        </div>

        {/* Status summary pills */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {[
            { label: `הכל (${stats.total})`,          value: 'all' },
            { label: `עברו (${stats.passed})`,         value: 'passed' },
            { label: `נכשלו (${stats.failed})`,        value: 'failed' },
            { label: `טרם נבחנו (${stats.pending})`,   value: 'pending' },
            { label: `לא התחילו (${stats.notStarted})`, value: 'notStarted' },
          ].map(f => (
            <button
              key={f.value}
              className={`btn btn-sm ${filterStatus === f.value ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilterStatus(f.value)}
              style={{ border: '1px solid var(--border)' }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '1.25rem', maxWidth: 360 }}>
          <Search size={16} style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input className="form-input" style={{ paddingRight: '2.5rem' }} placeholder="חיפוש..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>שם</th>
                <th>אימייל</th>
                <th>מחלקה</th>
                <th>מודול</th>
                <th>סטטוס</th>
                <th style={{ textAlign: 'center' }}>ניסיונות</th>
                <th>תאריך הדרכה</th>
                <th>תאריך בחינה</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: 'auto' }} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>לא נמצאו תוצאות</td></tr>
              ) : filtered.map(({ user: u, mod, progress: p }) => (
                <tr key={`${u.id}-${mod.type}`}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', direction: 'ltr' }}>{u.email}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.department || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.83rem' }}>
                      <mod.Icon size={13} color="var(--primary)" />{mod.label}
                    </div>
                  </td>
                  <td><StatusCell progress={p} /></td>
                  <td style={{ textAlign: 'center', fontWeight: (p?.examAttempts || 0) > 1 ? 700 : 400, color: (p?.examAttempts || 0) > 1 ? 'var(--warning)' : 'inherit' }}>
                    {p?.examAttempts || 0}
                  </td>
                  <td style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>{fmt(p?.trainingCompletedAt)}</td>
                  <td style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>{fmt(p?.examCompletedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
