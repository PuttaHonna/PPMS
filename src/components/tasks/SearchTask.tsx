import React from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { Search, X } from 'lucide-react';

export default function SearchTask() {
    const { searchQuery, setSearchQuery } = useTaskStore();

    return (
        <div className="relative h-full w-full group">
            <div className="absolute inset-0 bg-greenade-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-full flex items-center">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="SEARCH PROTOCOLS..."
                    className="w-full h-full px-6 bg-greenade-secondary/30 backdrop-blur-md text-white placeholder-greenade-accent/40 border-b-2 border-greenade-accent/20 focus:outline-none focus:border-greenade-primary focus:bg-greenade-secondary/50 transition-all font-display tracking-wider uppercase text-lg skew-x-[-5deg]"
                />

                <div className="absolute right-4 flex items-center gap-2">
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="text-greenade-accent/60 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5 skew-x-[-5deg]" />
                        </button>
                    )}
                    <Search className="w-5 h-5 text-greenade-primary skew-x-[-5deg]" />
                </div>
            </div>
        </div>
    );
}
