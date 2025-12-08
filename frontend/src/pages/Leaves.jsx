import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import { 
  LEAVE_TYPE_LABELS, 
  LEAVE_STATUS_LABELS,
  LEAVE_STATUS_COLORS,
  getLeaveTypesArray 
} from '../constants/enums';
import { Plus, Calendar, CheckCircle, XCircle, Clock, Umbrella } from 'lucide-react';

const Leaves = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    leaveType: 'PAID_LEAVE',
    reason: '',
  });

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  useEffect(() => {
    loadLeaves();
  }, [user]);

  const loadLeaves = async () => {
    try {
      const response = await apiService.getLeaveRequests(user.id);
      setLeaves(response.data);

      if (isAdmin) {
        const pendingResponse = await apiService.getPendingLeaveRequests();
        setPendingLeaves(pendingResponse.data);
      }
    } catch (error) {
      console.error('Error loading leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.createLeaveRequest(user.id, formData);
      alert('Demande de congé envoyée avec succès !');
      setShowModal(false);
      setFormData({ startDate: '', endDate: '', leaveType: 'PAID_LEAVE', reason: '' });
      loadLeaves();
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de la création de la demande');
    }
  };

  const handleApprove = async (id) => {
    try {
      await apiService.approveLeaveRequest(id, user.id);
      alert('Congé approuvé !');
      loadLeaves();
    } catch (error) {
      alert('Erreur lors de l\'approbation');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Raison du refus :');
    if (!reason) return;

    try {
      await apiService.rejectLeaveRequest(id, user.id, reason);
      alert('Congé refusé');
      loadLeaves();
    } catch (error) {
      alert('Erreur lors du refus');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = LEAVE_STATUS_COLORS[status] || LEAVE_STATUS_COLORS.PENDING;
    const label = LEAVE_STATUS_LABELS[status] || status;
    
    const icons = {
      PENDING: Clock,
      APPROVED: CheckCircle,
      REJECTED: XCircle,
      CANCELLED: XCircle
    };
    const Icon = icons[status] || Clock;
    
    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
        <Icon size={14} />
        <span>{label}</span>
      </span>
    );
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
          <h1 className="text-3xl font-bold text-gray-900">Congés</h1>
          <p className="text-gray-600 mt-1">Jours disponibles : {user.vacationDays}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          <span>Nouvelle demande</span>
        </button>
      </div>

      {/* Pending Leaves (Admin/Manager only) */}
      {isAdmin && pendingLeaves.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Demandes en attente</h2>
          <div className="space-y-3">
            {pendingLeaves.map((leave) => (
              <div key={leave.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{leave.userName}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Du {new Date(leave.startDate).toLocaleDateString('fr-FR')} au{' '}
                      {new Date(leave.endDate).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-sm text-gray-600">{LEAVE_TYPE_LABELS[leave.leaveType]}</p>
                    {leave.reason && (
                      <p className="text-sm text-gray-600 mt-2 italic">Raison : {leave.reason}</p>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleApprove(leave.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Approuver
                    </button>
                    <button
                      onClick={() => handleReject(leave.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Refuser
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Leaves */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mes demandes</h2>
        <div className="space-y-3">
          {leaves.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Aucune demande de congé</p>
          ) : (
            leaves.map((leave) => (
              <div
                key={leave.id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Umbrella className="text-primary-600 mt-1" size={20} />
                    <div>
                      <p className="font-medium text-gray-900">{LEAVE_TYPE_LABELS[leave.leaveType]}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Du {new Date(leave.startDate).toLocaleDateString('fr-FR')} au{' '}
                        {new Date(leave.endDate).toLocaleDateString('fr-FR')}
                      </p>
                      {leave.reason && (
                        <p className="text-sm text-gray-600 mt-1">Raison : {leave.reason}</p>
                      )}
                      {leave.rejectionReason && (
                        <p className="text-sm text-red-600 mt-1">
                          Motif du refus : {leave.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(leave.status)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Nouvelle demande de congé</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {getLeaveTypesArray().map(type => (
                    <option key={type.value} value={type.value}>
                      {type.emoji} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Raison</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Expliquez brièvement..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Envoyer
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
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

export default Leaves;