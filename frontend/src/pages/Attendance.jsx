import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import { Calendar, TrendingUp, CheckCircle, XCircle, Clock, Umbrella, AlertCircle } from 'lucide-react';

const Attendance = () => {
  const { user } = useAuth();
  const [attendances, setAttendances] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    leaveDays: 0,
    averageHours: 0,
  });

  useEffect(() => {
    loadAttendances();
  }, [user, selectedMonth, selectedYear]);

  const loadAttendances = async () => {
    try {
      setLoading(true);
      const startDate = new Date(selectedYear, selectedMonth, 1);
      const endDate = new Date(selectedYear, selectedMonth + 1, 0);
      
      const [attendancesResponse, leavesResponse] = await Promise.all([
        apiService.getAttendancesByDateRange(
          user.id,
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        ),
        apiService.getLeaveRequests(user.id)
      ]);
      
      setAttendances(attendancesResponse.data);
      setLeaves(leavesResponse.data.filter(l => l.status === 'APPROVED'));
      calculateStats(attendancesResponse.data, leavesResponse.data.filter(l => l.status === 'APPROVED'));
    } catch (error) {
      console.error('Erreur chargement présences:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data, leavesData) => {
    const presentDays = data.filter(a => a.status === 'PRESENT').length;
    const totalDays = data.length;
    const absentDays = totalDays - presentDays;
    
    // Compter les jours de congés dans le mois
    const startDate = new Date(selectedYear, selectedMonth, 1);
    const endDate = new Date(selectedYear, selectedMonth + 1, 0);
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    let leaveDays = 0;
    leavesData.forEach(leave => {
      const leaveStart = parseDate(leave.startDate);
      const leaveEnd = parseDate(leave.endDate);
      
      // Compter les jours de congé dans ce mois
      for (let d = new Date(Math.max(new Date(leaveStart), startDate)); 
           d <= new Date(Math.min(new Date(leaveEnd), endDate)); 
           d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclure week-ends
          leaveDays++;
        }
      }
    });
    
    // Calculer moyenne d'heures travaillées
    let totalHours = 0;
    let daysWithHours = 0;
    
    data.forEach(att => {
      if (att.checkInTime && att.checkOutTime) {
        const checkIn = parseTime(att.checkInTime);
        const checkOut = parseTime(att.checkOutTime);
        if (checkIn && checkOut) {
          const hours = calculateHours(checkIn, checkOut);
          totalHours += hours;
          daysWithHours++;
        }
      }
    });
    
    const averageHours = daysWithHours > 0 ? (totalHours / daysWithHours).toFixed(1) : 0;
    
    setStats({
      totalDays,
      presentDays,
      absentDays,
      leaveDays,
      averageHours,
    });
  };

  const parseDate = (dateValue) => {
    if (!dateValue) return null;
    if (typeof dateValue === 'string') return dateValue.split('T')[0];
    if (Array.isArray(dateValue) && dateValue.length >= 3) {
      const year = dateValue[0];
      const month = String(dateValue[1]).padStart(2, '0');
      const day = String(dateValue[2]).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return null;
  };

  const parseTime = (timeValue) => {
    if (!timeValue) return null;
    if (typeof timeValue === 'string') return timeValue;
    if (Array.isArray(timeValue) && timeValue.length >= 2) {
      const hours = String(timeValue[0]).padStart(2, '0');
      const minutes = String(timeValue[1]).padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return null;
  };

  const calculateHours = (checkIn, checkOut) => {
    const [h1, m1] = checkIn.split(':').map(Number);
    const [h2, m2] = checkOut.split(':').map(Number);
    return (h2 - h1) + (m2 - m1) / 60;
  };

  const getLeaveTypeName = (leaveType) => {
    const types = {
      PAID_LEAVE: 'Congés payés',
      SICK_LEAVE: 'Congé maladie',
      UNPAID_LEAVE: 'Congé sans solde',
      MATERNITY_LEAVE: 'Congé maternité',
      PATERNITY_LEAVE: 'Congé paternité',
      OTHER: 'Autre'
    };
    return types[leaveType] || leaveType;
  };

  const getLeaveTypeColor = (leaveType) => {
    const colors = {
      PAID_LEAVE: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-600', icon: 'text-blue-600' },
      SICK_LEAVE: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-600', icon: 'text-red-600' },
      UNPAID_LEAVE: { bg: 'bg-yellow-50', border: 'border-yellow-500', text: 'text-yellow-600', icon: 'text-yellow-600' },
      MATERNITY_LEAVE: { bg: 'bg-pink-50', border: 'border-pink-500', text: 'text-pink-600', icon: 'text-pink-600' },
      PATERNITY_LEAVE: { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-600', icon: 'text-purple-600' },
      OTHER: { bg: 'bg-gray-50', border: 'border-gray-500', text: 'text-gray-600', icon: 'text-gray-600' }
    };
    return colors[leaveType] || colors.PAID_LEAVE;
  };

  const getMonthDays = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const getAttendanceForDay = (day) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return attendances.find(att => parseDate(att.date) === dateStr);
  };

  const isWeekend = (day) => {
    const date = new Date(selectedYear, selectedMonth, day);
    return date.getDay() === 0 || date.getDay() === 6;
  };

  const isFutureDate = (day) => {
    const date = new Date(selectedYear, selectedMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  const isOnLeave = (day) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return leaves.some(leave => {
      const leaveStart = parseDate(leave.startDate);
      const leaveEnd = parseDate(leave.endDate);
      return dateStr >= leaveStart && dateStr <= leaveEnd;
    });
  };

  const getLeaveForDay = (day) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return leaves.find(leave => {
      const leaveStart = parseDate(leave.startDate);
      const leaveEnd = parseDate(leave.endDate);
      return dateStr >= leaveStart && dateStr <= leaveEnd;
    });
  };

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Ma Présence</h1>
        <p className="text-gray-600">Historique de vos présences et absences</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Jours travaillés</p>
              <p className="text-3xl font-bold text-gray-800">{stats.presentDays}</p>
            </div>
            <Calendar className="h-10 w-10 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taux de présence</p>
              <p className="text-3xl font-bold text-gray-800">
                {stats.totalDays > 0 ? Math.round((stats.presentDays / stats.totalDays) * 100) : 0}%
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Jours de congés</p>
              <p className="text-3xl font-bold text-gray-800">{stats.leaveDays}</p>
            </div>
            <Umbrella className="h-10 w-10 text-orange-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Absences</p>
              <p className="text-3xl font-bold text-gray-800">{stats.absentDays}</p>
            </div>
            <XCircle className="h-10 w-10 text-red-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Heures moy./jour</p>
              <p className="text-3xl font-bold text-gray-800">{stats.averageHours}h</p>
            </div>
            <Clock className="h-10 w-10 text-purple-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Mois</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Année</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Calendrier */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Calendrier {months[selectedMonth]} {selectedYear}
        </h3>

        {/* Grille calendrier */}
        <div className="grid grid-cols-7 gap-2">
          {/* En-têtes jours */}
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
            <div key={day} className="text-center font-semibold text-gray-700 py-2 text-sm">
              {day}
            </div>
          ))}

          {/* Espaces vides pour aligner le premier jour */}
          {Array.from({ length: (new Date(selectedYear, selectedMonth, 1).getDay() + 6) % 7 }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square"></div>
          ))}

          {/* Jours du mois */}
          {getMonthDays().map(day => {
            const attendance = getAttendanceForDay(day);
            const leave = getLeaveForDay(day);
            const onLeave = isOnLeave(day);
            const weekend = isWeekend(day);
            const future = isFutureDate(day);
            
            // Priorité d'affichage : Congé > Statut attendance > Absent/Présent
            const status = attendance?.status;
            const present = status === 'PRESENT' || attendance?.checkInTime;
            const absent = status === 'ABSENT';
            const late = status === 'LATE';
            const halfDay = status === 'HALF_DAY';
            const remote = status === 'REMOTE';
            
            // Couleurs pour les types de congés
            const leaveColors = leave ? getLeaveTypeColor(leave.leaveType) : null;

            // Déterminer la couleur et l'icône
            let bgColor, borderColor, icon, iconColor, label;
            
            if (future) {
              bgColor = 'bg-gray-50';
              borderColor = 'border-gray-200';
              label = 'Date future';
            } else if (weekend) {
              bgColor = 'bg-gray-100';
              borderColor = 'border-gray-300';
              label = 'Week-end';
            } else if (onLeave && leaveColors) {
              bgColor = leaveColors.bg;
              borderColor = leaveColors.border;
              icon = <Umbrella className={`w-4 h-4 ${leaveColors.icon}`} />;
              label = getLeaveTypeName(leave.leaveType);
            } else if (remote) {
              bgColor = 'bg-purple-50';
              borderColor = 'border-purple-500';
              icon = <Calendar className="w-4 h-4 text-purple-600" />;
              label = 'Télétravail';
            } else if (halfDay) {
              bgColor = 'bg-blue-50';
              borderColor = 'border-blue-500';
              icon = <Clock className="w-4 h-4 text-blue-600" />;
              label = 'Demi-journée';
            } else if (late) {
              bgColor = 'bg-yellow-50';
              borderColor = 'border-yellow-500';
              icon = <AlertCircle className="w-4 h-4 text-yellow-600" />;
              label = 'En retard';
            } else if (present) {
              bgColor = 'bg-green-50';
              borderColor = 'border-green-500';
              icon = <CheckCircle className="w-4 h-4 text-green-600" />;
              label = `Présent - ${parseTime(attendance?.checkInTime || attendance?.checkIn)} à ${parseTime(attendance?.checkOutTime || attendance?.checkOut) || '...'}`;
            } else if (absent) {
              bgColor = 'bg-red-50';
              borderColor = 'border-red-500';
              icon = <XCircle className="w-4 h-4 text-red-600" />;
              label = 'Absent';
            } else {
              bgColor = 'bg-white';
              borderColor = 'border-gray-300';
              label = 'Pas de donnée';
            }

            return (
              <div
                key={day}
                className={`aspect-square border-2 rounded-lg flex flex-col items-center justify-center p-2 transition-all ${bgColor} ${borderColor} ${
                  !future && !weekend ? 'hover:shadow-md cursor-pointer' : future ? 'cursor-not-allowed' : ''
                }`}
                title={label}
              >
                <div className="font-semibold text-gray-800">{day}</div>
                {!future && !weekend && icon && (
                  <div className="mt-1">{icon}</div>
                )}
                {attendance && attendance.checkInTime && !onLeave && status !== 'REMOTE' && (
                  <div className="text-xs text-gray-600 mt-1">
                    {parseTime(attendance.checkInTime)?.substring(0, 5)}
                  </div>
                )}
                {onLeave && leaveColors && (
                  <div className={`text-xs mt-1 font-medium ${leaveColors.text}`}>
                    {leave.leaveType === 'SICK_LEAVE' ? '🤒' : 
                     leave.leaveType === 'MATERNITY_LEAVE' ? '👶' :
                     leave.leaveType === 'PATERNITY_LEAVE' ? '👨‍👶' : '🏖️'}
                  </div>
                )}
                {remote && (
                  <div className="text-xs text-purple-600 mt-1 font-medium">
                    💻
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Légende */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Légende des statuts :</h3>
        
        {/* Statuts de présence */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-600 mb-2 uppercase">Présence</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-50 border-2 border-green-500 rounded flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">Présent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-50 border-2 border-purple-500 rounded flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-sm text-gray-700">Télétravail</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-50 border-2 border-yellow-500 rounded flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
              </div>
              <span className="text-sm text-gray-700">Retard</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-50 border-2 border-blue-500 rounded flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm text-gray-700">Demi-journée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-50 border-2 border-red-500 rounded flex items-center justify-center flex-shrink-0">
                <XCircle className="w-4 h-4 text-red-600" />
              </div>
              <span className="text-sm text-gray-700">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 border-2 border-gray-300 rounded flex-shrink-0"></div>
              <span className="text-sm text-gray-700">Week-end</span>
            </div>
          </div>
        </div>

        {/* Types de congés */}
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2 uppercase">Types de congés</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-50 border-2 border-blue-500 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-sm">🏖️</span>
              </div>
              <span className="text-sm text-gray-700">Congés payés</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-50 border-2 border-red-500 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-sm">🤒</span>
              </div>
              <span className="text-sm text-gray-700">Maladie</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-50 border-2 border-yellow-500 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-sm">💼</span>
              </div>
              <span className="text-sm text-gray-700">Sans solde</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-pink-50 border-2 border-pink-500 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-sm">👶</span>
              </div>
              <span className="text-sm text-gray-700">Maternité</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-50 border-2 border-purple-500 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-sm">👨‍👶</span>
              </div>
              <span className="text-sm text-gray-700">Paternité</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-50 border-2 border-gray-500 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-sm">📋</span>
              </div>
              <span className="text-sm text-gray-700">Autre</span>
            </div>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">
              💡 Note
            </h3>
            <p className="text-sm text-blue-800">
              Pour pointer votre présence, rendez-vous sur le <strong>Dashboard</strong> et cliquez sur "Pointer l'arrivée" ou "Pointer le départ".
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;