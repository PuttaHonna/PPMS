import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import LoginForm from '../auth/LoginForm';
import SignUpForm from '../auth/SignUpForm';
import { motion } from 'framer-motion';
import * as Lucide from 'lucide-react';

const ProfileView: React.FC = () => {
    const { user, isAuthenticated, logout, updateProfile, uploadAvatar } = useAuthStore();
    const [isLogin, setIsLogin] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ username: '', email: '', bio: '' });
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setEditForm({
                username: user.username || '',
                email: user.email || '',
                bio: user.bio || ''
            });
        }
    }, [user]);

    const handleSave = () => {
        updateProfile(editForm);
        setIsEditing(false);
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                await uploadAvatar(file);
            } catch (error) {
                console.error("Failed to upload avatar", error);
            }
        }
    };

    if (!isAuthenticated || !user) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 p-8">
                    {isLogin ? (
                        <LoginForm onToggle={() => setIsLogin(false)} />
                    ) : (
                        <SignUpForm onToggle={() => setIsLogin(true)} />
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col items-center justify-center overflow-y-auto custom-scrollbar p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden"
            >
                {/* Header / Banner */}
                <div className="h-32 bg-gradient-to-r from-cyan-400 to-purple-500 relative">
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 group cursor-pointer" onClick={handleAvatarClick}>
                        <div className="w-24 h-24 rounded-full bg-white p-1 shadow-xl relative overflow-hidden">
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-tr from-cyan-100 to-purple-100 flex items-center justify-center text-4xl font-bold text-gray-800">
                                    {(user.username || user.email || '?').charAt(0).toUpperCase()}
                                </div>
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                <Lucide.Camera className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>

                <div className="pt-16 pb-8 px-8">
                    {!isEditing ? (
                        <div className="text-center space-y-4">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800">{user.username || 'User'}</h2>
                                <p className="text-gray-500">{user.email}</p>
                            </div>

                            {user.bio && (
                                <div className="max-w-md mx-auto py-4 px-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                                    <p className="text-gray-600 italic">"{user.bio}"</p>
                                </div>
                            )}

                            <div className="flex justify-center gap-4 pt-4">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                                >
                                    <Lucide.Edit2 className="w-4 h-4" />
                                    Edit Profile
                                </button>
                                <button
                                    onClick={() => logout()}
                                    className="px-6 py-2.5 rounded-xl bg-red-50 text-red-500 font-medium hover:bg-red-100 transition-colors flex items-center gap-2"
                                >
                                    <Lucide.LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-md mx-auto space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    value={editForm.username}
                                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                    placeholder="Username"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                    placeholder="Email"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                <textarea
                                    value={editForm.bio}
                                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none h-32"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ProfileView;
