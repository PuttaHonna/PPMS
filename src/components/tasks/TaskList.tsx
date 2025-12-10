import React from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import TaskItem from './TaskItem';
import { AnimatePresence, motion } from 'framer-motion';

const TaskList: React.FC = () => {
    const { tasks, focusedTaskId, setFocusedTask, searchQuery } = useTaskStore();

    const visibleTasks = React.useMemo(() => {
        let filtered = [...tasks];

        // Filter by Search Query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
                t.title.toLowerCase().includes(query) ||
                t.subTasks?.some(st => st.title.toLowerCase().includes(query))
            );
        }

        return filtered.sort((a, b) => {
            // Priority 1: Focused Task
            if (a.id === focusedTaskId) return -1;
            if (b.id === focusedTaskId) return 1;

            // Priority 2: Completion Status
            if (a.completed === b.completed) {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            return a.completed ? 1 : -1;
        });
    }, [tasks, focusedTaskId, searchQuery]);

    if (tasks.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400">
                <p>No tasks yet. Add one above!</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <AnimatePresence mode="popLayout">
                {visibleTasks.map((task) => (
                    <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{
                            y: -200,
                            opacity: 0,
                            scale: 0.5,
                            transition: { duration: 0.6, ease: "backIn" }
                        }}
                        onClick={() => {
                            if (task.id === focusedTaskId) {
                                setFocusedTask(null);
                            }
                        }}
                        className={task.id === focusedTaskId ? 'ring-4 ring-greenade-primary ring-offset-2 ring-offset-black/20 rounded-xl shadow-[0_0_30px_rgba(74,222,128,0.5)] transition-all duration-500 relative z-10 cursor-pointer' : ''}
                        title={task.id === focusedTaskId ? "Click to clear highlight" : ""}
                    >
                        <TaskItem task={task} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default TaskList;
