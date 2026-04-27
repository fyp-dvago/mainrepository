/**
 * Analytics & Statistics Utilities for DVAGO
 * Handles adherence calculations, statistics, and data aggregation
 */

import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, format, isWithinInterval } from 'date-fns';
import { DoseRecord, Reminder, AdherenceStats, ChartDataPoint, AdminStats } from '../types';

/**
 * Calculate adherence statistics for a given time period
 */
export const calculateAdherenceStats = (
  doseRecords: DoseRecord[],
  startDate: Date,
  endDate: Date
): AdherenceStats => {
  const recordsInPeriod = doseRecords.filter(record =>
    isWithinInterval(record.scheduledTime, { start: startDate, end: endDate })
  );

  const totalScheduled = recordsInPeriod.length;
  const taken = recordsInPeriod.filter(r => r.status === 'taken').length;
  const missed = recordsInPeriod.filter(r => r.status === 'pending' && new Date() > record.scheduledTime).length;
  const snoozed = recordsInPeriod.filter(r => r.status === 'snoozed').length;
  const skipped = recordsInPeriod.filter(r => r.status === 'skipped').length;

  const adherenceRate = totalScheduled > 0 ? (taken / totalScheduled) * 100 : 0;

  return {
    totalScheduled,
    taken,
    missed,
    snoozed,
    skipped,
    adherenceRate: Math.round(adherenceRate * 10) / 10 // Round to 1 decimal
  };
};

/**
 * Get weekly adherence data for chart
 */
export const getWeeklyChartData = (doseRecords: DoseRecord[]): ChartDataPoint[] => {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 0 }); // Sunday
  const weekEnd = endOfWeek(now, { weekStartsOn: 0 });

  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return daysOfWeek.map(day => {
    const dayRecords = doseRecords.filter(record => {
      const recordDate = new Date(record.scheduledTime);
      return (
        recordDate.getFullYear() === day.getFullYear() &&
        recordDate.getMonth() === day.getMonth() &&
        recordDate.getDate() === day.getDate()
      );
    });

    const takenCount = dayRecords.filter(r => r.status === 'taken').length;
    const totalCount = dayRecords.length;
    const adherence = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

    return {
      label: format(day, 'EEE'), // Mon, Tue, etc.
      value: Math.round(adherence)
    };
  });
};

/**
 * Get monthly adherence data for chart
 */
export const getMonthlyChartData = (doseRecords: DoseRecord[]): ChartDataPoint[] => {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Group by week
  const weeks: ChartDataPoint[] = [];
  let currentWeekStart = startOfWeek(monthStart, { weekStartsOn: 0 });

  let weekNumber = 1;
  while (currentWeekStart <= monthEnd) {
    const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 0 });

    const weekRecords = doseRecords.filter(record =>
      isWithinInterval(record.scheduledTime, {
        start: currentWeekStart,
        end: currentWeekEnd > monthEnd ? monthEnd : currentWeekEnd
      })
    );

    const takenCount = weekRecords.filter(r => r.status === 'taken').length;
    const totalCount = weekRecords.length;
    const adherence = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

    weeks.push({
      label: `W${weekNumber}`,
      value: Math.round(adherence)
    });

    currentWeekStart = new Date(currentWeekEnd);
    currentWeekStart.setDate(currentWeekStart.getDate() + 1);
    weekNumber++;
  }

  return weeks;
};

/**
 * Calculate statistics for a specific reminder
 */
export const getReminderStats = (
  reminderId: string,
  doseRecords: DoseRecord[]
): AdherenceStats => {
  const reminderRecords = doseRecords.filter(r => r.reminderId === reminderId);

  const totalScheduled = reminderRecords.length;
  const taken = reminderRecords.filter(r => r.status === 'taken').length;
  const missed = reminderRecords.filter(r => r.status === 'pending' && new Date() > r.scheduledTime).length;
  const snoozed = reminderRecords.filter(r => r.status === 'snoozed').length;
  const skipped = reminderRecords.filter(r => r.status === 'skipped').length;

  const adherenceRate = totalScheduled > 0 ? (taken / totalScheduled) * 100 : 0;

  return {
    totalScheduled,
    taken,
    missed,
    snoozed,
    skipped,
    adherenceRate: Math.round(adherenceRate * 10) / 10
  };
};

/**
 * Get admin dashboard statistics
 */
export const getAdminStats = (
  reminders: Reminder[],
  doseRecords: DoseRecord[],
  totalUsers: number
): AdminStats => {
  const activeReminders = reminders.filter(r => r.isActive).length;
  
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 0 });

  // Calculate average adherence across all users
  const stats = calculateAdherenceStats(doseRecords, weekStart, now);

  // Daily doses (scheduled for today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dailyDoses = doseRecords.filter(r =>
    isWithinInterval(r.scheduledTime, { start: today, end: tomorrow })
  ).length;

  // Weekly doses
  const weeklyDoses = doseRecords.filter(r =>
    isWithinInterval(r.scheduledTime, { start: weekStart, end: now })
  ).length;

  return {
    totalUsers,
    totalReminders: reminders.length,
    activeReminders,
    averageAdherence: stats.adherenceRate,
    dailyDoses,
    weeklyDoses
  };
};

/**
 * Get dose status distribution for pie chart
 */
export const getDoseDistribution = (doseRecords: DoseRecord[]): { taken: number; missed: number; pending: number } => {
  const taken = doseRecords.filter(r => r.status === 'taken').length;
  const missed = doseRecords.filter(r => r.status === 'skipped' || (r.status === 'pending' && new Date() > r.scheduledTime)).length;
  const pending = doseRecords.filter(r => r.status === 'pending' && new Date() <= r.scheduledTime).length;

  return { taken, missed, pending };
};

/**
 * Get top performing reminders (highest adherence)
 */
export const getTopReminders = (
  reminders: Reminder[],
  doseRecords: DoseRecord[],
  limit: number = 5
): Array<{ reminder: Reminder; adherenceRate: number }> => {
  const reminderStats = reminders.map(reminder => {
    const stats = getReminderStats(reminder.id, doseRecords);
    return {
      reminder,
      adherenceRate: stats.adherenceRate
    };
  });

  return reminderStats
    .sort((a, b) => b.adherenceRate - a.adherenceRate)
    .slice(0, limit);
};

/**
 * Calculate streak (consecutive days with 100% adherence)
 */
export const getCurrentStreak = (doseRecords: DoseRecord[]): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let checkDate = new Date(today);

  while (true) {
    const nextDay = new Date(checkDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const dayRecords = doseRecords.filter(r => {
      const recordDate = new Date(r.scheduledTime);
      return isWithinInterval(recordDate, { start: checkDate, end: nextDay });
    });

    if (dayRecords.length === 0) {
      // No doses scheduled for this day, skip it
      checkDate.setDate(checkDate.getDate() - 1);
      continue;
    }

    const allTaken = dayRecords.every(r => r.status === 'taken');
    
    if (!allTaken) {
      break;
    }

    streak++;
    checkDate.setDate(checkDate.getDate() - 1);

    // Limit to 365 days to prevent infinite loops
    if (streak > 365) break;
  }

  return streak;
};
