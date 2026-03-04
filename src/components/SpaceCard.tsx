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

    // Extreme safety check for Names
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "glass glass-hover p-6 rounded-2xl flex flex-col gap-4 cursor-pointer transition-all duration-300",
                isSelected && "border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
            )}
            onClick={() => onViewLogs(container.Id)}
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2 rounded-lg bg-blue-500/10 text-blue-400",
                        isActive && "bg-green-500/10 text-green-400"
                    )}>
                        <Activity size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg truncate max-w-[150px]">{name}</h3>
                        <p className="text-xs text-foreground/50 truncate max-w-[150px]">{container.Image}</p>
                    </div>
                </div>
                <div className={cn(
                    "px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider",
                    isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                )}>
                    {container.State}
                </div>
            </div>

            <div className="flex gap-2 mt-auto pt-4 border-t border-white/5">
                <button
                    onClick={(e) => { e.stopPropagation(); onAction(container.Id, isActive ? 'stop' : 'start'); }}
                    className="flex-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                    {isActive ? <Square size={14} className="text-red-400" /> : <Play size={14} className="text-green-400" />}
                    <span>{isActive ? 'Stop' : 'Start'}</span>
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onAction(container.Id, 'restart'); }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    title="Restart"
                >
                    <RotateCcw size={14} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onViewLogs(container.Id); }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    title="View Logs"
                >
                    <Terminal size={14} />
                </button>
            </div>
        </motion.div>
    );
}
