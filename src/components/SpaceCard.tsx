"use strict";

import { motion } from 'framer-motion';
import { Play, Square, RotateCcw, Activity, Terminal } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Container {
    Id: string;
    Names: string[];
    Image: string;
    State: string;
    Status: string;
}

interface SpaceCardProps {
    container: Container;
    onAction: (id: string, action: string) => void;
    onViewLogs: (id: string) => void;
    isSelected: boolean;
}

export default function SpaceCard({ container, onAction, onViewLogs, isSelected }: SpaceCardProps) {
    if (!container) return null;

    let name = "unknown";
    try {
        if (container.Names && Array.isArray(container.Names) && container.Names.length > 0) {
            name = container.Names[0].replace('/', '');
        } else if ((container as any).Name) {
            name = (container as any).Name.replace('/', '');
        } else if (container.Id) {
            name = container.Id.substring(0, 12);
        }
    } catch (e) {
        console.error("Error parsing container name", e);
    }

    const isActive = container.State === 'running';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "hf-card flex flex-col overflow-hidden bg-white group",
                isSelected && "ring-2 ring-indigo-500 ring-offset-2"
            )}
        >
            {/* Status Bar */}
            <div className={cn(
                "px-4 py-2 flex items-center justify-between text-[10px] font-black uppercase tracking-widest",
                isActive ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white" : "bg-gray-100 text-gray-400"
            )}>
                <div className="flex items-center gap-2">
                    {isActive ? (
                        <Activity size={12} className="animate-pulse" />
                    ) : (
                        <Square size={12} />
                    )}
                    <span>{isActive ? 'Running' : 'Stopped'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="opacity-50">private</span>
                </div>
            </div>

            {/* Content Area */}
            <div className={cn(
                "p-5 grow flex flex-col gap-1 transition-colors",
                isActive ? "bg-blue-50/30" : "bg-gray-50/20"
            )}>
                <h3 className="font-black text-lg text-gray-900 leading-tight truncate">
                    {name} 💻
                </h3>
                <p className="text-xs text-gray-400 font-medium truncate mb-4">{container.Image}</p>

                {/* Actions Footer */}
                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                        <div className="w-5 h-5 rounded-full bg-gray-200 border border-white overflow-hidden flex items-center justify-center text-[8px] text-gray-500">
                            W
                        </div>
                        WerterKrot
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="px-4 py-3 bg-white border-t border-gray-100 flex gap-2">
                <button
                    onClick={(e) => { e.stopPropagation(); onAction(container.Id, isActive ? 'stop' : 'start'); }}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                        isActive
                            ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                            : "bg-green-50 text-green-600 hover:bg-green-100 border border-green-100"
                    )}
                >
                    {isActive ? <Square size={12} /> : <Play size={12} />}
                    {isActive ? 'Stop' : 'Start'}
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onAction(container.Id, 'restart'); }}
                    className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200 transition-colors"
                >
                    <RotateCcw size={14} />
                </button>
            </div>
        </motion.div>
    );
}
