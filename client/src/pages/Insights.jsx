import { useState } from 'react';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { statsApi } from '../api/endpoints';
import { useAsync } from '../hooks/useAsync';
import { ErrorBox, Loader, StatCard, BloodBadge } from '../components/ui';
import { groupLabel } from '../utils/blood';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const PALETTE = ['#c81e3a', '#ef4444', '#f97316', '#f59e0b', '#7c3aed', '#a855f7', '#0ea5e9', '#14b8a6', '#111827'];
const LEVEL_INFO = {
  critical: { label: 'Critical', icon: '🔴', text: 'Demand is higher than eligible donors' },
  low: { label: 'Low', icon: '🟠', text: 'Demand is close to supply' },
  watch: { label: 'Watch', icon: '🟡', text: 'Very few eligible donors' },
  healthy: { label: 'Healthy', icon: '🟢', text: 'Enough donors' },
};

export default function Insights() {
  const [city, setCity] = useState('');
  const overview = useAsync(() => statsApi.overview(), []);
  const radar = useAsync(() => statsApi.shortage(city), [city]);

  if (overview.loading && !overview.data) return <Loader text="Running aggregation pipelines…" />;
  if (overview.error) return <div className="container page"><ErrorBox error={overview.error} onRetry={overview.reload} /></div>;

  const o = overview.data;
  const t = o.totals;

  return (
    <div className="container page">
      <h1>Insights</h1>
      <p className="muted">Every number here is computed live by MongoDB aggregation pipelines ($group, $facet, $dateToString).</p>

      <div className="stats-grid">
        <StatCard icon="🧑‍🤝‍🧑" label="Donors" value={t.donors} />
        <StatCard icon="✅" label="Eligible today" value={t.eligibleNow} accent />
        <StatCard icon="📋" label="Open requests" value={t.openRequests} />
        <StatCard icon="✔️" label="Fulfilled requests" value={t.fulfilledRequests} />
        <StatCard icon="🩸" label="Donations recorded" value={t.donations} />
        <StatCard icon="❤️" label="Lives saved (×3 per unit)" value={t.livesSaved} accent />
      </div>

      {/* ---------- Shortage Radar ---------- */}
      <div className="card stack">
        <div className="row row--between">
          <div>
            <h2>📡 Shortage Radar</h2>
            <p className="muted small">Open-request demand vs donors who can donate <b>today</b> (all compatible groups counted).</p>
          </div>
          <select className="input input--sm" value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">All cities</option>
            {radar.data?.cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {radar.loading && !radar.data ? <Loader /> : radar.data && (
          <div className="radar">
            {radar.data.groups.map((g) => (
              <div key={g.group} className={`radar__item radar__item--${g.level}`} title={LEVEL_INFO[g.level].text}>
                <BloodBadge group={g.group} />
                <span className="radar__level">{LEVEL_INFO[g.level].icon} {LEVEL_INFO[g.level].label}</span>
                <span className="small">Need <b>{g.unitsNeeded}</b> units</span>
                <span className="small muted">{g.compatibleDonors} compatible · {g.exactDonors} exact</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="chart-grid">
        <div className="card">
          <h3>Donors by blood group</h3>
          <Doughnut
            data={{
              labels: o.donorsByGroup.map((g) => groupLabel(g.group)),
              datasets: [{ data: o.donorsByGroup.map((g) => g.count), backgroundColor: PALETTE }],
            }}
            options={{ plugins: { legend: { position: 'bottom' } } }}
          />
        </div>
        <div className="card">
          <h3>Donations per month</h3>
          <Bar
            data={{
              labels: o.donationsByMonth.map((m) => new Date(`${m.month}-01`).toLocaleString('en-IN', { month: 'short', year: '2-digit' })),
              datasets: [{ label: 'Units donated', data: o.donationsByMonth.map((m) => m.units), backgroundColor: '#c81e3a', borderRadius: 6 }],
            }}
            options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }}
          />
        </div>
        <div className="card">
          <h3>Top donor cities</h3>
          <Bar
            data={{
              labels: o.donorsByCity.map((c) => c.city),
              datasets: [{ label: 'Donors', data: o.donorsByCity.map((c) => c.count), backgroundColor: '#7c3aed', borderRadius: 6 }],
            }}
            options={{ indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { precision: 0 } } } }}
          />
        </div>
        {radar.data && (
          <div className="card">
            <h3>Demand vs supply ({radar.data.city})</h3>
            <Bar
              data={{
                labels: radar.data.groups.map((g) => groupLabel(g.group)),
                datasets: [
                  { label: 'Units needed', data: radar.data.groups.map((g) => g.unitsNeeded), backgroundColor: '#ef4444', borderRadius: 4 },
                  { label: 'Compatible eligible donors', data: radar.data.groups.map((g) => g.compatibleDonors), backgroundColor: '#14b8a6', borderRadius: 4 },
                ],
              }}
              options={{ plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
