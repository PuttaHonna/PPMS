import React from 'react';
import { useTaskStore, type Task } from '../../store/useTaskStore';
import { clsx } from 'clsx';

const MatrixQuadrant: React.FC<{
    title: string;
    tasks: Task[];
    color: string;
    className?: string;
}> = ({ title, tasks, color, className }) => (
    <div className={clsx("p-3 rounded-xl bg-white/60 backdrop-blur-md border border-white/40 flex flex-col h-full shadow-sm", className)}>
        <h3 className={clsx("font-bold mb-2 flex items-center gap-2 text-sm uppercase tracking-wide", color)}>
            {title}
            <span className="text-[10px] font-normal opacity-60 bg-black/5 px-1.5 py-0.5 rounded-full text-gray-600">
                {tasks.length}
            </span>
        </h3>
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 matrix-scrollbar">
            {tasks.map(task => (
                <div key={task.id} className="p-2 bg-white/50 rounded-md text-xs font-medium text-gray-700 hover:bg-white/80 transition-colors border border-white/20 shadow-sm">
                    {task.title}
                </div>
            ))}
            {tasks.length === 0 && (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                    Empty
                </div>
            )}
        </div>
    </div>
);

const EisenhowerMatrix: React.FC = () => {
    const { tasks } = useTaskStore();

    const urgentImportant = tasks.filter(t => t.isUrgent && t.isImportant && !t.completed);
    const notUrgentImportant = tasks.filter(t => !t.isUrgent && t.isImportant && !t.completed);
    const urgentNotImportant = tasks.filter(t => t.isUrgent && !t.isImportant && !t.completed);
    const notUrgentNotImportant = tasks.filter(t => !t.isUrgent && !t.isImportant && !t.completed);

    return (
        <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full min-h-0">
            <MatrixQuadrant
                title="Do First"
                tasks={urgentImportant}
                color="text-red-600"
                className="bg-red-50/50 border-red-100/50"
            />
            <MatrixQuadrant
                title="Schedule"
                tasks={notUrgentImportant}
                color="text-blue-600"
                className="bg-blue-50/50 border-blue-100/50"
            />
            <MatrixQuadrant
                title="Delegate"
                tasks={urgentNotImportant}
                color="text-yellow-600"
                className="bg-yellow-50/50 border-yellow-100/50"
            />
            <MatrixQuadrant
                title="Eliminate"
                tasks={notUrgentNotImportant}
                color="text-gray-600"
                className="bg-gray-50/50 border-gray-100/50"
            />
        </div>
    );
};

export default EisenhowerMatrix;
