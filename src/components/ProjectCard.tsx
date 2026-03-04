import React from 'react';
import Link from 'next/link';
import { Layers, Activity, Container, Globe } from 'lucide-react';
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
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="hf-card group p-5 flex flex-col gap-4 bg-white hover:bg-gray-50/50 cursor-pointer overflow-hidden border-gray-200"
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center border border-indigo-100 text-indigo-500 group-hover:scale-110 transition-transform">
                            <Layers size={20} />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate text-base">
                                {name || 'Standalone Spaces'}
                            </h3>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                                {name ? 'Docker Compose' : 'Individual'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-auto">
                    <div className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold border border-indigo-100 flex items-center gap-1.5 uppercase">
                        <Container size={10} />
                        {containerCount} Spaces
                    </div>
                    {activeCount > 0 && (
                        <div className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold border border-green-100 flex items-center gap-1.5 uppercase">
                            <Activity size={10} />
                            {activeCount} Running
                        </div>
                    )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-gray-400">
                    <span className="flex items-center gap-1">
                        <Globe size={12} strokeWidth={2.5} />
                        Public access
                    </span>
                    <span className="text-indigo-500 group-hover:translate-x-1 transition-transform">
                        Explore →
                    </span>
                </div>
            </motion.div>
        </Link>
    );
};

export default ProjectCard;
