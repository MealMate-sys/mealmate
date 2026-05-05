/**
 * Returns the ISO date string (YYYY-MM-DD) for the Monday
 * of the week containing the given date.
 */
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay() // 0=Sun, 1=Mon,...
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
  })
}

export function getPrevWeek(weekStart: string): string {
  return addDays(weekStart, -7)
}

export function getNextWeek(weekStart: string): string {
  return addDays(weekStart, 7)
}

export function isCurrentWeek(weekStart: string): boolean {
  return weekStart === getWeekStart()
}
