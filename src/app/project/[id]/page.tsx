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
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header / Breadcrumbs */}
            <header className="flex flex-col gap-6">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-colors w-fit group font-bold text-xs uppercase tracking-widest"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Spaces</span>
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center border border-indigo-200 text-white shadow-sm">
                            <Layers size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                                    {projectId === 'standalone' ? 'Standalone Spaces' : projectId}
                                </h1>
                            </div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                {containers.length} Running Containers
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => { setRefreshing(true); loadData(); }}
                        className="bg-white border border-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm group"
                    >
                        <RefreshCw size={14} strokeWidth={2.5} className={refreshing ? 'animate-spin text-indigo-500' : 'text-gray-400 group-hover:text-indigo-500'} />
                        <span className="text-xs font-bold text-gray-600 group-hover:text-indigo-600">Sync Pipeline</span>
                    </button>
                </div>
            </header>

            {/* Containers & Logs Section */}
            <div className="space-y-10">
                {loading ? (
                    <div className="space-y-8">
                        {[1, 2].map(i => (
                            <div key={i} className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
                                <div className="lg:col-span-4 h-48 bg-gray-50 rounded-2xl border border-gray-100"></div>
                                <div className="lg:col-span-8 h-48 bg-gray-50 rounded-2xl border border-gray-100"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {containers.length === 0 ? (
                            <div className="h-[400px] border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center gap-4 text-gray-300">
                                <Box size={60} strokeWidth={1} />
                                <p className="text-lg font-medium italic">No active spaces in this pipeline</p>
                            </div>
                        ) : (
                            containers.map((container, idx) => (
                                <motion.div
                                    key={container.Id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="grid grid-cols-1 lg:grid-cols-12 gap-6 group"
                                >
                                    {/* Left: Container Info Card */}
                                    <div className="lg:col-span-4">
                                        <SpaceCard
                                            container={container}
                                            onAction={handleAction}
                                            onViewLogs={() => { }}
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
        </div>
    );
}
