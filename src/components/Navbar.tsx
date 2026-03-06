import {
  Logs, Plus, Minus, Home, Database, MessageCircle, Contact, Flag, User, LogOut,
  Upload, X, FileText, FileJson, FileSpreadsheet, BarChart2, AlertCircle, CheckCircle2, ShieldX,
} from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useReport } from '../context/ReportContext';
import type { AnalysisResult } from '../context/ReportContext';

const LARGE_SCREEN = 1024;
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
const ACCEPTED_TYPES = '.csv,.json,.xlsx,.xls';
const MIN_QUALITY = 70; // minimum quality score to allow catalog publishing

const CATEGORIES = ['Health', 'Agriculture', 'Education', 'Finance', 'Climate',
  'Technology', 'Social', 'Government', 'Science', 'General'];
const REGIONS = ['Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
  'North', 'North West', 'South', 'South West', 'West', 'National'];

const menuItems = [
  { icons: <Home size={18} />, label: 'Home', path: '/' },
  { icons: <Database size={18} />, label: 'Datasets', path: '/datasets' },
  { icons: <MessageCircle size={18} />, label: 'Discussions', path: '/discussions' },
  { icons: <Contact size={18} />, label: 'Support', path: '/support' },
  { icons: <Flag size={18} />, label: 'Reports', path: '/reports' },
];

// ─── Upload Modal ──────────────────────────────────────────────────────────────
interface UploadModalProps {
  anchorOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UploadModal = ({ anchorOpen, onClose, onSuccess }: UploadModalProps) => {
  const { setReport } = useReport();

  // Step 1
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Step 2
  const [step, setStep] = useState<1 | 2>(1);
  const [qualityScore, setQualityScore] = useState(0);
  const [parsedRows, setParsedRows] = useState<object[]>([]);
  const [addToCatalog, setAddToCatalog] = useState<boolean | null>(null); // null = not chosen yet
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [meta, setMeta] = useState({
    name: '', category: 'Health', region: 'National',
    description: '', source: '', year: new Date().getFullYear(),
  });

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'csv') return <FileText size={18} className="text-blue-500" />;
    if (ext === 'json') return <FileJson size={18} className="text-violet-500" />;
    return <FileSpreadsheet size={18} className="text-emerald-500" />;
  };

  const handleFile = (f: File) => { setFile(f); setError(null); };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  // ── Step 1: Analyse ──────────────────────────────────────────────────────────
  const handleAnalyse = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${BASE_URL}/datasets/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Upload failed'); return; }

      const report: AnalysisResult = { ...data, fileName: file.name, uploadedAt: new Date().toISOString() };
      setReport(report);
      setQualityScore(data.qualityScore ?? 0);
      if (data._rows) setParsedRows(data._rows);

      // pre-fill name from filename
      setMeta((m) => ({
        ...m,
        name: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      }));
      setStep(2);
    } catch {
      setError('Could not reach the server. Is the backend running?');
    } finally {
      setUploading(false);
    }
  };

  // ── Step 2: Choose Yes/No ────────────────────────────────────────────────────
  const handleCatalogChoice = (yes: boolean) => {
    if (yes && qualityScore < MIN_QUALITY) {
      setRejected(true);
      return;
    }
    setRejected(false);
    setAddToCatalog(yes);
  };

  // ── Step 2: Save to catalog ──────────────────────────────────────────────────
  const handleSave = async () => {
    if (!meta.name.trim()) { setError('Please enter a dataset name.'); return; }

    if (!Array.isArray(parsedRows) || parsedRows.length === 0) {
      setError('No dataset rows found. Please go back and re-analyse the file.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const saveRes = await fetch(`${BASE_URL}/catalog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: meta.name.trim(),
          description: meta.description.trim(),
          category: meta.category,
          region: meta.region,
          source: meta.source.trim(),
          year: meta.year || null,
          data: parsedRows,
        }),
      });
      if (!saveRes.ok) {
        if (saveRes.status === 413) {
          setError('Dataset is too large to upload. Try reducing the number of rows.');
          return;
        }
        const e = await saveRes.json().catch(() => ({}));
        setError(e.error ?? 'Failed to save to catalog');
        return;
      }
      // Show appreciation message, then close after 2.5s
      setSaved(true);
      setTimeout(() => onSuccess(), 2500);
    } catch {
      setError('Could not save to catalog. Is the backend running?');
    } finally {
      setSaving(false);
    }
  };

  const scoreColor = qualityScore >= MIN_QUALITY ? 'text-emerald-600' : 'text-red-500';
  const labelClass = 'text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-1';
  const inputClass = 'w-full text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-gray-400 transition bg-gray-50 placeholder-gray-300';

  return (
    <div
      className={`absolute mt-1 top-0 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden
        ${step === 2 && addToCatalog ? 'w-80' : 'w-72'} ${anchorOpen ? 'left-44 lg:left-56' : 'left-12 lg:left-16'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <Upload size={14} />
          {step === 1 ? 'Upload & Analyse' : addToCatalog === true ? 'Dataset Details' : 'Analysis Complete'}
        </span>
        <div className="flex items-center gap-2">
          {step === 2 && (
            <button
              onClick={() => { setStep(1); setAddToCatalog(null); setRejected(false); setError(null); }}
              className="text-[10px] text-gray-400 hover:text-gray-600 transition"
            >
              ← Back
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ── STEP 1: File pick + Analyse ── */}
      {step === 1 && (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer flex flex-col items-center justify-center gap-2 py-8 px-5 border-b border-gray-100 transition-all duration-200
              ${dragOver ? 'bg-blue-50' : 'bg-gray-50 hover:bg-white'}`}
          >
            <input ref={inputRef} type="file" accept={ACCEPTED_TYPES} className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${dragOver ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <Upload size={22} className={dragOver ? 'text-blue-500' : 'text-gray-400'} />
            </div>
            <p className="text-xs font-semibold text-gray-700 text-center">
              {dragOver ? 'Drop your file here' : 'Drag & drop or click to select'}
            </p>
            <p className="text-[10px] text-gray-400">CSV, JSON, Excel (.xlsx / .xls)</p>
          </div>

          <div className="px-4 py-3 flex items-center gap-3">
            {file ? (
              <>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getFileIcon(file.name)}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{file.name}</p>
                    <p className="text-[10px] text-gray-400">{formatBytes(file.size)}</p>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); setError(null); }}
                  className="text-gray-300 hover:text-red-400 transition shrink-0"><X size={14} /></button>
              </>
            ) : (
              <p className="text-[10px] text-gray-400 flex-1">No file selected</p>
            )}
            <button onClick={handleAnalyse} disabled={!file || uploading}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0
                ${!file || uploading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800 active:scale-[0.98] shadow-sm'}`}>
              {uploading
                ? <><span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />Analysing…</>
                : <><BarChart2 size={13} />Analyse</>}
            </button>
          </div>
        </>
      )}

      {/* ── STEP 2: Result + catalog choice ── */}
      {step === 2 && (
        <div className="px-4 py-4 space-y-3 max-h-[75vh] overflow-y-auto">

          {saved ? (
            /* ── Appreciation screen ── */
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                <CheckCircle2 size={28} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Thank you for your contribution! 🎉</p>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  Your dataset is now live in the public catalog and available for everyone to explore and download.
                </p>
              </div>
              <p className="text-[10px] text-gray-300">Closing…</p>
            </div>
          ) : (
            <>
              {/* Quality score banner */}
              <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 border ${qualityScore >= MIN_QUALITY ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                {qualityScore >= MIN_QUALITY
                  ? <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                  : <ShieldX size={18} className="text-red-400 shrink-0" />}
                <div>
                  <p className={`text-xs font-bold ${scoreColor}`}>Quality Score: {qualityScore}%</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {qualityScore >= MIN_QUALITY
                      ? 'This dataset meets the minimum quality threshold.'
                      : `Minimum required is ${MIN_QUALITY}%. Dataset cannot be published.`}
                  </p>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 text-center">
                Your analysis report is saved. Would you like to add this dataset to the public catalog?
              </p>

              {/* Yes / No choice */}
              {addToCatalog === null && (
                <div className="flex gap-2">
                  <button onClick={() => handleCatalogChoice(true)}
                    className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-xs font-bold text-gray-700 hover:border-black hover:bg-black hover:text-white transition-all duration-200">
                    ✓ Yes, publish
                  </button>
                  <button onClick={() => { onSuccess(); }}
                    className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-xs font-bold text-gray-500 hover:border-gray-400 transition-all duration-200">
                    ✗ No, skip
                  </button>
                </div>
              )}

              {/* Rejection message */}
              {rejected && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-[11px] rounded-xl px-3 py-2.5">
                  <ShieldX size={13} className="shrink-0 mt-0.5" />
                  <span>
                    <strong>Dataset rejected.</strong> Quality score is {qualityScore}% — below the required {MIN_QUALITY}%.
                    Please clean and re-upload a higher-quality file to publish it.
                  </span>
                </div>
              )}

              {/* Metadata form */}
              {addToCatalog === true && !rejected && (
                <>
                  <div>
                    <label className={labelClass}>Dataset Name *</label>
                    <input value={meta.name} onChange={(e) => setMeta({ ...meta, name: e.target.value })}
                      placeholder="e.g. Malaria Cases 2023" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea value={meta.description} onChange={(e) => setMeta({ ...meta, description: e.target.value })}
                      placeholder="Brief description of the dataset…" rows={2}
                      className={`${inputClass} resize-none`} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={labelClass}>Category *</label>
                      <select value={meta.category} onChange={(e) => setMeta({ ...meta, category: e.target.value })} className={inputClass}>
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Region *</label>
                      <select value={meta.region} onChange={(e) => setMeta({ ...meta, region: e.target.value })} className={inputClass}>
                        {REGIONS.map((r) => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={labelClass}>Source</label>
                      <input value={meta.source} onChange={(e) => setMeta({ ...meta, source: e.target.value })}
                        placeholder="e.g. MINSANTE" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Year</label>
                      <input type="number" value={meta.year}
                        onChange={(e) => setMeta({ ...meta, year: parseInt(e.target.value) || new Date().getFullYear() })}
                        className={inputClass} />
                    </div>
                  </div>

                  <button onClick={handleSave} disabled={saving}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all duration-200 shadow-sm disabled:opacity-60">
                    {saving
                      ? <><span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
                      : 'Publish to Catalog'}
                  </button>
                </>
              )}

              {/* If rejected, let them skip */}
              {rejected && (
                <button onClick={onSuccess}
                  className="w-full py-2 rounded-xl border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 transition">
                  Continue without publishing
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-4 mb-3 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-[11px] rounded-xl px-3 py-2.5">
          <AlertCircle size={13} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}
    </div>
  );
};

// ─── Toast Notification ───────────────────────────────────────────────────────
const UploadToast = ({ onNavigate, onDismiss }: { onNavigate: () => void; onDismiss: () => void }) => (
  <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-xl max-w-xs animate-fade-in">
    <Flag size={16} className="text-blue-400 shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold">Analysis complete!</p>
      <p className="text-[10px] text-gray-400 mt-0.5">Your report is ready on the Reports page.</p>
    </div>
    <div className="flex flex-col gap-1 shrink-0">
      <button onClick={onNavigate} className="text-[10px] font-semibold text-blue-400 hover:text-blue-300 transition">View →</button>
      <button onClick={onDismiss} className="text-[10px] text-gray-500 hover:text-gray-300 transition">Dismiss</button>
    </div>
  </div>
);

// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(() => window.innerWidth >= LARGE_SCREEN);
  useEffect(() => {
    const onResize = () => setOpen(window.innerWidth >= LARGE_SCREEN);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const uploadRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (uploadRef.current && !uploadRef.current.contains(e.target as Node))
        setUploadOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 6000);
    return () => clearTimeout(t);
  }, [showToast]);

  const handleUploadSuccess = () => {
    setUploadOpen(false);
    setShowToast(true);
  };

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      <nav className={`sticky top-0 z-50 shadow-md h-screen p-1.5 lg:p-2 flex flex-col border border-r border-gray-200 ${open ? 'w-44 lg:w-56' : 'w-12 lg:w-16'} duration-500 bg-white text-black`}>

        <div className='border-b px-2 py-2 lg:px-3 lg:py-3 h-14 lg:h-20 flex justify-between items-center'>
          <span className={`font-bold text-base lg:text-xl ${!open && 'w-0 opacity-0 overflow-hidden'} duration-500 truncate`}>DataCenter</span>
          <div><Logs size={20} className={`cursor-pointer duration-500 ${!open && 'rotate-180'}`} onClick={() => setOpen(!open)} /></div>
        </div>

        {/* Upload button + modal */}
        <div ref={uploadRef} className='mt-2 lg:mt-3 relative'>
          <button
            onClick={() => setUploadOpen(!uploadOpen)}
            className='shadow-md rounded-full w-fit p-1.5 lg:p-2 flex items-center bg-blue-600 text-white hover:bg-blue-700 duration-300'
          >
            {uploadOpen ? <Minus size={20} className='cursor-pointer' /> : <Plus size={20} className='cursor-pointer' />}
            <p className={`${!open && 'hidden duration-500'} duration-500 font-semibold text-sm lg:text-base pr-3 lg:pr-4`}>Upload</p>
          </button>

          {uploadOpen && (
            <UploadModal
              anchorOpen={open}
              onClose={() => setUploadOpen(false)}
              onSuccess={handleUploadSuccess}
            />
          )}
        </div>

        <ul className="flex-1">
          {menuItems.map((item) => (
            <li key={item.label} className="mt-2 lg:mt-4">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `px-2 py-1.5 lg:px-3 lg:py-2 rounded-md duration-300 cursor-pointer flex items-center gap-2 lg:gap-3 relative group
                  ${isActive ? 'text-black' : 'text-gray-600 hover:text-black'}`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute -right-1.5 lg:-right-2 top-0 h-full w-0.5 lg:w-1 bg-black rounded-l" />
                    )}
                    <div className="transition-colors duration-300 shrink-0">{item.icons}</div>
                    <p className={`${!open && 'w-0 translate-x-24'} duration-500 overflow-hidden font-semibold text-sm transition-colors`}>
                      {item.label}
                    </p>
                    <p className={`${open && 'hidden'} absolute left-12 lg:left-16 shadow-md rounded-md duration-300 overflow-hidden
                      group-hover:left-12 lg:group-hover:left-16 w-0 p-0 group-hover:p-1.5 lg:group-hover:p-2 group-hover:w-fit bg-white font-semibold text-xs`}>
                      {item.label}
                    </p>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* User footer */}
        <div ref={profileRef} className='relative flex flex-col px-2 py-1.5 lg:px-3 lg:py-2 gap-1'>
          {!open && profileOpen && isAuthenticated && user && (
            <div className="absolute bottom-10 left-12 lg:left-16 z-50 bg-white border border-gray-200 rounded-xl shadow-lg w-52 p-4 animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
              <hr className="border-gray-100 mb-2" />
              <button
                onClick={() => { logout(); setProfileOpen(false); }}
                className="flex items-center gap-2 w-full text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg px-2 py-1.5 transition"
              >
                <LogOut size={14} /> Log out
              </button>
            </div>
          )}

          <div className='flex gap-1.5 lg:gap-2 items-center'>
            <button
              onClick={() => !open && setProfileOpen(!profileOpen)}
              className={`shrink-0 ${!open ? 'cursor-pointer hover:opacity-70' : 'cursor-default'} transition`}
            >
              <User size={20} />
            </button>
            <div className={`leading-4 lg:leading-5 min-w-0 ${!open && 'w-0 translate-x-24'} duration-500 overflow-hidden`}>
              {isAuthenticated && user ? (
                <>
                  <p className='text-xs lg:text-sm font-medium truncate'>{user.name}</p>
                  <span className='text-[10px] lg:text-xs text-gray-400 truncate'>{user.email}</span>
                </>
              ) : (
                <p className="text-xs lg:text-sm">Guest</p>
              )}
            </div>
          </div>

          {isAuthenticated && (
            <button
              onClick={logout}
              className={`flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition duration-200 px-1 mt-0.5 lg:mt-1 ${!open && 'hidden'}`}
            >
              <LogOut size={14} />
              <span>Log out</span>
            </button>
          )}
        </div>
      </nav>

      {/* Toast */}
      {showToast && (
        <UploadToast
          onNavigate={() => { setShowToast(false); navigate('/reports'); }}
          onDismiss={() => setShowToast(false)}
        />
      )}
    </>
  );
}

export default Navbar
