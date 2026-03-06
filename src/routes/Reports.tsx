import { useReport } from '../context/ReportContext';
import { useNavigate } from 'react-router-dom';
import {
    Flag, CheckCircle, AlertTriangle, AlertCircle,
    Shield, ShieldAlert, ShieldOff, BarChart2, Upload, Trash2,
} from 'lucide-react';



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
    const r = 36;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

    return (
        <div className="relative w-28 h-28 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r={r} fill="none" stroke="#e5e7eb" strokeWidth="7" />
                <circle
                    cx="40" cy="40" r={r} fill="none"
                    stroke={color} strokeWidth="7"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-gray-900 leading-none">{score}</span>
                <span className="text-[9px] text-gray-400 font-medium">/ 100</span>
            </div>
        </div>
    );
};

// ─── Null-Rate Bar Chart (pure SVG) ──────────────────────────────────────────
const NullRateChart = ({ preview }: { preview: (string | number | null)[][] }) => {
    if (preview.length < 2) return null;
    const headers = preview[0].map(String);
    const rows = preview.slice(1);
    const total = rows.length;

    const nullRates = headers.map((_, ci) => {
        const nullCount = rows.filter((r) => r[ci] === null).length;
        return total > 0 ? Math.round((nullCount / total) * 100) : 0;
    });

    const BAR_H = 18;
    const GAP = 8;
    const LABEL_W = 120;
    const CHART_W = 260;
    const svgH = headers.length * (BAR_H + GAP) + 10;

    return (
        <div className="overflow-x-auto">
            <svg width={LABEL_W + CHART_W + 60} height={svgH} className="text-xs">
                {headers.map((h, i) => {
                    const y = i * (BAR_H + GAP) + 4;
                    const barW = (nullRates[i] / 100) * CHART_W;
                    const color = nullRates[i] > 30 ? '#f59e0b' : nullRates[i] === 0 ? '#10b981' : '#3b82f6';
                    return (
                        <g key={i}>
                            <text x={LABEL_W - 6} y={y + BAR_H / 2 + 4} textAnchor="end"
                                fontSize={10} fill="#6b7280"
                                className="truncate">
                                {h.length > 14 ? h.slice(0, 13) + '…' : h}
                            </text>
                            <rect x={LABEL_W} y={y} width={CHART_W} height={BAR_H} rx={4} fill="#f3f4f6" />
                            <rect x={LABEL_W} y={y} width={barW} height={BAR_H} rx={4} fill={color}
                                style={{ transition: 'width 0.8s ease' }} />
                            <text x={LABEL_W + barW + 6} y={y + BAR_H / 2 + 4}
                                fontSize={10} fill="#9ca3af">
                                {nullRates[i]}%
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Flag size={28} className="text-gray-300" />
            </div>
            <h2 className="text-lg font-bold text-gray-700 mb-1">No report yet</h2>
            <p className="text-sm text-gray-400 max-w-xs">
                No dataset has been analysed yet. Use the{' '}
                <span className="font-semibold text-blue-600">Upload</span> button in the sidebar to
                upload and analyse a dataset.
            </p>
            <button
                onClick={() => navigate('/datasets')}
                className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
            >
                <Upload size={15} /> Go to Datasets
            </button>
        </div>
    );
};

// ─── Reports Page ─────────────────────────────────────────────────────────────
const Reports = () => {
    const { report, clearReport } = useReport();

    return (
        <div className="flex-1 bg-gray-50 min-h-screen px-4 sm:px-6 pt-6 sm:pt-10 pb-10 sm:pb-16">

            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <div className="flex items-center gap-2 mb-1">
                    <Flag size={18} className="text-gray-500" />
                    <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-black leading-tight">
                        Reports
                    </h1>
                </div>
                <p className="text-gray-500 text-xs sm:text-sm">
                    Analysis results for your most recently uploaded dataset.
                </p>
            </div>

            <div className="border-t border-gray-100 mb-6 sm:mb-8" />

            {!report ? (
                <EmptyState />
            ) : (
                <div className="space-y-6">

                    {/* ── Overview card ── */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-7">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex flex-col gap-3">
                                {report.fileName && (
                                    <p className="text-xs text-gray-400">
                                        File: <span className="font-semibold text-gray-600">{report.fileName}</span>
                                        {report.uploadedAt && (
                                            <span className="ml-2 text-gray-300">
                                                · {new Date(report.uploadedAt).toLocaleString()}
                                            </span>
                                        )}
                                    </p>
                                )}

                                <div className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                                    <span className="text-xs font-semibold text-gray-500">Analysis Complete</span>
                                </div>

                                <QualityBadge level={report.qualityLevel} score={report.qualityScore} />

                                <div className="flex gap-6 mt-1">
                                    <div className="text-center">
                                        <p className="text-2xl font-extrabold text-gray-900">
                                            {report.rowCount.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-400">rows</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-extrabold text-gray-900">
                                            {report.columnCount}
                                        </p>
                                        <p className="text-xs text-gray-400">columns</p>
                                    </div>
                                </div>
                            </div>
                            <ScoreRing score={report.qualityScore} />
                        </div>
                    </div>

                    {/* ── Null-rate chart ── */}
                    {report.cleanedPreview.length > 1 && (
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-7">
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart2 size={15} className="text-gray-400" />
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                    Null Rate per Column
                                </p>
                            </div>
                            <NullRateChart preview={report.cleanedPreview} />
                            <p className="text-[10px] text-gray-300 mt-3">
                                Green = 0% nulls · Blue = some nulls · Amber = &gt;30% nulls
                            </p>
                        </div>
                    )}

                    {/* ── Warnings ── */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-7">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                            Warnings ({report.warnings.length})
                        </p>
                        {report.warnings.length === 0 ? (
                            <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl px-4 py-2.5">
                                <CheckCircle size={14} className="shrink-0" />
                                No data quality issues detected.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {report.warnings.map((w, i) => (
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
                    </div>

                    {/* ── Data Preview ── */}
                    {report.cleanedPreview.length > 1 && (
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-7">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                                Cleaned Data Preview ({report.cleanedPreview.length - 1} of {report.rowCount} rows shown)
                            </p>
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="min-w-full text-xs">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            {report.cleanedPreview[0].map((h, i) => (
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
                                        {report.cleanedPreview.slice(1).map((row, ri) => (
                                            <tr key={ri} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                                {row.map((cell, ci) => (
                                                    <td
                                                        key={ci}
                                                        className={`px-4 py-2 whitespace-nowrap ${cell === null ? 'text-gray-300 italic' : 'text-gray-700'}`}
                                                    >
                                                        {cell === null
                                                            ? 'null'
                                                            : typeof cell === 'number'
                                                                ? Number(cell.toFixed(4))
                                                                : String(cell)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Error warning for empty preview */}
                    {report.cleanedPreview.length <= 1 && (
                        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                            <AlertCircle size={16} className="shrink-0" />
                            No preview data available for this dataset.
                        </div>
                    )}

                    {/* ── Clear Report ── */}
                    <div className="bg-white border border-red-100 rounded-2xl shadow-sm p-5 sm:p-6 flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <p className="text-sm font-semibold text-gray-800 mb-0.5">Clear Report</p>
                            <p className="text-xs text-gray-400">
                                Remove this report and upload a new dataset for analysis.
                            </p>
                        </div>
                        <button
                            onClick={clearReport}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 active:scale-[0.97] transition-all duration-200 shrink-0"
                        >
                            <Trash2 size={13} /> Clear Report
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
};

export default Reports;
