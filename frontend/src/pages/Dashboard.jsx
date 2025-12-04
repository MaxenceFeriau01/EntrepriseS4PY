import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import { Calendar, Umbrella, CheckSquare, Mail, Clock, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todayAttendance: null,
    pendingLeaves: 0,
    activeTasks: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const [tasks, messages, leaves] = await Promise.all([
        apiService.getTasks(user.id),
        apiService.getUnreadCount(user.id),
        apiService.getLeaveRequests(user.id),
      ]);

      const activeTasks = tasks.data.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length;
      const pendingLeaves = leaves.data.filter(l => l.status === 'PENDING').length;

      setStats({
        activeTasks,
        unreadMessages: messages.data.count,
        pendingLeaves,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await apiService.checkIn(user.id);
      alert('Pointage effectué avec succès !');
      loadDashboardData();
    } catch (error) {
      alert('Erreur lors du pointage');
    }
  };

  const handleCheckOut = async () => {
    try {
      await apiService.checkOut(user.id);
      alert('Départ enregistré avec succès !');
      loadDashboardData();
    } catch (error) {
      alert('Erreur lors du départ');
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, bgColor }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${bgColor} p-3 rounded-lg`}>
          <Icon className={color} size={24} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Bonjour, {user.firstName} ! 👋
        </h1>
        <p className="text-primary-100">
          Bienvenue sur votre tableau de bord
        </p>
        <div className="mt-4 flex items-center space-x-2 text-sm">
          <Clock size={16} />
          <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleCheckIn}
            className="flex items-center justify-center space-x-2 bg-green-50 text-green-700 py-4 rounded-lg font-medium hover:bg-green-100 transition-colors border border-green-200"
          >
            <Calendar size={20} />
            <span>Pointer l'arrivée</span>
          </button>
          <button
            onClick={handleCheckOut}
            className="flex items-center justify-center space-x-2 bg-red-50 text-red-700 py-4 rounded-lg font-medium hover:bg-red-100 transition-colors border border-red-200"
          >
            <Calendar size={20} />
            <span>Pointer le départ</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={CheckSquare}
          title="Tâches actives"
          value={stats.activeTasks}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={Mail}
          title="Messages non lus"
          value={stats.unreadMessages}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <StatCard
          icon={Umbrella}
          title="Congés en attente"
          value={stats.pendingLeaves}
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
        <StatCard
          icon={TrendingUp}
          title="Jours de congés"
          value={user.vacationDays}
          color="text-green-600"
          bgColor="bg-green-50"
        />
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h2>
        <div className="text-center py-8 text-gray-500">
          <p>Aucune activité récente</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;