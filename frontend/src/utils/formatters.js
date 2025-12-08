/**
 * Utilitaires de formatage pour EntrepriseS4PY
 * Centralise toutes les fonctions de parsing de dates, heures, etc.
 */

/**
 * Parse une date du backend (peut être string ou array Java [2025, 12, 8])
 * @param {string|array} dateValue - Date à parser
 * @returns {string|null} - Date au format "YYYY-MM-DD" ou null
 */
export const parseDate = (dateValue) => {
  if (!dateValue) return null;
  
  // Si c'est déjà une string
  if (typeof dateValue === 'string') {
    return dateValue.split('T')[0]; // Enlever l'heure si présente
  }
  
  // Si c'est un array Java [year, month, day]
  if (Array.isArray(dateValue) && dateValue.length >= 3) {
    const year = dateValue[0];
    const month = String(dateValue[1]).padStart(2, '0');
    const day = String(dateValue[2]).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  return null;
};

/**
 * Parse une heure du backend (peut être string ou array Java [9, 30, 0])
 * @param {string|array} timeValue - Heure à parser
 * @returns {string|null} - Heure au format "HH:MM" ou null
 */
export const parseTime = (timeValue) => {
  if (!timeValue) return null;
  
  // Si c'est déjà une string
  if (typeof timeValue === 'string') {
    // Si format "HH:MM:SS", garder juste "HH:MM"
    return timeValue.substring(0, 5);
  }
  
  // Si c'est un array Java [hour, minute, second]
  if (Array.isArray(timeValue) && timeValue.length >= 2) {
    const hours = String(timeValue[0]).padStart(2, '0');
    const minutes = String(timeValue[1]).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  
  return null;
};

/**
 * Calcule les heures travaillées entre deux heures
 * @param {string|array} checkIn - Heure d'arrivée
 * @param {string|array} checkOut - Heure de départ
 * @returns {number|null} - Nombre d'heures ou null
 */
export const calculateHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return null;
  
  const checkInTime = parseTime(checkIn);
  const checkOutTime = parseTime(checkOut);
  
  if (!checkInTime || !checkOutTime) return null;
  
  const [inHour, inMin] = checkInTime.split(':').map(Number);
  const [outHour, outMin] = checkOutTime.split(':').map(Number);
  
  const inMinutes = inHour * 60 + inMin;
  const outMinutes = outHour * 60 + outMin;
  
  const diffMinutes = outMinutes - inMinutes;
  
  if (diffMinutes < 0) return null; // Heure de départ avant arrivée
  
  return (diffMinutes / 60).toFixed(2);
};

/**
 * Formate une date en français
 * @param {string} dateStr - Date au format ISO
 * @param {object} options - Options de formatage
 * @returns {string} - Date formatée
 */
export const formatDate = (dateStr, options = {}) => {
  if (!dateStr) return '';
  
  const defaultOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options
  };
  
  return new Date(dateStr).toLocaleDateString('fr-FR', defaultOptions);
};

/**
 * Formate une date/heure complète en français
 * @param {string} dateTimeStr - DateTime au format ISO
 * @returns {string} - Date et heure formatées
 */
export const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  
  return new Date(dateTimeStr).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formate une heure en français
 * @param {string} timeStr - Heure au format ISO ou HH:MM
 * @returns {string} - Heure formatée
 */
export const formatTime = (timeStr) => {
  if (!timeStr) return '';
  
  // Si c'est déjà au format HH:MM
  if (timeStr.length === 5 && timeStr.includes(':')) {
    return timeStr;
  }
  
  return new Date(timeStr).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Calcule le nombre de jours entre deux dates
 * @param {string} startDate - Date de début
 * @param {string} endDate - Date de fin
 * @returns {number} - Nombre de jours
 */
export const daysBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays + 1; // +1 pour inclure le dernier jour
};

/**
 * Vérifie si une date est aujourd'hui
 * @param {string|array} dateValue - Date à vérifier
 * @returns {boolean} - true si c'est aujourd'hui
 */
export const isToday = (dateValue) => {
  const date = parseDate(dateValue);
  if (!date) return false;
  
  const today = new Date().toISOString().split('T')[0];
  return date === today;
};

/**
 * Vérifie si une date est un week-end
 * @param {Date|string} date - Date à vérifier
 * @returns {boolean} - true si samedi ou dimanche
 */
export const isWeekend = (date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = d.getDay();
  return day === 0 || day === 6; // 0 = dimanche, 6 = samedi
};

/**
 * Obtient le nom du mois en français
 * @param {number} monthIndex - Index du mois (0-11)
 * @returns {string} - Nom du mois
 */
export const getMonthName = (monthIndex) => {
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  return months[monthIndex] || '';
};

/**
 * Obtient le nom du jour en français
 * @param {number} dayIndex - Index du jour (0-6)
 * @returns {string} - Nom du jour
 */
export const getDayName = (dayIndex) => {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  return days[dayIndex] || '';
};

/**
 * Formate un nombre en français (avec espaces pour les milliers)
 * @param {number} num - Nombre à formater
 * @returns {string} - Nombre formaté
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString('fr-FR');
};

/**
 * Formate un montant en euros
 * @param {number} amount - Montant à formater
 * @returns {string} - Montant formaté avec €
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0,00 €';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

/**
 * Obtient l'heure de checkout en gérant différentes propriétés
 * @param {object} attendance - Objet attendance
 * @returns {string|null} - Heure de checkout ou null
 */
export const getCheckOutTime = (attendance) => {
  if (!attendance) return null;
  // Vérifier différentes propriétés possibles
  return attendance.checkOutTime || attendance.checkOut || attendance.checkout || null;
};

/**
 * Obtient l'heure de checkin en gérant différentes propriétés
 * @param {object} attendance - Objet attendance
 * @returns {string|null} - Heure de checkin ou null
 */
export const getCheckInTime = (attendance) => {
  if (!attendance) return null;
  // Vérifier différentes propriétés possibles
  return attendance.checkInTime || attendance.checkIn || attendance.checkin || null;
};

/**
 * Calcule le temps relatif (ex: "Il y a 2 heures")
 * @param {string} dateTimeStr - DateTime au format ISO
 * @returns {string} - Temps relatif
 */
export const timeAgo = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  
  const date = new Date(dateTimeStr);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  
  return formatDate(dateTimeStr);
};

export default {
  parseDate,
  parseTime,
  calculateHours,
  formatDate,
  formatDateTime,
  formatTime,
  daysBetween,
  isToday,
  isWeekend,
  getMonthName,
  getDayName,
  formatNumber,
  formatCurrency,
  getCheckOutTime,
  getCheckInTime,
  timeAgo
};