import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { donorApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import BloodGroupPicker from '../components/BloodGroupPicker';
import LocationPicker from '../components/LocationPicker';
import MapView from '../components/MapView';
import { BloodBadge, EmptyState, Loader } from '../components/ui';
import { canReceiveFrom, groupLabel } from '../utils/blood';
import { DEFAULT_CENTER } from '../utils/cities';

export default function FindDonors() {
  const { user } = useAuth();
  const [group, setGroup] = useState('');
  const [mode, setMode] = useState('compatible');
  const [radiusKm, setRadiusKm] = useState(10);
  const [location, setLocation] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Start from the logged-in user's saved location
  useEffect(() => {
    if (user && !location) {
      const [lng, lat] = user.location.coordinates;
      setLocation({ lat, lng, city: user.city });
    }
  }, [user, location]);

  const search = async (e) => {
    e?.preventDefault();
    if (!group) return toast.error('Choose the patient’s blood group');
    if (!location?.lat) return toast.error('Set the hospital / search location');
    setLoading(true);
    try {
      setResult(await donorApi.search({ bloodGroup: group, mode, radiusKm, lat: location.lat, lng: location.lng }));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
    return undefined;
  };

  const center = location?.lat ? location : DEFAULT_CENTER;
  const markers = (result?.donors || []).map((d) => ({
    id: d._id,
    lat: d.location.coordinates[1],
    lng: d.location.coordinates[0],
    color: d.exactMatch ? '#c81e3a' : '#f59e0b',
    popup: <><b>{d.name}</b><br />{groupLabel(d.bloodGroup)} · {d.distanceKm} km · Score {d.matchScore}</>,
  }));

  return (
    <div className="container page">
      <h1>Find donors</h1>
      <p className="muted">Shows only donors who are <b>compatible</b>, <b>nearby</b> and <b>eligible to donate today</b>.</p>

      <div className="layout-split">
        <form className="card stack" onSubmit={search}>
          <h3>Patient blood group</h3>
          <BloodGroupPicker value={group} onChange={setGroup} highlight={group && mode === 'compatible' ? canReceiveFrom(group) : []} />
          {group && (
            <div className="segmented">
              <button type="button" className={mode === 'compatible' ? 'is-active' : ''} onClick={() => setMode('compatible')}>
                All compatible ({canReceiveFrom(group).length} groups)
              </button>
              <button type="button" className={mode === 'exact' ? 'is-active' : ''} onClick={() => setMode('exact')}>
                Exact {groupLabel(group)} only
              </button>
            </div>
          )}
          <h3>Search around</h3>
          <LocationPicker value={location} onChange={setLocation} height={180} />
          <label className="field">
            <span className="field__label">Radius: <b>{radiusKm} km</b></span>
            <input type="range" min="1" max="100" value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value))} />
          </label>
          <button className="btn btn--primary btn--block" disabled={loading}>{loading ? 'Searching…' : '🔍 Search donors'}</button>
        </form>

        <div className="stack">
          <MapView center={center} zoom={radiusKm > 30 ? 9 : 11} markers={markers} radiusKm={result ? radiusKm : null} you={location?.lat ? { ...location, label: 'Search centre' } : null} />
          {loading && <Loader text="Running $geoNear aggregation…" />}
          {!loading && result && (
            <>
              <div className="result-head">
                <b>{result.count} eligible donor{result.count === 1 ? '' : 's'}</b> within {result.radiusKm} km
                <span className="muted"> · searched groups: {result.searchedGroups.map(groupLabel).join(', ')}</span>
                <span className="legend"><i className="dot dot--red" /> exact <i className="dot dot--amber" /> compatible</span>
              </div>
              {result.count === 0 ? (
                <EmptyState icon="🔎" title="No eligible donors in this radius">
                  Increase the radius, or <Link to="/requests/new">post a request</Link> so donors are alerted as soon as they become eligible.
                </EmptyState>
              ) : (
                <div className="donor-list">
                  {result.donors.map((d, i) => (
                    <div key={d._id} className="card donor-card">
                      <span className="donor-card__rank">#{i + 1}</span>
                      <BloodBadge group={d.bloodGroup} />
                      <div className="donor-card__info">
                        <b>{d.name}</b>
                        <span className="muted">📍 {d.distanceKm} km · {d.city} · {d.donationsCount} donations · ⚡ {d.reliabilityScore}</span>
                      </div>
                      <div className="score" title="Match score = distance (50) + reliability (30) + exact group (20)">
                        <b>{d.matchScore}</b><span>match</span>
                      </div>
                    </div>
                  ))}
                  <div className="alert alert--info">
                    🔒 Phone numbers are private. <Link to={`/requests/new?bloodGroup=${encodeURIComponent(group)}`}>Post a request</Link> and these donors get alerted instantly - you see their number once they pledge.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
