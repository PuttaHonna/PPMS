import { create } from 'zustand';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, updateDoc, onSnapshot, runTransaction } from 'firebase/firestore';
import type { Task } from './useTaskStore';

interface GameState {
    xp: number;
    level: number;
    streak: number;
    lastTaskDate: string | null; // ISO Date string
    loading: boolean;
    initialize: (uid: string) => void;
    addXp: (amount: number) => Promise<void>;
    checkStreak: () => Promise<void>;
    visualTrigger: number;
    triggerVisualReward: () => void;
    spendXp: (amount: number) => Promise<boolean>;
    unsubscribe: (() => void) | null;
    syncWithTasks: (tasks: Task[]) => Promise<void>;
}

// Leveling Config
const BASE_XP = 100;
const XP_MULTIPLIER = 1.5;

function calculateLevelAndXp(totalXp: number) {
    let level = 1;
    let currentXp = totalXp;

    // Safety break to prevent infinite loops in case of high XP
    while (true) {
        const xpToNextLevel = Math.floor(BASE_XP * Math.pow(XP_MULTIPLIER, level - 1));
        if (currentXp >= xpToNextLevel) {
            currentXp -= xpToNextLevel;
            level++;
        } else {
            break;
        }
    }

    return { level, currentXp };
}

export const useGameStore = create<GameState>((set, get) => ({
    xp: 0,
    level: 1,
    streak: 0,
    lastTaskDate: null,
    loading: false,
    visualTrigger: 0,

    unsubscribe: null as (() => void) | null,

    triggerVisualReward: () => set({ visualTrigger: Date.now() }),

    syncWithTasks: async (tasks: Task[]) => {
        const user = auth.currentUser;
        if (!user) return;

        // Calculate Total XP from scratch
        let totalXp = 0;

        tasks.forEach(task => {
            if (task.completed) {
                totalXp += 10;
            }
            if (task.subTasks) {
                task.subTasks.forEach(st => {
                    if (st.completed) {
                        totalXp += 2;
                    }
                });
            }
        });

        // Convert Total XP to Level and Current XP
        const { level, currentXp } = calculateLevelAndXp(totalXp);

        // Force update Firestore
        const userRef = doc(db, 'users', user.uid);
        try {
            await updateDoc(userRef, {
                xp: currentXp,
                level: level
            });
            console.log("XP Synced with Tasks:", { totalXp, level, currentXp });
        } catch (error) {
            console.error("Error syncing XP:", error);
        }
    },

    initialize: (uid: string) => {
        // Cleanup previous listener
        const { unsubscribe } = get();
        if (unsubscribe) unsubscribe();

        if (!uid) return;

        set({ loading: true });
        const userRef = doc(db, 'users', uid);

        // Real-time listener for game stats
        const unsub = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                set({
                    xp: data.xp || 0,
                    level: data.level || 1,
                    streak: data.streak || 0,
                    lastTaskDate: data.lastTaskDate || null,
                    loading: false
                });
            } else {
                // Initialize user doc if it doesn't exist
                setDoc(userRef, {
                    xp: 0,
                    level: 1,
                    streak: 0,
                    lastTaskDate: null
                }, { merge: true });
                set({ loading: false });
            }
        }, (error) => {
            console.error("Game Store Listener Error:", error);
            set({ loading: false });
        });

        set({ unsubscribe: unsub });
    },

    addXp: async (amount) => {
        const user = auth.currentUser;
        if (!user) return;

        const userRef = doc(db, 'users', user.uid);

        try {
            await runTransaction(db, async (transaction) => {
                const sfDoc = await transaction.get(userRef);
                if (!sfDoc.exists()) {
                    // Initialize if missing
                    transaction.set(userRef, {
                        xp: amount,
                        level: 1,
                        streak: 0,
                        lastTaskDate: null
                    });
                    return;
                }

                const data = sfDoc.data();
                const currentXp = data.xp || 0;
                let currentLevel = data.level || 1;

                let newXp = currentXp + amount;

                // Level Up Logic
                const xpToNextLevel = Math.floor(BASE_XP * Math.pow(XP_MULTIPLIER, currentLevel - 1));

                if (newXp >= xpToNextLevel) {
                    newXp -= xpToNextLevel;
                    currentLevel++;
                    // Could trigger level up alert here if we could return from transaction
                }

                transaction.update(userRef, { xp: newXp, level: currentLevel });
            });
        } catch (error) {
            console.error("Error adding XP transaction:", error);
        }
    },

    checkStreak: async () => {
        const user = auth.currentUser;
        if (!user) return;

        const { lastTaskDate, streak } = get();
        const today = new Date().toISOString().split('T')[0];

        if (lastTaskDate === today) return; // Already updated for today

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];

        let newStreak = streak;

        if (lastTaskDate === yesterdayString) {
            newStreak++; // Continue streak
        } else if (!lastTaskDate) {
            newStreak = 1; // First task ever
        } else {
            newStreak = 1; // Streak broken, restart
        }

        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                streak: newStreak,
                lastTaskDate: today
            });
        } catch (error) {
            console.error("Error updating streak:", error);
        }
    },

    spendXp: async (amount) => {
        const user = auth.currentUser;
        if (!user) return false;

        const { xp } = get();
        if (xp < amount) return false;

        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                xp: xp - amount
            });
            return true;
        } catch (error) {
            console.error("Error spending XP:", error);
            return false;
        }
    }
}));
