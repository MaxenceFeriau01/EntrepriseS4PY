import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { Users, Mail, Phone, Briefcase, Building, Search } from 'lucide-react';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [searchTerm, employees]);

  const loadEmployees = async () => {
    try {
      const response = await apiService.getAllUsers();
      setEmployees(response.data);
      setFilteredEmployees(response.data);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    if (!searchTerm) {
      setFilteredEmployees(employees);
      return;
    }

    const filtered = employees.filter(
      (emp) =>
        emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  };

  const getRoleLabel = (role) => {
    const labels = {
      ADMIN: 'Administrateur',
      MANAGER: 'Manager',
      EMPLOYEE: 'Employé',
    };
    return labels[role] || role;
  };

  const getRoleBadge = (role) => {
    const badges = {
      ADMIN: 'bg-red-100 text-red-800',
      MANAGER: 'bg-blue-100 text-blue-800',
      EMPLOYEE: 'bg-gray-100 text-gray-800',
    };
    return badges[role] || badges.EMPLOYEE;
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employés</h1>
          <p className="text-gray-600 mt-1">{employees.length} employés au total</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={20} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un employé..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Aucun employé trouvé
          </div>
        ) : (
          filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {employee.firstName?.[0]}
                  {employee.lastName?.[0]}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">
                    {employee.firstName} {employee.lastName}
                  </h3>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(
                      employee.role
                    )}`}
                  >
                    {getRoleLabel(employee.role)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Briefcase size={16} className="flex-shrink-0" />
                  <span className="truncate">{employee.position}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Building size={16} className="flex-shrink-0" />
                  <span className="truncate">{employee.department}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail size={16} className="flex-shrink-0" />
                  <span className="truncate">{employee.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone size={16} className="flex-shrink-0" />
                  <span className="truncate">{employee.phone}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Jours de congés :</span>
                  <span className="font-semibold text-gray-900">{employee.vacationDays}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Statut :</span>
                  <span
                    className={`font-semibold ${
                      employee.active ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {employee.active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Employees;