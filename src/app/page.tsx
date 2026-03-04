"use client";

import { useEffect, useState } from 'react';
import { fetchContainers, fetchImages, performContainerAction } from '@/lib/api';
import SpaceCard from '@/components/SpaceCard';
import ProjectCard from '@/components/ProjectCard';
import { LayoutGrid, ScrollText, RefreshCw, Box, Layers, Container, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
    const [containers, setContainers] = useState<any[]>([]);
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Group containers by project for the summary cards
    const projects = containers.reduce((acc: any, c) => {
        const projectName = c.ComposeProject || "";
        if (!acc[projectName]) {
            acc[projectName] = { name: projectName, count: 0, active: 0 };
        }
        acc[projectName].count++;
        if (c.State === 'running') acc[projectName].active++;
        return acc;
    }, {});

    const loadData = async () => {
        try {
            const [cData, iData] = await Promise.all([fetchContainers(), fetchImages()]);
            setContainers(cData);
            setImages(iData);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-24 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-12">
                <div>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 mb-2"
                    >
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)] text-white">
                            <Activity size={18} className={refreshing ? 'animate-spin' : ''} />
                        </div>
                        <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Antigravity Labs</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black tracking-tight text-white"
                    >
                        Docker <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Spaces</span>
                    </motion.h1>
                    <p className="mt-2 text-white/40 font-medium">Manage your Docker orchestration with style.</p>
                </div>

                <div className="flex gap-4">
                    <div className="flex glass px-4 py-2 rounded-full text-xs font-medium gap-6">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-white/70">{containers.filter(c => c && c.State === 'running').length} Active</span>
                        </div>
                        <div className="flex items-center gap-2 border-l border-white/10 pl-6">
                            <span className="w-2 h-2 rounded-full bg-white/20"></span>
                            <span className="text-white/70">{containers.length} Total</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hub View - Projects and Standalone */}
            <section className="space-y-8">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <LayoutGrid size={20} className="text-foreground/40" />
                    <h2 className="text-xl font-bold uppercase tracking-tight text-white/70">Project Hub</h2>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="glass rounded-2xl h-40 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {Object.values(projects).map((project: any) => (
                                <ProjectCard
                                    key={project.name || 'standalone'}
                                    name={project.name}
                                    containerCount={project.count}
                                    activeCount={project.active}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </section>

            {/* Images View */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <LayoutGrid size={20} className="text-foreground/40" />
                    <h2 className="text-xl font-bold">Local Images</h2>
                </div>

                <div className="glass rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-foreground/40 uppercase text-[10px] font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-3">Tag / ID</th>
                                <th className="px-6 py-3">Created</th>
                                <th className="px-6 py-3">Size</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={3} className="px-6 py-4 h-12"></td>
                                    </tr>
                                ))
                            ) : (
                                images.map((img) => (
                                    <tr key={img.Id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs">
                                            {img.RepoTags?.[0] || img.Id.substring(7, 19)}
                                        </td>
                                        <td className="px-6 py-4 text-foreground/60">
                                            {new Date(img.Created * 1000).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-foreground/60">
                                            {(img.Size / (1024 * 1024)).toFixed(1)} MB
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Footer */}
            <footer className="pt-12 border-t border-white/5 text-foreground/30 text-xs flex justify-between items-center">
                <p>© 2026 Docker-Web-Hugger. Built for Windows and Linux.</p>
                <div className="flex gap-4">
                    <span className="hover:text-white/50 cursor-pointer">Documentation</span>
                    <span className="hover:text-white/50 cursor-pointer">Support</span>
                </div>
            </footer>
        </div>
    );
}
