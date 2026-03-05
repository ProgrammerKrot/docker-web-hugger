function getApiBase() {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        return `http://${hostname}:8000`;
    }
    return 'http://localhost:8000';
}

export async function fetchContainers() {
    const res = await fetch(`${getApiBase()}/containers`);
    if (!res.ok) throw new Error('Failed to fetch containers');
    return res.json();
}

export async function fetchImages() {
    const res = await fetch(`${getApiBase()}/images`);
    if (!res.ok) throw new Error('Failed to fetch images');
    return res.json();
}

export async function performContainerAction(id: string, action: string) {
    const res = await fetch(`${getApiBase()}/containers/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
    });
    if (!res.ok) throw new Error(`Action ${action} failed`);
    return res.json();
}

export function getLogStreamUrl(containerId: string) {
    return `${getApiBase()}/logs/stream?containerId=${containerId}`;
}
