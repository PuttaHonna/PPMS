import { useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { sendTaskReminder, initEmail } from '../services/emailService';
import { auth } from '../lib/firebase';

export const useTaskReminders = () => {
    const { tasks, markReminderSent } = useTaskStore();

    useEffect(() => {
        initEmail();

        const checkReminders = async () => {
            const user = auth.currentUser;
            if (!user || !user.email) return;

            const now = new Date();

            tasks.forEach(async (task) => {
                if (
                    task.reminderEnabled &&
                    !task.reminderSent &&
                    task.dueDate
                ) {
                    const dueDate = new Date(task.dueDate);
                    const timeDiff = dueDate.getTime() - now.getTime();

                    // Send reminder if due within 1 hour (3600000 ms) or overdue
                    // But don't send if it's way past due (e.g., > 24 hours ago) to avoid spamming old tasks
                    const isDueSoon = timeDiff <= 3600000 && timeDiff > -86400000;

                    if (isDueSoon && user.email) {
                        const success = await sendTaskReminder(task, user.email);
                        if (success) {
                            markReminderSent(task.id);
                        }
                    }
                }
            });
        };

        // Check every minute
        const intervalId = setInterval(checkReminders, 60000);

        // Initial check
        checkReminders();

        return () => clearInterval(intervalId);
    }, [tasks, markReminderSent]);
};
