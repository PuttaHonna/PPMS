import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
}

interface NoteState {
    notes: Note[];
    addNote: (title: string, content: string) => void;
    updateNote: (id: string, updates: Partial<Note>) => void;
    deleteNote: (id: string) => void;
}

export const useNoteStore = create<NoteState>()(
    persist(
        (set) => ({
            notes: [],
            addNote: (title, content) =>
                set((state) => ({
                    notes: [
                        ...state.notes,
                        {
                            id: uuidv4(),
                            title,
                            content,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            tags: [],
                        },
                    ],
                })),
            updateNote: (id, updates) =>
                set((state) => ({
                    notes: state.notes.map((n) =>
                        n.id === id ? { ...n, ...updates, updatedAt: new Date() } : n
                    ),
                })),
            deleteNote: (id) =>
                set((state) => ({
                    notes: state.notes.filter((n) => n.id !== id),
                })),
        }),
        {
            name: 'note-storage',
        }
    )
);
