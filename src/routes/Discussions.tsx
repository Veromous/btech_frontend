import { useState, useEffect, useRef, useCallback } from 'react';
import {
    MessageCircle, Plus, Search, X, ChevronDown,
    ThumbsUp, MessageSquare, Clock, Loader2, Send, ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';

const API = `${import.meta.env.VITE_API_URL ?? 'http://localhost:4000'}/discussions`;

const CATEGORIES = [
    'All', 'Health', 'Agriculture', 'Education', 'Business',
    'Climate', 'Technology', 'Government', 'General',
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface Thread {
    id: string;
    title: string;
    body: string;
    category: string;
    authorName: string;
    authorUid: string;
    createdAt: { _seconds: number } | null;
    replyCount: number;
    likeCount: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(thread: Thread): string {
    if (!thread.createdAt) return 'Just now';
    const secs = Math.floor(Date.now() / 1000) - thread.createdAt._seconds;
    if (secs < 60) return 'Just now';
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
    return `${Math.floor(secs / 86400)}d ago`;
}

const CATEGORY_COLORS: Record<string, string> = {
    Health: 'bg-rose-50 text-rose-600 border-rose-100',
    Agriculture: 'bg-green-50 text-green-600 border-green-100',
    Education: 'bg-blue-50 text-blue-600 border-blue-100',
    Business: 'bg-amber-50 text-amber-700 border-amber-100',
    Climate: 'bg-sky-50 text-sky-600 border-sky-100',
    Technology: 'bg-violet-50 text-violet-600 border-violet-100',
    Government: 'bg-orange-50 text-orange-600 border-orange-100',
    General: 'bg-gray-100 text-gray-600 border-gray-200',
};

function categoryColor(cat: string) {
    return CATEGORY_COLORS[cat] ?? 'bg-gray-100 text-gray-600 border-gray-200';
}

// ─── New Thread Modal ─────────────────────────────────────────────────────────
interface ModalProps {
    onClose: () => void;
    onPosted: (thread: Thread) => void;
}

const NewThreadModal = ({ onClose, onPosted }: ModalProps) => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [category, setCategory] = useState('General');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const overlayRef = useRef<HTMLDivElement>(null);

    const handleSubmit = async () => {
        if (!title.trim() || !body.trim()) {
            setError('Title and message are required.');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            // Wait up to 3 s for Firebase to rehydrate the current user
            let currentUser = auth.currentUser;
            if (!currentUser) {
                await new Promise<void>((resolve) => {
                    const unsub = auth.onAuthStateChanged((u) => {
                        currentUser = u;
                        unsub();
                        resolve();
                    });
                    setTimeout(resolve, 3000); // fallback
                });
            }

            if (!currentUser) {
                setError('You must be signed in to post. Please refresh and try again.');
                return;
            }

            // Force-refresh so we always send a fresh token
            const token = await currentUser.getIdToken(true);

            const res = await fetch(API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title: title.trim(), body: body.trim(), category }),
            });

            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json.error ?? `Server error: ${res.status}`);
            }

            const { id } = await res.json();

            // optimistic object — timestamp will arrive on next fetch
            onPosted({
                id,
                title: title.trim(),
                body: body.trim(),
                category,
                authorName: currentUser.displayName ?? currentUser.email ?? 'You',
                authorUid: currentUser.uid,
                createdAt: null,
                replyCount: 0,
                likeCount: 0,
            });
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            ref={overlayRef}
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] flex items-center justify-center px-4"
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-bold text-gray-900">Start a Discussion</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X size={18} />
                    </button>
                </div>

                {/* Title */}
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What's on your mind? (title)"
                    maxLength={120}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-gray-400 transition mb-3"
                />

                {/* Body */}
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Share your thoughts, questions or insights…"
                    rows={5}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-gray-400 transition resize-none mb-3"
                />

                {/* Category */}
                <div className="relative mb-4">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-400 transition bg-white pr-9"
                    >
                        {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

                {/* Actions */}
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-2 px-5 py-2 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 active:scale-[0.98] transition disabled:opacity-50"
                    >
                        {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        Post
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Reply Modal ─────────────────────────────────────────────────────────────
interface ReplyModalProps {
    thread: Thread;
    onClose: () => void;
    onReplied: (threadId: string) => void;
}

const ReplyModal = ({ thread, onClose, onReplied }: ReplyModalProps) => {
    interface Reply { id: number; body: string; authorName: string; createdAt: { _seconds: number } | null; }
    const [replies, setReplies] = useState<Reply[]>([]);
    const [loadingReplies, setLoadingReplies] = useState(true);
    const [replyBody, setReplyBody] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`${API}/${thread.id}/replies`)
            .then((r) => r.json())
            .then(setReplies)
            .catch(() => { })
            .finally(() => setLoadingReplies(false));
    }, [thread.id]);

    const postReply = async () => {
        if (!replyBody.trim()) return;
        setSubmitting(true); setError('');
        try {
            let currentUser = auth.currentUser;
            if (!currentUser) {
                await new Promise<void>((resolve) => {
                    const unsub = auth.onAuthStateChanged((u) => { currentUser = u; unsub(); resolve(); });
                    setTimeout(resolve, 3000);
                });
            }
            if (!currentUser) { setError('Sign in to reply.'); return; }
            const token = await currentUser.getIdToken(true);
            const res = await fetch(`${API}/${thread.id}/replies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ body: replyBody.trim() }),
            });
            if (!res.ok) throw new Error((await res.json()).error ?? 'Error');
            setReplies((prev) => [...prev, {
                id: Date.now(), body: replyBody.trim(),
                authorName: currentUser!.displayName ?? 'You',
                createdAt: null,
            }]);
            setReplyBody('');
            onReplied(thread.id);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            onClick={(e) => e.target === e.currentTarget && onClose()}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] flex items-center justify-center px-4"
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{thread.title}</p>
                        <p className="text-xs text-gray-400">{thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}</p>
                    </div>
                </div>

                {/* Thread body */}
                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/60">
                    <p className="text-xs text-gray-600 leading-relaxed">{thread.body}</p>
                </div>

                {/* Replies list */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                    {loadingReplies ? (
                        <div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin text-gray-300" /></div>
                    ) : replies.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-8">No replies yet — be the first!</p>
                    ) : replies.map((r) => (
                        <div key={r.id} className="flex gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shrink-0">
                                {r.authorName.charAt(0).toUpperCase()}
                            </div>
                            <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1">
                                <p className="text-xs font-semibold text-gray-800 mb-0.5">{r.authorName}</p>
                                <p className="text-xs text-gray-600 leading-relaxed">{r.body}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Reply input */}
                <div className="px-6 py-4 border-t border-gray-100">
                    {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
                    <div className="flex gap-2">
                        <input
                            value={replyBody}
                            onChange={(e) => setReplyBody(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && postReply()}
                            placeholder="Write a reply…"
                            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-gray-400 transition"
                        />
                        <button
                            onClick={postReply}
                            disabled={submitting || !replyBody.trim()}
                            className="flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition disabled:opacity-40"
                        >
                            {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                            Reply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Thread Card ──────────────────────────────────────────────────────────────
interface CardProps {
    thread: Thread;
    onLike: (id: string) => void;
    onReply: (thread: Thread) => void;
    liked: boolean;
}

const ThreadCard = ({ thread, onLike, onReply, liked }: CardProps) => (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200 group overflow-hidden">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {thread.authorName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{thread.authorName}</p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock size={10} /> {timeAgo(thread)}
                    </p>
                </div>
            </div>
            <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border shrink-0 ${categoryColor(thread.category)}`}>
                {thread.category}
            </span>
        </div>

        <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-1.5 group-hover:text-blue-600 transition-colors leading-snug break-words">
            {thread.title}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3 sm:mb-4 break-words">{thread.body}</p>

        {/* Footer — interactive */}
        <div className="flex items-center gap-2 sm:gap-3 text-gray-400">
            <button
                onClick={() => onLike(thread.id)}
                className={`flex items-center gap-1.5 text-[10px] sm:text-xs px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border transition-all duration-200
                    ${liked
                        ? 'bg-black text-white border-black'
                        : 'border-gray-100 hover:bg-gray-50 hover:border-gray-200'}`}
            >
                <ThumbsUp size={12} /> {thread.likeCount}
            </button>
            <button
                onClick={() => onReply(thread)}
                className="flex items-center gap-1.5 text-[10px] sm:text-xs px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all duration-200"
            >
                <MessageSquare size={12} /> {thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}
            </button>
        </div>
    </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ filtered }: { filtered: boolean }) => (
    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
        <MessageCircle size={40} className="text-gray-200 mb-3" />
        <p className="text-gray-400 text-sm font-medium">
            {filtered ? 'No discussions match your search.' : 'No discussions yet.'}
        </p>
        <p className="text-gray-300 text-xs mt-1">
            {filtered ? 'Try a different keyword or category.' : 'Be the first to start one!'}
        </p>
    </div>
);

// ─── Discussions Page ─────────────────────────────────────────────────────────
const Discussions = () => {
    const { isAuthenticated } = useAuth();
    const [threads, setThreads] = useState<Thread[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [replyThread, setReplyThread] = useState<Thread | null>(null);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    // track which thread IDs the user has liked (localStorage-backed)
    const [likedIds, setLikedIds] = useState<Set<string>>(() => {
        try { return new Set(JSON.parse(localStorage.getItem('likedThreads') ?? '[]')); }
        catch { return new Set(); }
    });

    // ── Fetch threads ──────────────────────────────────────────────────────────
    const fetchThreads = useCallback(async () => {
        setLoading(true);
        setFetchError('');
        try {
            const res = await fetch(API);
            if (!res.ok) throw new Error();
            const data: Thread[] = await res.json();
            setThreads(data);
        } catch {
            setFetchError('Could not load discussions. Is the backend running?');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchThreads(); }, [fetchThreads]);

    // ── Optimistic insert after post ───────────────────────────────────────────
    const handlePosted = (thread: Thread) => {
        setThreads((prev) => [thread, ...prev]);
        setTimeout(fetchThreads, 2000);
    };

    // ── Like / Unlike toggle ───────────────────────────────────────────────────
    const handleLike = async (id: string) => {
        const key = String(id);
        const alreadyLiked = likedIds.has(key);

        if (alreadyLiked) {
            // ── Unlike ──────────────────────────────────────────────────────────
            // Optimistic: decrement count, remove from liked set
            setThreads((prev) =>
                prev.map((t) => String(t.id) === key ? { ...t, likeCount: Math.max(0, t.likeCount - 1) } : t)
            );
            const newLiked = new Set(likedIds);
            newLiked.delete(key);
            setLikedIds(newLiked);
            localStorage.setItem('likedThreads', JSON.stringify([...newLiked]));
            await fetch(`${API}/${id}/unlike`, { method: 'PUT' }).catch(() => { });
        } else {
            // ── Like ────────────────────────────────────────────────────────────
            // Optimistic: increment count, add to liked set
            setThreads((prev) =>
                prev.map((t) => String(t.id) === key ? { ...t, likeCount: t.likeCount + 1 } : t)
            );
            const newLiked = new Set(likedIds).add(key);
            setLikedIds(newLiked);
            localStorage.setItem('likedThreads', JSON.stringify([...newLiked]));
            await fetch(`${API}/${id}/like`, { method: 'PUT' }).catch(() => { });
        }
    };

    // ── Reply count bump after posting ─────────────────────────────────────────
    const handleReplied = (id: string) => {
        setThreads((prev) => prev.map((t) => String(t.id) === String(id) ? { ...t, replyCount: t.replyCount + 1 } : t));
    };

    // ── Filtered list ──────────────────────────────────────────────────────────
    const filtered = threads.filter((t) => {
        const matchCat = activeCategory === 'All' || t.category === activeCategory;
        const q = search.toLowerCase();
        const matchSearch = !q || t.title.toLowerCase().includes(q) || t.body.toLowerCase().includes(q);
        return matchCat && matchSearch;
    });

    return (
        <div className="flex-1 bg-gray-50 min-h-screen px-4 sm:px-6 pt-6 sm:pt-10 pb-10 sm:pb-16">

            {/* ── Hero ── */}
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-black leading-tight mb-2 sm:mb-3">Discussions</h1>
                <p className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 leading-snug mb-2 sm:mb-3">
                    Questions, ideas & insights —<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-500">
                        straight from Cameroon's research community.
                    </span>
                </p>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-xl">
                    Explore ongoing conversations around data, research challenges, and findings across
                    health, agriculture, climate, education, and more. Join the dialogue — ask questions,
                    share discoveries, and connect with fellow researchers.
                </p>
                {/* Stats */}
                <div className="flex gap-4 sm:gap-6 mt-4 sm:mt-5">
                    <div className="flex flex-col">
                        <span className="text-sm sm:text-lg font-bold text-gray-900">{threads.length}</span>
                        <span className="text-[10px] sm:text-xs text-gray-400">Threads</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm sm:text-lg font-bold text-gray-900">{CATEGORIES.length - 1}</span>
                        <span className="text-[10px] sm:text-xs text-gray-400">Categories</span>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-100 mb-6 sm:mb-8" />

            {/* ── Toolbar ── */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
                {/* Search — always full row width so it never squeezes */}
                <div className="flex-1 min-w-0 flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3 shadow-sm focus-within:border-gray-400 transition">
                    <Search size={14} className="text-gray-400 shrink-0" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search discussions…"
                        className="flex-1 min-w-0 outline-none text-xs sm:text-sm text-gray-700 placeholder-gray-400 bg-transparent"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 transition shrink-0">
                            <X size={13} />
                        </button>
                    )}
                </div>

                {/* New Thread / Sign in */}
                {isAuthenticated ? (
                    <button
                        onClick={() => setModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 sm:px-5 py-2.5 sm:py-3 bg-black text-white text-xs sm:text-sm font-semibold rounded-2xl hover:bg-gray-800 active:scale-[0.98] transition shrink-0 shadow-sm"
                    >
                        <Plus size={14} /> <span className="hidden sm:inline">New </span>Thread
                    </button>
                ) : (
                    <p className="text-[10px] text-gray-400 w-full text-right pr-1">
                        <span className="font-medium">Sign in</span> to start a discussion
                    </p>
                )}
            </div>

            {/* ── Category chips ── */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-5 sm:mb-7">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold border transition-all duration-200
                            ${activeCategory === cat
                                ? 'bg-black text-white border-black shadow-sm scale-[1.03]'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* ── Thread list ── */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 size={28} className="animate-spin text-gray-300" />
                </div>
            ) : fetchError ? (
                <div className="flex flex-col items-center py-20 text-center">
                    <p className="text-sm text-red-400 font-medium">{fetchError}</p>
                    <button
                        onClick={fetchThreads}
                        className="mt-3 text-xs text-gray-500 underline hover:text-gray-700 transition"
                    >
                        Try again
                    </button>
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState filtered={search.trim() !== '' || activeCategory !== 'All'} />
            ) : (
                <div className="grid gap-4">
                    {filtered.map((t) => (
                        <ThreadCard
                            key={t.id}
                            thread={t}
                            onLike={handleLike}
                            onReply={setReplyThread}
                            liked={likedIds.has(t.id)}
                        />
                    ))}
                </div>
            )}

            {/* ── Modal ── */}
            {modalOpen && (
                <NewThreadModal
                    onClose={() => setModalOpen(false)}
                    onPosted={handlePosted}
                />
            )}
            {replyThread && (
                <ReplyModal
                    thread={replyThread}
                    onClose={() => setReplyThread(null)}
                    onReplied={handleReplied}
                />
            )}
        </div>
    );
};

export default Discussions;
