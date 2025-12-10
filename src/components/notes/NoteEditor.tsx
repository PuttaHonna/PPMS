import React, { useState, useRef } from 'react';
import { useNoteStore } from '../../store/useNoteStore';
import { useTaskStore } from '../../store/useTaskStore';
import { Save, X } from 'lucide-react';

interface NoteEditorProps {
    onClose: () => void;
    existingNoteId?: string;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ onClose, existingNoteId }) => {
    const { addNote, updateNote, notes } = useNoteStore();
    const { tasks } = useTaskStore();
    const existingNote = notes.find((n) => n.id === existingNoteId);

    const [title, setTitle] = useState(existingNote?.title || '');
    const [content, setContent] = useState(existingNote?.content || '');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionQuery, setSuggestionQuery] = useState('');
    const [cursorPosition, setCursorPosition] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSave = () => {
        if (!title.trim() && !content.trim()) return;

        if (existingNoteId) {
            updateNote(existingNoteId, { title, content });
        } else {
            addNote(title, content);
        }
        onClose();
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        const newCursorPosition = e.target.selectionStart;
        setContent(newContent);
        setCursorPosition(newCursorPosition);

        // Check for [[ trigger
        const lastTwoChars = newContent.slice(newCursorPosition - 2, newCursorPosition);
        if (lastTwoChars === '[[') {
            setShowSuggestions(true);
            setSuggestionQuery('');
        } else if (showSuggestions) {
            // Find the text after the last [[
            const lastOpenBracketIndex = newContent.lastIndexOf('[[', newCursorPosition);
            if (lastOpenBracketIndex !== -1) {
                const query = newContent.slice(lastOpenBracketIndex + 2, newCursorPosition);
                if (query.includes(']]')) {
                    setShowSuggestions(false);
                } else {
                    setSuggestionQuery(query);
                }
            } else {
                setShowSuggestions(false);
            }
        }
    };

    const insertLink = (linkTitle: string) => {
        if (!textareaRef.current) return;

        const lastOpenBracketIndex = content.lastIndexOf('[[', cursorPosition);
        if (lastOpenBracketIndex !== -1) {
            const newContent =
                content.slice(0, lastOpenBracketIndex) +
                `[[${linkTitle}]]` +
                content.slice(cursorPosition);
            setContent(newContent);
            setShowSuggestions(false);
            // Reset cursor position needs a timeout or effect, simplifying for now
            textareaRef.current.focus();
        }
    };

    const suggestions = [
        ...notes.map(n => ({ id: n.id, title: n.title, type: 'Note' })),
        ...tasks.map(t => ({ id: t.id, title: t.title, type: 'Task' }))
    ].filter(item => item.title.toLowerCase().includes(suggestionQuery.toLowerCase()));

    return (
        <div className="flex flex-col h-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <input
                    type="text"
                    placeholder="Note Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-transparent text-2xl font-bold text-gray-900 placeholder-gray-400 focus:outline-none w-full"
                />
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 p-4 relative">
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={handleContentChange}
                    placeholder="Start typing... Use [[ to link to other notes or tasks"
                    className="w-full h-full bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none resize-none font-mono text-sm leading-relaxed custom-scrollbar"
                />

                {/* Link Suggestions */}
                {showSuggestions && (
                    <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-50 custom-scrollbar">
                        {suggestions.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => insertLink(item.title)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm flex justify-between items-center transition-colors"
                            >
                                <span className="truncate">{item.title}</span>
                                <span className="text-xs text-gray-400 ml-2 capitalize">{item.type}</span>
                            </button>
                        ))}
                        {suggestions.length === 0 && (
                            <div className="px-4 py-2 text-gray-400 text-sm">No matches found</div>
                        )}
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end">
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-medium shadow-lg shadow-cyan-500/20"
                >
                    <Save className="w-4 h-4" />
                    Save Note
                </button>
            </div>
        </div>
    );
};

export default NoteEditor;
