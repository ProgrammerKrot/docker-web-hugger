"use client";

import React from 'react';
import { Github, Globe, Heart, MessageSquare, Settings, UserPlus, Mail, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar() {
    return (
        <aside className="w-full md:w-80 flex-shrink-0 bg-sidebar-bg border-r border-card-border min-h-screen p-6 space-y-8 hidden md:block">
            {/* Profile Section */}
            <div className="space-y-4">
                <div className="relative group w-fit">
                    <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-sm bg-gray-200">
                        {/* Avatar placeholder - in a real app this would be an image */}
                        <div className="w-full h-full flex items-center justify-center bg-hf-gradient">
                            <span className="text-4xl font-black text-indigo-200">NK</span>
                        </div>
                    </div>
                    <button className="absolute bottom-2 right-2 bg-white border border-card-border rounded-full p-2 shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-1.5 text-xs font-bold text-gray-600">
                        <UserPlus size={14} />
                        Add status
                    </button>
                    <div className="absolute -bottom-1 -left-1 flex gap-1">
                        <div className="bg-white border border-card-border rounded-full px-2 py-0.5 shadow-sm text-[10px] flex items-center gap-1">
                            <span className="text-yellow-500">👏</span> 2
                        </div>
                        <div className="bg-white border border-card-border rounded-full px-2 py-0.5 shadow-sm text-[10px] flex items-center gap-1">
                            <span className="text-red-500">❤️</span> 1
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Nikita André Lukša</h1>
                    <p className="text-sm font-bold text-indigo-600 bg-indigo-50 w-fit px-2 py-0.5 rounded">WerterKrot</p>
                </div>

                <div className="flex gap-2">
                    <button className="flex-1 bg-white border border-card-border rounded-lg py-2 text-xs font-bold hover:bg-gray-50 transition-colors shadow-sm">
                        + New
                    </button>
                    <button className="flex-1 bg-white border border-card-border rounded-lg py-2 text-xs font-bold hover:bg-gray-50 transition-colors shadow-sm">
                        Edit profile
                    </button>
                    <button className="bg-white border border-card-border rounded-lg p-2 hover:bg-gray-50 transition-colors shadow-sm">
                        <Settings size={14} className="text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Links & Interests */}
            <div className="space-y-6 pt-6 border-t border-gray-200">
                <div className="space-y-3">
                    <a href="https://github.com/ProgrammerKrot" className="flex items-center gap-3 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium">
                        <Github size={18} />
                        <span>ProgrammerKrot</span>
                    </a>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                        <MessageSquare size={14} />
                        AI & ML interests
                    </div>
                    <p className="text-sm text-gray-400 italic">None yet</p>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                        <Globe size={14} />
                        Organizations
                    </div>
                    <p className="text-sm text-gray-400 italic">None yet</p>
                </div>
            </div>

            {/* Footer / Meta */}
            <div className="pt-12 text-[10px] text-gray-400 font-medium space-y-1">
                <div className="flex items-center gap-1">
                    <Info size={10} />
                    <span>Hugging Face Style Dashboard</span>
                </div>
                <p>© 2026 Antigravity Labs</p>
            </div>
        </aside>
    );
}
