import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Edit,
  Trash2,
  Flag
} from 'lucide-react';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const statusColors = {
    TODO: 'bg-gray-100 text-gray-800 border-gray-300',
    IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-300',
    DONE: 'bg-green-100 text-green-800 border-green-300',
    CANCELLED: 'bg-red-100 text-red-800 border-red-300'
  };

  const statusLabels = {
    TODO: 'À faire',
    IN_PROGRESS: 'En cours',
    DONE: 'Terminé',
    CANCELLED: 'Annulé'
  };

  const priorityColors = {
    LOW: 'text-gray-600',
    MEDIUM: 'text-blue-600',
    HIGH: 'text-orange-600',
    URGENT: 'text-red-600'
  };

  const priorityLabels = {
    LOW: 'Basse',
    MEDIUM: 'Moyenne',
    HIGH: 'Haute',
    URGENT: 'Urgente'
  };

  useEffect(() => {
    fetchTaskDetail();
  }, [id]);

  const fetchTaskDetail = async () => {
    try {
      // Récupérer toutes les tâches et trouver celle qui correspond
      const response = user.role === 'ADMIN' || user.role === 'MANAGER'
        ? await apiService.getAllTasks()
        : await apiService.getTasks(user.id);
      
      const foundTask = response.data.find(t => t.id === parseInt(id));
      
      if (!foundTask) {
        setError('Tâche non trouvée');
        return;
      }

      setTask(foundTask);
      setEditForm({
        title: foundTask.title,
        description: foundTask.description,
        priority: foundTask.priority,
        status: foundTask.status,
        dueDate: foundTask.dueDate ? foundTask.dueDate.split('T')[0] : ''
      });
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement de la tâche');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await apiService.updateTaskStatus(task.id, newStatus);
      await fetchTaskDetail();
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await apiService.updateTask(task.id, {
        ...editForm,
        assignedToId: task.assignedToId
      });
      setIsEditing(false);
      await fetchTaskDetail();
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      return;
    }

    try {
      await apiService.deleteTask(task.id);
      navigate('/tasks');
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error || 'Tâche non trouvée'}
        </div>
        <button
          onClick={() => navigate('/tasks')}
          className="mt-4 text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux tâches
        </button>
      </div>
    );
  }

  const daysUntilDue = getDaysUntilDue(task.dueDate);
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0 && task.status !== 'DONE';
  const canEdit = user.role === 'ADMIN' || user.role === 'MANAGER' || task.assignedToId === user.id;
  const canDelete = user.role === 'ADMIN' || user.role === 'MANAGER';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Bouton retour */}
      <button
        onClick={() => navigate('/tasks')}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        Retour aux tâches
      </button>

      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="text-2xl font-bold text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
            )}
            
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {/* Statut */}
              {isEditing ? (
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="px-3 py-1 border rounded-lg text-sm"
                >
                  <option value="TODO">À faire</option>
                  <option value="IN_PROGRESS">En cours</option>
                  <option value="DONE">Terminé</option>
                  <option value="CANCELLED">Annulé</option>
                </select>
              ) : (
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[task.status]}`}>
                  {statusLabels[task.status]}
                </span>
              )}

              {/* Priorité */}
              <div className="flex items-center gap-2">
                <Flag className={`h-5 w-5 ${priorityColors[task.priority]}`} />
                {isEditing ? (
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                    className="px-3 py-1 border rounded-lg text-sm"
                  >
                    <option value="LOW">Basse</option>
                    <option value="MEDIUM">Moyenne</option>
                    <option value="HIGH">Haute</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                ) : (
                  <span className={`text-sm font-medium ${priorityColors[task.priority]}`}>
                    Priorité {priorityLabels[task.priority]}
                  </span>
                )}
              </div>

              {/* Alerte retard */}
              {isOverdue && (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-700">
                    En retard de {Math.abs(daysUntilDue)} jour(s)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {!isEditing && (
            <div className="flex gap-2">
              {canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Modifier"
                >
                  <Edit className="h-5 w-5" />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Actions de mise à jour rapide du statut */}
        {!isEditing && task.status !== 'DONE' && task.status !== 'CANCELLED' && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600 mr-2">Actions rapides :</span>
            {task.status === 'TODO' && (
              <button
                onClick={() => handleUpdateStatus('IN_PROGRESS')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
              >
                Commencer
              </button>
            )}
            {task.status === 'IN_PROGRESS' && (
              <button
                onClick={() => handleUpdateStatus('DONE')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
              >
                Marquer comme terminé
              </button>
            )}
            <button
              onClick={() => handleUpdateStatus('CANCELLED')}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm transition-colors"
            >
              Annuler
            </button>
          </div>
        )}

        {/* Formulaire d'édition */}
        {isEditing && (
          <form onSubmit={handleUpdate} className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'échéance
                </label>
                <input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({
                      title: task.title,
                      description: task.description,
                      priority: task.priority,
                      status: task.status,
                      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
                    });
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Détails */}
      {!isEditing && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {task.description || 'Aucune description'}
          </p>
        </div>
      )}

      {/* Informations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Assigné à */}
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Assigné à</p>
              <p className="font-medium text-gray-900">{task.assignedToName || 'Non assigné'}</p>
            </div>
          </div>

          {/* Créé par */}
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Créé par</p>
              <p className="font-medium text-gray-900">{task.createdByName || 'Inconnu'}</p>
            </div>
          </div>

          {/* Date d'échéance */}
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Date d'échéance</p>
              <p className="font-medium text-gray-900">{formatDate(task.dueDate)}</p>
              {daysUntilDue !== null && task.status !== 'DONE' && (
                <p className={`text-sm ${daysUntilDue < 0 ? 'text-red-600' : daysUntilDue <= 3 ? 'text-orange-600' : 'text-gray-500'}`}>
                  {daysUntilDue < 0 
                    ? `En retard de ${Math.abs(daysUntilDue)} jour(s)`
                    : daysUntilDue === 0
                    ? "Aujourd'hui"
                    : `Dans ${daysUntilDue} jour(s)`
                  }
                </p>
              )}
            </div>
          </div>

          {/* Date de création */}
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Créé le</p>
              <p className="font-medium text-gray-900">{formatDate(task.createdAt)}</p>
            </div>
          </div>

          {/* Date de complétion */}
          {task.completedAt && (
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Terminé le</p>
                <p className="font-medium text-gray-900">{formatDate(task.completedAt)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;