import emailjs from '@emailjs/browser';
import type { Task } from '../store/useTaskStore';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const initEmail = () => {
    if (PUBLIC_KEY) {
        emailjs.init(PUBLIC_KEY);
    }
};

export const sendTaskReminder = async (task: Task, userEmail: string) => {
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
        console.warn('EmailJS not configured. Please set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY in your .env file.');
        return false;
    }

    try {
        const templateParams = {
            to_email: userEmail,
            task_title: task.title,
            due_date: task.dueDate ? new Date(task.dueDate).toLocaleString() : 'No due date',
            task_link: window.location.href, // Link to the dashboard
        };

        const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
        console.log('Email sent successfully!', response.status, response.text);
        return true;
    } catch (error) {
        console.error('Failed to send email:', error);
        return false;
    }
};
