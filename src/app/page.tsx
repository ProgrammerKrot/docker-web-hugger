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
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header / Search Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Layers size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-black text-gray-900">Spaces</h2>
                            <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs font-bold">
                                {Object.keys(projects).length}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                            <Box size={16} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search spaces..."
                            className="bg-gray-100/50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-full md:w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Hub View - Projects and Standalone */}
            <section className="space-y-6">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="hf-card h-40 animate-pulse bg-gray-50" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
