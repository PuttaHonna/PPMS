import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Lock, Zap, Palette, Shield } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const SHOP_ITEMS = [
    { id: 'freeze', name: 'Streak Freeze', description: 'Protect your streak for one day.', cost: 500, icon: Shield, color: 'text-blue-400', available: true },
    { id: 'theme_dark', name: 'Void Theme', description: 'Unlock the dark void theme.', cost: 1000, icon: Palette, color: 'text-purple-400', available: false },
    { id: 'theme_cyber', name: 'Cyberpunk Theme', description: 'Unlock the cyberpunk neon theme.', cost: 1500, icon: Zap, color: 'text-yellow-400', available: false },
    { id: 'badge_pro', name: 'Pro Badge', description: 'Display a PRO badge on your profile.', cost: 5000, icon: Lock, color: 'text-pink-400', available: false },
];

const XPShop: React.FC = () => {
    const { xp, spendXp } = useGameStore();

    const handlePurchase = async (item: typeof SHOP_ITEMS[0]) => {
        if (!item.available) return;
        if (xp >= item.cost) {
            const success = await spendXp(item.cost);
            if (success) {
                // In a real app, we'd add the item to the user's inventory
                alert(`Purchased ${item.name}!`);
            }
        } else {
            alert("Not enough XP!");
        }
    };

    return (
        <div className="h-full flex flex-col items-center p-8 pt-12 overflow-y-auto custom-scrollbar">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-4xl"
            >
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-display font-bold text-white mb-2 uppercase tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                        XP Exchange
                    </h2>
                    <p className="text-greenade-accent font-mono text-sm max-w-md mx-auto bg-black/60 backdrop-blur-md py-2 px-6 rounded-full border border-greenade-accent/40 shadow-lg">
                        Current Balance: <span className="text-white font-bold ml-2 text-base">{xp} XP</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {SHOP_ITEMS.map((item) => (
                        <div
                            key={item.id}
                            className={clsx(
                                "relative group p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 flex flex-col items-center text-center gap-4",
                                "bg-black/40 border-greenade-accent/30 shadow-xl", // Darker background for contrast
                                item.available ? "hover:border-greenade-primary hover:bg-black/60 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(74,222,128,0.3)]" : "opacity-70 grayscale"
                            )}
                        >
                            <div className={clsx("p-4 rounded-full bg-white/10 border border-white/20 mb-2 shadow-inner", item.color)}>
                                <item.icon className="w-8 h-8 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                            </div>

                            <div>
                                <h3 className="font-bold text-white text-lg mb-1 tracking-wide">{item.name}</h3>
                                <p className="text-xs text-gray-300 mb-4 h-8 font-medium">{item.description}</p>
                            </div>

                            <button
                                onClick={() => handlePurchase(item)}
                                disabled={!item.available || xp < item.cost}
                                className={clsx(
                                    "mt-auto w-full py-2 rounded-lg font-bold text-sm tracking-wide transition-all shadow-md",
                                    !item.available
                                        ? "bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed" // Clearer disabled state
                                        : xp >= item.cost
                                            ? "bg-greenade-primary text-white hover:bg-greenade-primary/90 hover:scale-105 shadow-greenade-primary/30"
                                            : "bg-red-900/50 text-red-200 border border-red-500/50 cursor-not-allowed"
                                )}
                            >
                                {item.available ? `${item.cost} XP` : "LOCKED"}
                            </button>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default XPShop;
