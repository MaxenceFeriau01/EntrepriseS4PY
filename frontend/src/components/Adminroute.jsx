import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';

const AdminRoute = () => {
  const { user } = useAuth();
  const [showMessage, setShowMessage] = useState(true);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Vérifier si l'utilisateur est admin
  if (user?.role !== 'ADMIN') {
    if (showMessage) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Accès refusé</h2>
            <p className="text-gray-600 mb-6">
              Cette page est réservée aux administrateurs.
            </p>
            <p className="text-sm text-gray-500">
              Redirection vers le tableau de bord...
            </p>
          </div>
        </div>
      );
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;