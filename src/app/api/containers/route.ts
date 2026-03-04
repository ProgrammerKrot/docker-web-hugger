import { NextResponse } from 'next/server';
import { docker } from '@/lib/docker';

export async function GET() {
    try {
        const containers = await docker.listContainers({ all: true });
        return NextResponse.json(containers);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { action, containerId } = await request.json();
        const container = docker.getContainer(containerId);

        switch (action) {
            case 'start':
                await container.start();
                break;
            case 'stop':
                await container.stop();
                break;
            case 'restart':
                await container.restart();
                break;
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
