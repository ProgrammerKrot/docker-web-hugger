"use strict";

import { useState, useEffect, useRef } from 'react';
import { Terminal, Filter, X, Trash2 } from 'lucide-react';

interface LogLine {
    id: string;
    source: string;
    content: string;
    timestamp: string;
}

interface LogViewerProps {
    selectedContainerId: string | null;
    containers: any[];
}

export default function LogViewer({ selectedContainerId, containers }: LogViewerProps) {
    const [logs, setLogs] = useState<LogLine[]>([]);
    const [filter, setFilter] = useState('');
    const [originFilter, setOriginFilter] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!selectedContainerId) return;

        let eventSource: EventSource;
        let retryCount = 0;
        const maxRetries = 5;

        const connect = () => {
            console.log(`Connecting to logs for ${selectedContainerId}... (Attempt ${retryCount + 1})`);
            eventSource = new EventSource(`http://${window.location.hostname}:8000/logs/stream?containerId=${selectedContainerId}`);

            eventSource.onmessage = (event) => {
                const logContent = event.data;
                const container = containers.find(c => c.Id === selectedContainerId);

                let name = "unknown";
                try {
                    if (container?.Names && Array.isArray(container.Names) && container.Names.length > 0) {
                        name = container.Names[0].replace('/', '');
                    } else if (container?.Name) {
                        name = container.Name.replace('/', '');
                    } else if (container?.Id) {
                        name = container.Id.substring(0, 12);
                    }
                } catch (e) { }

                const newLine: LogLine = {
                    id: Math.random().toString(36).substr(2, 9),
                    source: name,
                    content: logContent,
                    timestamp: new Date().toLocaleTimeString(),
                };

                setLogs(prev => [...prev.slice(-499), newLine]);
                retryCount = 0; // Reset on success
            };

            eventSource.onerror = (err) => {
                console.error('SSE Error details:', err);
                eventSource.close();

                if (retryCount < maxRetries) {
                    retryCount++;
                    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
                    console.log(`Retrying log connection in ${delay}ms...`);
                    setTimeout(connect, delay);
                }
            };
        };

        connect();

        return () => {
            if (eventSource) eventSource.close();
        };
    }, [selectedContainerId, containers]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.content.toLowerCase().includes(filter.toLowerCase());
        const matchesOrigin = originFilter ? log.source === originFilter : true;
        return matchesSearch && matchesOrigin;
    });

    return (
        <div className="glass rounded-2xl flex flex-col h-[600px] overflow-hidden">
            <div className="p-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Terminal size={18} className="text-blue-400" />
                    <h2 className="font-bold">Real-time Logs</h2>
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">Live feed</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:border-blue-500/50 transition-all w-48"
                        />
                    </div>

                    <button
                        onClick={() => setLogs([])}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-foreground/60 transition-colors"
                        title="Clear Logs"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1 bg-black/20"
            >
                {filteredLogs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-foreground/30 gap-2">
                        <Terminal size={40} strokeWidth={1} />
                        <p>Waiting for logs... {selectedContainerId ? 'Streaming from ' + (() => {
                            try {
                                const c = containers.find(c => c.Id === selectedContainerId);
                                if (!c) return '...';
                                if (c.Names && Array.isArray(c.Names) && c.Names.length > 0) return c.Names[0].replace('/', '');
                                if (c.Name) return c.Name.replace('/', '');
                                return c.Id ? c.Id.substring(0, 12) : '...';
                            } catch (e) {
                                return '...';
                            }
                        })() : 'Select a space'}</p>
                    </div>
                ) : (
                    filteredLogs.map(log => (
                        <div key={log.id} className="group flex gap-3 hover:bg-white/5 py-0.5 px-2 rounded-md transition-colors">
                            <span className="text-foreground/30 whitespace-nowrap">[{log.timestamp}]</span>
                            <span className="text-blue-400 font-bold whitespace-nowrap">{log.source}:</span>
                            <span className="text-foreground/80 break-all">{log.content}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
