import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Search, SlidersHorizontal, X, ChevronDown,
    HeartPulse, TrendingUp, CloudSun, BrainCircuit, Users,
    Leaf, Landmark, FlaskConical, Globe, Zap,
    FileSpreadsheet, FileJson, FileText, Database,
    Download, Loader2, MapPin, Calendar, Rows3, Info, ArrowLeft,
} from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

// ─── Data ─────────────────────────────────────────────────────────────────────
const SUGGESTIONS = [
    'Malaria cases in Cameroon', 'HIV/AIDS prevalence by region', 'Maternal mortality rates',
    'Cocoa production by region', 'Agricultural yield Adamawa', 'Coffee export statistics',
    'School enrolment rates Cameroon', 'Literacy rates by region',
    'GDP growth Cameroon', 'SME performance Douala',
    'Rainfall patterns North Region', 'Deforestation rates South Cameroon',
    'Internet penetration Cameroon', 'Mobile network coverage',
    'Population census 2023', 'Urban migration Cameroon', 'Youth unemployment',
];

const CATEGORIES = [
    { label: 'Health', icon: <HeartPulse size={16} /> },
    { label: 'Finance', icon: <TrendingUp size={16} /> },
    { label: 'Climate', icon: <CloudSun size={16} /> },
    { label: 'AI / ML', icon: <BrainCircuit size={16} /> },
    { label: 'Social', icon: <Users size={16} /> },
    { label: 'Agriculture', icon: <Leaf size={16} /> },
    { label: 'Government', icon: <Landmark size={16} /> },
    { label: 'Science', icon: <FlaskConical size={16} /> },
    { label: 'Global', icon: <Globe size={16} /> },
    { label: 'Energy', icon: <Zap size={16} /> },
    { label: 'Technology', icon: <BrainCircuit size={16} /> },
    { label: 'Education', icon: <BookOpen size={16} /> },
];

const FILE_TYPES = [
    { label: 'CSV', icon: <FileText size={15} />, ext: 'csv' },
    { label: 'JSON', icon: <FileJson size={15} />, ext: 'json' },
    { label: 'Excel', icon: <FileSpreadsheet size={15} />, ext: 'xlsx' },
];

const FILE_SIZES = ['< 1 MB', '1–10 MB', '10–100 MB', '> 100 MB'];

const CHIPS = ['Health', 'Agriculture', 'Education', 'Business', 'Climate', 'Trade & Commerce'];

// ─── Missing icon shim ─────────────────────────────────────────────────────────
function BookOpen({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
    );
}

// ─── Category colours ──────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
    Health: 'bg-rose-50 text-rose-600 border-rose-100',
    Agriculture: 'bg-green-50 text-green-600 border-green-100',
    Education: 'bg-blue-50 text-blue-600 border-blue-100',
    Finance: 'bg-amber-50 text-amber-700 border-amber-100',
    Climate: 'bg-sky-50 text-sky-600 border-sky-100',
    Technology: 'bg-violet-50 text-violet-600 border-violet-100',
    Social: 'bg-pink-50 text-pink-600 border-pink-100',
    Government: 'bg-orange-50 text-orange-600 border-orange-100',
    Science: 'bg-teal-50 text-teal-600 border-teal-100',
    General: 'bg-gray-100 text-gray-600 border-gray-200',
};
function catColor(cat: string) {
    return CATEGORY_COLORS[cat] ?? 'bg-gray-100 text-gray-600 border-gray-200';
}

// ─── Types ──────────────────────────────────────────────────────────────────────
interface CatalogEntry {
    id: number;
    name: string;
    description: string;
    category: string;
    region: string;
    source: string;
    year: number | null;
    rowCount: number;
    fileSize: string;
}

// ─── FilterPanel ──────────────────────────────────────────────────────────────
interface FilterState { category: string | null; fileType: string | null; fileSize: string | null; }
interface FilterPanelProps { open: boolean; filters: FilterState; setFilters: (f: FilterState) => void; onClose: () => void; }

const FilterPanel = ({ open, filters, setFilters, onClose }: FilterPanelProps) => {
    const [draft, setDraft] = useState<FilterState>({ ...filters });
    useEffect(() => { if (open) setDraft({ ...filters }); }, [open]);

    const pick = (key: keyof FilterState, val: string) =>
        setDraft((d) => ({ ...d, [key]: d[key] === val ? null : val }));
    const draftCount = (draft.category ? 1 : 0) + (draft.fileType ? 1 : 0) + (draft.fileSize ? 1 : 0);

    if (!open) return null;
    return (
        <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl w-80 p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                    <SlidersHorizontal size={15} /> Filters
                    {draftCount > 0 && <span className="bg-black text-white text-xs rounded-full px-2 py-0.5">{draftCount}</span>}
                </span>
                <div className="flex items-center gap-3">
                    {draftCount > 0 && (
                        <button onClick={() => setDraft({ category: null, fileType: null, fileSize: null })}
                            className="text-xs text-gray-400 hover:text-red-500 transition">Clear all</button>
                    )}
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={16} /></button>
                </div>
            </div>

            <div className="mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Category</p>
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                        <button key={cat.label} onClick={() => pick('category', cat.label)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-medium transition-all duration-200
                            ${draft.category === cat.label ? 'bg-black text-white border-black scale-[1.03]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'}`}>
                            {cat.icon} {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">File Type</p>
                <div className="flex gap-2">
                    {FILE_TYPES.map((ft) => (
                        <button key={ft.label} onClick={() => pick('fileType', ft.label)}
                            className={`flex items-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-semibold transition-all duration-200
                            ${draft.fileType === ft.label ? 'bg-black text-white border-black scale-[1.04]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                            {ft.icon} {ft.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">File Size</p>
                <div className="flex flex-wrap gap-2">
                    {FILE_SIZES.map((size) => (
                        <button key={size}
                            onClick={() => setDraft({ ...draft, fileSize: draft.fileSize === size ? null : size })}
                            className={`px-3 py-1.5 border rounded-full text-xs font-medium transition-all duration-200
                            ${draft.fileSize === size ? 'bg-black text-white border-black scale-[1.04]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            <button onClick={() => { setFilters({ ...draft }); onClose(); }}
                className="w-full py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all duration-200 shadow-sm">
                Apply{draftCount > 0 ? ` (${draftCount})` : ''}
            </button>
        </div>
    );
};

// ─── SearchBar ────────────────────────────────────────────────────────────────
interface SearchBarProps { query: string; setQuery: (v: string) => void; filters: FilterState; setFilters: (f: FilterState) => void; }

const SearchBar = ({ query, setQuery, filters, setFilters }: SearchBarProps) => {
    const [filterOpen, setFilterOpen] = useState(false);
    const [showAC, setShowAC] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const suggestions = query.trim().length > 0
        ? SUGGESTIONS.filter((s) => s.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
        : [];

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowAC(false); setFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const activeCount = (filters.category ? 1 : 0) + (filters.fileType ? 1 : 0) + (filters.fileSize ? 1 : 0);

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3.5 shadow-sm focus-within:border-gray-400 focus-within:shadow-md transition-all duration-200">
                    <Search size={15} className="text-gray-400 shrink-0" />
                    <input type="text" value={query}
                        onChange={(e) => { setQuery(e.target.value); setShowAC(true); }}
                        onFocus={() => setShowAC(true)}
                        placeholder="Search datasets by topic, keyword, or category…"
                        className="flex-1 outline-none text-gray-700 text-xs sm:text-sm placeholder-gray-400 bg-transparent" />
                    {query && (
                        <button onClick={() => { setQuery(''); setShowAC(false); }} className="text-gray-400 hover:text-gray-600 transition">
                            <X size={14} />
                        </button>
                    )}
                </div>
                <button onClick={() => setFilterOpen(!filterOpen)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 sm:px-4 sm:py-3.5 rounded-2xl border text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0
                    ${filterOpen || activeCount > 0 ? 'bg-black text-white border-black shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:shadow-sm'}`}>
                    <SlidersHorizontal size={14} />
                    <span className="hidden sm:inline">Filter</span>
                    {activeCount > 0 && (
                        <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${filterOpen || activeCount > 0 ? 'bg-white text-black' : 'bg-black text-white'}`}>{activeCount}</span>
                    )}
                    <ChevronDown size={12} className={`transition-transform duration-200 ${filterOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {showAC && suggestions.length > 0 && (
                <div className="absolute left-0 right-14 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-40 overflow-hidden">
                    <p className="text-xs text-gray-400 px-4 pt-3 pb-1.5 font-semibold uppercase tracking-widest">Suggestions</p>
                    {suggestions.map((s) => (
                        <button key={s} onMouseDown={() => { setQuery(s); setShowAC(false); }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition text-left">
                            <Search size={14} className="text-gray-300 shrink-0" /> {s}
                        </button>
                    ))}
                </div>
            )}
            <FilterPanel open={filterOpen} filters={filters} setFilters={setFilters} onClose={() => setFilterOpen(false)} />
        </div>
    );
};

// ─── Chip Suggestions ─────────────────────────────────────────────────────────
const ChipSuggestions = ({ query, setQuery }: { query: string; setQuery: (v: string) => void }) => (
    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3">
        {CHIPS.map((chip) => (
            <button key={chip} onClick={() => setQuery(query === chip ? '' : chip)}
                className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold border transition-all duration-200
                ${query === chip ? 'bg-black text-white border-black shadow-sm scale-[1.04]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:shadow-sm'}`}>
                {chip}
            </button>
        ))}
    </div>
);

// ─── Download Picker ──────────────────────────────────────────────────────────
const DownloadPicker = ({ datasetId, datasetName, direction = 'up' }: {
    datasetId: number;
    datasetName: string;
    direction?: 'up' | 'down';
}) => {
    const [open, setOpen] = useState(false);
    const [downloading, setDownloading] = useState<string | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const download = async (ext: string) => {
        setDownloading(ext);
        try {
            const res = await fetch(`${BASE_URL}/catalog/${datasetId}/download?format=${ext}`);
            if (!res.ok) throw new Error('Download failed');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${datasetName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${ext}`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            alert('Download failed. Is the backend running?');
        } finally {
            setDownloading(null);
            setOpen(false);
        }
    };

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-800 active:scale-[0.97] transition-all duration-200 shadow-sm"
            >
                <Download size={12} /> Download
                <ChevronDown size={11} className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className={`absolute right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-xl w-40 overflow-hidden
                    ${direction === 'down' ? 'top-full mt-2' : 'bottom-full mb-2'}`}>
                    <p className="text-[10px] text-gray-400 px-3 pt-2.5 pb-1 font-semibold uppercase tracking-widest">Choose format</p>
                    {FILE_TYPES.map((ft) => (
                        <button
                            key={ft.ext}
                            onClick={() => download(ft.ext)}
                            disabled={downloading === ft.ext}
                            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                        >
                            {downloading === ft.ext
                                ? <Loader2 size={13} className="animate-spin text-gray-400" />
                                : ft.icon}
                            {ft.label}
                            {downloading === ft.ext && <span className="text-gray-400 ml-auto">…</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Dataset Detail Modal ─────────────────────────────────────────────────────
interface DetailEntry extends CatalogEntry {
    data: Record<string, unknown>[];
}

const DatasetDetailModal = ({ entry, onClose }: { entry: CatalogEntry; onClose: () => void }) => {
    const [detail, setDetail] = useState<DetailEntry | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(true);

    useEffect(() => {
        setLoadingDetail(true);
        fetch(`${BASE_URL}/catalog/${entry.id}`)
            .then((r) => r.json())
            .then((d) => setDetail(d))
            .catch(() => { })
            .finally(() => setLoadingDetail(false));
    }, [entry.id]);

    // Lock body scroll while open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const headers = detail?.data?.length ? Object.keys(detail.data[0]) : [];

    return (
        <div
            onClick={(e) => e.target === e.currentTarget && onClose()}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
            <div className="bg-white w-full sm:max-w-3xl sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[93vh] sm:max-h-[88vh] overflow-hidden">

                {/* Header */}
                <div className="flex items-center gap-3 px-5 sm:px-7 py-4 border-b border-gray-100">
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition shrink-0">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-bold text-gray-900 leading-tight truncate">{entry.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catColor(entry.category)}`}>
                                {entry.category}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-gray-500">
                                <MapPin size={9} /> {entry.region}
                            </span>
                        </div>
                    </div>
                    <DownloadPicker datasetId={entry.id} datasetName={entry.name} direction="down" />
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-6">

                    {/* Description */}
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Description</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{entry.description}</p>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: 'Category', value: entry.category },
                            { label: 'Region', value: entry.region },
                            { label: 'Year', value: entry.year ?? '—' },
                            { label: 'Rows', value: entry.rowCount.toLocaleString() },
                            { label: 'Source', value: entry.source || '—' },
                            { label: 'File size', value: entry.fileSize },
                        ].map((item) => (
                            <div key={item.label} className="bg-gray-50 rounded-2xl px-4 py-3">
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{item.label}</p>
                                <p className="text-xs font-bold text-gray-800 truncate">{String(item.value)}</p>
                            </div>
                        ))}
                    </div>

                    {/* Data preview table */}
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Info size={12} /> Data Preview
                        </p>
                        {loadingDetail ? (
                            <div className="flex justify-center py-10">
                                <Loader2 size={22} className="animate-spin text-gray-300" />
                            </div>
                        ) : !detail || detail.data.length === 0 ? (
                            <p className="text-xs text-gray-400 py-6 text-center">No preview available.</p>
                        ) : (
                            <div className="overflow-x-auto rounded-2xl border border-gray-100">
                                <table className="min-w-full text-xs">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            {headers.map((h) => (
                                                <th key={h} className="px-4 py-2.5 text-left font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detail.data.map((row, ri) => (
                                            <tr key={ri} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                                {headers.map((h) => (
                                                    <td key={h} className="px-4 py-2 whitespace-nowrap text-gray-700">
                                                        {row[h] === null || row[h] === undefined ? <span className="text-gray-300 italic">—</span> : String(row[h])}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Dataset Card ─────────────────────────────────────────────────────────────
const DatasetCard = ({ entry, onOpen }: { entry: CatalogEntry; onOpen: (e: CatalogEntry) => void }) => (
    <div
        onClick={() => onOpen(entry)}
        className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200 group flex flex-col gap-3 cursor-pointer"
    >

        {/* Header row: category + region badges */}
        <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full border ${catColor(entry.category)}`}>
                {entry.category}
            </span>
            <span className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-0.5 rounded-full font-medium">
                <MapPin size={10} /> {entry.region}
            </span>
        </div>

        {/* Name + description */}
        <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors leading-snug">
                {entry.name}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{entry.description}</p>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-[10px] text-gray-400">
            {entry.year && (
                <span className="flex items-center gap-1"><Calendar size={10} /> {entry.year}</span>
            )}
            <span className="flex items-center gap-1"><Rows3 size={10} /> {entry.rowCount} rows</span>
            {entry.source && (
                <span className="truncate max-w-[120px]">{entry.source}</span>
            )}
        </div>

        {/* Footer: file size + download (stop propagation so card click doesn't also open modal) */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-50">
            <span className="text-[10px] text-gray-400">Click to view details</span>
            <div onClick={(e) => e.stopPropagation()}>
                <DownloadPicker datasetId={entry.id} datasetName={entry.name} />
            </div>
        </div>
    </div>
);

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 animate-pulse space-y-3">
        <div className="flex gap-2">
            <div className="h-5 w-20 bg-gray-100 rounded-full" />
            <div className="h-5 w-24 bg-gray-100 rounded-full" />
        </div>
        <div className="space-y-2">
            <div className="h-4 w-3/4 bg-gray-100 rounded" />
            <div className="h-3 w-full bg-gray-100 rounded" />
            <div className="h-3 w-2/3 bg-gray-100 rounded" />
        </div>
        <div className="flex gap-3">
            <div className="h-3 w-12 bg-gray-100 rounded" />
            <div className="h-3 w-14 bg-gray-100 rounded" />
        </div>
        <div className="flex justify-between pt-1 border-t border-gray-50">
            <div className="h-3 w-10 bg-gray-100 rounded" />
            <div className="h-6 w-24 bg-gray-100 rounded-xl" />
        </div>
    </div>
);

// ─── Datasets Page ────────────────────────────────────────────────────────────
const Datasets = () => {
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState<FilterState>({ category: null, fileType: null, fileSize: null });
    const [entries, setEntries] = useState<CatalogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [selectedEntry, setSelectedEntry] = useState<CatalogEntry | null>(null);

    // debounced fetch
    const fetchCatalog = useCallback(async (search: string, category: string) => {
        setLoading(true);
        setFetchError('');
        try {
            const params = new URLSearchParams();
            if (search.trim()) params.set('search', search.trim());
            if (category) params.set('category', category);
            const res = await fetch(`${BASE_URL}/catalog?${params.toString()}`);
            if (!res.ok) throw new Error();
            setEntries(await res.json());
        } catch {
            setFetchError('Could not load datasets. Is the backend running?');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchCatalog(query, filters.category ?? ''), 300);
        return () => clearTimeout(timer);
    }, [query, filters.category, fetchCatalog]);

    return (
        <div className="flex-1 bg-gray-50 min-h-screen px-4 sm:px-6 pt-6 sm:pt-10 pb-10 sm:pb-16">

            {/* ── Topic Header ── */}
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-black leading-tight mb-2 sm:mb-3">
                    DataSet
                </h1>
                <p className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 leading-snug mb-2 sm:mb-3">
                    From Adamawa to Limbe,<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-500">
                        Cameroon's data, all in one place.
                    </span>
                </p>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-xl">
                    A curated library of research-grade datasets collected across all ten regions of Cameroon —
                    verified, structured, and ready to power your next insight. Download in CSV, JSON, or Excel.
                </p>

                {/* Stats row */}
                <div className="flex gap-4 sm:gap-6 mt-4 sm:mt-5">
                    {[
                        { value: entries.length > 0 ? `${entries.length}` : '—', label: 'Datasets' },
                        { value: '10 Regions', label: 'Covered' },
                        { value: '3 formats', label: 'Available' },
                    ].map((stat) => (
                        <div key={stat.label} className="flex flex-col">
                            <span className="text-sm sm:text-lg font-bold text-gray-900">{stat.value}</span>
                            <span className="text-[10px] sm:text-xs text-gray-400">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Divider ── */}
            <div className="border-t border-gray-100 mb-6 sm:mb-8" />

            {/* ── Search + Filter ── */}
            <SearchBar query={query} setQuery={setQuery} filters={filters} setFilters={setFilters} />
            <ChipSuggestions query={query} setQuery={setQuery} />

            {/* ── Results ── */}
            <div className="mt-8 sm:mt-10">
                {loading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : fetchError ? (
                    <div className="flex flex-col items-center py-20 text-center">
                        <p className="text-sm text-red-400 font-medium">{fetchError}</p>
                        <button onClick={() => fetchCatalog(query, filters.category ?? '')}
                            className="mt-3 text-xs text-gray-500 underline hover:text-gray-700 transition">
                            Try again
                        </button>
                    </div>
                ) : entries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                        <Database size={32} className="text-gray-200 mb-2" />
                        <p className="text-gray-500 text-xs sm:text-sm font-semibold">No dataset found.</p>
                        <p className="text-gray-300 text-[10px] sm:text-xs mt-1">Try a different keyword, category, or region.</p>
                    </div>
                ) : (() => {
                    const isFiltered = query.trim() !== '' || !!filters.category;
                    const displayed = isFiltered ? entries : entries.slice(0, 9);
                    return (
                        <>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {displayed.map((entry) => (
                                    <DatasetCard key={entry.id} entry={entry} onOpen={setSelectedEntry} />
                                ))}
                            </div>
                            {!isFiltered && (
                                <p className="text-center text-xs text-gray-400 mt-6">
                                    Showing {displayed.length} of {entries.length} datasets.{' '}
                                    <span className="font-semibold text-gray-500">Can't find what you're looking for? Use the search bar above.</span>
                                </p>
                            )}
                        </>
                    );
                })()}
            </div>

            {selectedEntry && (
                <DatasetDetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
            )}
        </div>
    );
};

export default Datasets;
