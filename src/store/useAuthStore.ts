import { create } from 'zustand';
import { auth } from '../lib/firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile as updateFirebaseProfile
} from 'firebase/auth';

interface User {
    id: string;
    email?: string;
    username?: string;
    bio?: string;
    avatarUrl?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ error?: any }>;
    signup: (email: string, password: string, username: string) => Promise<{ error?: any }>;
    logout: () => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<void>;
    uploadAvatar: (file: File) => Promise<void>;
    initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    loading: true,

    initialize: async () => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                set({
                    user: {
                        id: user.uid,
                        email: user.email || '',
                        username: user.displayName || 'User',
                        avatarUrl: user.photoURL || undefined,
                    },
                    isAuthenticated: true,
                    loading: false,
                });
            } else {
                set({ user: null, isAuthenticated: false, loading: false });
            }
        });
    },

    login: async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return {};
        } catch (error: any) {
            console.error('Login error:', error);
            return { error };
        }
    },

    signup: async (email, password, username) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateFirebaseProfile(userCredential.user, {
                displayName: username
            });
            return {};
        } catch (error: any) {
            console.error('Signup error:', error);
            return { error };
        }
    },

    logout: async () => {
        await signOut(auth);
        set({ user: null, isAuthenticated: false });
    },

    updateProfile: async (updates) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // Update local state
        set((state) => ({
            user: state.user ? { ...state.user, ...updates } : null,
        }));

        if (updates.username) {
            try {
                await updateFirebaseProfile(currentUser, {
                    displayName: updates.username
                });
            } catch (error) {
                console.error("Error updating profile: ", error);
            }
        }
    },

    uploadAvatar: async (file: File) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        try {
            const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
            const { storage } = await import('../lib/firebase');

            const storageRef = ref(storage, `avatars/${currentUser.uid}`);
            await uploadBytes(storageRef, file);
            const photoURL = await getDownloadURL(storageRef);

            await updateFirebaseProfile(currentUser, { photoURL });

            set((state) => ({
                user: state.user ? { ...state.user, avatarUrl: photoURL } : null
            }));
        } catch (error) {
            console.error("Error uploading avatar: ", error);
            throw error;
        }
    }
}));
