import { Link } from 'react-router-dom';
import { statsApi } from '../api/endpoints';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/ui';

const FEATURES = [
  { icon: '🧬', title: 'Compatibility-aware matching', text: 'An A+ patient can receive from A+, A−, O+ and O−. We search all of them, not just "A+" - up to 4× more donors.' },
  { icon: '📍', title: 'Nearest donors first', text: 'MongoDB geospatial queries rank donors by distance, reliability and exact-group match into one Match Score.' },
  { icon: '⏳', title: 'Only eligible donors', text: 'The 90-day (men) / 120-day (women) recovery rule, age and weight are checked inside the database query.' },
  { icon: '🚨', title: 'One-tap SOS', text: 'Creating a critical request instantly alerts every compatible, eligible donor within 25 km.' },
  { icon: '💎', title: 'Bombay blood group support', text: 'Rare hh donors are tracked separately and only matched to hh patients, who cannot receive any other blood.' },
  { icon: '🔒', title: 'Privacy-first contact', text: 'Donor phone numbers are never shown in search. They are shared only after the donor pledges to help.' },
  { icon: '📡', title: 'City Shortage Radar', text: 'Live demand vs eligible supply per blood group, so camps can target the groups a city is short of.' },
  { icon: '🏅', title: 'Donor Passport', text: 'Eligibility countdown, verified donation history, badges, levels and "lives saved" to keep donors coming back.' },
];

export default function Home() {
  const { user } = useAuth();
  const { data } = useAsync(() => statsApi.overview(), []);
  const t = data?.totals;

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__text">
            <span className="pill">🩸 Every 2 seconds someone in India needs blood</span>
            <h1>Find a <span className="accent">compatible</span> blood donor near you - in seconds.</h1>
            <p className="lead">
              RaktSetu connects patients with nearby donors who can donate <b>today</b>,
              using blood-compatibility science, live location and smart eligibility checks.
            </p>
            <div className="hero__cta">
              <Link to="/requests/new?sos=1" className="btn btn--sos btn--lg">🚨 I need blood now</Link>
              <Link to="/find" className="btn btn--ghost btn--lg">🔍 Search donors</Link>
              {!user && <Link to="/register" className="btn btn--primary btn--lg">❤️ Become a donor</Link>}
            </div>
          </div>
          <div className="hero__art" aria-hidden>
            <div className="hero__drop">🩸</div>
            <div className="hero__float hero__float--1">O− → everyone</div>
            <div className="hero__float hero__float--2">📍 1.2 km away</div>
            <div className="hero__float hero__float--3">✓ Eligible today</div>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="stats-grid">
          <StatCard icon="🧑‍🤝‍🧑" label="Registered donors" value={t?.donors} />
          <StatCard icon="✅" label="Can donate today" value={t?.eligibleNow} accent />
          <StatCard icon="📋" label="Open requests" value={t?.openRequests} />
          <StatCard icon="❤️" label="Lives saved" value={t?.livesSaved} accent />
        </div>
      </section>

      <section className="container section">
        <h2 className="section__title">What makes RaktSetu different</h2>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="card feature">
              <div className="feature__icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p className="muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container section">
        <h2 className="section__title">How it works</h2>
        <ol className="steps">
          <li><b>Post a request</b> with blood group, hospital and urgency.</li>
          <li><b>Compatible donors nearby</b> who are eligible today get alerted instantly.</li>
          <li><b>A donor pledges</b>, and only then you see their phone number.</li>
          <li><b>Confirm the donation</b>. It goes into the donor's verified Passport and their next eligible date updates.</li>
        </ol>
      </section>
    </>
  );
}
