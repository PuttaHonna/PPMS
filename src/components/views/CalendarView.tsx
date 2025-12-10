import React, { useState, useMemo } from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Circle, FileText } from 'lucide-react';

import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarView: React.FC = () => {
    const { tasks, toggleTask } = useTaskStore();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    // Calendar Logic
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const prevMonthDays = new Date(year, month, 0).getDate();

    // Navigation
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const goToToday = () => {
        const now = new Date();
        setCurrentDate(now);
        setSelectedDate(now);
    };

    // Filter tasks for the month
    const tasksInMonth = useMemo(() => {
        return tasks.filter(task => {
            if (!task.dueDate) return false;
            const d = new Date(task.dueDate);
            return d.getMonth() === month && d.getFullYear() === year;
        });
    }, [tasks, month, year]);

    // Get tasks for a specific day
    const getTasksForDay = (day: number) => {
        return tasksInMonth.filter(task => {
            const d = new Date(task.dueDate!); // Checked in filter
            return d.getDate() === day;
        });
    };

    // Grid Generation
    const days = [];

    // Previous month filler
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push({
            day: prevMonthDays - firstDayOfMonth + 1 + i,
            currentMonth: false,
            date: new Date(year, month - 1, prevMonthDays - firstDayOfMonth + 1 + i)
        });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({
            day: i,
            currentMonth: true,
            date: new Date(year, month, i)
        });
    }

    // Next month filler
    const remainingCells = 42 - days.length; // 6 rows * 7 cols
    for (let i = 1; i <= remainingCells; i++) {
        days.push({
            day: i,
            currentMonth: false,
            date: new Date(year, month + 1, i)
        });
    }

    // Selected Date Tasks
    const selectedDateTasks = useMemo(() => {
        if (!selectedDate) return [];
        return tasks.filter(task => {
            if (!task.dueDate) return false;
            const d = new Date(task.dueDate);
            return (
                d.getDate() === selectedDate.getDate() &&
                d.getMonth() === selectedDate.getMonth() &&
                d.getFullYear() === selectedDate.getFullYear()
            );
        });
    }, [tasks, selectedDate]);

    return (
        <div className="flex h-full gap-6">
            {/* Calendar Grid Section */}
            <div className="flex-1 flex flex-col bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm border border-white/60 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-display font-bold text-gray-800">
                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button
                            onClick={goToToday}
                            className="text-xs font-medium px-3 py-1 bg-greenade-primary/10 text-greenade-primary rounded-full hover:bg-greenade-primary/20 transition-colors"
                        >
                            Today
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
                    {DAYS_OF_WEEK.map(day => (
                        <div key={day} className="py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                {/* Grid Container - Scrollable */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-7 grid-rows-6 min-h-[600px]">
                        {days.map((cell, idx) => {
                            const dayTasks = cell.currentMonth ? getTasksForDay(cell.day) : [];
                            const isSelected = selectedDate && cell.date.toDateString() === selectedDate.toDateString();
                            const isToday = new Date().toDateString() === cell.date.toDateString();

                            return (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedDate(cell.date)}
                                    className={clsx(
                                        "relative border-b border-r border-gray-50 p-2 cursor-pointer transition-all duration-200 hover:bg-white/80 min-h-[100px]",
                                        !cell.currentMonth && "bg-gray-50/30 text-gray-300",
                                        cell.currentMonth && "text-gray-700",
                                        isSelected && "bg-greenade-primary/5 ring-inset ring-2 ring-greenade-primary",
                                        isToday && !isSelected && "bg-blue-50/50"
                                    )}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={clsx(
                                            "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full",
                                            isToday && "bg-blue-500 text-white shadow-md shadow-blue-500/30",
                                            !isToday && "text-opacity-80"
                                        )}>
                                            {cell.day}
                                        </span>
                                    </div>

                                    <div className="mt-1 space-y-1">
                                        {dayTasks.slice(0, 3).map(task => (
                                            <div key={task.id} className={clsx(
                                                "text-[10px] truncate px-1.5 py-0.5 rounded border-l-2",
                                                task.completed ? "bg-gray-100 text-gray-400 border-gray-300 line-through" : "bg-white shadow-sm border-greenade-primary text-gray-700"
                                            )}>
                                                {task.title}
                                            </div>
                                        ))}
                                        {dayTasks.length > 3 && (
                                            <div className="text-[10px] text-gray-400 pl-1">
                                                +{dayTasks.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Side Panel: Selected Day Tasks */}
            <div className="w-80 flex flex-col bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/60">
                <div className="p-6 border-b border-white/50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-greenade-primary" />
                        {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'Select a date'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        {selectedDateTasks.length === 0 ? "No tasks due today" : `${selectedDateTasks.length} tasks scheduled`}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <AnimatePresence mode='popLayout'>
                        {selectedDateTasks.length > 0 ? (
                            selectedDateTasks.map(task => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="group flex items-start gap-3 p-3 mb-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                                >
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                                        className={clsx(
                                            "mt-0.5 shrink-0 transition-colors",
                                            task.completed ? "text-greenade-primary" : "text-gray-300 hover:text-greenade-primary"
                                        )}
                                    >
                                        {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <p className={clsx(
                                            "text-sm font-medium transition-all truncate",
                                            task.completed ? "text-gray-400 line-through" : "text-gray-700"
                                        )}>
                                            {task.title}
                                        </p>
                                        <div className="flex gap-2 mt-1.5">
                                            {task.isUrgent && <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-medium">Urgent</span>}
                                            {task.isImportant && <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded font-medium">Important</span>}
                                            <span className="text-[10px] text-gray-400">{task.projectId}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 opacity-60">
                                <FileText className="w-12 h-12 mb-2 stroke-1" />
                                <p className="text-sm">Enjoy your free time!</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div >
    );
};

export default CalendarView;
