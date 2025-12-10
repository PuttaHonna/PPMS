import React, { useState } from 'react';
import { useNoteStore } from '../../store/useNoteStore';
import { Plus, Search, Trash2 } from 'lucide-react';
import NoteEditor from './NoteEditor';
import ContentRenderer from './ContentRenderer';
import { useUIStore } from '../../store/useUIStore';
import { useTaskStore } from '../../store/useTaskStore';

const NoteList: React.FC = () => {
    const { notes, deleteNote, addNote } = useNoteStore();
    const { tasks } = useTaskStore();
    const { setView } = useUIStore();
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredNotes = notes.filter(
        (note) =>
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isCreating || editingId) {
        return (
            <div className="h-full">
                <NoteEditor
                    onClose={() => {
                        setIsCreating(false);
                        setEditingId(null);
                    }}
                    existingNoteId={editingId || undefined}
                />
            </div>
        );
    }

    const handleLinkClick = (title: string) => {
        // Try to find a note with this title
        const targetNote = notes.find(n => n.title.toLowerCase() === title.toLowerCase());
        if (targetNote) {
            setEditingId(targetNote.id);
            return;
        }

        // Try to find a task
        const targetTask = tasks.find(t => t.title.toLowerCase() === title.toLowerCase());
        if (targetTask) {
            setView('list');
            return;
        }

        // Create a new note if it doesn't exist
        addNote(title, '');
        // We need to wait for the store to update, or just find it immediately if synchronous
        // Since Zustand set is synchronous, we can try to find it immediately, 
        // but we need to fetch the fresh state or trust it's there. 
        // Actually, we can't see the new note in 'notes' variable yet because it's from the previous render.
        // We can use useNoteStore.getState().notes to find the new one.
        const newNotes = useNoteStore.getState().notes;
        const newNote = newNotes.find(n => n.title === title);
        if (newNote) {
            setEditingId(newNote.id);
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Search and New Note button */}
            <div className="flex items-center justify-between gap-4 shrink-0">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/60 backdrop-blur-md border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-sm"
                    />
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition-colors font-medium shadow-lg shadow-cyan-500/20"
                >
                    <Plus className="w-4 h-4" />
                    New Note
                </button>
            </div>

            {/* Note cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar pr-2 pb-4">
                {filteredNotes.map((note) => (
                    <div
                        key={note.id}
                        onClick={() => setEditingId(note.id)}
                        className="group relative p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-gray-200 hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-500/5 transition-all cursor-pointer"
                    >
                        <div className="absolute top-2 right-2 flex gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNote(note.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{note.title || 'Untitled Note'}</h3>
                        <ContentRenderer content={note.content || 'No content'} onLinkClick={handleLinkClick} />
                        <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
                {filteredNotes.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-400">
                        <p>No notes found. Create one to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NoteList;
