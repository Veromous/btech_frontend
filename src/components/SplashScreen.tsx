import { useEffect, useState } from 'react';

// file names that animate into view
const FILES = [
    { name: 'health_records_2024.csv', size: '2.4 MB' },
    { name: 'agriculture_yield.json', size: '840 KB' },
    { name: 'population_census.xlsx', size: '5.1 MB' },
    { name: 'rainfall_patterns.csv', size: '1.2 MB' },
    { name: 'gdp_cameroon.json', size: '320 KB' },
];

const SplashScreen = () => {
    const [visibleFiles, setVisibleFiles] = useState<number[]>([]);
    const [progress, setProgress] = useState(0);
    const [pulseRing, setPulseRing] = useState(false);

    // stagger files appearing
    useEffect(() => {
        FILES.forEach((_, i) => {
            setTimeout(() => {
                setVisibleFiles((prev) => [...prev, i]);
            }, 300 + i * 280);
        });

        // pulse the db icon to signal activity
        const pulse = setInterval(() => setPulseRing((p) => !p), 800);

        // progress bar
        const interval = setInterval(() => {
            setProgress((p) => {
                if (p >= 100) { clearInterval(interval); return 100; }
                return p + Math.random() * 14;
            });
        }, 160);

        return () => { clearInterval(interval); clearInterval(pulse); };
    }, []);

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">

            {/* ── Animated DB Icon ─────────────────────────────────── */}
            <div className="relative flex items-center justify-center mb-8">
                {/* outer pulse ring */}
                <span
                    className={`absolute rounded-full border-2 border-blue-200 transition-all duration-700 ${pulseRing ? 'w-24 h-24 opacity-60' : 'w-32 h-32 opacity-0'
                        }`}
                />
                {/* middle ring */}
                <span
                    className={`absolute rounded-full border border-blue-100 transition-all duration-700 ${pulseRing ? 'w-16 h-16 opacity-80' : 'w-20 h-20 opacity-0'
                        }`}
                />

                {/* Database SVG */}
                <div className="relative z-10 w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-lg">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-8 h-8"
                    >
                        <ellipse cx="12" cy="5" rx="9" ry="3" />
                        <path d="M3 5v4c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
                        <path d="M3 9v4c0 1.66 4.03 3 9 3s9-1.34 9-3V9" />
                        <path d="M3 13v4c0 1.66 4.03 3 9 3s9-1.34 9-3v-4" />
                    </svg>
                </div>

                {/* Download arrow — bounces down */}
                <div className="absolute -bottom-6 animate-bounce">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5"
                    >
                        <path d="M12 5v14M5 12l7 7 7-7" />
                    </svg>
                </div>
            </div>

            {/* ── Title ─────────────────────────────────────────────── */}
            <h1 className="text-xl font-bold text-gray-900 mb-1 mt-4">DataCenter</h1>
            <p className="text-xs text-gray-400 mb-8">Fetching Cameroon's data…</p>

            {/* ── Animated file list ────────────────────────────────── */}
            <div className="w-72 space-y-2 mb-8">
                {FILES.map((file, i) => (
                    <div
                        key={file.name}
                        className={`flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 transition-all duration-500 ${visibleFiles.includes(i)
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-3'
                            }`}
                        style={{ transitionDelay: `${i * 60}ms` }}
                    >
                        {/* File icon */}
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                            </svg>
                        </div>

                        {/* Name */}
                        <span className="text-xs text-gray-700 font-medium truncate flex-1">{file.name}</span>

                        {/* Size + animated tick */}
                        <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs text-gray-400">{file.size}</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Progress bar ──────────────────────────────────────── */}
            <div className="w-72">
                <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>Loading datasets</span>
                    <span>{Math.min(Math.round(progress), 100)}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-black rounded-full transition-all duration-200"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default SplashScreen;
