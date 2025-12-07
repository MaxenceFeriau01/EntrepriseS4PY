import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Clock, 
  Calendar, 
  CheckSquare, 
  MessageSquare, 
  Users, 
  User, 
  LogOut,
  Menu,
  X,
  UserCheck,
  CalendarCheck,
  Building2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Charger le nombre de messages non lus
  useEffect(() => {
    if (user?.id) {
      loadUnreadCount();
      
      // Rafraîchir toutes les 30 secondes
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Rafraîchir quand on change de page
  useEffect(() => {
    if (user?.id) {
      loadUnreadCount();
    }
  }, [location.pathname]);

  const loadUnreadCount = async () => {
    try {
      const response = await apiService.getUnreadCount(user.id);
      setUnreadCount(response.data.count || response.data || 0);
    } catch (error) {
      console.error('Erreur chargement messages non lus:', error);
    }
  };

  const menuItems = [
    { 
      path: '/dashboard', 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      roles: ['ADMIN', 'MANAGER', 'EMPLOYEE']
    },
    { 
      path: '/attendance', 
      icon: Clock, 
      label: 'Ma Présence',
      roles: ['ADMIN', 'MANAGER', 'EMPLOYEE']
    },
    { 
      path: '/leaves', 
      icon: Calendar, 
      label: 'Mes Congés',
      roles: ['ADMIN', 'MANAGER', 'EMPLOYEE']
    },
    { 
      path: '/tasks', 
      icon: CheckSquare, 
      label: 'Tâches',
      roles: ['ADMIN', 'MANAGER', 'EMPLOYEE']
    },
    { 
      path: '/messages', 
      icon: MessageSquare, 
      label: 'Messages',
      roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
      badge: unreadCount // Badge dynamique
    },
    // Séparateur visuel pour admin/manager
    { separator: true, roles: ['ADMIN', 'MANAGER'] },
    { 
      path: '/attendance-planning', 
      icon: UserCheck, 
      label: 'Planning Présences',
      roles: ['ADMIN', 'MANAGER'],
      adminBadge: 'Admin'
    },
    { 
      path: '/leaves-planning', 
      icon: CalendarCheck, 
      label: 'Planning Congés',
      roles: ['ADMIN', 'MANAGER'],
      adminBadge: 'Admin'
    },
    { 
      path: '/employees', 
      icon: Users, 
      label: 'Gestion Employés',
      roles: ['ADMIN', 'MANAGER'],
      adminBadge: 'Admin'
    },
  ];

  // Filtrer les éléments du menu selon le rôle
  const filteredMenuItems = menuItems.filter(item => {
    if (item.separator) return item.roles?.includes(user?.role);
    return !item.roles || item.roles.includes(user?.role);
  });

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Logo et menu burger */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-blue-500 transition-colors"
            >
              {sidebarOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <Building2 className="h-7 w-7 text-white" />
              <h1 className="text-xl font-bold text-white">EntrepriseS4PY</h1>
            </div>
          </div>

          {/* Infos utilisateur */}
          <div className="flex items-center gap-4">
            {/* Badge messages dans la navbar */}
            {unreadCount > 0 && (
              <button
                onClick={() => navigate('/messages')}
                className="relative p-2 hover:bg-blue-500 rounded-lg transition-colors"
              >
                <MessageSquare className="h-5 w-5 text-white" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              </button>
            )}

            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-blue-100">
                {user?.role === 'ADMIN' ? 'Administrateur' : 
                 user?.role === 'MANAGER' ? 'Manager' : 
                 'Employé'} • {user?.department}
              </p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
            >
              <User className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-500 hover:bg-opacity-20 transition-colors text-white"
              title="Déconnexion"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white shadow-xl transform transition-transform duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 overflow-y-auto`}
      >
        <nav className="p-4 space-y-1">
          {filteredMenuItems.map((item, index) => {
            // Séparateur
            if (item.separator) {
              return (
                <div key={`separator-${index}`} className="my-4">
                  <div className="border-t border-gray-200"></div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4 mb-2 px-2">
                    Administration
                  </p>
                </div>
              );
            }

            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative ${
                  active
                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                    : 'text-gray-700 hover:bg-gray-100 hover:translate-x-1'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-500'}`} />
                <span className="font-medium flex-1 text-left">{item.label}</span>
                
                {/* Badge messages non lus */}
                {item.badge && item.badge > 0 && (
                  <span className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                    active 
                      ? 'bg-red-500 text-white' 
                      : 'bg-red-500 text-white animate-pulse'
                  }`}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
                
                {/* Badge Admin */}
                {item.adminBadge && !active && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
                    {item.adminBadge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer de la sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-50 to-transparent">
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-gray-600">Statut : En ligne</span>
            </div>
            <p className="text-xs text-gray-500">
              Version 1.0.0
            </p>
          </div>
        </div>
      </aside>

      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenu principal */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;