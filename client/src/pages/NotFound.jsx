import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui';

export default function NotFound() {
  return (
    <div className="container page">
      <EmptyState icon="🧭" title="Page not found">
        <Link to="/">Go back home</Link>
      </EmptyState>
    </div>
  );
}
