export const getImageUrl = (url: string | null | undefined) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
  // Scoatem /api din URL daca exista
  return `${apiUrl.replace(/\/api$/, '')}${url}`;
};
