import cron from 'node-cron';
import { sendFollowUpReminders, sendWeeklySummary } from '../services/notificationService';

/**
 * Initialize notification schedulers
 */
export const initNotificationSchedulers = (): void => {
  // Schedule follow-up reminders to run daily at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Running scheduled job: Sending follow-up reminders');
    await sendFollowUpReminders();
  });

  // Schedule weekly summary emails to be sent every Monday at 8:00 AM
  cron.schedule('0 8 * * 1', async () => {
    console.log('Running scheduled job: Sending weekly application summaries');
    await sendWeeklySummary();
  });

  console.log('Notification schedulers initialized');
}; 