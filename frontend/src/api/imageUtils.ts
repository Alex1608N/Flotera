export const getImageUrl = (url: string | null | undefined) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
  // Eliminăm /api de la final dacă există, pentru a concatena cu calea de upload (ex: /uploads/...)
  return `${apiUrl.replace(/\/api$/, '')}${url}`;
};
