/**
 * Formats a duration in seconds into a clean time string.
 * - Under 1 hour: MM:SS (e.g. 02:45)
 * - 1 hour and above: HH:MM:SS (e.g. 01:15:30)
 * 
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatTime(totalSeconds = 0) {
  const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const pad = (num) => String(num).padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}
