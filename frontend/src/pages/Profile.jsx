import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Briefcase, Building, Calendar, Award } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <Icon className="text-primary-600" size={20} />
        </div>
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );

  const getRoleLabel = (role) => {
    const labels = {
      ADMIN: 'Administrateur',
      MANAGER: 'Manager',
      EMPLOYEE: 'Employé',
    };
    return labels[role] || role;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {user.firstName?.[0]}
            {user.lastName?.[0]}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-600">{user.position}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
              {getRoleLabel(user.role)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem icon={Mail} label="Email" value={user.email} />
          <InfoItem icon={Phone} label="Téléphone" value={user.phone} />
          <InfoItem icon={Briefcase} label="Poste" value={user.position} />
          <InfoItem icon={Building} label="Département" value={user.department} />
          <InfoItem
            icon={Calendar}
            label="Membre depuis"
            value={new Date(user.createdAt).toLocaleDateString('fr-FR')}
          />
          <InfoItem icon={Award} label="Jours de congés restants" value={`${user.vacationDays} jours`} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-blue-100 text-sm font-medium mb-2">Statut</p>
          <p className="text-3xl font-bold">{user.active ? 'Actif' : 'Inactif'}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-green-100 text-sm font-medium mb-2">Département</p>
          <p className="text-3xl font-bold">{user.department}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-purple-100 text-sm font-medium mb-2">Rôle</p>
          <p className="text-3xl font-bold">{getRoleLabel(user.role)}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;