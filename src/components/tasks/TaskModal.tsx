import { motion } from 'framer-motion';
import { X, Bell, BellOff } from 'lucide-react';
import { useTaskStore, type Task } from '../../store/useTaskStore';

interface TaskModalProps {
    type: string;
    tasks: Task[];
    onClose: () => void;
}

export default function TaskModal({ type, tasks, onClose }: TaskModalProps) {
    const { toggleReminder } = useTaskStore();
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none" onClick={onClose}>
            {/* Backdrop - optional, keeping it transparent/clickable to close */}
            <div className="absolute inset-0 pointer-events-auto bg-black/20 backdrop-blur-sm" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-md max-h-[70vh] bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden border border-gray-700 pointer-events-auto flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-3 border-b border-gray-800 flex justify-between items-center shrink-0 bg-gray-900 z-10 relative">
                    <h3 className="text-xl font-bold text-white capitalize">{type} Tasks</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="px-3 py-2 bg-gray-800/50 border-b border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0">
                    {type} Task
                </div>
                <div className="p-3 flex-1 overflow-y-auto custom-scrollbar pb-8">
                    {tasks.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No tasks found.</p>
                    ) : (
                        <div className="space-y-2">
                            {tasks.map(task => (
                                <div key={task.id} className="p-3 bg-gray-800 rounded-lg border border-gray-700 flex items-center gap-3 hover:bg-gray-750 transition-colors group">
                                    <div className={`w-3 h-3 rounded-full shrink-0 ${task.completed ? 'bg-green-500' : 'bg-orange-500'}`} />
                                    <span className={`text-gray-200 flex-1 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                                        {task.title}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleReminder(task.id);
                                        }}
                                        className={`p-1.5 rounded-full transition-colors ${task.reminderEnabled ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-600 hover:text-gray-400 opacity-0 group-hover:opacity-100'}`}
                                        title={task.reminderEnabled ? "Reminder on" : "Turn on reminder"}
                                    >
                                        {task.reminderEnabled ? <Bell size={14} /> : <BellOff size={14} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
