import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { ToastContainer } from './components/Toast';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import LeadDetail from './pages/LeadDetail';
import LeadForm from './pages/LeadForm';
import Students from './pages/Students';
import Programs from './pages/Programs';
import Users from './pages/Users';
import Landing from './pages/Landing';

function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />} />
        <Route path="/lead" element={<LeadForm />} />
        <Route path="/home" element={<Landing />} />

        <Route
          path="/"
          element={
            isAuthenticated ? (
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            ) : (
              <Navigate to="/home" replace />
            )
          }
        >
          <Route index element={user?.role === 'STUDENT' ? <Navigate to="/programs" replace /> : <Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="leads" element={<ProtectedRoute allowedRoles={['ADMIN', 'ADVISOR', 'MANAGEMENT']}><Leads /></ProtectedRoute>} />
          <Route path="leads/:id" element={<ProtectedRoute allowedRoles={['ADMIN', 'ADVISOR', 'MANAGEMENT']}><LeadDetail /></ProtectedRoute>} />
          <Route path="students" element={<ProtectedRoute allowedRoles={['ADMIN', 'ADVISOR', 'MANAGEMENT', 'STUDENT']}><Students /></ProtectedRoute>} />
          <Route path="programs" element={<Programs />} />
          <Route path="users" element={<ProtectedRoute allowedRoles={['ADMIN']}><Users /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </>
  );
}

export default App;
