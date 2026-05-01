import notifee, {
  AndroidImportance,
  EventType,
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import Tts from 'react-native-tts';
import api from './apiClient';

const MEDICINE_REMINDERS_CHANNEL_ID = 'medicine-reminders';
const MEDICINE_REMINDERS_NO_SOUND_CHANNEL_ID = 'medicine-reminders-no-sound';
const MEDICINE_REMINDERS_NO_VIBRATION_CHANNEL_ID =
  'medicine-reminders-no-vibration';
const MEDICINE_REMINDERS_SILENT_CHANNEL_ID = 'medicine-reminders-silent';
const MEDICINE_REMINDER_ID_PREFIX = 'medicine-reminder-';
const DOSE_REMINDER_ID_PREFIX = 'reminder-';

type NotificationSettings = {
  pushEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  voiceEnabled: boolean;
};

const defaultNotificationSettings: NotificationSettings = {
  pushEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  voiceEnabled: false,
};

let eventHandlersRegistered = false;

export const initializeMedicineNotifications = async () => {
  await notifee.requestPermission();

  await notifee.createChannel({
    id: MEDICINE_REMINDERS_CHANNEL_ID,
    name: 'Medicine Reminders',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });

  await notifee.createChannel({
    id: MEDICINE_REMINDERS_NO_SOUND_CHANNEL_ID,
    name: 'Medicine Reminders No Sound',
    importance: AndroidImportance.HIGH,
    vibration: true,
  });

  await notifee.createChannel({
    id: MEDICINE_REMINDERS_NO_VIBRATION_CHANNEL_ID,
    name: 'Medicine Reminders No Vibration',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: false,
  });

  await notifee.createChannel({
    id: MEDICINE_REMINDERS_SILENT_CHANNEL_ID,
    name: 'Medicine Reminders Silent',
    importance: AndroidImportance.HIGH,
    vibration: false,
  });
};

const getNextReminderTimestamp = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const reminderDate = new Date();

  reminderDate.setHours(hours, minutes, 0, 0);

  if (reminderDate.getTime() <= Date.now()) {
    reminderDate.setDate(reminderDate.getDate() + 1);
  }

  return reminderDate.getTime();
};

type ScheduleMedicineReminderOptions = {
  medicineName: string;
  dosage: string;
  times: string[];
  doseSchedules?: {
    id: string;
    scheduledAt: string;
  }[];
};

const getSavedNotificationSettings = async (): Promise<NotificationSettings> => {
  try {
    const response = await api.get('/user/profile');
    return {
      ...defaultNotificationSettings,
      ...response?.data?.settings?.notifications,
    };
  } catch {
    return defaultNotificationSettings;
  }
};

const getChannelIdForSettings = (settings: NotificationSettings) => {
  if (!settings.soundEnabled && !settings.vibrationEnabled) {
    return MEDICINE_REMINDERS_SILENT_CHANNEL_ID;
  }

  if (!settings.soundEnabled) {
    return MEDICINE_REMINDERS_NO_SOUND_CHANNEL_ID;
  }

  if (!settings.vibrationEnabled) {
    return MEDICINE_REMINDERS_NO_VIBRATION_CHANNEL_ID;
  }

  return MEDICINE_REMINDERS_CHANNEL_ID;
};

export const cancelMedicineReminderNotifications = async () => {
  const notificationIds = await notifee.getTriggerNotificationIds();
  const medicineReminderIds = notificationIds.filter(id =>
    id.startsWith(MEDICINE_REMINDER_ID_PREFIX) ||
    id.startsWith(DOSE_REMINDER_ID_PREFIX),
  );

  if (medicineReminderIds.length > 0) {
    await notifee.cancelTriggerNotifications(medicineReminderIds);
  }
};

export const getDoseReminderNotificationId = (doseId: string) =>
  `${DOSE_REMINDER_ID_PREFIX}${doseId}`;

export const cancelDoseReminderNotification = async (doseId: string) => {
  if (!doseId) {
    return;
  }

  const notificationId = getDoseReminderNotificationId(doseId);

  try {
    await notifee.cancelTriggerNotification(notificationId);
    await notifee.cancelNotification(notificationId);
  } catch {
    // Dose status is the source of truth; notification cleanup is best effort.
  }
};

const speakReminder = async (voiceText?: unknown) => {
  if (typeof voiceText !== 'string' || !voiceText.trim()) {
    return;
  }

  try {
    await Tts.speak(voiceText);
  } catch {
    // Voice reminders are best effort; normal notifications must still work.
  }
};

const handleReminderVoiceEvent = async (event: any) => {
  if (event.type !== EventType.DELIVERED) {
    return;
  }

  const data = event.detail?.notification?.data;

  if (data?.voiceEnabled === 'true') {
    await speakReminder(data.voiceText);
  }
};

export const registerMedicineReminderEventHandlers = () => {
  if (eventHandlersRegistered) {
    return;
  }

  eventHandlersRegistered = true;

  Tts.setDefaultLanguage('en-US').catch(() => undefined);

  notifee.onBackgroundEvent(async event => {
    await handleReminderVoiceEvent(event);
  });

  notifee.onForegroundEvent(event => {
    handleReminderVoiceEvent(event);
  });
};

export const scheduleMedicineReminderNotifications = async ({
  medicineName,
  dosage,
  times,
  doseSchedules,
}: ScheduleMedicineReminderOptions) => {
  const validTimes = times.filter(time => /^\d{2}:\d{2}$/.test(time));
  const validDoseSchedules = Array.isArray(doseSchedules)
    ? doseSchedules.filter(
        dose =>
          dose?.id &&
          dose?.scheduledAt &&
          new Date(dose.scheduledAt).getTime() > Date.now(),
      )
    : [];

  if (validTimes.length === 0 && validDoseSchedules.length === 0) {
    return;
  }

  const settings = await getSavedNotificationSettings();

  if (!settings.pushEnabled) {
    await cancelMedicineReminderNotifications();
    return;
  }

  await initializeMedicineNotifications();
  const channelId = getChannelIdForSettings(settings);
  const createNotification = (id: string, timestamp: number) => {
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp,
      alarmManager: {
        allowWhileIdle: true,
      },
    };

    return notifee.createTriggerNotification(
      {
        id,
        title: `Time to take ${medicineName}`,
        body: `It is time to take ${dosage}. Please take your medicine as scheduled.`,
        data: {
          voiceEnabled: String(settings.voiceEnabled),
          voiceText: `Time to take ${medicineName}. Dosage: ${dosage}.`,
        },
        android: {
          channelId,
          sound: settings.soundEnabled ? 'default' : undefined,
          vibrationPattern: settings.vibrationEnabled ? [300, 500] : [],
          pressAction: {
            id: 'default',
          },
        },
      },
      trigger,
    );
  };

  if (validDoseSchedules.length > 0) {
    await Promise.all(
      validDoseSchedules.map(dose =>
        createNotification(
          getDoseReminderNotificationId(dose.id),
          new Date(dose.scheduledAt).getTime(),
        ),
      ),
    );
    return;
  }

  await Promise.all(
    validTimes.map((time, index) => {
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: getNextReminderTimestamp(time),
        repeatFrequency: RepeatFrequency.DAILY,
        alarmManager: {
          allowWhileIdle: true,
        },
      };

      return notifee.createTriggerNotification(
        {
          id: `${MEDICINE_REMINDER_ID_PREFIX}${time}-${index}`,
          title: `Time to take ${medicineName}`,
          body: `It is time to take ${dosage}. Please take your medicine as scheduled.`,
          data: {
            voiceEnabled: String(settings.voiceEnabled),
            voiceText: `Time to take ${medicineName}. Dosage: ${dosage}.`,
          },
          android: {
            channelId,
            sound: settings.soundEnabled ? 'default' : undefined,
            vibrationPattern: settings.vibrationEnabled ? [300, 500] : [],
            pressAction: {
              id: 'default',
            },
          },
        },
        trigger,
      );
    }),
  );
};
