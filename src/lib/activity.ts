// Lightweight, fire-and-forget activity tracking.
// Records what a signed-in user searches for and which datasets they open,
// so the home page can surface personalised "Recommended for you" datasets.

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export interface TrackPayload {
    uid?: string | null;
    kind: 'search' | 'view';
    term?: string;
    category?: string;
    datasetId?: number;
}

export function trackEvent(ev: TrackPayload): void {
    // Only track signed-in users — recommendations are per-account.
    if (!ev.uid) return;

    try {
        fetch(`${BASE_URL}/activity/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ev),
            keepalive: true,
        }).catch(() => { /* non-fatal — tracking is best-effort */ });
    } catch {
        /* ignore */
    }
}
