import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axios';
import { UserPlus, Mail, Phone, Briefcase, Shield, ShieldCheck, ShieldAlert, Calendar, Edit, Trash2, Lock, Power, Search, Filter, X } from 'lucide-react';

const Employees = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // États des filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive

  // Liste des départements
  const departments = ['IT', 'Commercial', 'Marketing', 'Comptabilité', 'RH', 'Logistique'];
  const roles = ['ADMIN', 'MANAGER', 'EMPLOYEE'];

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [employees, searchTerm, departmentFilter, roleFilter, statusFilter]);

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

  const applyFilters = () => {
    let filtered = [...employees];

    // Filtre par recherche (nom, email)
    if (searchTerm) {
      filtered = filtered.filter(emp => 
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par département
    if (departmentFilter) {
      filtered = filtered.filter(emp => emp.department === departmentFilter);
    }

    // Filtre par rôle
    if (roleFilter) {
      filtered = filtered.filter(emp => emp.role === roleFilter);
    }

    // Filtre par statut
    if (statusFilter === 'active') {
      filtered = filtered.filter(emp => emp.active);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(emp => !emp.active);
    }

    setFilteredEmployees(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('');
    setRoleFilter('');
    setStatusFilter('all');
  };

  const hasActiveFilters = searchTerm || departmentFilter || roleFilter || statusFilter !== 'all';

  const handleToggleActive = async (employeeId, currentStatus) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir ${currentStatus ? 'désactiver' : 'activer'} cet employé ?`)) {
      return;
    }

    try {
      const endpoint = currentStatus ? `/admin/users/${employeeId}/deactivate` : `/admin/users/${employeeId}/activate`;
      await axiosInstance.patch(endpoint);
      
      setSuccessMessage(`Employé ${currentStatus ? 'désactivé' : 'activé'} avec succès`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
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
          <p className="text-gray-600 text-sm mt-1">
            {filteredEmployees.length} employé(s) {hasActiveFilters && `sur ${employees.length} au total`}
          </p>
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

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Filtres</h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Effacer les filtres
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtre Département */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les départements</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Filtre Rôle */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les rôles</option>
            {roles.map(role => (
              <option key={role} value={role}>{getRoleLabel(role)}</option>
            ))}
          </select>

          {/* Filtre Statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs uniquement</option>
            <option value="inactive">Inactifs uniquement</option>
          </select>
        </div>
      </div>

      {/* Liste des employés */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">Aucun employé trouvé avec ces critères</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border ${
                employee.active ? 'border-green-200' : 'border-red-200'
              }`}
            >
              {/* En-tête de la carte */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                    employee.active ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gray-400'
                  }`}>
                    {employee.firstName[0]}{employee.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {employee.firstName} {employee.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{employee.position}</p>
                  </div>
                </div>
                
                {/* Badge de statut */}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  employee.active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {employee.active ? 'Actif' : 'Inactif'}
                </span>
              </div>

              {/* Informations */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{employee.email}</span>
                </div>
                
                {employee.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{employee.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase className="h-4 w-4" />
                  <span>{employee.department}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  {getRoleIcon(employee.role)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadge(employee.role)}`}>
                    {getRoleLabel(employee.role)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{employee.vacationDays} jours de congés</span>
                </div>
              </div>

              {/* Actions Admin */}
              {user?.role === 'ADMIN' && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleToggleActive(employee.id, employee.active)}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      employee.active
                        ? 'bg-red-50 text-red-700 hover:bg-red-100'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    <Power className="h-4 w-4" />
                    {employee.active ? 'Désactiver' : 'Activer'}
                  </button>

                  <button
                    onClick={() => handleResetPassword(employee.id, employee.email)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium transition-colors"
                  >
                    <Lock className="h-4 w-4" />
                    Mot de passe
                  </button>

                  <button
                    onClick={() => handleDelete(employee.id, `${employee.firstName} ${employee.lastName}`)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm font-medium transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Employees;