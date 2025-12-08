import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import { parseDate, parseTime, getCheckOutTime, getCheckInTime } from '../utils/formatters';
import { 
  Calendar, 
  Umbrella, 
  CheckSquare, 
  Mail, 
  Clock, 
  TrendingUp, 
  Users, 
  CalendarCheck, 
  AlertCircle,
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  FileText,
  UserCheck,
  LogIn,
  LogOut
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todayAttendance: null,
    pendingLeaves: 0,
    approvedLeaves: 0,
    activeTasks: 0,
    unreadMessages: 0,
    totalEmployees: 0,
    urgentTasks: 0,
    todayLeaves: 0,
  });
  const [recentActivity, setRecentActivity] = useState({
    upcomingTasks: [],
    pendingLeaveRequests: [],
    recentMessages: [],
    todayAttendance: null,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      if (isAdminOrManager) {
        // Admin/Manager : toutes les données
        const [tasks, pendingLeaves, allUsers, allLeaves, myAttendances] = await Promise.all([
          apiService.getAllTasks(),
          apiService.getPendingLeaveRequests(),
          apiService.getAllUsers(),
          apiService.getAllLeaveRequests(),
          apiService.getUserAttendances(user.id), // Ses propres présences
        ]);

        const activeTasks = tasks.data.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length;
        const urgentTasks = tasks.data.filter(t => 
          (t.status === 'TODO' || t.status === 'IN_PROGRESS') && 
          (t.priority === 'URGENT' || t.priority === 'HIGH')
        ).length;
        const activeEmployees = allUsers.data.filter(u => u.active).length;
        const approvedLeaves = allLeaves.data.filter(l => l.status === 'APPROVED').length;
        
        // Congés aujourd'hui
        const today = new Date().toISOString().split('T')[0];
        const todayLeaves = allLeaves.data.filter(l => {
          if (l.status !== 'APPROVED') return false;
          const startDate = parseDate(l.startDate);
          const endDate = parseDate(l.endDate);
          return startDate <= today && endDate >= today;
        }).length;

        // Sa propre présence aujourd'hui
        const todayAttendance = myAttendances.data.find(att => {
          const attDate = parseDate(att.date);
          return attDate === today;
        });

        console.log('📊 Données présence ADMIN:', {
          today,
          myAttendances: myAttendances.data,
          todayAttendance
        });

        console.log('✅ État du pointage ADMIN:', {
          hasCheckedIn: !!todayAttendance,
          hasCheckedOut: !!getCheckOutTime(todayAttendance),
          checkIn: todayAttendance?.checkInTime || todayAttendance?.checkIn,
          checkOut: getCheckOutTime(todayAttendance)
        });

        // Tâches avec échéance proche (7 jours)
        const upcomingTasks = tasks.data
          .filter(t => {
            if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
            if (!t.dueDate) return false;
            const dueDate = new Date(t.dueDate);
            const now = new Date();
            const diffDays = (dueDate - now) / (1000 * 60 * 60 * 24);
            return diffDays >= 0 && diffDays <= 7;
          })
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
          .slice(0, 5);

        setStats({
          activeTasks,
          urgentTasks,
          pendingLeaves: pendingLeaves.data.length,
          approvedLeaves,
          totalEmployees: activeEmployees,
          todayLeaves,
        });

        setRecentActivity({
          upcomingTasks,
          pendingLeaveRequests: pendingLeaves.data.slice(0, 5),
          todayAttendance, // Ajouter sa présence
        });
      } else {
        // Employé : uniquement ses données
        const [tasks, messages, leaves, attendances] = await Promise.all([
          apiService.getTasks(user.id),
          apiService.getUnreadCount(user.id),
          apiService.getLeaveRequests(user.id),
          apiService.getUserAttendances(user.id), // ← Utiliser getUserAttendances au lieu de getAttendances
        ]);

        const activeTasks = tasks.data.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length;
        const urgentTasks = tasks.data.filter(t => 
          (t.status === 'TODO' || t.status === 'IN_PROGRESS') && 
          (t.priority === 'URGENT' || t.priority === 'HIGH')
        ).length;
        const pendingLeaves = leaves.data.filter(l => l.status === 'PENDING').length;
        const approvedLeaves = leaves.data.filter(l => l.status === 'APPROVED').length;

        // Vérifier si présence pointée aujourd'hui
        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = attendances.data.find(att => {
          const attDate = parseDate(att.date);
          return attDate === today;
        });

        console.log('📊 Données présence:', {
          today,
          allAttendances: attendances.data,
          todayAttendance,
          firstAttendance: attendances.data[0],
          dateComparison: attendances.data.map(att => ({
            rawDate: att.date,
            parsedDate: parseDate(att.date),
            isToday: parseDate(att.date) === today
          }))
        });

        console.log('✅ État du pointage:', {
          hasCheckedIn: !!todayAttendance,
          hasCheckedOut: !!getCheckOutTime(todayAttendance),
          checkIn: todayAttendance?.checkInTime || todayAttendance?.checkIn,
          checkOut: getCheckOutTime(todayAttendance)
        });

        // Tâches avec échéance proche
        const upcomingTasks = tasks.data
          .filter(t => {
            if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
            if (!t.dueDate) return false;
            const dueDate = new Date(t.dueDate);
            const now = new Date();
            const diffDays = (dueDate - now) / (1000 * 60 * 60 * 24);
            return diffDays >= 0 && diffDays <= 7;
          })
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
          .slice(0, 5);

        setStats({
          activeTasks,
          urgentTasks,
          unreadMessages: messages.data?.count || 0,
          pendingLeaves: pendingLeaves || 0,
          approvedLeaves: approvedLeaves || 0,
        });

        setRecentActivity({
          upcomingTasks,
          todayAttendance,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (recentActivity.todayAttendance) {
      alert('Vous avez déjà pointé votre arrivée aujourd\'hui !');
      return;
    }

    if (!window.confirm('Confirmer votre arrivée ?')) return;

    try {
      setActionLoading(true);
      await apiService.checkIn(user.id);
      
      // Attendre un peu pour laisser la DB se mettre à jour
      setTimeout(async () => {
        await loadDashboardData();
        alert('✅ Arrivée enregistrée avec succès !');
      }, 500);
    } catch (error) {
      console.error('Erreur pointage:', error);
      alert('❌ Erreur lors du pointage de l\'arrivée');
    } finally {
      setTimeout(() => setActionLoading(false), 600);
    }
  };

  const handleCheckOut = async () => {
    if (!recentActivity.todayAttendance) {
      alert('Vous devez d\'abord pointer votre arrivée !');
      return;
    }

    if (getCheckOutTime(recentActivity.todayAttendance)) {
      alert('Vous avez déjà pointé votre départ aujourd\'hui !');
      return;
    }

    if (!window.confirm('⚠️ ATTENTION : Pointer votre départ signifie que vous terminez votre journée de travail.\n\nÊtes-vous sûr(e) de vouloir quitter ?')) return;

    try {
      setActionLoading(true);
      await apiService.checkOut(user.id);
      
      // Attendre un peu pour laisser la DB se mettre à jour
      setTimeout(async () => {
        await loadDashboardData();
        alert('✅ Départ enregistré avec succès ! Bonne fin de journée !');
      }, 500);
    } catch (error) {
      console.error('Erreur départ:', error);
      alert('❌ Erreur lors du pointage du départ');
    } finally {
      setTimeout(() => setActionLoading(false), 600);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, bgColor, subtitle }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`${bgColor} p-3 rounded-lg`}>
          <Icon className={color} size={24} />
        </div>
      </div>
    </div>
  );

  const getDaysUntilDue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Demain";
    return `Dans ${diffDays} jours`;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      URGENT: 'text-red-600 bg-red-50',
      HIGH: 'text-orange-600 bg-orange-50',
      MEDIUM: 'text-blue-600 bg-blue-50',
      LOW: 'text-gray-600 bg-gray-50',
    };
    return colors[priority] || colors.MEDIUM;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const todayAttendance = recentActivity.todayAttendance;
  const hasCheckedIn = !!todayAttendance;
  const hasCheckedOut = !!getCheckOutTime(todayAttendance);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Bonjour, {user.firstName} ! 👋
        </h1>
        <p className="text-blue-100">
          {isAdminOrManager ? 'Vue d\'ensemble de l\'entreprise' : 'Bienvenue sur votre tableau de bord'}
        </p>
        <div className="mt-4 flex items-center space-x-2 text-sm">
          <Clock size={16} />
          <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Quick Actions - Pointage (pour tous) */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Pointage du jour
        </h2>
        
        {/* Statut actuel */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Statut aujourd'hui :</p>
              {!hasCheckedIn && (
                <span className="inline-flex items-center gap-2 text-orange-700 bg-orange-100 px-3 py-1 rounded-full text-sm font-medium">
                  <AlertCircle size={16} />
                  Pas encore pointé
                </span>
              )}
              {hasCheckedIn && !hasCheckedOut && (
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-2 text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm font-medium">
                    <CheckCircle size={16} />
                    Arrivée enregistrée
                  </span>
                  <p className="text-sm text-gray-600">
                    🕐 Arrivée : {parseTime(todayAttendance.checkInTime || todayAttendance.checkIn)}
                  </p>
                </div>
              )}
              {hasCheckedIn && hasCheckedOut && (
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-2 text-blue-700 bg-blue-100 px-3 py-1 rounded-full text-sm font-medium">
                    <CheckCircle size={16} />
                    Journée terminée
                  </span>
                  <p className="text-sm text-gray-600">
                    🕐 Arrivée : {parseTime(todayAttendance.checkInTime || todayAttendance.checkIn)} | 
                    Départ : {parseTime(getCheckOutTime(todayAttendance))}
                  </p>
                </div>
              )}
            </div>
            <Clock className="w-12 h-12 text-gray-300" />
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleCheckIn}
            disabled={actionLoading || hasCheckedIn}
            className={`flex items-center justify-center space-x-2 py-4 rounded-lg font-medium transition-all duration-200 border-2 ${
              hasCheckedIn
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:scale-105'
            }`}
          >
            <LogIn size={20} />
            <span>{hasCheckedIn ? '✓ Arrivée pointée' : 'Pointer l\'arrivée'}</span>
          </button>
          
          <button
            onClick={handleCheckOut}
            disabled={actionLoading || !hasCheckedIn || hasCheckedOut}
            className={`flex items-center justify-center space-x-2 py-4 rounded-lg font-medium transition-all duration-200 border-2 ${
              !hasCheckedIn || hasCheckedOut
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:scale-105'
            }`}
          >
            <LogOut size={20} />
            <span>
              {hasCheckedOut ? '✓ Départ pointé' : 
               !hasCheckedIn ? 'Pointer d\'abord l\'arrivée' : 
               'Pointer le départ'}
            </span>
          </button>
        </div>

        {/* Avertissement départ */}
        {hasCheckedIn && !hasCheckedOut && (
          <div className="mt-4 p-3 bg-orange-50 border-l-4 border-orange-400 rounded">
            <p className="text-xs text-orange-800 flex items-start gap-2">
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
              <span>
                <strong>Important :</strong> Le pointage du départ marque la fin de votre journée de travail. 
                Vous ne pourrez plus pointer après cela aujourd'hui.
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      {isAdminOrManager ? (
        // Stats Admin/Manager
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            title="Employés actifs"
            value={stats.totalEmployees || 0}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            icon={AlertTriangle}
            title="Tâches urgentes"
            value={stats.urgentTasks || 0}
            color="text-orange-600"
            bgColor="bg-orange-50"
            subtitle="Haute priorité"
          />
          <StatCard
            icon={AlertCircle}
            title="Congés en attente"
            value={stats.pendingLeaves || 0}
            color="text-orange-600"
            bgColor="bg-orange-50"
            subtitle="À valider"
          />
          <StatCard
            icon={Umbrella}
            title="En congés aujourd'hui"
            value={stats.todayLeaves || 0}
            color="text-purple-600"
            bgColor="bg-purple-50"
            subtitle="Absences du jour"
          />
        </div>
      ) : (
        // Stats Employé
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={CheckSquare}
            title="Tâches actives"
            value={stats.activeTasks || 0}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            icon={AlertTriangle}
            title="Tâches urgentes"
            value={stats.urgentTasks || 0}
            color="text-orange-600"
            bgColor="bg-orange-50"
          />
          <StatCard
            icon={Mail}
            title="Messages non lus"
            value={stats.unreadMessages || 0}
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
          <StatCard
            icon={Umbrella}
            title="Congés approuvés"
            value={stats.approvedLeaves || 0}
            color="text-green-600"
            bgColor="bg-green-50"
          />
        </div>
      )}

      {/* Activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne gauche */}
        <div className="space-y-6">
          {/* Rappel présence (Employé uniquement) */}
          {!isAdminOrManager && !hasCheckedIn && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-1">
                    📋 Rappel : Pointage non effectué
                  </h3>
                  <p className="text-sm text-yellow-800">
                    N'oubliez pas de pointer votre arrivée aujourd'hui ! Cliquez sur "Pointer l'arrivée" ci-dessus.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Présence pointée (Employé uniquement) */}
          {!isAdminOrManager && hasCheckedIn && !hasCheckedOut && (
            <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">
                    ✅ Présence enregistrée
                  </h3>
                  <p className="text-sm text-green-800">
                    Votre arrivée a été enregistrée à {parseTime(todayAttendance?.checkInTime || todayAttendance?.checkIn)}. 
                    Pensez à pointer votre départ en fin de journée.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Journée terminée */}
          {!isAdminOrManager && hasCheckedOut && (
            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">
                    🎉 Journée terminée
                  </h3>
                  <p className="text-sm text-blue-800">
                    Votre journée de travail est enregistrée. À demain !
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tâches avec échéance proche */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Tâches avec échéance proche
              </h3>
              <p className="text-xs text-gray-600 mt-1">Prochains 7 jours</p>
            </div>
            <div className="divide-y divide-gray-100">
              {recentActivity.upcomingTasks.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Aucune tâche avec échéance proche</p>
                </div>
              ) : (
                recentActivity.upcomingTasks.map(task => (
                  <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className="text-xs text-gray-500">
                            📅 {getDaysUntilDue(task.dueDate)}
                          </span>
                        </div>
                      </div>
                      {task.dueDate && new Date(task.dueDate) < new Date(Date.now() + 24 * 60 * 60 * 1000) && (
                        <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Colonne droite */}
        <div className="space-y-6">
          {/* Demandes de congés (Admin/Manager uniquement) */}
          {isAdminOrManager && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Congés à valider
                </h3>
                <p className="text-xs text-gray-600 mt-1">Demandes en attente</p>
              </div>
              <div className="divide-y divide-gray-100">
                {recentActivity.pendingLeaveRequests?.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Aucune demande en attente</p>
                  </div>
                ) : (
                  recentActivity.pendingLeaveRequests?.map(leave => (
                    <div key={leave.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm mb-1">
                            {leave.userName}
                          </h4>
                          <p className="text-xs text-gray-600 mb-2">
                            Du {new Date(leave.startDate).toLocaleDateString('fr-FR')} au {new Date(leave.endDate).toLocaleDateString('fr-FR')}
                          </p>
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                            En attente
                          </span>
                        </div>
                        <Umbrella className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Info congés restants (Employé uniquement) */}
          {!isAdminOrManager && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6">
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-full p-4">
                  <Umbrella className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Solde de congés
                  </h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {user.vacationDays || 25} jours
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {stats.pendingLeaves > 0 ? `${stats.pendingLeaves} demande(s) en attente` : 'Aucune demande en attente'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Conseils */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm border border-purple-200 p-6">
            <div className="flex items-start gap-3">
              <div className="bg-white rounded-full p-2">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  💡 Le saviez-vous ?
                </h3>
                {isAdminOrManager ? (
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">•</span>
                      <span>Validez régulièrement les demandes de congés pour maintenir la motivation des équipes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">•</span>
                      <span>Vérifiez le planning des présences pour anticiper les absences</span>
                    </li>
                  </ul>
                ) : (
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">•</span>
                      <span>Pensez à pointer votre arrivée ET votre départ chaque jour</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">•</span>
                      <span>Le pointage du départ marque la fin de votre journée</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">•</span>
                      <span>Vous ne pouvez pointer qu'une seule fois par jour</span>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;