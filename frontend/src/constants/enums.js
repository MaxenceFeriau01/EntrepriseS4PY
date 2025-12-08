/**
 * Constantes et énumérations pour EntrepriseS4PY
 * Centralise tous les types, statuts, priorités, etc.
 */

// ============================================
// TYPES DE CONGÉS (Leave Types)
// ============================================

export const LEAVE_TYPES = {
  PAID_LEAVE: 'PAID_LEAVE',
  SICK_LEAVE: 'SICK_LEAVE',
  UNPAID_LEAVE: 'UNPAID_LEAVE',
  MATERNITY_LEAVE: 'MATERNITY_LEAVE',
  PATERNITY_LEAVE: 'PATERNITY_LEAVE',
  OTHER: 'OTHER'
};

export const LEAVE_TYPE_LABELS = {
  PAID_LEAVE: 'Congés payés',
  SICK_LEAVE: 'Congé maladie',
  UNPAID_LEAVE: 'Congé sans solde',
  MATERNITY_LEAVE: 'Congé maternité',
  PATERNITY_LEAVE: 'Congé paternité',
  OTHER: 'Autre'
};

export const LEAVE_TYPE_COLORS = {
  PAID_LEAVE: {
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    text: 'text-blue-600',
    icon: 'text-blue-600',
    solid: 'bg-blue-500'
  },
  SICK_LEAVE: {
    bg: 'bg-red-50',
    border: 'border-red-500',
    text: 'text-red-600',
    icon: 'text-red-600',
    solid: 'bg-red-500'
  },
  UNPAID_LEAVE: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-500',
    text: 'text-yellow-600',
    icon: 'text-yellow-600',
    solid: 'bg-yellow-500'
  },
  MATERNITY_LEAVE: {
    bg: 'bg-pink-50',
    border: 'border-pink-500',
    text: 'text-pink-600',
    icon: 'text-pink-600',
    solid: 'bg-pink-500'
  },
  PATERNITY_LEAVE: {
    bg: 'bg-purple-50',
    border: 'border-purple-500',
    text: 'text-purple-600',
    icon: 'text-purple-600',
    solid: 'bg-purple-500'
  },
  OTHER: {
    bg: 'bg-gray-50',
    border: 'border-gray-500',
    text: 'text-gray-600',
    icon: 'text-gray-600',
    solid: 'bg-gray-500'
  }
};

export const LEAVE_TYPE_EMOJIS = {
  PAID_LEAVE: '🏖️',
  SICK_LEAVE: '🤒',
  UNPAID_LEAVE: '💼',
  MATERNITY_LEAVE: '👶',
  PATERNITY_LEAVE: '👨‍👶',
  OTHER: '📋'
};

// ============================================
// STATUTS DE CONGÉS (Leave Status)
// ============================================

export const LEAVE_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED'
};

export const LEAVE_STATUS_LABELS = {
  PENDING: 'En attente',
  APPROVED: 'Approuvé',
  REJECTED: 'Refusé',
  CANCELLED: 'Annulé'
};

export const LEAVE_STATUS_COLORS = {
  PENDING: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-500'
  },
  APPROVED: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-500'
  },
  REJECTED: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-500'
  },
  CANCELLED: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-500'
  }
};

// ============================================
// STATUTS DE PRÉSENCE (Attendance Status)
// ============================================

export const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  LATE: 'LATE',
  HALF_DAY: 'HALF_DAY',
  REMOTE: 'REMOTE'
};

export const ATTENDANCE_STATUS_LABELS = {
  PRESENT: 'Présent',
  ABSENT: 'Absent',
  LATE: 'En retard',
  HALF_DAY: 'Demi-journée',
  REMOTE: 'Télétravail'
};

export const ATTENDANCE_STATUS_COLORS = {
  PRESENT: {
    bg: 'bg-green-50',
    border: 'border-green-500',
    text: 'text-green-600',
    icon: 'text-green-600'
  },
  ABSENT: {
    bg: 'bg-red-50',
    border: 'border-red-500',
    text: 'text-red-600',
    icon: 'text-red-600'
  },
  LATE: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-500',
    text: 'text-yellow-600',
    icon: 'text-yellow-600'
  },
  HALF_DAY: {
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    text: 'text-blue-600',
    icon: 'text-blue-600'
  },
  REMOTE: {
    bg: 'bg-purple-50',
    border: 'border-purple-500',
    text: 'text-purple-600',
    icon: 'text-purple-600'
  }
};

export const ATTENDANCE_STATUS_EMOJIS = {
  PRESENT: '✅',
  ABSENT: '❌',
  LATE: '⚠️',
  HALF_DAY: '🕐',
  REMOTE: '💻'
};

// ============================================
// STATUTS DES TÂCHES (Task Status)
// ============================================

export const TASK_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export const TASK_STATUS_LABELS = {
  TODO: 'À faire',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée'
};

export const TASK_STATUS_COLORS = {
  TODO: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-500'
  },
  IN_PROGRESS: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-500'
  },
  COMPLETED: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-500'
  },
  CANCELLED: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-500'
  }
};

// ============================================
// PRIORITÉS DES TÂCHES (Task Priority)
// ============================================

export const TASK_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

export const TASK_PRIORITY_LABELS = {
  LOW: 'Basse',
  MEDIUM: 'Moyenne',
  HIGH: 'Haute',
  URGENT: 'Urgente'
};

export const TASK_PRIORITY_COLORS = {
  LOW: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    border: 'border-gray-300'
  },
  MEDIUM: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-300'
  },
  HIGH: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-300'
  },
  URGENT: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-300'
  }
};

// ============================================
// RÔLES UTILISATEURS (User Roles)
// ============================================

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE'
};

export const USER_ROLE_LABELS = {
  ADMIN: 'Administrateur',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employé'
};

// ============================================
// DÉPARTEMENTS
// ============================================

export const DEPARTMENTS = {
  IT: 'IT',
  COMMERCIAL: 'Commercial',
  MARKETING: 'Marketing',
  COMPTABILITE: 'Comptabilité',
  RH: 'RH',
  LOGISTIQUE: 'Logistique',
  DIRECTION: 'Direction'
};

export const DEPARTMENT_LABELS = {
  IT: 'Informatique',
  COMMERCIAL: 'Commercial',
  MARKETING: 'Marketing',
  COMPTABILITE: 'Comptabilité',
  RH: 'Ressources Humaines',
  LOGISTIQUE: 'Logistique',
  DIRECTION: 'Direction'
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Obtenir le label d'un type de congé
 */
export const getLeaveTypeLabel = (type) => {
  return LEAVE_TYPE_LABELS[type] || type;
};

/**
 * Obtenir les couleurs d'un type de congé
 */
export const getLeaveTypeColor = (type) => {
  return LEAVE_TYPE_COLORS[type] || LEAVE_TYPE_COLORS.OTHER;
};

/**
 * Obtenir l'emoji d'un type de congé
 */
export const getLeaveTypeEmoji = (type) => {
  return LEAVE_TYPE_EMOJIS[type] || '📋';
};

/**
 * Obtenir le label d'un statut de congé
 */
export const getLeaveStatusLabel = (status) => {
  return LEAVE_STATUS_LABELS[status] || status;
};

/**
 * Obtenir les couleurs d'un statut de congé
 */
export const getLeaveStatusColor = (status) => {
  return LEAVE_STATUS_COLORS[status] || LEAVE_STATUS_COLORS.PENDING;
};

/**
 * Obtenir le label d'un statut de présence
 */
export const getAttendanceStatusLabel = (status) => {
  return ATTENDANCE_STATUS_LABELS[status] || status;
};

/**
 * Obtenir les couleurs d'un statut de présence
 */
export const getAttendanceStatusColor = (status) => {
  return ATTENDANCE_STATUS_COLORS[status] || ATTENDANCE_STATUS_COLORS.PRESENT;
};

/**
 * Obtenir l'emoji d'un statut de présence
 */
export const getAttendanceStatusEmoji = (status) => {
  return ATTENDANCE_STATUS_EMOJIS[status] || '✅';
};

/**
 * Obtenir le label d'un statut de tâche
 */
export const getTaskStatusLabel = (status) => {
  return TASK_STATUS_LABELS[status] || status;
};

/**
 * Obtenir les couleurs d'un statut de tâche
 */
export const getTaskStatusColor = (status) => {
  return TASK_STATUS_COLORS[status] || TASK_STATUS_COLORS.TODO;
};

/**
 * Obtenir le label d'une priorité de tâche
 */
export const getTaskPriorityLabel = (priority) => {
  return TASK_PRIORITY_LABELS[priority] || priority;
};

/**
 * Obtenir les couleurs d'une priorité de tâche
 */
export const getTaskPriorityColor = (priority) => {
  return TASK_PRIORITY_COLORS[priority] || TASK_PRIORITY_COLORS.MEDIUM;
};

/**
 * Obtenir le label d'un rôle utilisateur
 */
export const getUserRoleLabel = (role) => {
  return USER_ROLE_LABELS[role] || role;
};

/**
 * Obtenir le label d'un département
 */
export const getDepartmentLabel = (department) => {
  return DEPARTMENT_LABELS[department] || department;
};

/**
 * Obtenir tous les types de congés sous forme de tableau
 */
export const getLeaveTypesArray = () => {
  return Object.keys(LEAVE_TYPES).map(key => ({
    value: key,
    label: LEAVE_TYPE_LABELS[key],
    emoji: LEAVE_TYPE_EMOJIS[key]
  }));
};

/**
 * Obtenir tous les statuts de tâche sous forme de tableau
 */
export const getTaskStatusArray = () => {
  return Object.keys(TASK_STATUS).map(key => ({
    value: key,
    label: TASK_STATUS_LABELS[key]
  }));
};

/**
 * Obtenir toutes les priorités de tâche sous forme de tableau
 */
export const getTaskPriorityArray = () => {
  return Object.keys(TASK_PRIORITY).map(key => ({
    value: key,
    label: TASK_PRIORITY_LABELS[key]
  }));
};

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default {
  LEAVE_TYPES,
  LEAVE_TYPE_LABELS,
  LEAVE_TYPE_COLORS,
  LEAVE_TYPE_EMOJIS,
  LEAVE_STATUS,
  LEAVE_STATUS_LABELS,
  LEAVE_STATUS_COLORS,
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_COLORS,
  ATTENDANCE_STATUS_EMOJIS,
  TASK_STATUS,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_PRIORITY,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
  USER_ROLES,
  USER_ROLE_LABELS,
  DEPARTMENTS,
  DEPARTMENT_LABELS,
  // Fonctions utilitaires
  getLeaveTypeLabel,
  getLeaveTypeColor,
  getLeaveTypeEmoji,
  getLeaveStatusLabel,
  getLeaveStatusColor,
  getAttendanceStatusLabel,
  getAttendanceStatusColor,
  getAttendanceStatusEmoji,
  getTaskStatusLabel,
  getTaskStatusColor,
  getTaskPriorityLabel,
  getTaskPriorityColor,
  getUserRoleLabel,
  getDepartmentLabel,
  getLeaveTypesArray,
  getTaskStatusArray,
  getTaskPriorityArray
};