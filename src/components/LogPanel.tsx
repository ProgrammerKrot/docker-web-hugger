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
        <div className="hf-card bg-gray-50 flex flex-col h-[300px] overflow-hidden border-gray-200">
            <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-indigo-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        {containerName} • Runtime Logs
                    </span>
                </div>
                <button
                    onClick={() => setLogs([])}
                    className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <Trash2 size={12} />
                </button>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed space-y-1.5 custom-scrollbar bg-white/50"
            >
                {logs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2 italic">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-200 animate-pulse" />
                        Waiting for logs...
                    </div>
                ) : (
                    logs.map(log => (
                        <div key={log.id} className="flex gap-3 group">
                            <span className="text-gray-300 shrink-0 font-bold select-none">{log.timestamp}</span>
                            <span className="text-gray-700 break-all">{log.content}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
