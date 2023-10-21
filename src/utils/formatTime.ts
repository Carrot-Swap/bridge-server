export function formatTime(time: number) {
  const hour = Math.floor(time / (1000 * 60 * 60));
  const minutes = Math.floor((time - hour * 1000 * 60 * 60) / (1000 * 60));
  const seconds = Math.floor(
    (time - hour * 1000 * 60 * 60 - minutes * 1000 * 60) / 1000
  );
  if (hour) {
    return `${hour}h ${minutes}m ${seconds}s`;
  } else if (minutes) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}
