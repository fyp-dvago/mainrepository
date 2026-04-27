/**
 * Time & Date Utilities for DVAGO
 * Handles countdown timers, dose scheduling, and time formatting
 */

import { format, addDays, addWeeks, isBefore, isAfter, differenceInMilliseconds, addMinutes } from 'date-fns';
import { Reminder, NextDose, DoseRecord } from '../types';

/**
 * Calculate the next upcoming dose for a reminder
 */
export const getNextDoseTime = (reminder: Reminder): Date | null => {
  if (!reminder.isActive || !reminder.times || reminder.times.length === 0) {
    return null;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentDayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday

  // Get all possible next doses
  const possibleDoses: Date[] = [];

  // Check today's remaining times
  reminder.times.forEach(timeStr => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const doseTime = new Date(today);
    doseTime.setHours(hours, minutes, 0, 0);

    if (isAfter(doseTime, now)) {
      // Check if this day is valid for the reminder
      if (reminder.frequency === 'daily') {
        possibleDoses.push(doseTime);
      } else if (reminder.frequency === 'weekly' && reminder.customDays?.includes(currentDayOfWeek)) {
        possibleDoses.push(doseTime);
      } else if (reminder.frequency === 'custom' && reminder.customDays?.includes(currentDayOfWeek)) {
        possibleDoses.push(doseTime);
      }
    }
  });

  // If no doses today, check next 7 days
  if (possibleDoses.length === 0) {
    for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
      const futureDate = addDays(today, dayOffset);
      const futureDayOfWeek = futureDate.getDay();

      let isDayValid = false;
      if (reminder.frequency === 'daily') {
        isDayValid = true;
      } else if (reminder.frequency === 'weekly') {
        isDayValid = reminder.customDays?.includes(futureDayOfWeek) || false;
      } else if (reminder.frequency === 'custom') {
        isDayValid = reminder.customDays?.includes(futureDayOfWeek) || false;
      }

      if (isDayValid) {
        // Add all times for this day
        reminder.times.forEach(timeStr => {
          const [hours, minutes] = timeStr.split(':').map(Number);
          const doseTime = new Date(futureDate);
          doseTime.setHours(hours, minutes, 0, 0);
          possibleDoses.push(doseTime);
        });
        break; // Found the next valid day
      }
    }
  }

  // Return the earliest dose
  if (possibleDoses.length === 0) {
    return null;
  }

  return possibleDoses.sort((a, b) => a.getTime() - b.getTime())[0];
};

/**
 * Get the next dose across all active reminders
 */
export const getNextDoseAcrossReminders = (reminders: Reminder[]): NextDose | null => {
  const activeReminders = reminders.filter(r => r.isActive);
  
  const nextDoses = activeReminders
    .map(reminder => {
      const scheduledTime = getNextDoseTime(reminder);
      if (!scheduledTime) return null;

      return {
        reminder,
        scheduledTime,
        timeUntil: differenceInMilliseconds(scheduledTime, new Date())
      };
    })
    .filter((dose): dose is NextDose => dose !== null);

  if (nextDoses.length === 0) {
    return null;
  }

  // Sort by time until dose and return the nearest one
  return nextDoses.sort((a, b) => a.timeUntil - b.timeUntil)[0];
};

/**
 * Format countdown timer display
 * Returns format like "2h 15m" or "45m" or "5m"
 */
export const formatCountdown = (milliseconds: number): string => {
  if (milliseconds <= 0) {
    return 'Now';
  }

  const totalMinutes = Math.floor(milliseconds / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

/**
 * Format time for display (e.g., "09:00 AM")
 */
export const formatTime = (date: Date): string => {
  return format(date, 'hh:mm a');
};

/**
 * Format date for display (e.g., "Dec 15, 2025")
 */
export const formatDate = (date: Date): string => {
  return format(date, 'MMM dd, yyyy');
};

/**
 * Format date and time (e.g., "Dec 15, 2025 at 09:00 AM")
 */
export const formatDateTime = (date: Date): string => {
  return format(date, 'MMM dd, yyyy \'at\' hh:mm a');
};

/**
 * Check if a dose is overdue
 */
export const isDoseOverdue = (scheduledTime: Date): boolean => {
  return isBefore(scheduledTime, new Date());
};

/**
 * Get upcoming doses for today
 */
export const getTodaysDoses = (reminders: Reminder[]): NextDose[] => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setHours(23, 59, 59, 999);

  const doses: NextDose[] = [];

  reminders.forEach(reminder => {
    if (!reminder.isActive) return;

    const nextDose = getNextDoseTime(reminder);
    if (nextDose && isAfter(nextDose, startOfDay) && isBefore(nextDose, endOfDay)) {
      doses.push({
        reminder,
        scheduledTime: nextDose,
        timeUntil: differenceInMilliseconds(nextDose, now)
      });
    }
  });

  return doses.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
};

/**
 * Calculate refill warning
 * Returns true if quantity is low (< 7 days worth)
 */
export const needsRefill = (reminder: Reminder): boolean => {
  const dailyDoses = reminder.times.length;
  const daysRemaining = reminder.remainingQuantity / dailyDoses;
  return daysRemaining < 7;
};

/**
 * Get human-readable frequency text
 */
export const getFrequencyText = (reminder: Reminder): string => {
  if (reminder.frequency === 'daily') {
    return 'Daily';
  } else if (reminder.frequency === 'weekly') {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days = reminder.customDays?.map(d => dayNames[d]).join(', ') || '';
    return `Weekly: ${days}`;
  } else {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days = reminder.customDays?.map(d => dayNames[d]).join(', ') || '';
    return days;
  }
};

/**
 * Update countdown timer state
 * Returns updated milliseconds until dose
 */
export const updateCountdown = (nextDose: NextDose | null): number => {
  if (!nextDose) return 0;
  return Math.max(0, differenceInMilliseconds(nextDose.scheduledTime, new Date()));
};
