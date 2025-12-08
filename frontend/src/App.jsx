import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import LeavesPlanning from './pages/LeavesPlanning';
import Tasks from './pages/Tasks';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Employees from './pages/Employees';
import CreateUser from './pages/CreateUser';
import AttendancePlanning from './pages/AttendancePlanning';
import TaskDetail from './pages/Taskdetail'


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Route publique - LOGIN UNIQUEMENT */}
          <Route path="/login" element={<Login />} />
          
          {/* PAS DE ROUTE /register - Les comptes sont créés par les admins */}

          {/* Routes protégées (authentification requise) */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/leaves" element={<Leaves />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/tasks/:id" element={<TaskDetail />} />
              <Route path="/leaves-planning" element={<LeavesPlanning />} />
              <Route path="/attendance-planning" element={<AttendancePlanning />} />
              
              {/* Routes admin uniquement */}
              <Route element={<AdminRoute />}>
                <Route path="/admin/create-user" element={<CreateUser />} />
              </Route>
            </Route>
          </Route>

          {/* Route par défaut */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;