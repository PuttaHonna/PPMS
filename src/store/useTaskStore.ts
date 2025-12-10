import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { parseTaskInput, estimateTime, generateSubTasks } from '../utils/nli';
import { db, auth } from '../lib/firebase';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import type {
    QuerySnapshot,
    DocumentData,
    FirestoreError
} from 'firebase/firestore';

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    dueDate: Date | null;
    projectId: string;
    isUrgent: boolean;
    isImportant: boolean;
    estimatedTime?: number;
    subTasks?: { id: string; title: string; completed: boolean }[];
    recurrence?: 'daily' | 'weekly' | 'monthly' | null;
    createdAt: Date;
    userId?: string;
    reminderEnabled?: boolean;
    reminderSent?: boolean;
    completedAt?: Date | null;
}

export interface Project {
    id: string;
    name: string;
    color: string;
}

interface TaskState {
    tasks: Task[];
    projects: Project[];
    loading: boolean;
    unsubscribe: (() => void) | null;
    initializeListeners: () => void;
    addTask: (text: string, options?: {
        projectId?: string;
        isUrgent?: boolean;
        isImportant?: boolean;
        subTasks?: string[];
        recurrence?: 'daily' | 'weekly' | 'monthly' | null;
    }) => Promise<void>;
    toggleTask: (id: string) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    toggleSubTask: (taskId: string, subTaskId: string) => Promise<void>;
    addProject: (name: string, color: string) => Promise<void>;
    toggleReminder: (taskId: string) => Promise<void>;
    markReminderSent: (taskId: string) => Promise<void>;
    focusedTaskId: string | null;
    setFocusedTask: (id: string | null) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [],
    projects: [
        { id: 'inbox', name: 'Inbox', color: '#6b7280' },
        { id: 'work', name: 'Work', color: '#3b82f6' },
        { id: 'personal', name: 'Personal', color: '#10b981' },
    ],
    loading: false,
    unsubscribe: null,
    focusedTaskId: null,

    setFocusedTask: (id) => set({ focusedTaskId: id }),
    searchQuery: '',
    setSearchQuery: (query) => set({ searchQuery: query }),

    initializeListeners: () => {
        const { unsubscribe: existingUnsubscribe } = get();
        if (existingUnsubscribe) {
            existingUnsubscribe();
        }

        const user = auth.currentUser;
        if (!user) {
            set({ tasks: [], unsubscribe: null });
            return;
        }

        set({ loading: true });
        const q = query(
            collection(db, 'tasks'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
            const tasks = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title,
                    completed: data.completed,
                    dueDate: data.dueDate ? data.dueDate.toDate() : null,
                    projectId: data.projectId,
                    isUrgent: data.isUrgent,
                    isImportant: data.isImportant,
                    estimatedTime: data.estimatedTime,
                    subTasks: data.subTasks,
                    recurrence: data.recurrence,
                    createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
                    completedAt: data.completedAt ? data.completedAt.toDate() : null,
                    userId: data.userId,
                } as Task;
            });
            set({ tasks, loading: false });
        }, (error: FirestoreError) => {
            console.error("Error fetching tasks: ", error);
            set({ loading: false });
        });

        set({ unsubscribe });
    },

    addTask: async (text, options = {}) => {
        const user = auth.currentUser;
        if (!user) return;

        const {
            projectId = 'inbox',
            isUrgent = false,
            isImportant = false,
            subTasks: manualSubTasks = [],
            recurrence = null
        } = options;

        const { title, dueDate } = parseTaskInput(text);
        const estimatedTime = estimateTime(text);

        // Combine NLP subtasks with manually added ones
        const generatedSubTasks = generateSubTasks(text);
        const allSubTasks = [...generatedSubTasks, ...manualSubTasks].map(st => ({
            id: uuidv4(),
            title: st,
            completed: false
        }));

        const newTask = {
            title,
            completed: false,
            dueDate: dueDate ? Timestamp.fromDate(dueDate) : null,
            projectId,
            isUrgent,
            isImportant,
            estimatedTime,
            subTasks: allSubTasks,
            recurrence,
            createdAt: serverTimestamp(),
            userId: user.uid
        };

        try {
            await addDoc(collection(db, 'tasks'), newTask);
        } catch (error) {
            console.error("Error adding task: ", error);
        }
    },

    toggleTask: async (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;

        const newCompletedStatus = !task.completed;

        try {
            const taskRef = doc(db, 'tasks', id);

            // Handle Recurrence: If completing a recurring task, RESCHEDULE it instead of cloning
            if (newCompletedStatus && task.recurrence) {
                const nextDueDate = new Date();
                // If task had a due date, use that as base. Otherwise use today.
                const baseDate = task.dueDate ? new Date(task.dueDate) : new Date();

                if (task.recurrence === 'daily') nextDueDate.setDate(baseDate.getDate() + 1);
                if (task.recurrence === 'weekly') nextDueDate.setDate(baseDate.getDate() + 7);
                if (task.recurrence === 'monthly') nextDueDate.setMonth(baseDate.getMonth() + 1);

                // Update the EXISTING task
                await updateDoc(taskRef, {
                    completed: false, // Keep it uncompleted (active) for the new date
                    dueDate: Timestamp.fromDate(nextDueDate),
                    reminderSent: false, // Reset reminder
                    subTasks: task.subTasks?.map(st => ({ ...st, completed: false })) || [] // Reset subtasks
                });

                // We don't toggle 'completed' to true because we just rescheduled it.
                // The UI will see it update to the new date.
            } else {
                // Standard behavior for non-recurring tasks
                await updateDoc(taskRef, {
                    completed: newCompletedStatus,
                    completedAt: newCompletedStatus ? serverTimestamp() : null
                });
            }

        } catch (error) {
            console.error("Error toggling task: ", error);
        }
    },

    deleteTask: async (id) => {
        try {
            await deleteDoc(doc(db, 'tasks', id));
        } catch (error) {
            console.error("Error deleting task: ", error);
        }
    },

    updateTask: async (id, updates) => {
        try {
            const taskRef = doc(db, 'tasks', id);
            const firestoreUpdates: any = { ...updates };
            if (updates.dueDate) {
                firestoreUpdates.dueDate = Timestamp.fromDate(updates.dueDate);
            }
            // Remove undefined fields
            Object.keys(firestoreUpdates).forEach(key =>
                firestoreUpdates[key] === undefined && delete firestoreUpdates[key]
            );

            await updateDoc(taskRef, firestoreUpdates);
        } catch (error) {
            console.error("Error updating task: ", error);
        }
    },

    toggleSubTask: async (taskId, subTaskId) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task || !task.subTasks) return;

        const newSubTasks = task.subTasks.map((st) =>
            st.id === subTaskId ? { ...st, completed: !st.completed } : st
        );

        try {
            const taskRef = doc(db, 'tasks', taskId);
            await updateDoc(taskRef, {
                subTasks: newSubTasks
            });
        } catch (error) {
            console.error("Error toggling subtask: ", error);
        }
    },

    addProject: async (name, color) => {
        const user = auth.currentUser;
        if (!user) return;

        const newProject = {
            id: uuidv4(),
            name,
            color,
            userId: user.uid
        };

        set(state => ({ projects: [...state.projects, newProject] }));

        // Persist to Firestore
        try {
            await addDoc(collection(db, 'projects'), newProject);
        } catch (error) {
            console.error("Error adding project: ", error);
        }
    },

    toggleReminder: async (taskId) => {
        const { tasks } = get();
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const updatedTask = { ...task, reminderEnabled: !task.reminderEnabled, reminderSent: false }; // Reset sent status when toggling

        set(state => ({
            tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t)
        }));

        // Persist to Firestore
        try {
            const taskRef = doc(db, 'tasks', taskId);
            await updateDoc(taskRef, {
                reminderEnabled: updatedTask.reminderEnabled,
                reminderSent: false
            });
        } catch (error) {
            console.error("Error toggling reminder: ", error);
        }
    },

    markReminderSent: async (taskId) => {
        set(state => ({
            tasks: state.tasks.map(t => t.id === taskId ? { ...t, reminderSent: true } : t)
        }));

        try {
            const taskRef = doc(db, 'tasks', taskId);
            await updateDoc(taskRef, { reminderSent: true });
        } catch (error) {
            console.error("Error marking reminder sent: ", error);
        }
    }
}));
