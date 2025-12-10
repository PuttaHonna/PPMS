import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useTaskStore, type Task } from '../../store/useTaskStore';
import { Check, Trash2, Calendar, AlertCircle, Star, Repeat, Bell, BellOff, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { triggerCelebration } from '../../utils/confetti';

interface TaskItemProps {
    task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
    const { toggleTask, deleteTask, updateTask, toggleSubTask, toggleReminder } = useTaskStore();
    const { addXp, checkStreak, triggerVisualReward } = useGameStore();

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDueDate, setEditDueDate] = useState<string>(
        task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    );
    const [editSubTasks, setEditSubTasks] = useState(task.subTasks || []);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (editTitle.trim()) {
            updateTask(task.id, {
                title: editTitle.trim(),
                dueDate: editDueDate ? new Date(editDueDate) : null,
                subTasks: editSubTasks
            });
            setIsEditing(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') {
            // Reset state
            setEditTitle(task.title);
            setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
            setEditSubTasks(task.subTasks || []);
            setIsEditing(false);
        }
    };

    const updateSubTaskTitle = (id: string, newTitle: string) => {
        setEditSubTasks(prev => prev.map(st =>
            st.id === id ? { ...st, title: newTitle } : st
        ));
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            className={clsx(
                'group relative p-4 border backdrop-blur-md transition-all duration-300 skew-x-[-5deg] overflow-hidden',
                'bg-greenade-secondary/40 border-greenade-accent/20 shadow-lg hover:shadow-greenade-primary/30 hover:border-greenade-primary/50',
                task.completed ? 'opacity-60' : 'opacity-100'
            )}
        >
            <div className="flex items-center gap-4 skew-x-[5deg]">
                <button
                    onClick={() => {
                        if (!task.completed) {
                            triggerCelebration();
                            addXp(10); // 10 XP per task
                            checkStreak();
                            triggerVisualReward();
                        } else {
                            addXp(-10); // Subtract 10 XP if unchecking
                        }
                        toggleTask(task.id);
                    }}
                    className={clsx(
                        "flex items-center justify-center w-6 h-6 border-2 transition-all duration-300 shrink-0",
                        task.completed
                            ? "bg-greenade-primary border-greenade-primary text-white"
                            : "border-greenade-accent/40 hover:border-greenade-primary text-transparent hover:text-greenade-primary"
                    )}
                >
                    <Check className={clsx(
                        "w-4 h-4 transition-all duration-300",
                        task.completed ? "opacity-100 scale-100" : "opacity-0 scale-50"
                    )} />
                </button>

                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <div className="flex flex-col gap-2">
                            {/* Title Input */}
                            <input
                                ref={inputRef}
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full bg-black/20 border border-greenade-primary/50 rounded px-2 py-1 text-white font-display text-xl tracking-wide focus:outline-none focus:ring-1 focus:ring-greenade-primary"
                                placeholder="Task Title"
                            />
                            {/* Date Input */}
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-greenade-primary" />
                                <input
                                    type="date"
                                    value={editDueDate}
                                    onChange={(e) => setEditDueDate(e.target.value)}
                                    className="bg-black/20 border border-greenade-primary/30 rounded px-2 py-1 text-xs text-white/80 focus:outline-none focus:ring-1 focus:ring-greenade-primary [color-scheme:dark]"
                                />
                            </div>
                        </div>
                    ) : (
                        <h3 className={clsx(
                            'font-display text-xl tracking-wide transition-colors uppercase truncate',
                            task.completed ? 'text-greenade-accent/40 line-through' : 'text-white group-hover:text-greenade-accent'
                        )}>
                            {task.title}
                        </h3>
                    )}

                    {!isEditing && (
                        <div className="flex items-center gap-3 mt-1 text-xs text-greenade-accent/70 font-sans">
                            {task.dueDate && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                </div>
                            )}
                            {task.estimatedTime && (
                                <span className="font-mono text-greenade-primary">~{task.estimatedTime}m</span>
                            )}
                            {task.recurrence && (
                                <div className="flex items-center gap-1 text-pink-400">
                                    <Repeat className="w-3 h-3" />
                                    <span className="capitalize">{task.recurrence}</span>
                                </div>
                            )}
                            {task.isUrgent && (
                                <span className="text-red-400 font-bold uppercase tracking-wider">Urgent</span>
                            )}
                            {task.subTasks && task.subTasks.length > 0 && (
                                <div className="flex items-center gap-1 text-blue-400">
                                    <span className="font-mono">
                                        {task.subTasks.length - task.subTasks.filter(st => st.completed).length} Left
                                    </span>
                                </div>
                            )}
                            <span className="text-greenade-accent/60 bg-greenade-secondary/50 px-1 py-0.5 rounded text-[10px] border border-greenade-accent/20">
                                +{10 + (task.subTasks?.length || 0) * 2} XP
                            </span>
                            {task.completed && task.completedAt && (
                                <span className="font-mono text-[10px] text-yellow-400 bg-yellow-400/10 px-1 py-0.5 rounded border border-yellow-400/20" title="Time taken to complete">
                                    ⚡ {(() => {
                                        const ms = Math.max(0, new Date(task.completedAt).getTime() - new Date(task.createdAt).getTime());
                                        if (ms < 1000) return `${ms}ms`;
                                        if (ms < 60000) return `${(ms / 1000).toFixed(0)} secs`;
                                        if (ms < 3600000) return `${Math.floor(ms / 60000)} mins`;
                                        return `${(ms / 3600000).toFixed(1)} hrs`;
                                    })()}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isEditing ? (
                        <button
                            onClick={() => {
                                setEditTitle(task.title);
                                setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
                                setEditSubTasks(task.subTasks || []);
                                setIsEditing(true);
                            }}
                            className="p-2 text-white/80 hover:bg-white/10 hover:text-greenade-primary rounded-lg transition-colors"
                            title="Edit Task"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            className="p-2 text-greenade-primary hover:bg-greenade-primary/10 rounded-lg transition-colors"
                            title="Save"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={() => updateTask(task.id, { isUrgent: !task.isUrgent })}
                        className={clsx(
                            "p-2 rounded-lg transition-colors",
                            task.isUrgent ? "text-red-500 bg-red-100" : "text-white/80 hover:bg-white/10 hover:text-white"
                        )}
                        title="Toggle Urgent"
                    >
                        <AlertCircle className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => updateTask(task.id, { isImportant: !task.isImportant })}
                        className={clsx(
                            "p-2 rounded-lg transition-colors",
                            task.isImportant ? "text-yellow-500 bg-yellow-100" : "text-white/80 hover:bg-white/10 hover:text-white"
                        )}
                        title="Toggle Important"
                    >
                        <Star className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => toggleReminder(task.id)}
                        className={clsx(
                            "p-2 rounded-lg transition-colors",
                            task.reminderEnabled ? "text-yellow-500 bg-yellow-100" : "text-white/80 hover:bg-white/10 hover:text-white"
                        )}
                        title={task.reminderEnabled ? "Turn off reminder" : "Turn on reminder"}
                    >
                        {task.reminderEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-white/80 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Sub-tasks */}
            {task.subTasks && task.subTasks.length > 0 && !task.completed && (
                <div className="mt-4 pl-10 space-y-2 skew-x-[5deg]">
                    {/* Progress Bar */}
                    <div className="h-1 w-full bg-greenade-secondary/50 rounded-full overflow-hidden mb-3">
                        <div
                            className="h-full bg-greenade-primary transition-all duration-300"
                            style={{ width: `${(task.subTasks.filter(st => st.completed).length / task.subTasks.length) * 100}%` }}
                        />
                    </div>

                    {isEditing ? (
                        // Edit Mode: Subtask Inputs
                        <div className="space-y-2">
                            {editSubTasks.map((subTask) => (
                                <div key={subTask.id} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={subTask.title}
                                        onChange={(e) => updateSubTaskTitle(subTask.id, e.target.value)}
                                        className="w-full bg-black/10 border border-greenade-accent/30 rounded px-2 py-1 text-sm text-white/90 focus:outline-none focus:ring-1 focus:ring-greenade-primary"
                                        placeholder="Subtask Title"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        // View Mode: Subtask List
                        task.subTasks.map((subTask) => (
                            <div key={subTask.id} className="flex items-center gap-3 text-sm group/sub">
                                <button
                                    onClick={() => {
                                        if (!subTask.completed) {
                                            addXp(2);
                                        } else {
                                            addXp(-2);
                                        }
                                        toggleSubTask(task.id, subTask.id);
                                    }}
                                    className={clsx(
                                        "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                        subTask.completed
                                            ? "bg-greenade-primary border-greenade-primary text-white"
                                            : "border-greenade-accent/40 hover:border-greenade-primary"
                                    )}
                                >
                                    <Check className={clsx(
                                        "w-3 h-3 transition-all duration-300",
                                        subTask.completed ? "opacity-100 scale-100" : "opacity-0 scale-50"
                                    )} />
                                </button>
                                <span className={clsx(
                                    "transition-colors",
                                    subTask.completed ? "text-greenade-accent/40 line-through" : "text-greenade-accent/80"
                                )}>
                                    {subTask.title}
                                </span>
                                {!subTask.completed && (
                                    <span className="text-greenade-accent bg-greenade-secondary/40 px-1.5 py-0.5 rounded text-[10px] ml-auto border border-greenade-accent/20">
                                        +2 XP
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </motion.div>
    );
}
