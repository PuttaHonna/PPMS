import { useState } from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { motion, AnimatePresence } from 'framer-motion';
import TaskModal from './TaskModal';

import { clsx } from 'clsx';

interface MissionStatusProps {
    className?: string;
}

export default function MissionStatus({ className }: MissionStatusProps) {
    const tasks = useTaskStore(state => state.tasks);
    const [selectedType, setSelectedType] = useState<'total' | 'done' | 'active' | null>(null);

    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const active = total - done;
    const progress = total === 0 ? 0 : Math.round((done / total) * 100);

    const getTasksForType = () => {
        switch (selectedType) {
            case 'done': return tasks.filter(t => t.completed);
            case 'active': return tasks.filter(t => !t.completed);
            case 'total': return tasks;
            default: return [];
        }
    };

    return (
        <>
            <div className={clsx("bg-gray-800/80 backdrop-blur-md p-4 rounded-xl text-white shadow-xl border border-gray-700", className)}>
                <div className="flex justify-between items-end mb-2">
                    <h2 className="text-cyan-400 font-bold tracking-wider text-xs">STATUS</h2>
                    <span className="text-2xl font-bold">{progress}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-gray-700 rounded-full mb-4 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-green-400 to-blue-500"
                    />
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <StatBox label="Total" value={total} onClick={() => setSelectedType('total')} color="text-blue-400" />
                    <StatBox label="Done" value={done} onClick={() => setSelectedType('done')} color="text-green-400" />
                    <StatBox label="Active" value={active} onClick={() => setSelectedType('active')} color="text-orange-400" />
                </div>
            </div>

            <AnimatePresence>
                {selectedType && (
                    <TaskModal
                        type={selectedType}
                        tasks={getTasksForType()}
                        onClose={() => setSelectedType(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

interface StatBoxProps {
    label: string;
    value: number;
    onClick: () => void;
    color: string;
}

function StatBox({ label, value, onClick, color }: StatBoxProps) {
    return (
        <button
            onClick={onClick}
            className="bg-gray-700/50 hover:bg-gray-700 p-2 rounded-lg flex flex-col items-center transition-all hover:scale-105 active:scale-95"
        >
            <span className={`text-lg font-bold ${color}`}>{value}</span>
            <span className="text-[10px] text-gray-400 mt-0.5 font-medium uppercase">{label}</span>
        </button>
    )
}
