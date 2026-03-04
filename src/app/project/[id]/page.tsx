"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchContainers, performContainerAction } from '@/lib/api';
import SpaceCard from '@/components/SpaceCard';
import LogPanel from '@/components/LogPanel';
import { ArrowLeft, Layers, Terminal as TerminalIcon, RefreshCw, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function ProjectPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = decodeURIComponent(params.id as string);

    const [containers, setContainers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const allContainers = await fetchContainers();
            const filtered = allContainers.filter((c: any) =>
                (projectId === 'standalone' ? !c.ComposeProject : c.ComposeProject === projectId)
            );
            setContainers(filtered);
        } catch (err) {
            console.error('Failed to load project containers:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }, [projectId]);

    const handleAction = async (id: string, action: string) => {
        setRefreshing(true);
        try {
            await performContainerAction(id, action);
            loadData();
        } catch (err) {
            console.error('Action failed:', err);
            setRefreshing(false);
        }
    };

    const getName = (c: any) => {
        if (c.Names && c.Names.length > 0) return c.Names[0].replace('/', '');
        return c.Id.substring(0, 12);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-24 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <header className="flex flex-col gap-6 pt-8">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-white/40 hover:text-white transition-colors w-fit group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back to Projects</span>
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 text-blue-400">
                                <Layers size={21} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tight">
                                    {projectId === 'standalone' ? 'Standalone Spaces' : projectId}
                                </h1>
                                <p className="text-sm text-white/40 font-medium">
                                    Project View • {containers.length} Containers
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => { setRefreshing(true); loadData(); }}
                        className="glass px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/5 transition-all outline-none"
                    >
                        <RefreshCw size={16} className={refreshing ? 'animate-spin text-blue-400' : 'text-white/40'} />
                        <span className="text-sm font-bold text-white/70">Refresh Project</span>
                    </button>
                </div>
            </header>

            {/* Containers & Logs Section */}
            <div className="space-y-12">
                {loading ? (
                    <div className="space-y-8">
                        {[1, 2].map(i => (
                            <div key={i} className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
                                <div className="lg:col-span-4 h-48 glass rounded-2xl"></div>
                                <div className="lg:col-span-8 h-48 glass rounded-2xl"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {containers.length === 0 ? (
                            <div className="h-[400px] glass rounded-3xl flex flex-col items-center justify-center gap-4 text-white/20">
                                <Box size={60} strokeWidth={1} />
                                <p className="text-xl font-medium">No containers found in this project</p>
                            </div>
                        ) : (
                            containers.map((container, idx) => (
                                <motion.div
                                    key={container.Id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="grid grid-cols-1 lg:grid-cols-12 gap-6 group"
                                >
                                    {/* Left: Container Info Card */}
                                    <div className="lg:col-span-4">
                                        <SpaceCard
                                            container={container}
                                            onAction={handleAction}
                                            onViewLogs={() => { }} // Disabled here since logs are always visible
                                            isSelected={false}
                                        />
                                    </div>

                                    {/* Right: Dedicated Log Panel */}
                                    <div className="lg:col-span-8">
                                        <LogPanel
                                            containerId={container.Id}
                                            containerName={getName(container)}
                                        />
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                )}
            </div>

            {/* Images View Section Link or Preview could go here */}
        </div>
    );
}
