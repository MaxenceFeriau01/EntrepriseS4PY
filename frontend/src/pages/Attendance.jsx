import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const Attendance = () => {
  const { user } = useAuth();
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadAttendances();
  }, [user, currentMonth]);

  const loadAttendances = async () => {
    try {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const response = await apiService.getAttendancesByDateRange(
        user.id,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      setAttendances(response.data);
    } catch (error) {
      console.error('Error loading attendances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await apiService.checkIn(user.id);
      alert('Arrivée pointée avec succès !');
      loadAttendances();
    } catch (error) {
      alert('Erreur lors du pointage');
    }
  };

  const handleCheckOut = async () => {
    try {
      await apiService.checkOut(user.id);
      alert('Départ pointé avec succès !');
      loadAttendances();
    } catch (error) {
      alert('Erreur lors du pointage de départ');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'ABSENT':
        return <XCircle className="text-red-500" size={20} />;
      case 'LATE':
        return <AlertCircle className="text-orange-500" size={20} />;
      case 'HALF_DAY':
        return <Clock className="text-blue-500" size={20} />;
      case 'REMOTE':
        return <Calendar className="text-purple-500" size={20} />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      PRESENT: 'Présent',
      ABSENT: 'Absent',
      LATE: 'En retard',
      HALF_DAY: 'Demi-journée',
      REMOTE: 'Télétravail',
    };
    return labels[status] || status;
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Présences</h1>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pointer aujourd'hui</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleCheckIn}
            className="flex items-center justify-center space-x-2 bg-green-50 text-green-700 py-4 rounded-lg font-medium hover:bg-green-100 transition-colors border border-green-200"
          >
            <CheckCircle size={20} />
            <span>Pointer l'arrivée</span>
          </button>
          <button
            onClick={handleCheckOut}
            className="flex items-center justify-center space-x-2 bg-red-50 text-red-700 py-4 rounded-lg font-medium hover:bg-red-100 transition-colors border border-red-200"
          >
            <XCircle size={20} />
            <span>Pointer le départ</span>
          </button>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            ← Mois précédent
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={nextMonth}
            className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            Mois suivant →
          </button>
        </div>

        {/* Attendance List */}
        <div className="space-y-3">
          {attendances.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Aucune présence enregistrée ce mois</p>
          ) : (
            attendances.map((attendance) => (
              <div
                key={attendance.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {getStatusIcon(attendance.status)}
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(attendance.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                    <p className="text-sm text-gray-600">{getStatusLabel(attendance.status)}</p>
                  </div>
                </div>
                <div className="text-right">
                  {attendance.checkIn && (
                    <p className="text-sm text-gray-900">
                      Arrivée: <span className="font-medium">{attendance.checkIn}</span>
                    </p>
                  )}
                  {attendance.checkOut && (
                    <p className="text-sm text-gray-900">
                      Départ: <span className="font-medium">{attendance.checkOut}</span>
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;