import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import FindDonors from './pages/FindDonors';
import Requests from './pages/Requests';
import RequestForm from './pages/RequestForm';
import RequestDetail from './pages/RequestDetail';
import Passport from './pages/Passport';
import Camps from './pages/Camps';
import Insights from './pages/Insights';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';

const secure = (page) => <ProtectedRoute>{page}</ProtectedRoute>;

export default function App() {
  return (
    <>
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/find" element={<FindDonors />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/requests/new" element={secure(<RequestForm />)} />
          <Route path="/requests/:id" element={<RequestDetail />} />
          <Route path="/requests/:id/edit" element={secure(<RequestForm />)} />
          <Route path="/passport" element={secure(<Passport />)} />
          <Route path="/camps" element={<Camps />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/notifications" element={secure(<Notifications />)} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="container">
          🩸 <b>RaktSetu</b> - a bridge of blood between donors and patients · MongoDB + Express + React + Node.js
        </div>
      </footer>
    </>
  );
}
