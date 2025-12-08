import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axios';
import { Calendar, Users, Search, Filter, TrendingUp, Clock } from 'lucide-react';

const LeavesPlanning = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [searchTerm, selectedDepartment, employees]);

  const fetchData = async () => {
    try {
      // Récupérer les employés
      const employeesResponse = await axiosInstance.get('/users');
      setEmployees(employeesResponse.data);
      setFilteredEmployees(employeesResponse.data);

      // Récupérer tous les congés approuvés
      const leavesResponse = await axiosInstance.get('/leave-requests');
      setLeaves(leavesResponse.data.filter(l => l.status === 'APPROVED'));
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = employees;

    // Filtrer par recherche
    if (searchTerm) {
      filtered = filtered.filter(emp =>
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrer par département
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(emp => emp.department === selectedDepartment);
    }

    setFilteredEmployees(filtered);
  };

  const getDepartments = () => {
    const depts = [...new Set(employees.map(emp => emp.department))];
    return depts.sort();
  };

  const getEmployeeLeaves = (employeeId) => {
    return leaves.filter(leave => leave.userId === employeeId && leave.status === 'APPROVED');
  };

  const isOnLeaveToday = (employeeId) => {
    const today = new Date().toISOString().split('T')[0];
    return leaves.some(leave => 
      leave.userId === employeeId &&
      leave.status === 'APPROVED' &&
      leave.startDate <= today &&
      leave.endDate >= today
    );
  };

  const getOnLeaveToday = () => {
    // Utiliser TOUS les employés actifs, pas seulement les filtrés
    return employees.filter(emp => emp.active && isOnLeaveToday(emp.id));
  };

  const getLeavesThisMonth = () => {
    const startOfMonth = new Date(selectedYear, selectedMonth, 1);
    const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0);
    const startStr = startOfMonth.toISOString().split('T')[0];
    const endStr = endOfMonth.toISOString().split('T')[0];
    
    return leaves.filter(leave => {
      // Un congé est dans ce mois si il chevauche le mois
      return leave.startDate <= endStr && leave.endDate >= startStr;
    });
  };

  const getMonthDays = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const isEmployeeOnLeaveThisDay = (employeeId, day) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return leaves.some(leave =>
      leave.userId === employeeId &&
      leave.status === 'APPROVED' &&
      leave.startDate <= dateStr &&
      leave.endDate >= dateStr
    );
  };

  const getLeaveTypeColor = (leave) => {
    const colors = {
      PAID_LEAVE: 'bg-blue-500',
      SICK_LEAVE: 'bg-red-500',
      UNPAID_LEAVE: 'bg-yellow-500',
      MATERNITY_LEAVE: 'bg-pink-500',
      PATERNITY_LEAVE: 'bg-purple-500',
      OTHER: 'bg-gray-500'
    };
    return colors[leave.leaveType] || 'bg-gray-500';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short'
    });
  };

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Planning des Congés</h1>
        <p className="text-gray-600">Vue d'ensemble des absences et congés de l'équipe</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Employés actifs</p>
              <p className="text-2xl font-bold text-gray-800">{employees.filter(e => e.active).length}</p>
            </div>
            <Users className="h-10 w-10 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Présents aujourd'hui</p>
              <p className="text-2xl font-bold text-gray-800">
                {employees.filter(e => e.active).length - getOnLeaveToday().length}
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En congés aujourd'hui</p>
              <p className="text-2xl font-bold text-gray-800">{getOnLeaveToday().length}</p>
            </div>
            <Calendar className="h-10 w-10 text-orange-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Congés ce mois</p>
              <p className="text-2xl font-bold text-gray-800">{getLeavesThisMonth().length}</p>
            </div>
            <Clock className="h-10 w-10 text-purple-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un employé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtre département */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">Tous les départements</option>
              {getDepartments().map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Sélection mois */}
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Liste des employés en congés aujourd'hui */}
      {getOnLeaveToday().length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-orange-800 mb-3">
            🏖️ En congés aujourd'hui ({getOnLeaveToday().length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {getOnLeaveToday().map(emp => (
              <div key={emp.id} className="bg-white rounded-lg p-3 shadow-sm">
                <p className="font-medium text-gray-800">
                  {emp.firstName} {emp.lastName}
                </p>
                <p className="text-sm text-gray-600">{emp.position}</p>
                <p className="text-xs text-gray-500">{emp.department}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Planning mensuel */}
      <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Planning {months[selectedMonth]} {selectedYear}
        </h3>

        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white z-10 border border-gray-200 p-3 text-left font-semibold text-gray-700 min-w-[200px]">
                Employé
              </th>
              {getMonthDays().map(day => (
                <th key={day} className="border border-gray-200 p-2 text-center text-xs font-medium text-gray-600 min-w-[40px]">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(employee => (
              <tr key={employee.id} className="hover:bg-gray-50">
                <td className="sticky left-0 bg-white z-10 border border-gray-200 p-3">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      {employee.firstName} {employee.lastName}
                    </p>
                    <p className="text-xs text-gray-600">{employee.department}</p>
                  </div>
                </td>
                {getMonthDays().map(day => {
                  const onLeave = isEmployeeOnLeaveThisDay(employee.id, day);
                  const leave = leaves.find(l =>
                    l.userId === employee.id &&
                    l.status === 'APPROVED' &&
                    l.startDate <= `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` &&
                    l.endDate >= `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  );

                  return (
                    <td key={day} className="border border-gray-200 p-1">
                      {onLeave ? (
                        <div
                          className={`h-8 rounded ${getLeaveTypeColor(leave)} opacity-70`}
                          title={`${employee.firstName} - ${leave.leaveType}`}
                        />
                      ) : (
                        <div className="h-8" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredEmployees.length === 0 && (
          <p className="text-center py-8 text-gray-500">Aucun employé trouvé</p>
        )}
      </div>

      {/* Légende */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Légende</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-700">Congés payés</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-700">Congé maladie</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-700">Congé sans solde</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-pink-500 rounded"></div>
            <span className="text-sm text-gray-700">Congé maternité</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-500 rounded"></div>
            <span className="text-sm text-gray-700">Congé paternité</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-500 rounded"></div>
            <span className="text-sm text-gray-700">Autre</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeavesPlanning;