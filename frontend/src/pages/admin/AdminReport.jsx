import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import api from '../../utils/api';
import { BarChart2, Download, CheckCircle, XCircle, Clock, AlertTriangle, Search } from 'lucide-react';

const StatusCell = ({ user }) => {
  if (user.examPassed) return <span className="badge badge-success"><CheckCircle size={11} />עבר</span>;
  if (user.examCompletedAt) return <span className="badge badge-danger"><XCircle size={11} />נכשל ({user.examScore}/10)</span>;
  if (user.trainingCompletedAt) return <span className="badge badge-warning"><Clock size={11} />טרם נבחן</span>;
  if (user.trainingStartedAt) return <span className="badge badge-info"><Clock size={11} />הדרכה בתהליך</span>;
  return <span className="badge badge-gray"><AlertTriangle size={11} />לא התחיל</span>;
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

export default function AdminReport() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    api.get('/admin/compliance-report').then(({ data }) => setUsers(data)).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.department || '').toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'passed' && u.examPassed) ||
      (filterStatus === 'failed' && u.examCompletedAt && !u.examPassed) ||
      (filterStatus === 'pending' && u.trainingCompletedAt && !u.examCompletedAt) ||
      (filterStatus === 'training' && u.trainingStartedAt && !u.trainingCompletedAt) ||
      (filterStatus === 'notStarted' && !u.trainingStartedAt);

    return matchSearch && matchStatus;
  });

  const downloadCsv = () => {
    const headers = ['שם,אימייל,מחלקה,סטטוס,ציון,ניסיונות,תאריך הדרכה,תאריך בחינה'];
    const rows = filtered.map(u => [
      `"${u.name}"`,
      u.email,
      `"${u.department || ''}"`,
      u.examPassed ? 'עבר' : u.examCompletedAt ? 'נכשל' : u.trainingCompletedAt ? 'טרם נבחן' : u.trainingStartedAt ? 'בהדרכה' : 'לא התחיל',
      u.examScore ?? '',
      u.examAttempts || 0,
      fmt(u.trainingCompletedAt),
      fmt(u.examCompletedAt),
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

  const stats = {
    total: users.length,
    passed: users.filter(u => u.examPassed).length,
    failed: users.filter(u => u.examCompletedAt && !u.examPassed).length,
    pending: users.filter(u => u.trainingCompletedAt && !u.examCompletedAt).length,
    notStarted: users.filter(u => !u.trainingStartedAt).length,
  };

  return (
    <Layout>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <BarChart2 size={22} color="var(--primary)" />
              <h1 style={{ fontSize: '1.5rem' }}>דוח ציות</h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{filtered.length} עובדים מוצגים</p>
          </div>
          <button className="btn btn-outline" onClick={downloadCsv}>
            <Download size={16} />הורד CSV
          </button>
        </div>

        {/* Summary pills */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {[
            { label: `הכל (${stats.total})`, value: 'all' },
            { label: `עברו (${stats.passed})`, value: 'passed' },
            { label: `נכשלו (${stats.failed})`, value: 'failed' },
            { label: `טרם נבחנו (${stats.pending})`, value: 'pending' },
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
                <th>סטטוס</th>
                <th>ניסיונות</th>
                <th>תאריך הדרכה</th>
                <th>תאריך בחינה</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: 'auto' }} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>לא נמצאו תוצאות</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', direction: 'ltr' }}>{u.email}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.department || '—'}</td>
                  <td><StatusCell user={u} /></td>
                  <td style={{ textAlign: 'center', fontWeight: u.examAttempts > 1 ? 700 : 400, color: u.examAttempts > 1 ? 'var(--warning)' : 'inherit' }}>
                    {u.examAttempts || 0}
                  </td>
                  <td style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>{fmt(u.trainingCompletedAt)}</td>
                  <td style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>{fmt(u.examCompletedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
