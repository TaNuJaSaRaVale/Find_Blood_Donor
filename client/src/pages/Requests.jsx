import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestApi } from '../api/endpoints';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import RequestCard from '../components/RequestCard';
import { EmptyState, ErrorBox, Loader } from '../components/ui';
import { BLOOD_GROUPS, groupLabel, canDonateTo } from '../utils/blood';

export default function Requests() {
  const { user } = useAuth();
  const [tab, setTab] = useState(user ? 'forMe' : 'all');
  const [filters, setFilters] = useState({ status: 'open', bloodGroup: '', city: '' });

  const { data, loading, error, reload } = useAsync(() => {
    if (tab === 'forMe') return requestApi.forMe();
    return requestApi.list({ ...filters, mine: tab === 'mine' ? 'true' : undefined, bloodGroup: filters.bloodGroup || undefined, city: filters.city || undefined });
  }, [tab, filters.status, filters.bloodGroup, filters.city]);

  const tabs = [
    ...(user ? [{ id: 'forMe', label: '🎯 I can help' }] : []),
    { id: 'all', label: '📋 All requests' },
    ...(user ? [{ id: 'mine', label: '🗂️ My requests' }] : []),
  ];

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Blood requests</h1>
          <p className="muted">Critical requests are shown first. Requests expire automatically (MongoDB TTL index).</p>
        </div>
        <Link to="/requests/new" className="btn btn--primary">+ New request</Link>
      </div>

      <div className="tabs">
        {tabs.map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? 'is-active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {tab === 'forMe' && user && (
        <div className="alert alert--info">
          Open requests within 50 km that <b>{groupLabel(user.bloodGroup)}</b> blood can help: {canDonateTo(user.bloodGroup).map(groupLabel).join(', ')}.
          {data?.eligibility && !data.eligibility.eligible && <> ⚠️ <b>{data.eligibility.reasons[0]}</b></>}
        </div>
      )}

      {tab !== 'forMe' && (
        <div className="filters">
          <select className="input input--sm" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="open">Open</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
            <option value="all">All statuses</option>
          </select>
          <select className="input input--sm" value={filters.bloodGroup} onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}>
            <option value="">All blood groups</option>
            {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{groupLabel(g)}</option>)}
          </select>
          <input className="input input--sm" placeholder="City" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
        </div>
      )}

      <ErrorBox error={error} onRetry={reload} />
      {loading ? (
        <Loader />
      ) : data?.requests?.length ? (
        <div className="request-grid">
          {data.requests.map((r) => <RequestCard key={r._id} request={r} />)}
        </div>
      ) : (
        !error && (
          <EmptyState icon="🎉" title="No requests here">
            {tab === 'forMe' ? 'Nobody near you needs your blood group right now.' : 'Try changing the filters.'}
          </EmptyState>
        )
      )}
    </div>
  );
}
