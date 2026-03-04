import React from 'react';
import Link from 'next/link';
import { Layers, Activity, Container } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProjectCardProps {
    name: string;
    containerCount: number;
    activeCount: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ name, containerCount, activeCount }) => {
    return (
        <Link href={`/project/${encodeURIComponent(name || 'standalone')}`}>
            <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="glass group p-6 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Layers size={80} />
                </div>

                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 text-blue-400">
                        <Layers size={24} />
                    </div>
                    <div className="flex gap-2">
                        <div className="glass px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-wider text-blue-400">
                            <Container size={12} />
                            {containerCount} Containers
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                        {name || 'Standalone Spaces'}
                    </h3>
                    <p className="text-xs text-white/40 uppercase tracking-widest font-bold">
                        {name ? 'Docker Compose Project' : 'Individual Containers'}
                    </p>
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity size={14} className="text-green-500" />
                        <span className="text-sm font-medium text-white/60">
                            {activeCount} Running
                        </span>
                    </div>
                    <span className="text-xs font-bold text-blue-500 group-hover:underline">
                        View Details →
                    </span>
                </div>
            </motion.div>
        </Link>
    );
};

export default ProjectCard;
