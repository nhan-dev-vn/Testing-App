export const showDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.toLocaleTimeString()}, ${d.toLocaleDateString()}`
}