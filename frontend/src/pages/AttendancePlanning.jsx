import { useState, useEffect } from 'react';
import { Calendar, Clock, Edit2, Check, X, UserCheck, UserX, AlertCircle, Search } from 'lucide-react';
import apiService from '../services/apiService';

const AttendancePlanning = () => {
  const [attendances, setAttendances] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [editingCell, setEditingCell] = useState(null);
  const [editForm, setEditForm] = useState({ checkIn: '', checkOut: '', status: '' });

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const departments = ['Informatique', 'Commercial', 'Marketing', 'Comptabilité', 'Ressources Humaines', 'Logistique'];

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [usersData, attendancesData] = await Promise.all([
        apiService.getAllUsers(),
        apiService.getAttendances()
      ]);
      
      console.log('Users:', usersData.data);
      console.log('Attendances:', attendancesData.data);
      
      setUsers(Array.isArray(usersData.data) ? usersData.data : []);
      setAttendances(Array.isArray(attendancesData.data) ? attendancesData.data : []);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setError(error.response?.data?.message || 'Erreur de chargement');
      setUsers([]);
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };

  // Obtenir le nombre de jours dans le mois
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user => {
    const matchSearch = searchTerm === '' || 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDepartment = departmentFilter === '' || user.department === departmentFilter;
    return matchSearch && matchDepartment && user.active;
  });

  // Obtenir la présence pour un utilisateur et un jour donné
  const getAttendanceForDay = (userId, day) => {
    const date = new Date(selectedYear, selectedMonth, day);
    const dateString = date.toISOString().split('T')[0];
    
    return attendances.find(att => {
      if (!att.date) return false;
      
      // Gérer différents formats de date
      let attDateString;
      if (typeof att.date === 'string') {
        attDateString = att.date.split('T')[0];
      } else if (Array.isArray(att.date) && att.date.length >= 3) {
        // Format [2025, 12, 2] du backend Java
        const year = att.date[0];
        const month = String(att.date[1]).padStart(2, '0');
        const dayNum = String(att.date[2]).padStart(2, '0');
        attDateString = `${year}-${month}-${dayNum}`;
      } else {
        return false;
      }
      
      return att.userId === userId && attDateString === dateString;
    });
  };

  // Convertir une date du backend en objet Date
  const parseBackendDate = (dateValue) => {
    if (!dateValue) return null;
    
    if (typeof dateValue === 'string') {
      return new Date(dateValue);
    } else if (Array.isArray(dateValue) && dateValue.length >= 3) {
      // Format [2025, 12, 2] ou [2025, 12, 2, 8, 30, 0]
      const year = dateValue[0];
      const month = dateValue[1] - 1; // Les mois en JS commencent à 0
      const day = dateValue[2];
      const hours = dateValue[3] || 0;
      const minutes = dateValue[4] || 0;
      const seconds = dateValue[5] || 0;
      return new Date(year, month, day, hours, minutes, seconds);
    }
    return null;
  };

  // Extraire l'heure d'une date
  const extractTime = (dateValue) => {
    const date = parseBackendDate(dateValue);
    if (!date || isNaN(date.getTime())) return '';
    return date.toTimeString().slice(0, 5);
  };

  // Statistiques
  const today = new Date().toISOString().split('T')[0];
  const stats = {
    totalEmployees: filteredUsers.length,
    presentToday: attendances.filter(att => {
      if (!att.date) return false;
      let attDateString;
      if (typeof att.date === 'string') {
        attDateString = att.date.split('T')[0];
      } else if (Array.isArray(att.date) && att.date.length >= 3) {
        const year = att.date[0];
        const month = String(att.date[1]).padStart(2, '0');
        const day = String(att.date[2]).padStart(2, '0');
        attDateString = `${year}-${month}-${day}`;
      } else {
        return false;
      }
      return attDateString === today && att.status === 'PRESENT';
    }).length,
    absentToday: attendances.filter(att => {
      if (!att.date) return false;
      let attDateString;
      if (typeof att.date === 'string') {
        attDateString = att.date.split('T')[0];
      } else if (Array.isArray(att.date) && att.date.length >= 3) {
        const year = att.date[0];
        const month = String(att.date[1]).padStart(2, '0');
        const day = String(att.date[2]).padStart(2, '0');
        attDateString = `${year}-${month}-${day}`;
      } else {
        return false;
      }
      return attDateString === today && att.status === 'ABSENT';
    }).length,
    totalPresencesMonth: attendances.filter(att => {
      if (!att.date) return false;
      const attDate = parseBackendDate(att.date);
      if (!attDate || isNaN(attDate.getTime())) return false;
      return attDate.getMonth() === selectedMonth && 
             attDate.getFullYear() === selectedYear &&
             att.status === 'PRESENT';
    }).length
  };

  // Ouvrir l'édition d'une cellule
  const handleEditCell = (userId, day) => {
    const attendance = getAttendanceForDay(userId, day);
    if (attendance) {
      setEditingCell({ userId, day });
      setEditForm({
        checkIn: extractTime(attendance.checkIn) || '09:00',
        checkOut: extractTime(attendance.checkOut) || '17:30',
        status: attendance.status || 'PRESENT'
      });
    } else {
      // Créer une nouvelle présence
      setEditingCell({ userId, day });
      setEditForm({
        checkIn: '09:00',
        checkOut: '17:30',
        status: 'PRESENT'
      });
    }
  };

  // Sauvegarder les modifications
  const handleSaveEdit = async () => {
    try {
      const { userId, day } = editingCell;
      const date = new Date(selectedYear, selectedMonth, day);
      const dateString = date.toISOString().split('T')[0];

      const attendance = getAttendanceForDay(userId, day);

      const attendanceData = {
        userId,
        date: dateString,
        checkIn: editForm.status === 'PRESENT' ? `${dateString}T${editForm.checkIn}:00` : null,
        checkOut: editForm.status === 'PRESENT' ? `${dateString}T${editForm.checkOut}:00` : null,
        status: editForm.status
      };

      if (attendance) {
        // Mettre à jour
        await apiService.updateAttendance(attendance.id, attendanceData);
        alert('Présence mise à jour avec succès !');
      } else {
        // Créer
        await apiService.createAttendance(attendanceData);
        alert('Présence créée avec succès !');
      }

      await fetchData();
      setEditingCell(null);
      setEditForm({ checkIn: '', checkOut: '', status: '' });
    } catch (error) {
      console.error('Erreur sauvegarde présence:', error);
      alert(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  // Annuler l'édition
  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditForm({ checkIn: '', checkOut: '', status: '' });
  };

  // Rendu d'une cellule de présence
  const renderAttendanceCell = (userId, day) => {
    const attendance = getAttendanceForDay(userId, day);
    const isEditing = editingCell?.userId === userId && editingCell?.day === day;
    const isToday = day === new Date().getDate() && 
                   selectedMonth === new Date().getMonth() && 
                   selectedYear === new Date().getFullYear();

    if (isEditing) {
      return (
        <td key={day} className="border border-gray-300 p-1 bg-blue-50">
          <div className="flex flex-col gap-1 min-w-[120px]">
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              className="text-xs border rounded px-1 py-0.5"
            >
              <option value="PRESENT">Présent</option>
              <option value="ABSENT">Absent</option>
            </select>
            {editForm.status === 'PRESENT' && (
              <>
                <input
                  type="time"
                  value={editForm.checkIn}
                  onChange={(e) => setEditForm({ ...editForm, checkIn: e.target.value })}
                  className="text-xs border rounded px-1 py-0.5"
                  placeholder="Entrée"
                />
                <input
                  type="time"
                  value={editForm.checkOut}
                  onChange={(e) => setEditForm({ ...editForm, checkOut: e.target.value })}
                  className="text-xs border rounded px-1 py-0.5"
                  placeholder="Sortie"
                />
              </>
            )}
            <div className="flex gap-1">
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-green-500 text-white rounded px-1 py-0.5 text-xs hover:bg-green-600"
              >
                <Check className="w-3 h-3 mx-auto" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex-1 bg-gray-500 text-white rounded px-1 py-0.5 text-xs hover:bg-gray-600"
              >
                <X className="w-3 h-3 mx-auto" />
              </button>
            </div>
          </div>
        </td>
      );
    }

    if (!attendance) {
      return (
        <td
          key={day}
          className={`border border-gray-300 p-2 text-center cursor-pointer hover:bg-gray-100 ${
            isToday ? 'bg-yellow-50' : ''
          }`}
          onClick={() => handleEditCell(userId, day)}
        >
          <span className="text-gray-400 text-xs">-</span>
        </td>
      );
    }

    const checkInDate = parseBackendDate(attendance.checkIn);
    const checkOutDate = parseBackendDate(attendance.checkOut);

    return (
      <td
        key={day}
        className={`border border-gray-300 p-2 text-center cursor-pointer hover:bg-opacity-80 ${
          attendance.status === 'PRESENT' ? 'bg-green-100' : 'bg-red-100'
        } ${isToday ? 'ring-2 ring-yellow-400' : ''}`}
        onClick={() => handleEditCell(userId, day)}
      >
        {attendance.status === 'PRESENT' ? (
          <div className="flex flex-col items-center">
            <UserCheck className="w-4 h-4 text-green-600 mb-1" />
            {checkInDate && checkOutDate && !isNaN(checkInDate.getTime()) && !isNaN(checkOutDate.getTime()) && (
              <div className="text-xs text-gray-700">
                {checkInDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                {' - '}
                {checkOutDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        ) : (
          <UserX className="w-4 h-4 text-red-600 mx-auto" />
        )}
      </td>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement du planning...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div>
            <p className="font-semibold text-red-800">Erreur de chargement</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Planning des Présences</h1>
            <p className="text-sm text-gray-600">Gestion centralisée des présences</p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Employés actifs</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalEmployees}</p>
            </div>
            <UserCheck className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Présents aujourd'hui</p>
              <p className="text-2xl font-bold text-green-600">{stats.presentToday}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Absents aujourd'hui</p>
              <p className="text-2xl font-bold text-red-600">{stats.absentToday}</p>
            </div>
            <UserX className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Présences ce mois</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalPresencesMonth}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recherche */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Search className="w-4 h-4 inline mr-1" />
              Rechercher un employé
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Prénom ou nom..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Département */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Département
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les départements</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Mois */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mois
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>

          {/* Année */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Année
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">💡 Astuce</p>
          <p>Cliquez sur une case pour modifier ou ajouter une présence. Cases vertes = présent, rouges = absent.</p>
        </div>
      </div>

      {/* Tableau des présences */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r-2 border-gray-300">
                  Employé
                </th>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const date = new Date(selectedYear, selectedMonth, day);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  const isToday = day === new Date().getDate() && 
                                 selectedMonth === new Date().getMonth() && 
                                 selectedYear === new Date().getFullYear();
                  
                  return (
                    <th
                      key={day}
                      className={`px-2 py-3 text-center text-xs font-medium uppercase tracking-wider border-r border-gray-200 ${
                        isWeekend ? 'bg-gray-100 text-gray-500' : 'text-gray-700'
                      } ${isToday ? 'bg-yellow-100 text-yellow-800' : ''}`}
                    >
                      {day}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="sticky left-0 z-10 bg-white px-4 py-3 whitespace-nowrap border-r-2 border-gray-300">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{user.department}</div>
                    </div>
                  </td>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day =>
                    renderAttendanceCell(user.id, day)
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pas de résultats */}
      {filteredUsers.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <UserX className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Aucun employé trouvé</p>
        </div>
      )}
    </div>
  );
};

export default AttendancePlanning;