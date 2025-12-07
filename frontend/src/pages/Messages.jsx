import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import { MessageSquare, Send, Search, User, Circle, ArrowLeft } from 'lucide-react';

const Messages = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Scroll automatique vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  const loadData = async () => {
    try {
      if (!loading) setLoading(false); // Ne pas afficher le loader lors des refresh
      
      // Charger tous les utilisateurs
      const usersResponse = await apiService.getAllUsers();
      setUsers(usersResponse.data);

      // Charger tous les messages (reçus + envoyés)
      const [receivedResponse, sentResponse] = await Promise.all([
        apiService.getReceivedMessages(user.id),
        apiService.getSentMessages(user.id)
      ]);

      const allMessages = [...receivedResponse.data, ...sentResponse.data];
      setMessages(allMessages);

      // Créer les conversations
      const updatedConversations = createConversations(allMessages, usersResponse.data);
      
      // Si une conversation est sélectionnée, la mettre à jour
      if (selectedConversation) {
        const updatedConv = updatedConversations.find(c => c.userId === selectedConversation.userId);
        if (updatedConv) {
          setSelectedConversation(updatedConv);
          setConversationMessages(updatedConv.messages);
        }
      }
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const createConversations = (allMessages, allUsers) => {
    const conversationsMap = new Map();

    allMessages.forEach(message => {
      // Déterminer l'autre personne dans la conversation
      const otherUserId = message.senderId === user.id ? message.recipientId : message.senderId;
      
      if (!conversationsMap.has(otherUserId)) {
        const otherUser = allUsers.find(u => u.id === otherUserId);
        
        conversationsMap.set(otherUserId, {
          userId: otherUserId,
          user: otherUser,
          messages: [],
          lastMessage: null,
          unreadCount: 0
        });
      }

      const conversation = conversationsMap.get(otherUserId);
      conversation.messages.push(message);
      
      // Compter les messages non lus (reçus uniquement)
      if (message.recipientId === user.id && !message.read) {
        conversation.unreadCount++;
      }
    });

    // Trier les messages de chaque conversation par date
    conversationsMap.forEach(conversation => {
      conversation.messages.sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      );
      
      // Définir le dernier message
      conversation.lastMessage = conversation.messages[conversation.messages.length - 1];
    });

    // Convertir en tableau et trier par dernier message
    const conversationsArray = Array.from(conversationsMap.values())
      .sort((a, b) => {
        const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt) : new Date(0);
        const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt) : new Date(0);
        return dateB - dateA;
      });

    setConversations(conversationsArray);
    return conversationsArray;
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setConversationMessages(conversation.messages);

    // Marquer tous les messages non lus comme lus
    const unreadMessages = conversation.messages.filter(
      msg => msg.recipientId === user.id && !msg.read
    );

    for (const msg of unreadMessages) {
      try {
        await apiService.markAsRead(msg.id);
      } catch (error) {
        console.error('Erreur marquage lu:', error);
      }
    }

    // Recharger les données
    await loadData();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      
      const messageData = {
        recipientId: selectedConversation.userId,
        subject: 'Message',
        content: newMessage.trim()
      };

      await apiService.sendMessage(user.id, messageData);
      
      // Vider le champ immédiatement
      setNewMessage('');
      
      // Recharger les messages
      await loadData();
      
    } catch (error) {
      console.error('Erreur envoi message:', error);
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const handleStartNewConversation = (userId) => {
    const existingConversation = conversations.find(c => c.userId === userId);
    
    if (existingConversation) {
      handleSelectConversation(existingConversation);
    } else {
      const otherUser = users.find(u => u.id === userId);
      const newConversation = {
        userId,
        user: otherUser,
        messages: [],
        lastMessage: null,
        unreadCount: 0
      };
      setSelectedConversation(newConversation);
      setConversationMessages([]);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!conv.user) return false;
    const fullName = `${conv.user.firstName} ${conv.user.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Liste des conversations */}
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 border-r border-gray-200`}>
        {/* En-tête */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            Messages
          </h2>

          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Liste des conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="mb-4">Aucune conversation</p>
              
              {/* Bouton nouvelle conversation */}
              <div className="mt-4">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleStartNewConversation(parseInt(e.target.value));
                      e.target.value = '';
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Démarrer une conversation...</option>
                  {users
                    .filter(u => u.id !== user.id && u.active)
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          ) : (
            <>
              {filteredConversations.map(conversation => (
                <button
                  key={conversation.userId}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                    selectedConversation?.userId === conversation.userId ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      {conversation.user?.active && (
                        <Circle className="absolute bottom-0 right-0 w-3 h-3 text-green-500 fill-current" />
                      )}
                    </div>

                    {/* Infos conversation */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conversation.user?.firstName} {conversation.user?.lastName}
                        </h3>
                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatMessageTime(conversation.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-gray-600 truncate flex-1">
                          {conversation.lastMessage?.senderId === user.id && 'Vous: '}
                          {conversation.lastMessage?.content || 'Aucun message'}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Zone de conversation */}
      {selectedConversation ? (
        <div className="flex flex-col flex-1">
          {/* En-tête conversation */}
          <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-3">
            <button
              onClick={() => setSelectedConversation(null)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {selectedConversation.user?.firstName} {selectedConversation.user?.lastName}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                {selectedConversation.user?.department} • {selectedConversation.user?.position}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {conversationMessages.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <p>Aucun message dans cette conversation</p>
                <p className="text-sm mt-2">Envoyez le premier message !</p>
              </div>
            ) : (
              <>
                {conversationMessages.map(message => {
                  const isSentByMe = message.senderId === user.id;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isSentByMe
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            isSentByMe ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {/* Élément invisible pour le scroll automatique */}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Zone d'envoi */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Écrivez votre message..."
                disabled={sending}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Envoyer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center text-gray-500 max-w-md px-4">
            <MessageSquare className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold mb-2">Sélectionnez une conversation</h3>
            <p className="text-sm mb-6">Choisissez une conversation dans la liste pour commencer à échanger</p>
            
            {/* Nouvelle conversation */}
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleStartNewConversation(parseInt(e.target.value));
                  e.target.value = '';
                }
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Nouvelle conversation...</option>
              {users
                .filter(u => u.id !== user.id && u.active)
                .map(u => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName} - {u.department}
                  </option>
                ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;