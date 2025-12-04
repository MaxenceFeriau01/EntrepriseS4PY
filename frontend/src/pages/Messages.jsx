import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import { Plus, Mail, Send, Inbox, MailOpen } from 'lucide-react';

const Messages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('received');
  const [formData, setFormData] = useState({
    recipientId: '',
    subject: '',
    content: '',
  });

  useEffect(() => {
    loadMessages();
    loadUsers();
  }, [user, tab]);

  const loadMessages = async () => {
    try {
      const response =
        tab === 'received'
          ? await apiService.getReceivedMessages(user.id)
          : await apiService.getSentMessages(user.id);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await apiService.getActiveUsers();
      setUsers(response.data.filter((u) => u.id !== user.id));
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.sendMessage(user.id, formData);
      alert('Message envoyé !');
      setShowModal(false);
      setFormData({ recipientId: '', subject: '', content: '' });
      loadMessages();
    } catch (error) {
      alert('Erreur lors de l\'envoi');
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await apiService.markAsRead(messageId);
      loadMessages();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          <span>Nouveau message</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex space-x-2">
          <button
            onClick={() => setTab('received')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              tab === 'received'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Inbox size={20} />
            <span>Reçus</span>
          </button>
          <button
            onClick={() => setTab('sent')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              tab === 'sent'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Send size={20} />
            <span>Envoyés</span>
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Aucun message</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg transition-colors cursor-pointer ${
                  tab === 'received' && !message.read
                    ? 'bg-primary-50 border-l-4 border-primary-600'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => tab === 'received' && !message.read && handleMarkAsRead(message.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {tab === 'received' && !message.read ? (
                      <Mail className="text-primary-600 mt-1" size={20} />
                    ) : (
                      <MailOpen className="text-gray-400 mt-1" size={20} />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-semibold text-gray-900">
                          {tab === 'received' ? message.senderName : message.recipientName}
                        </p>
                        {tab === 'received' && !message.read && (
                          <span className="px-2 py-1 bg-primary-600 text-white text-xs rounded-full">
                            Nouveau
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1">{message.subject}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{message.content}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(message.createdAt).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Nouveau message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destinataire
                </label>
                <select
                  value={formData.recipientId}
                  onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Sélectionner un destinataire</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} - {u.position}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sujet</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Sujet du message"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Votre message..."
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

export default Messages;