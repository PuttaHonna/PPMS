import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useGameStore } from '../store/useGameStore';
import LoginForm from './auth/LoginForm';
import SignUpForm from './auth/SignUpForm';
import { motion, AnimatePresence } from 'framer-motion';
import * as Lucide from 'lucide-react';
import { clsx } from 'clsx';

const MyProfile: React.FC = () => {
    const { user, isAuthenticated, logout, updateProfile } = useAuthStore();
    const { level, xp, streak } = useGameStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ username: '', email: '', bio: '' });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            setEditForm({
                username: user.username || '',
                email: user.email || '',
                bio: user.bio || ''
            });
        }
    }, [user]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSave = () => {
        updateProfile(editForm);
        setIsEditing(false);
    };

    return (
        <div className="relative z-50" ref={containerRef}>
            {/* Trigger Button */}
            <div className="flex items-center gap-4">
                {isAuthenticated && user && (
                    <div className="hidden md:flex flex-col items-end mr-2">
                        <div className="flex items-center gap-2">
                            <span className="text-white font-bold text-lg drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                                LVL {level}
                            </span>
                            <span className="text-xs text-greenade-accent bg-greenade-secondary/50 px-2 py-0.5 rounded border border-greenade-accent/30">
                                {xp} XP
                            </span>
                        </div>
                        {streak > 0 && (
                            <div className="flex items-center gap-1 text-orange-400 text-xs font-bold">
                                <Lucide.Flame className="w-3 h-3 fill-orange-400" />
                                <span>{streak} DAY STREAK</span>
                            </div>
                        )}
                    </div>
                )}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative group focus:outline-none"
                >
                    {isAuthenticated && user ? (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 p-[2px] shadow-lg shadow-purple-500/20 transition-transform group-hover:scale-105">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-tr from-cyan-500 to-purple-500">
                                        {(user.username || user.email || '?').charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors shadow-sm">
                            <Lucide.User className="w-5 h-5 text-gray-600" />
                        </div>
                    )}
                </button>
            </div>

            {/* Popover */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-14 w-80 bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden origin-top-right"
                    >
                        {isAuthenticated && user ? (
                            // Authenticated View
                            <div className="p-6">

                                <div className="flex flex-col items-center mb-6">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 p-1 mb-3 shadow-lg">
                                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                                {user.avatarUrl ? (
                                                    <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-3xl font-bold text-gray-800">
                                                        {(user.username || user.email || '?').charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-yellow-900 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm" title="Level">
                                            {level}
                                        </div>
                                    </div>

                                    {!isEditing && (
                                        <>
                                            <h3 className="text-xl font-bold text-gray-800">{user.username || 'User'}</h3>
                                            <div className="flex items-center gap-4 mt-2 mb-1 w-full px-4">
                                                <div className="flex-1">
                                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                        <span>Level {level}</span>
                                                        <span>{xp} XP</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-cyan-400 to-purple-500"
                                                            style={{ width: `${(xp % 100)}%` }} // Simplified percentage calculation for demo
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center" title="Days Streak">
                                                    <Lucide.Flame className={clsx("w-5 h-5", streak > 0 ? "text-orange-500 fill-orange-500" : "text-gray-300")} />
                                                    <span className="text-xs font-bold text-gray-600">{streak}</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </>
                                    )}
                                </div>

                                {isEditing ? (
                                    <div className="space-y-3">
                                        <input
                                            value={editForm.username}
                                            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl bg-white/50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                            placeholder="Username"
                                        />
                                        <input
                                            value={editForm.email}
                                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl bg-white/50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                            placeholder="Email"
                                        />
                                        <textarea
                                            value={editForm.bio}
                                            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl bg-white/50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none h-20"
                                            placeholder="Bio"
                                        />
                                        <div className="flex gap-2 pt-2">
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                className="flex-1 py-2 rounded-xl bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 transition-colors shadow-lg shadow-purple-500/20"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {user.bio && (
                                            <p className="text-sm text-gray-600 text-center italic mb-4">"{user.bio}"</p>
                                        )}
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Lucide.Edit2 className="w-4 h-4" />
                                            Edit Profile
                                        </button>
                                        <div className="h-px bg-gray-200 my-2" />
                                        <button
                                            onClick={() => {
                                                logout();
                                                setIsOpen(false);
                                            }}
                                            className="w-full py-2.5 rounded-xl bg-red-50 text-red-500 text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Lucide.LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Unauthenticated View (Login/Signup)
                            <div className="p-6">
                                {isLogin ? (
                                    <LoginForm onToggle={() => setIsLogin(false)} onSuccess={() => setIsOpen(false)} />
                                ) : (
                                    <SignUpForm onToggle={() => setIsLogin(true)} onSuccess={() => setIsOpen(false)} />
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyProfile;
