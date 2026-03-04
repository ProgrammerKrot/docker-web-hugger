import React from 'react';
import { Layers } from 'lucide-react';

interface ProjectGroupProps {
    projectName: string;
    children: React.ReactNode;
}

const ProjectGroup: React.FC<ProjectGroupProps> = ({ projectName, children }) => {
    return (
        <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 px-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30">
                    <Layers className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-white/90">
                        {projectName || 'Standalone Spaces'}
                    </h2>
                    <p className="text-sm text-white/50">
                        Docker Compose Project
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {children}
            </div>
            <div className="border-b border-white/5 pt-4"></div>
        </div>
    );
};

export default ProjectGroup;
