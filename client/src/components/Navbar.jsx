import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationApi } from '../api/endpoints';
import { BloodBadge } from './ui';

const LINKS = [
  { to: '/find', label: 'Find Donors' },
  { to: '/requests', label: 'Requests' },
  { to: '/camps', label: 'Camps' },
  { to: '/insights', label: 'Insights' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setOpen(false), [location.pathname]);

  // Poll the unread-notification count every 30 seconds
  useEffect(() => {
    if (!user) return undefined;
    const load = () => notificationApi.unreadCount().then((d) => setUnread(d.unread)).catch(() => {});
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, [user, location.pathname]);

  return (
    <header className="nav">
      <div className="container nav__inner">
        <Link to="/" className="nav__brand">
          <img src="/icon.svg" alt="" width="30" height="30" />
          <span>Rakt<b>Setu</b></span>
        </Link>

        <button className="nav__toggle" aria-label="Menu" onClick={() => setOpen((o) => !o)}>☰</button>

        <nav className={`nav__links ${open ? 'is-open' : ''}`}>
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className="nav__link">{l.label}</NavLink>
          ))}
          <Link to="/requests/new?sos=1" className="btn btn--sos btn--sm">🚨 SOS</Link>
          {user ? (
            <>
              <NavLink to="/notifications" className="nav__link nav__bell" aria-label="Notifications">
                🔔{unread > 0 && <span className="nav__count">{unread > 9 ? '9+' : unread}</span>}
              </NavLink>
              <NavLink to="/passport" className="nav__link nav__user">
                <BloodBadge group={user.bloodGroup} size="sm" /> {user.name.split(' ')[0]}
              </NavLink>
              <button className="btn btn--ghost btn--sm" onClick={() => { logout(); navigate('/'); }}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav__link">Login</NavLink>
              <Link to="/register" className="btn btn--primary btn--sm">Become a donor</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
