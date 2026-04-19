function toEpochDay(dateString: string) {
  return Math.floor(new Date(`${dateString}T00:00:00Z`).getTime() / 86_400_000);
}

export function calculateCurrentStreak(dates: string[]) {
  if (!dates.length) {
    return 0;
  }

  const uniqueSortedDates = Array.from(new Set(dates)).sort((a, b) => b.localeCompare(a));
  let streak = 1;

  for (let index = 1; index < uniqueSortedDates.length; index += 1) {
    const previousDay = toEpochDay(uniqueSortedDates[index - 1]);
    const currentDay = toEpochDay(uniqueSortedDates[index]);

    if (previousDay - currentDay === 1) {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
}
