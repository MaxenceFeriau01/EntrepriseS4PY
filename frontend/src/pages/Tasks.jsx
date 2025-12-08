import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import { Plus, CheckSquare, Clock, AlertCircle, X, AlertTriangle, Zap, TrendingUp, Eye } from 'lucide-react';

const Tasks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [assignedToFilter, setAssignedToFilter] = useState('ALL'); // Nouveau filtre
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedToId: '',
    priority: 'MEDIUM',
    dueDate: '',
  });

  const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  useEffect(() => {
    loadTasks();
    if (isAdminOrManager) {
      loadUsers();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      const response = isAdminOrManager 
        ? await apiService.getAllTasks()
        : await apiService.getTasks(user.id);
      setTasks(response.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await apiService.getActiveUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await apiService.updateTaskStatus(taskId, newStatus);
      loadTasks();
    } catch (error) {
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.createTask(formData, user.id);
      alert('Tâche créée avec succès !');
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        assignedToId: '',
        priority: 'MEDIUM',
        dueDate: '',
      });
      loadTasks();
    } catch (error) {
      alert('Erreur lors de la création de la tâche');
    }
  };

  // Ordre de priorité
  const priorityOrder = {
    'URGENT': 1,
    'HIGH': 2,
    'MEDIUM': 3,
    'LOW': 4
  };

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: 'bg-gray-100 text-gray-800 border-gray-300',
      MEDIUM: 'bg-blue-100 text-blue-800 border-blue-300',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
      URGENT: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[priority] || colors.MEDIUM;
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      LOW: <TrendingUp className="w-4 h-4" />,
      MEDIUM: <AlertCircle className="w-4 h-4" />,
      HIGH: <AlertTriangle className="w-4 h-4" />,
      URGENT: <Zap className="w-4 h-4" />,
    };
    return icons[priority] || icons.MEDIUM;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      LOW: 'Faible',
      MEDIUM: 'Moyenne',
      HIGH: 'Élevée',
      URGENT: 'Urgente',
    };
    return labels[priority] || priority;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckSquare className="text-green-500" size={20} />;
      case 'IN_PROGRESS':
        return <Clock className="text-blue-500" size={20} />;
      case 'TODO':
        return <AlertCircle className="text-gray-500" size={20} />;
      case 'CANCELLED':
        return <X className="text-red-500" size={20} />;
      default:
        return <AlertCircle className="text-gray-500" size={20} />;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      TODO: 'À faire',
      IN_PROGRESS: 'En cours',
      COMPLETED: 'Terminée',
      CANCELLED: 'Annulée',
    };
    return labels[status] || status;
  };

  // Filtrer et trier les tâches
  const filteredAndSortedTasks = tasks
    .filter((task) => {
      // Filtre par statut
      const statusMatch = filter === 'ALL' || task.status === filter;
      
      // Filtre par personne assignée (admin uniquement)
      const assignedMatch = assignedToFilter === 'ALL' || task.assignedToId === parseInt(assignedToFilter);
      
      return statusMatch && assignedMatch;
    })
    .sort((a, b) => {
      // Tri par priorité d'abord (URGENT > HIGH > MEDIUM > LOW)
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Si même priorité, tri par date d'échéance
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      
      // Sinon tri par date de création (plus récent en premier)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  // Statistiques par priorité
  const stats = {
    urgent: tasks.filter(t => t.priority === 'URGENT' && t.status !== 'COMPLETED').length,
    high: tasks.filter(t => t.priority === 'HIGH' && t.status !== 'COMPLETED').length,
    medium: tasks.filter(t => t.priority === 'MEDIUM' && t.status !== 'COMPLETED').length,
    low: tasks.filter(t => t.priority === 'LOW' && t.status !== 'COMPLETED').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tâches</h1>
          <p className="text-sm text-gray-600 mt-1">Gestion et suivi des tâches</p>
        </div>
        {isAdminOrManager && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus size={20} />
            <span>Créer une tâche</span>
          </button>
        )}
      </div>

      {/* Statistiques par priorité */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold">Urgentes</p>
              <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
            </div>
            <Zap className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold">Élevées</p>
              <p className="text-2xl font-bold text-orange-600">{stats.high}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold">Moyennes</p>
              <p className="text-2xl font-bold text-blue-600">{stats.medium}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold">Faibles</p>
              <p className="text-2xl font-bold text-gray-600">{stats.low}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-gray-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold">Terminées</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckSquare className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4">
        {/* Filtres par statut */}
        <div className="flex space-x-2 overflow-x-auto mb-4">
          {['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'ALL' && `Toutes (${tasks.length})`}
              {status === 'TODO' && `À faire (${tasks.filter(t => t.status === 'TODO').length})`}
              {status === 'IN_PROGRESS' && `En cours (${tasks.filter(t => t.status === 'IN_PROGRESS').length})`}
              {status === 'COMPLETED' && `Terminées (${tasks.filter(t => t.status === 'COMPLETED').length})`}
              {status === 'CANCELLED' && `Annulées (${tasks.filter(t => t.status === 'CANCELLED').length})`}
            </button>
          ))}
        </div>

        {/* Filtre par personne (Admin/Manager uniquement) */}
        {isAdminOrManager && (
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Assigné à :
            </label>
            <select
              value={assignedToFilter}
              onChange={(e) => setAssignedToFilter(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="ALL">Tous les employés ({tasks.length} tâches)</option>
              {users.map((u) => {
                const userTaskCount = tasks.filter(t => t.assignedToId === u.id).length;
                return (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName} ({userTaskCount} tâche{userTaskCount > 1 ? 's' : ''})
                  </option>
                );
              })}
            </select>
            
            {(filter !== 'ALL' || assignedToFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setFilter('ALL');
                  setAssignedToFilter('ALL');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium whitespace-nowrap"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredAndSortedTasks.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucune tâche pour ces filtres</p>
            {(filter !== 'ALL' || assignedToFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setFilter('ALL');
                  setAssignedToFilter('ALL');
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Compteur de résultats */}
            {(filter !== 'ALL' || assignedToFilter !== 'ALL') && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <p className="text-sm text-blue-800">
                  <span className="font-bold">{filteredAndSortedTasks.length}</span> tâche(s) trouvée(s) 
                  {assignedToFilter !== 'ALL' && ` pour ${users.find(u => u.id === parseInt(assignedToFilter))?.firstName} ${users.find(u => u.id === parseInt(assignedToFilter))?.lastName}`}
                  {filter !== 'ALL' && ` avec le statut "${getStatusLabel(filter)}"`}
                </p>
              </div>
            )}
            
            {filteredAndSortedTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-all p-5 border-l-4"
              style={{
                borderLeftColor: 
                  task.priority === 'URGENT' ? '#ef4444' :
                  task.priority === 'HIGH' ? '#f97316' :
                  task.priority === 'MEDIUM' ? '#3b82f6' : '#6b7280'
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="mt-1">
                    {getStatusIcon(task.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Titre et priorité */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-lg">{task.title}</h3>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {getPriorityIcon(task.priority)}
                        {getPriorityLabel(task.priority)}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>

                    {/* Infos */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">Assignée à:</span>
                        <span>{task.assignedToName || 'Non assignée'}</span>
                      </div>
                      {isAdminOrManager && (
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">Créée par:</span>
                          <span>{task.createdByName || 'Inconnu'}</span>
                        </div>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className="font-semibold">Échéance:</span>
                          <span className={
                            new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'
                              ? 'text-red-600 font-bold'
                              : ''
                          }>
                            {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions à droite */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Bouton Voir détails */}
                  <button
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    title="Voir les détails de la tâche"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Détails</span>
                  </button>

                  {/* Dropdown statut */}
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="TODO">À faire</option>
                    <option value="IN_PROGRESS">En cours</option>
                    <option value="COMPLETED">Terminée</option>
                    <option value="CANCELLED">Annulée</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
          </>
        )}
      </div>

      {/* Modal Create Task */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Créer une tâche</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Ex: Développer la nouvelle fonctionnalité"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows="4"
                  placeholder="Décrivez la tâche en détail..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigner à <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.assignedToId}
                    onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un employé</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} ({u.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LOW">🟢 Faible</option>
                    <option value="MEDIUM">🔵 Moyenne</option>
                    <option value="HIGH">🟠 Élevée</option>
                    <option value="URGENT">🔴 Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'échéance
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
                >
                  Créer la tâche
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;