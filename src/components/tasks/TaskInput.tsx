import { useState, useEffect } from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { parseTaskInput, estimateTime } from '../../utils/nli';
import { Calendar, Plus, Repeat } from 'lucide-react';

export default function TaskInput() {
    const [input, setInput] = useState('');
    const addTask = useTaskStore((state) => state.addTask);
    const [showOptions, setShowOptions] = useState(false);
    const [preview, setPreview] = useState<{ date: Date | null; isRecurring: boolean; estimatedTime: number } | null>(null);
    const [subtasks, setSubtasks] = useState<string[]>([]);
    const [recurrence, setRecurrence] = useState<'daily' | 'weekly' | 'monthly' | null>(null);

    useEffect(() => {
        if (input.trim()) {
            const { dueDate, isRecurring } = parseTaskInput(input);
            const estimatedTime = estimateTime(input);
            if (dueDate || isRecurring || estimatedTime) {
                setPreview({ date: dueDate, isRecurring, estimatedTime });
            } else {
                setPreview(null);
            }
        } else {
            setPreview(null);
        }
    }, [input]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Capture current state before async operation
        const currentSubtasks = [...subtasks];
        const currentRecurrence = recurrence;

        await addTask(input, { subTasks: currentSubtasks, recurrence: currentRecurrence });

        setInput('');
        setPreview(null);
        setShowOptions(false);
        setSubtasks([]);
        setRecurrence(null);
    };

    const handleOptionClick = async (type: 'do_first' | 'schedule' | 'delegate' | 'eliminate') => {
        if (!input.trim()) return;

        // Capture current state
        const currentSubtasks = [...subtasks];
        const currentRecurrence = recurrence;

        switch (type) {
            case 'do_first':
                await addTask(input, { isUrgent: true, isImportant: true, subTasks: currentSubtasks, recurrence: currentRecurrence });
                break;
            case 'schedule':
                await addTask(input, { isUrgent: false, isImportant: true, subTasks: currentSubtasks, recurrence: currentRecurrence });
                break;
            case 'delegate':
                await addTask(input, { isUrgent: true, isImportant: false, subTasks: currentSubtasks, recurrence: currentRecurrence });
                break;
            case 'eliminate':
                await addTask(input, { isUrgent: false, isImportant: false, subTasks: currentSubtasks, recurrence: currentRecurrence });
                break;
        }

        setInput('');
        setPreview(null);
        setShowOptions(false);
        setSubtasks([]);
        setRecurrence(null);
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto z-20">
            <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute inset-0 bg-greenade-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="DEPLOY NEW TASK..."
                    className="w-full px-6 py-4 bg-greenade-secondary/30 backdrop-blur-md text-white placeholder-greenade-accent/40 border-b-2 border-greenade-accent/20 focus:outline-none focus:border-greenade-primary focus:bg-greenade-secondary/50 transition-all font-display tracking-wider uppercase text-lg skew-x-[-5deg]"
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                    <button
                        type="button"
                        onClick={() => setShowOptions(!showOptions)}
                        disabled={!input.trim()}
                        className="p-2 bg-greenade-primary text-white opacity-0 group-hover:opacity-100 transition-all disabled:opacity-0 hover:bg-greenade-accent hover:text-greenade-background shadow-lg skew-x-[-5deg]"
                    >
                        <Plus className={`w-5 h-5 skew-x-[5deg] transition-transform ${showOptions ? 'rotate-45' : ''}`} />
                    </button>
                </div>

                {/* Options Dropdown */}
                {showOptions && input.trim() && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-greenade-secondary/95 backdrop-blur-xl border border-greenade-accent/20 shadow-xl skew-x-[-5deg] overflow-hidden animate-in fade-in slide-in-from-top-2 z-30 p-2">
                        {/* Priority Selection */}
                        <div className="grid grid-cols-2 gap-1 mb-2">
                            <button
                                type="button"
                                onClick={() => handleOptionClick('do_first')}
                                className="text-left px-3 py-2 text-white hover:bg-greenade-primary/20 hover:text-greenade-accent transition-colors flex items-center gap-2 rounded"
                            >
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                <span className="font-display tracking-wide text-xs skew-x-[5deg]">Do First</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleOptionClick('schedule')}
                                className="text-left px-3 py-2 text-white hover:bg-blue-500/20 hover:text-blue-400 transition-colors flex items-center gap-2 rounded"
                            >
                                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                <span className="font-display tracking-wide text-xs skew-x-[5deg]">Schedule</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleOptionClick('delegate')}
                                className="text-left px-3 py-2 text-white hover:bg-yellow-500/20 hover:text-yellow-400 transition-colors flex items-center gap-2 rounded"
                            >
                                <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                                <span className="font-display tracking-wide text-xs skew-x-[5deg]">Delegate</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleOptionClick('eliminate')}
                                className="text-left px-3 py-2 text-white hover:bg-red-500/20 hover:text-red-400 transition-colors flex items-center gap-2 rounded"
                            >
                                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                <span className="font-display tracking-wide text-xs skew-x-[5deg]">Eliminate</span>
                            </button>
                        </div>

                        <div className="h-px bg-white/10 my-2" />

                        {/* Recurrence Selection */}
                        <div className="mb-2">
                            <label className="text-xs text-gray-400 mb-1 block px-1">Recurrence</label>
                            <select
                                onChange={(e) => setRecurrence(e.target.value as any)}
                                className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-greenade-primary"
                            >
                                <option value="">None</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>

                        {/* Subtasks Input */}
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block px-1">Subtasks</label>
                            <div className="space-y-1">
                                {subtasks.map((st, i) => (
                                    <div key={i} className="text-xs text-white px-2 py-1 bg-white/5 rounded flex justify-between">
                                        <span>{st}</span>
                                        <button type="button" onClick={() => setSubtasks(subtasks.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300">×</button>
                                    </div>
                                ))}
                                <div className="flex gap-1">
                                    <input
                                        type="text"
                                        placeholder="Add subtask..."
                                        className="flex-1 bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-greenade-primary"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const val = (e.target as HTMLInputElement).value.trim();
                                                if (val) {
                                                    setSubtasks([...subtasks, val]);
                                                    (e.target as HTMLInputElement).value = '';
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </form>

            {/* Smart Input Preview */}
            {preview && (
                <div className="absolute top-full left-0 mt-2 flex items-center gap-4 text-sm text-greenade-accent bg-greenade-secondary/90 backdrop-blur-md px-4 py-2 border border-greenade-accent/20 shadow-lg animate-in fade-in slide-in-from-top-2 skew-x-[-5deg] z-10">
                    {preview.date && (
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>{preview.date.toLocaleString()}</span>
                        </div>
                    )}
                    {preview.isRecurring && (
                        <div className="flex items-center gap-1.5 text-pink-500">
                            <Repeat className="w-4 h-4" />
                            <span>Recurring</span>
                        </div>
                    )}
                    {preview.estimatedTime && (
                        <div className="flex items-center gap-1.5 text-green-600">
                            <span className="font-mono">~{preview.estimatedTime}m</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
