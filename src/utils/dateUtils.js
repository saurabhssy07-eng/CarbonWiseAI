export function getTodayStr() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

export function getWeekId() {
  const d = new Date();
  const dayOfWeek = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((dayOfWeek + 6) % 7));
  return monday.toISOString().split('T')[0];
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateFull(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export function getDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => getDaysAgo(6 - i));
}

export function getLast30Days() {
  return Array.from({ length: 30 }, (_, i) => getDaysAgo(29 - i));
}

export function isToday(dateStr) {
  return dateStr === getTodayStr();
}

export function isYesterday(dateStr) {
  return dateStr === getDaysAgo(1);
}

export function daysBetween(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

export function getWeekStartEnd() {
  const d = new Date();
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: monday.toISOString().split('T')[0],
    end:   sunday.toISOString().split('T')[0],
  };
}

export function timeAgo(timestamp) {
  if (!timestamp) return '';
  const now = Date.now();
  const t = timestamp?.toMillis ? timestamp.toMillis() : new Date(timestamp).getTime();
  const diff = Math.floor((now - t) / 1000);
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
