import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axios';
import { UserPlus, Mail, Phone, Briefcase, Shield, ShieldCheck, ShieldAlert, Calendar, Edit, Trash2, Lock, Power } from 'lucide-react';

const Employees = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axiosInstance.get('/users');
      setEmployees(response.data);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des employés:', err);
      setError('Erreur lors du chargement des employés');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (employeeId, currentStatus) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir ${currentStatus ? 'désactiver' : 'activer'} cet employé ?`)) {
      return;
    }

    try {
      const endpoint = currentStatus ? `/admin/users/${employeeId}/deactivate` : `/admin/users/${employeeId}/activate`;
      await axiosInstance.patch(endpoint);
      
      setSuccessMessage(`Employé ${currentStatus ? 'désactivé' : 'activé'} avec succès`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Rafraîchir la liste
      fetchEmployees();
    } catch (err) {
      console.error('Erreur:', err);
      setError(`Erreur lors de ${currentStatus ? 'la désactivation' : 'l\'activation'}`);
    }
  };

  const handleResetPassword = async (employeeId, employeeEmail) => {
    const newPassword = prompt(`Entrez le nouveau mot de passe pour ${employeeEmail}:`);
    
    if (!newPassword || newPassword.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      await axiosInstance.patch(`/admin/users/${employeeId}/reset-password`, { newPassword });
      setSuccessMessage('Mot de passe réinitialisé avec succès');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de la réinitialisation du mot de passe');
    }
  };

  const handleDelete = async (employeeId, employeeName) => {
    if (!window.confirm(`⚠️ ATTENTION : Êtes-vous sûr de vouloir SUPPRIMER définitivement ${employeeName} ?\n\nCette action est IRRÉVERSIBLE !`)) {
      return;
    }

    try {
      await axiosInstance.delete(`/users/${employeeId}`);
      setSuccessMessage('Employé supprimé avec succès');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Rafraîchir la liste
      fetchEmployees();
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de la suppression');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN':
        return <ShieldAlert className="h-5 w-5 text-red-600" />;
      case 'MANAGER':
        return <ShieldCheck className="h-5 w-5 text-blue-600" />;
      default:
        return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      ADMIN: 'bg-red-100 text-red-800 border-red-200',
      MANAGER: 'bg-blue-100 text-blue-800 border-blue-200',
      EMPLOYEE: 'bg-green-100 text-green-800 border-green-200'
    };
    return badges[role] || badges.EMPLOYEE;
  };

  const getRoleLabel = (role) => {
    const labels = {
      ADMIN: 'Administrateur',
      MANAGER: 'Manager',
      EMPLOYEE: 'Employé'
    };
    return labels[role] || role;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Employés</h1>
          <p className="text-gray-600 text-sm mt-1">{employees.length} employé(s) au total</p>
        </div>
        
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => navigate('/admin/create-user')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <UserPlus className="h-5 w-5" />
            Créer un utilisateur
          </button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {successMessage}
        </div>
      )}

      {/* Liste des employés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <div
            key={employee.id}
            className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border ${
              employee.active ? 'border-gray-200' : 'border-red-200 bg-gray-50'
            }`}
          >
            {/* En-tête avec nom et statut */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">
                  {employee.firstName} {employee.lastName}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  {getRoleIcon(employee.role)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadge(employee.role)}`}>
                    {getRoleLabel(employee.role)}
                  </span>
                </div>
              </div>
              
              {/* Indicateur actif/inactif */}
              <div className="flex flex-col items-end gap-1">
                <div 
                  className={`h-3 w-3 rounded-full ${employee.active ? 'bg-green-500' : 'bg-red-500'}`} 
                  title={employee.active ? 'Actif' : 'Inactif'}
                />
                <span className={`text-xs ${employee.active ? 'text-green-600' : 'text-red-600'}`}>
                  {employee.active ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>

            {/* Informations de contact */}
            <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="truncate">{employee.email}</span>
              </div>
              
              {employee.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{employee.phone}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Briefcase className="h-4 w-4 text-gray-400" />
                <span>{employee.position}</span>
              </div>
            </div>

            {/* Département et congés */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Département</span>
                <span className="text-gray-800 font-semibold">{employee.department}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-600 font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Congés
                </span>
                <span className="text-blue-600 font-semibold">{employee.vacationDays} jours</span>
              </div>
            </div>

            {/* Actions admin */}
            {user?.role === 'ADMIN' && (
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleToggleActive(employee.id, employee.active)}
                  className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    employee.active 
                      ? 'bg-orange-50 text-orange-700 hover:bg-orange-100' 
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                  title={employee.active ? 'Désactiver' : 'Activer'}
                >
                  <Power className="h-4 w-4" />
                  {employee.active ? 'Désactiver' : 'Activer'}
                </button>

                <button
                  onClick={() => handleResetPassword(employee.id, employee.email)}
                  className="flex items-center justify-center px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                  title="Réinitialiser le mot de passe"
                >
                  <Lock className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handleDelete(employee.id, `${employee.firstName} ${employee.lastName}`)}
                  className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {employees.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Aucun employé trouvé</p>
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => navigate('/admin/create-user')}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Créer le premier utilisateur
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Employees;