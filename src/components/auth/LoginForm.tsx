import React, { useState } from 'react';

import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface LoginFormProps {
    onToggle: () => void;
    onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggle, onSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (email.trim() && password.trim()) {
            const { error } = await login(email, password);
            if (error) {
                setError(error.message);
            } else {
                if (onSuccess) onSuccess();
            }
        }
    };

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                Welcome Back!
            </h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                        {error}
                    </div>
                )}
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all text-gray-800 placeholder-gray-400 text-sm font-medium"
                        placeholder="Email"
                    />
                </div>

                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all text-gray-800 placeholder-gray-400 text-sm font-medium"
                        placeholder="Password"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-2xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
                >
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center mt-4">
                    <p className="text-xs text-gray-500">
                        New here?{' '}
                        <button
                            type="button"
                            onClick={onToggle}
                            className="text-purple-600 font-semibold hover:underline"
                        >
                            Create account
                        </button>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default LoginForm;
