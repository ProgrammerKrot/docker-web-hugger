import { NextRequest } from 'next/server';
import { docker } from '@/lib/docker';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const containerId = request.nextUrl.searchParams.get('containerId');

    if (!containerId) {
        return new Response('Missing containerId', { status: 400 });
    }

    const container = docker.getContainer(containerId);

    const stream = new ReadableStream({
        async start(controller) {
            try {
                const logStream = await container.logs({
                    follow: true,
                    stdout: true,
                    stderr: true,
                    timestamps: true,
                    tail: 100,
                });

                logStream.on('data', (chunk) => {
                    // Docker logs can have a header if not attached to a TTY
                    // We'll just send the string for now, simplified
                    controller.enqueue(`data: ${chunk.toString('utf8')}\n\n`);
                });

                logStream.on('end', () => {
                    controller.close();
                });

                logStream.on('error', (err) => {
                    controller.error(err);
                });

                // Keep the connection alive
                const keepAlive = setInterval(() => {
                    controller.enqueue(': keepalive\n\n');
                }, 30000);

                request.signal.onabort = () => {
                    if ('destroy' in logStream && typeof logStream.destroy === 'function') {
                        (logStream as any).destroy();
                    }
                    clearInterval(keepAlive);
                    controller.close();
                };
            } catch (error) {
                controller.error(error);
            }
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
