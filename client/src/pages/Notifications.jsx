import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { notificationApi } from '../api/endpoints';
import { useAsync } from '../hooks/useAsync';
import { EmptyState, ErrorBox, Loader } from '../components/ui';
import { timeAgo } from '../utils/format';

const ICONS = { request: '🩸', pledge: '🙌', donation: '❤️', camp: '🏕️', system: '🔔' };

export default function Notifications() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync(() => notificationApi.list(), []);

  const open = async (n) => {
    if (!n.read) await notificationApi.markRead(n._id).catch(() => {});
    if (n.link) navigate(n.link);
    else reload();
  };

  const run = (fn, msg) => fn().then(() => { toast.success(msg); reload(); }).catch((e) => toast.error(e.message));

  if (loading && !data) return <Loader />;

  return (
    <div className="container page narrow">
      <div className="page-head">
        <div>
          <h1>Notifications</h1>
          <p className="muted">Auto-deleted after 30 days by a MongoDB TTL index.</p>
        </div>
        {data?.unread > 0 && <button className="btn btn--ghost btn--sm" onClick={() => run(notificationApi.markAllRead, 'All marked as read')}>Mark all read</button>}
      </div>
      <ErrorBox error={error} onRetry={reload} />
      {data?.notifications.length === 0 && <EmptyState icon="🔕" title="You're all caught up" />}
      <div className="stack">
        {data?.notifications.map((n) => (
          <div key={n._id} className={`card notification ${n.read ? '' : 'is-unread'}`}>
            <button className="notification__main" onClick={() => open(n)}>
              <span className="notification__icon">{ICONS[n.type]}</span>
              <span>
                <b>{n.title}</b>
                {n.message && <span className="muted small block">{n.message}</span>}
                <span className="muted small">{timeAgo(n.createdAt)}</span>
              </span>
            </button>
            <button className="icon-btn" title="Delete" onClick={() => run(() => notificationApi.remove(n._id), 'Deleted')}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
