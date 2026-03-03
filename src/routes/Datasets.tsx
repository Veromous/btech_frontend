import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Search, SlidersHorizontal, X, ChevronDown,
    HeartPulse, TrendingUp, CloudSun, BrainCircuit, Users,
    Leaf, Landmark, FlaskConical, Globe, Zap,
    FileSpreadsheet, FileJson, FileText, Database,
    Upload, CheckCircle, AlertTriangle, AlertCircle,
    BarChart2, Shield, ShieldAlert, ShieldOff,
} from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

// ─── Data ─────────────────────────────────────────────────────────────────────
const SUGGESTIONS = [
    // Health
    'Malaria cases in Cameroon', 'HIV/AIDS prevalence by region', 'Maternal mortality rates',
    'Hospital access rural areas', 'Cholera outbreaks Far North', 'Vaccination coverage Cameroon',
    // Agriculture
    'Cocoa production by region', 'Agricultural yield Adamawa', 'Coffee export statistics',
    'Crop failure data North Region', 'Livestock population Cameroon', 'Banana farming Littoral',
    // Education
    'School enrolment rates Cameroon', 'Literacy rates by region', 'University graduation statistics',
    'Primary school dropout rates', 'Teacher-student ratio Cameroon',
    // Business & Economy
    'GDP growth Cameroon', 'SME performance Douala', 'Informal economy data',
    'Trade balance Cameroon', 'Import export statistics', 'Accounting records public sector',
    // Climate & Environment
    'Rainfall patterns North Region', 'Deforestation rates South Cameroon',
    'Temperature trends Yaoundé', 'Flooding incidents Wouri', 'Air quality Douala',
    // Connectivity & Tech
    'Internet penetration Cameroon', 'Mobile network coverage', 'Power outage frequency',
    'Electricity access rural Cameroon',
    // Population & Social
    'Population census 2023', 'Urban migration Cameroon', 'Unemployment rates youth',
    'Poverty index by region', 'Household income data',
    // Transport
    'Road condition survey Cameroon', 'Traffic data Douala', 'Rail freight statistics',
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
];

const FILE_TYPES = [
    { label: 'CSV', icon: <FileText size={15} /> },
    { label: 'JSON', icon: <FileJson size={15} /> },
    { label: 'Excel', icon: <FileSpreadsheet size={15} /> },
];

const FILE_SIZES = ['< 1 MB', '1–10 MB', '10–100 MB', '> 100 MB'];

const CHIPS = [
    'Health', 'Agriculture', 'Education', 'Business', 'Climate', 'Trade & Commerce',
];

// ─── FilterPanel ──────────────────────────────────────────────────────────────
interface FilterState {
    category: string | null;
    fileType: string | null;
    fileSize: string | null;
}

interface FilterPanelProps {
    open: boolean;
    filters: FilterState;
    setFilters: (f: FilterState) => void;
    onClose: () => void;
}

const FilterPanel = ({ open, filters, setFilters, onClose }: FilterPanelProps) => {
    const [draft, setDraft] = useState<FilterState>({ ...filters });

    useEffect(() => {
        if (open) setDraft({ ...filters });
    }, [open]);

    const pick = (key: keyof FilterState, val: string) =>
        setDraft((d) => ({ ...d, [key]: d[key] === val ? null : val }));

    const draftCount =
        (draft.category ? 1 : 0) + (draft.fileType ? 1 : 0) + (draft.fileSize ? 1 : 0);

    const handleApply = () => {
        setFilters({ ...draft });
        onClose();
    };

    const handleClear = () => {
        setDraft({ category: null, fileType: null, fileSize: null });
    };

    if (!open) return null;

    return (
        <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl w-80 p-5 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                    <SlidersHorizontal size={15} /> Filters
                    {draftCount > 0 && (
                        <span className="bg-black text-white text-xs rounded-full px-2 py-0.5">{draftCount}</span>
                    )}
                </span>
                <div className="flex items-center gap-3">
                    {draftCount > 0 && (
                        <button
                            onClick={handleClear}
                            className="text-xs text-gray-400 hover:text-red-500 transition"
                        >
                            Clear all
                        </button>
                    )}
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Categories */}
            <div className="mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Popular Categories</p>
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.label}
                            onClick={() => pick('category', cat.label)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-medium transition-all duration-200
                ${draft.category === cat.label
                                    ? 'bg-black text-white border-black scale-[1.03] shadow-sm'
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                        >
                            {cat.icon} {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* File Type */}
            <div className="mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">File Type</p>
                <div className="flex gap-2">
                    {FILE_TYPES.map((ft) => (
                        <button
                            key={ft.label}
                            onClick={() => pick('fileType', ft.label)}
                            className={`flex items-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-semibold transition-all duration-200
                ${draft.fileType === ft.label
                                    ? 'bg-black text-white border-black scale-[1.04] shadow-sm'
                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                        >
                            {ft.icon} {ft.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* File Size */}
            <div className="mb-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">File Size</p>
                <div className="flex flex-wrap gap-2">
                    {FILE_SIZES.map((size) => (
                        <button
                            key={size}
                            onClick={() => setDraft({ ...draft, fileSize: draft.fileSize === size ? null : size })}
                            className={`px-3 py-1.5 border rounded-full text-xs font-medium transition-all duration-200
                ${draft.fileSize === size
                                    ? 'bg-black text-white border-black scale-[1.04] shadow-sm'
                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={handleApply}
                className="w-full py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all duration-200 shadow-sm"
            >
                Apply{draftCount > 0 ? ` (${draftCount})` : ''}
            </button>
        </div>
    );
};

// ─── SearchBar ────────────────────────────────────────────────────────────────
interface SearchBarProps {
    query: string;
    setQuery: (v: string) => void;
    filters: FilterState;
    setFilters: (f: FilterState) => void;
}

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
                setShowAC(false);
                setFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const activeCount =
        (filters.category ? 1 : 0) + (filters.fileType ? 1 : 0) + (filters.fileSize ? 1 : 0);

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-5 py-3.5 shadow-sm focus-within:border-gray-400 focus-within:shadow-md transition-all duration-200">
                    <Search size={18} className="text-gray-400 shrink-0" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setShowAC(true); }}
                        onFocus={() => setShowAC(true)}
                        placeholder="Search datasets by topic, keyword, or category…"
                        className="flex-1 outline-none text-gray-700 text-sm placeholder-gray-400 bg-transparent"
                    />
                    {query && (
                        <button onClick={() => { setQuery(''); setShowAC(false); }} className="text-gray-400 hover:text-gray-600 transition">
                            <X size={16} />
                        </button>
                    )}
                </div>

                <button
                    onClick={() => setFilterOpen(!filterOpen)}
                    className={`flex items-center gap-2 px-4 py-3.5 rounded-2xl border text-sm font-semibold transition-all duration-200 shrink-0
            ${filterOpen || activeCount > 0
                            ? 'bg-black text-white border-black shadow-md'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:shadow-sm'}`}
                >
                    <SlidersHorizontal size={16} />
                    Filter
                    {activeCount > 0 && (
                        <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${filterOpen || activeCount > 0 ? 'bg-white text-black' : 'bg-black text-white'}`}>
                            {activeCount}
                        </span>
                    )}
                    <ChevronDown size={14} className={`transition-transform duration-200 ${filterOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {showAC && suggestions.length > 0 && (
                <div className="absolute left-0 right-14 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-40 overflow-hidden">
                    <p className="text-xs text-gray-400 px-4 pt-3 pb-1.5 font-semibold uppercase tracking-widest">Suggestions</p>
                    {suggestions.map((s) => (
                        <button
                            key={s}
                            onMouseDown={() => { setQuery(s); setShowAC(false); }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition text-left"
                        >
                            <Search size={14} className="text-gray-300 shrink-0" />
                            {s}
                        </button>
                    ))}
                </div>
            )}

            <FilterPanel
                open={filterOpen}
                filters={filters}
                setFilters={setFilters}
                onClose={() => setFilterOpen(false)}
            />
        </div>
    );
};

// ─── Chip Suggestions ─────────────────────────────────────────────────────────
interface ChipsProps {
    query: string;
    setQuery: (v: string) => void;
}

const ChipSuggestions = ({ query, setQuery }: ChipsProps) => (
    <div className="flex flex-wrap gap-2 mt-4">
        {CHIPS.map((chip) => (
            <button
                key={chip}
                onClick={() => setQuery(query === chip ? '' : chip)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200
          ${query === chip
                        ? 'bg-black text-white border-black shadow-sm scale-[1.04]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:shadow-sm'}`}
            >
                {chip}
            </button>
        ))}
    </div>
);

// ─── Upload Result Types ───────────────────────────────────────────────────────
interface AnalysisResult {
    qualityScore: number;
    qualityLevel: string;
    warnings: string[];
    rowCount: number;
    columnCount: number;
    cleanedPreview: (string | number | null)[][];
}

// ─── Quality Badge ─────────────────────────────────────────────────────────────
const QualityBadge = ({ level, score }: { level: string; score: number }) => {
    const isHigh = level === 'High Quality';
    const isMedium = level === 'Medium Quality';

    const { bg, text, border, icon } = isHigh
        ? { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: <Shield size={14} /> }
        : isMedium
            ? { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: <ShieldAlert size={14} /> }
            : { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: <ShieldOff size={14} /> };

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${bg} ${text} ${border}`}>
            {icon}
            {level}
            <span className="ml-1 opacity-70">({score}/100)</span>
        </div>
    );
};

// ─── Score Ring ────────────────────────────────────────────────────────────────
const ScoreRing = ({ score }: { score: number }) => {
    const r = 28;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

    return (
        <div className="relative w-20 h-20 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
                <circle
                    cx="32" cy="32" r={r} fill="none"
                    stroke={color} strokeWidth="6"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-extrabold text-gray-900 leading-none">{score}</span>
                <span className="text-[9px] text-gray-400 font-medium">/ 100</span>
            </div>
        </div>
    );
};

// ─── Upload Section ────────────────────────────────────────────────────────────
const ACCEPTED_TYPES = '.csv,.json,.xlsx,.xls';

const UploadSection = () => {
    const [dragOver, setDragOver] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const getFileIcon = (name: string) => {
        const ext = name.split('.').pop()?.toLowerCase();
        if (ext === 'csv') return <FileText size={18} className="text-blue-500" />;
        if (ext === 'json') return <FileJson size={18} className="text-violet-500" />;
        return <FileSpreadsheet size={18} className="text-emerald-500" />;
    };

    const handleFile = (f: File) => {
        setFile(f);
        setResult(null);
        setError(null);
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    }, []);

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) handleFile(f);
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`${BASE_URL}/datasets/upload`, {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? 'Upload failed');
            } else {
                setResult(data as AnalysisResult);
            }
        } catch {
            setError('Could not reach the server. Is the backend running?');
        } finally {
            setUploading(false);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    };

    return (
        <div className="mb-8">
            {/* Section header */}
            <div className="flex items-center gap-2 mb-4">
                <Upload size={16} className="text-gray-500" />
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Upload & Analyse Dataset</h2>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                {/* Drop zone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`cursor-pointer flex flex-col items-center justify-center gap-3 py-10 px-6 border-b border-gray-100 transition-all duration-200
            ${dragOver
                            ? 'bg-blue-50 border-blue-300 scale-[1.005]'
                            : 'bg-gray-50 hover:bg-white'}`}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept={ACCEPTED_TYPES}
                        onChange={onInputChange}
                        className="hidden"
                    />

                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200
            ${dragOver ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <Upload size={24} className={dragOver ? 'text-blue-500' : 'text-gray-400'} />
                    </div>

                    <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700">
                            {dragOver ? 'Drop your file here' : 'Drag & drop or click to upload'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Supports CSV, JSON, and Excel (.xlsx / .xls)</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {['CSV', 'JSON', 'Excel'].map((t) => (
                            <span key={t} className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 shadow-xs">
                                {t}
                            </span>
                        ))}
                    </div>
                </div>

                {/* File info + action */}
                <div className="px-6 py-4 flex items-center gap-4">
                    {file ? (
                        <>
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                {getFileIcon(file.name)}
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
                                    <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); setError(null); }}
                                className="text-gray-300 hover:text-red-400 transition shrink-0"
                            >
                                <X size={16} />
                            </button>
                        </>
                    ) : (
                        <p className="text-xs text-gray-400 flex-1">No file selected</p>
                    )}

                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shrink-0
              ${!file || uploading
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-black text-white hover:bg-gray-800 active:scale-[0.98] shadow-sm'}`}
                    >
                        {uploading ? (
                            <>
                                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Analyzing…
                            </>
                        ) : (
                            <>
                                <BarChart2 size={15} />
                                Analyse Dataset
                            </>
                        )}
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mx-6 mb-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                        <AlertCircle size={16} className="shrink-0" />
                        {error}
                    </div>
                )}

                {/* Results */}
                {result && (
                    <div className="border-t border-gray-100 px-6 py-5 space-y-5">
                        {/* Summary row */}
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                                    <span className="text-xs font-semibold text-gray-500">Analysis Complete</span>
                                </div>
                                <QualityBadge level={result.qualityLevel} score={result.qualityScore} />
                                <div className="flex gap-4 ml-2">
                                    <div className="text-center">
                                        <p className="text-lg font-extrabold text-gray-900">{result.rowCount.toLocaleString()}</p>
                                        <p className="text-xs text-gray-400">rows</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-extrabold text-gray-900">{result.columnCount}</p>
                                        <p className="text-xs text-gray-400">columns</p>
                                    </div>
                                </div>
                            </div>
                            <ScoreRing score={result.qualityScore} />
                        </div>

                        {/* Warnings */}
                        {result.warnings.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Warnings ({result.warnings.length})</p>
                                {result.warnings.map((w, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl px-4 py-2.5"
                                    >
                                        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                        {w}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* No warnings */}
                        {result.warnings.length === 0 && (
                            <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl px-4 py-2.5">
                                <CheckCircle size={14} className="shrink-0" />
                                No data quality issues detected.
                            </div>
                        )}

                        {/* Preview table */}
                        {result.cleanedPreview.length > 1 && (
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                                    Cleaned Data Preview ({result.cleanedPreview.length - 1} of {result.rowCount} rows shown)
                                </p>
                                <div className="overflow-x-auto rounded-xl border border-gray-100">
                                    <table className="min-w-full text-xs">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                {result.cleanedPreview[0].map((h, i) => (
                                                    <th
                                                        key={i}
                                                        className="px-4 py-2.5 text-left font-semibold text-gray-500 whitespace-nowrap"
                                                    >
                                                        {String(h ?? '')}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result.cleanedPreview.slice(1).map((row, ri) => (
                                                <tr
                                                    key={ri}
                                                    className="border-b border-gray-50 hover:bg-gray-50 transition"
                                                >
                                                    {row.map((cell, ci) => (
                                                        <td
                                                            key={ci}
                                                            className={`px-4 py-2 whitespace-nowrap ${cell === null ? 'text-gray-300 italic' : 'text-gray-700'}`}
                                                        >
                                                            {cell === null ? 'null' : (typeof cell === 'number' ? Number(cell.toFixed(4)) : String(cell))}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Datasets Page ────────────────────────────────────────────────────────────
const Datasets = () => {
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState<FilterState>({ category: null, fileType: null, fileSize: null });

    return (
        <div className="flex-1 bg-gray-50 min-h-screen px-8 pr-10 pt-10 pb-16">

            {/* ── Topic Header ── */}
            <div className="mb-8">
                <h1 className="text-5xl font-extrabold text-black leading-tight mb-3">
                    DataSet
                </h1>

                <p className="text-2xl font-bold text-gray-900 leading-snug mb-3">
                    From Adamawa to Limbe,<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-500">
                        Cameroon's data, all in one place.
                    </span>
                </p>

                <p className="text-gray-500 text-sm leading-relaxed max-w-xl">
                    A curated library of research-grade datasets collected across all ten regions of Cameroon —
                    from the rainforests of the South to the sahel of the Far North, from the port city of Douala
                    to the highlands of Bamenda. Agriculture, public health, education, climate, trade, and more:
                    verified, structured, and ready to power your next insight.
                </p>

                {/* Stats row */}
                <div className="flex gap-6 mt-5">
                    {[
                        { value: '4,800+', label: 'Datasets' },
                        { value: '10 Regions', label: 'Covered' },
                        { value: '3 formats', label: 'Supported' },
                    ].map((stat) => (
                        <div key={stat.label} className="flex flex-col">
                            <span className="text-lg font-bold text-gray-900">{stat.value}</span>
                            <span className="text-xs text-gray-400">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Divider ── */}
            <div className="border-t border-gray-100 mb-8" />

            {/* ── Upload Section ── */}
            <UploadSection />

            {/* ── Divider ── */}
            <div className="border-t border-gray-100 mb-8" />

            {/* ── Search + Filter ── */}
            <SearchBar query={query} setQuery={setQuery} filters={filters} setFilters={setFilters} />
            <ChipSuggestions query={query} setQuery={setQuery} />

            {/* ── Results placeholder ── */}
            <div className="mt-10 flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <Database size={40} className="text-gray-200 mb-3" />
                <p className="text-gray-400 text-sm font-medium">Datasets will appear here.</p>
                <p className="text-gray-300 text-xs mt-1">Use the search bar or filters above to explore.</p>
            </div>
        </div>
    );
};

export default Datasets;
