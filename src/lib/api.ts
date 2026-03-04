const API_BASE = 'http://localhost:8000';

export async function fetchContainers() {
    const res = await fetch(`${API_BASE}/containers`);
    if (!res.ok) throw new Error('Failed to fetch containers');
    return res.json();
}

export async function fetchImages() {
    const res = await fetch(`${API_BASE}/images`);
    if (!res.ok) throw new Error('Failed to fetch images');
    return res.json();
}

export async function performContainerAction(id: string, action: string) {
    const res = await fetch(`${API_BASE}/containers/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
    });
    if (!res.ok) throw new Error(`Action ${action} failed`);
    return res.json();
}

export function getLogStreamUrl(containerId: string) {
    return `${API_BASE}/logs/stream?containerId=${containerId}`;
}
