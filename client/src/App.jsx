import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewTransfer from './pages/NewTransfer';
import Transactions from './pages/Transactions';
import TransactionDetail from './pages/TransactionDetail';
import Notifications from './pages/Notifications';
import Admin from './pages/Admin';

function Protected({ children, adminOnly }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="center">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          <Route path="/send" element={<Protected><NewTransfer /></Protected>} />
          <Route path="/transactions" element={<Protected><Transactions /></Protected>} />
          <Route path="/transactions/:id" element={<Protected><TransactionDetail /></Protected>} />
          <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
          <Route path="/admin" element={<Protected adminOnly><Admin /></Protected>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}
