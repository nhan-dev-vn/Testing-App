export const showDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.toLocaleTimeString()}, ${d.toLocaleDateString()}`
}
export const showDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString();
}

export const showCountTime = (time) => {
  const minute = Math.floor(time / 60);
  const second = time - minute * 60;
  return (minute < 10 ? '0' + minute : minute) + ':' + (second < 10 ? '0' + second : second);
}