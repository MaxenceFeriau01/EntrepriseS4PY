import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Building2, 
  Calendar, 
  Key, 
  Save,
  Edit2,
  X,
  CheckCircle,
  Umbrella,
  TrendingUp,
  Award
} from 'lucide-react';
import { parseDate, parseTime, calculateHours } from '../utils/formatters';
import { getUserRoleLabel, getDepartmentLabel } from '../constants/enums';

const Profile = () => {
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPresences: 0,
    thisMonthPresences: 0,
    totalLeaves: 0,
    approvedLeaves: 0,
    averageHours: 0,
    activeTasks: 0
  });
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    department: '',
    position: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Charger les infos utilisateur
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        department: user.department || '',
        position: user.position || ''
      });

      // Charger les statistiques
      const [attendances, leaves, tasks] = await Promise.all([
        apiService.getUserAttendances(user.id),
        apiService.getLeaveRequests(user.id),
        apiService.getTasks(user.id)
      ]);

      // Calculer les stats
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const thisMonthAttendances = attendances.data.filter(att => {
        const attDate = new Date(parseDate(att.date));
        return attDate >= firstDayOfMonth;
      });

      // Calculer moyenne des heures
      let totalHours = 0;
      let daysWithHours = 0;
      attendances.data.forEach(att => {
        if (att.checkInTime && att.checkOutTime) {
          const hours = parseFloat(calculateHours(att.checkInTime, att.checkOutTime));
          if (hours > 0) {
            totalHours += hours;
            daysWithHours++;
          }
        }
      });

      setStats({
        totalPresences: attendances.data.length,
        thisMonthPresences: thisMonthAttendances.length,
        totalLeaves: leaves.data.length,
        approvedLeaves: leaves.data.filter(l => l.status === 'APPROVED').length,
        averageHours: daysWithHours > 0 ? (totalHours / daysWithHours).toFixed(1) : 0,
        activeTasks: tasks.data.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length
      });

    } catch (error) {
      console.error('Erreur chargement profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await apiService.updateUser(user.id, profileData);
      alert('✅ Profil mis à jour avec succès !');
      setEditMode(false);
      // Recharger les données
      window.location.reload();
    } catch (error) {
      alert('❌ Erreur lors de la mise à jour du profil');
      console.error('Erreur:', error);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Vérifier que tous les champs sont remplis
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('❌ Veuillez remplir tous les champs');
      return;
    }

    // Vérifier que les mots de passe correspondent
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('❌ Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    // Vérifier la longueur
    if (passwordData.newPassword.length < 6) {
      alert('❌ Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      // Utiliser le nouvel endpoint avec validation de l'ancien mot de passe
      await apiService.changePassword(user.id, passwordData.currentPassword, passwordData.newPassword);
      alert('✅ Mot de passe changé avec succès !');
      setChangePasswordMode(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors du changement de mot de passe';
      alert('❌ ' + errorMessage);
      console.error('Erreur:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur">
              <User className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {user.firstName} {user.lastName}
              </h1>
              <div className="flex items-center gap-4 text-blue-100">
                <span className="flex items-center gap-2">
                  <Briefcase size={16} />
                  {user.position}
                </span>
                <span className="flex items-center gap-2">
                  <Building2 size={16} />
                  {getDepartmentLabel(user.department)}
                </span>
              </div>
              <div className="mt-2">
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                  {getUserRoleLabel(user.role)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <Award className="w-8 h-8 text-gray-200" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.thisMonthPresences}</p>
          <p className="text-sm text-gray-600 mt-1">Présences ce mois</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-8 h-8 text-gray-200" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.averageHours}h</p>
          <p className="text-sm text-gray-600 mt-1">Moyenne heures/jour</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <Umbrella className="w-6 h-6 text-orange-600" />
            </div>
            <Calendar className="w-8 h-8 text-gray-200" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{user.vacationDays}</p>
          <p className="text-sm text-gray-600 mt-1">Jours de congés restants</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <TrendingUp className="w-8 h-8 text-gray-200" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.activeTasks}</p>
          <p className="text-sm text-gray-600 mt-1">Tâches actives</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations personnelles */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Informations personnelles
              </h2>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit2 size={16} />
                  Modifier
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {editMode ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save size={16} />
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <X size={16} />
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    <p className="font-medium text-gray-900">{user.phone || 'Non renseigné'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Adresse</p>
                    <p className="font-medium text-gray-900">{user.address || 'Non renseignée'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Département</p>
                    <p className="font-medium text-gray-900">{getDepartmentLabel(user.department)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Poste</p>
                    <p className="font-medium text-gray-900">{user.position}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Date d'embauche</p>
                    <p className="font-medium text-gray-900">
                      {user.hireDate ? new Date(user.hireDate).toLocaleDateString('fr-FR') : 'Non renseignée'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sécurité */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600" />
              Sécurité
            </h2>
          </div>

          <div className="p-6">
            {changePasswordMode ? (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ancien mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    💡 Le mot de passe doit contenir au moins 6 caractères
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save size={16} />
                    Changer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setChangePasswordMode(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <X size={16} />
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setChangePasswordMode(true)}
                className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-3 rounded-lg hover:bg-blue-100 transition-colors font-medium"
              >
                <Key size={20} />
                Changer mon mot de passe
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;