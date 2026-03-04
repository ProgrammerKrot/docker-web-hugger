"use client";

import { useState, useEffect, useRef } from 'react';
import { Terminal, Trash2 } from 'lucide-react';
import { getLogStreamUrl } from '@/lib/api';

interface LogLine {
    id: string;
    content: string;
    timestamp: string;
}

interface LogPanelProps {
    containerId: string;
    containerName: string;
}

export default function LogPanel({ containerId, containerName }: LogPanelProps) {
    const [logs, setLogs] = useState<LogLine[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerId) return;

        let eventSource: EventSource;
        let retryCount = 0;
        const maxRetries = 5;

        const connect = () => {
            const url = getLogStreamUrl(containerId);
            eventSource = new EventSource(url);

            eventSource.onmessage = (event) => {
                const logContent = event.data;
                const newLine: LogLine = {
                    id: Math.random().toString(36).substr(2, 9),
                    content: logContent,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                };

                setLogs(prev => [...prev.slice(-199), newLine]);
                retryCount = 0;
            };

            eventSource.onerror = (err) => {
                eventSource.close();
                if (retryCount < maxRetries) {
                    retryCount++;
                    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
                    setTimeout(connect, delay);
                }
            };
        };

        connect();

        return () => {
            if (eventSource) eventSource.close();
        };
    }, [containerId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="glass bg-black/40 rounded-xl flex flex-col h-[300px] border border-white/5 overflow-hidden">
            <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-2">
                    <Terminal size={12} className="text-blue-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                        {containerName} Logs
                    </span>
                </div>
                <button
                    onClick={() => setLogs([])}
                    className="p-1 rounded hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors"
                >
                    <Trash2 size={12} />
                </button>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-3 font-mono text-[10px] leading-relaxed space-y-1 custom-scrollbar"
            >
                {logs.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-white/10 italic">
                        No logs yet...
                    </div>
                ) : (
                    logs.map(log => (
                        <div key={log.id} className="flex gap-2 group">
                            <span className="text-white/20 shrink-0">{log.timestamp}</span>
                            <span className="text-white/80 break-all">{log.content}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
