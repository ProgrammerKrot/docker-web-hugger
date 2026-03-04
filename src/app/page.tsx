"use client";

import { useEffect, useState } from 'react';
import SpaceCard from '@/components/SpaceCard';
import LogViewer from '@/components/LogViewer';
import ProjectGroup from '@/components/ProjectGroup';
import { LayoutGrid, ScrollText, RefreshCw, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
    const [containers, setContainers] = useState<any[]>([]);
    const [images, setImages] = useState<any[]>([]);
    const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Group containers by project
    const groupedContainers = containers.reduce((acc: any, container) => {
        const project = container.ComposeProject || "";
        if (!acc[project]) {
            acc[project] = [];
        }
        acc[project].push(container);
        return acc;
    }, {});

    const fetchContainers = async () => {
        try {
            const res = await fetch('http://localhost:8000/containers');
            const data = await res.json();
            if (res.ok) {
                setContainers(data);
            }
        } catch (err) {
            console.error('Failed to fetch containers:', err);
        }
    };
    const fetchImages = async () => {
        try {
            const res = await fetch('http://localhost:8000/images');
            const data = await res.json();
            if (res.ok) {
                setImages(data);
            }
        } catch (err) {
            console.error('Failed to fetch images:', err);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchContainers(), fetchImages()]);
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            fetchContainers();
            fetchImages();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleAction = async (id: string, action: string) => {
        setRefreshing(true);
        try {
            await fetch(`http://localhost:8000/containers/${id}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
            fetchContainers();
        } catch (err) {
            console.error('Action failed:', err);
            setRefreshing(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-24 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                <div>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 mb-2"
                    >
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
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
                </div>

                <div className="flex gap-4">
                    <div className="flex glass px-4 py-2 rounded-full text-xs font-medium gap-6">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span>{containers.filter(c => c && c.State === 'running').length} Active</span>
                        </div>
                        <div className="flex items-center gap-2 border-l border-white/10 pl-6">
                            <span className="w-2 h-2 rounded-full bg-white/20"></span>
                            <span>{containers.length} Total</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Grid View */}
            <section className="space-y-8">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <Box size={20} className="text-foreground/40" />
                    <h2 className="text-xl font-bold uppercase tracking-tight text-white/70">Orchestration & Spaces</h2>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="glass rounded-2xl h-48 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {Object.entries(groupedContainers).map(([projectName, projectContainers]: [string, any]) => (
                            <ProjectGroup key={projectName} projectName={projectName}>
                                <AnimatePresence mode="popLayout">
                                    {projectContainers.map((container: any) => (
                                        <SpaceCard
                                            key={container.Id}
                                            container={container}
                                            onAction={handleAction}
                                            onViewLogs={(id) => setSelectedContainerId(id)}
                                            isSelected={selectedContainerId === container.Id}
                                        />
                                    ))}
                                </AnimatePresence>
                            </ProjectGroup>
                        ))}
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

            {/* Logs View */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <ScrollText size={20} className="text-foreground/40" />
                    <h2 className="text-xl font-bold">Log Stream</h2>
                </div>

                <LogViewer
                    selectedContainerId={selectedContainerId}
                    containers={containers}
                />
            </section>

            {/* Footer */}
            <footer className="pt-12 border-t border-white/5 text-foreground/30 text-xs flex justify-between items-center">
                <p>© 2026 Docker-Web-Hugger. Built for Windows and Linux.</p>
                <div className="flex gap-4">
                    <span className="hover:text-foreground/50 cursor-pointer">Documentation</span>
                    <span className="hover:text-foreground/50 cursor-pointer">Support</span>
                </div>
            </footer>
        </div>
    );
}
