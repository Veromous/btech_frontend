import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

const REPORT_KEY = 'datasetReport';

export interface AnalysisResult {
    qualityScore: number;
    qualityLevel: string;
    warnings: string[];
    rowCount: number;
    columnCount: number;
    cleanedPreview: (string | number | null)[][];
    fileName?: string;
    uploadedAt?: string;
}

interface ReportContextValue {
    report: AnalysisResult | null;
    setReport: (r: AnalysisResult | null) => void;
    clearReport: () => void;
}

const ReportContext = createContext<ReportContextValue | null>(null);

export const ReportProvider = ({ children }: { children: ReactNode }) => {
    const [report, _setReport] = useState<AnalysisResult | null>(() => {
        try {
            const raw = localStorage.getItem(REPORT_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    });

    const setReport = (r: AnalysisResult | null) => {
        _setReport(r);
        if (r) {
            localStorage.setItem(REPORT_KEY, JSON.stringify(r));
        } else {
            localStorage.removeItem(REPORT_KEY);
        }
    };

    const clearReport = () => setReport(null);

    return (
        <ReportContext.Provider value={{ report, setReport, clearReport }}>
            {children}
        </ReportContext.Provider>
    );
};

export const useReport = () => {
    const ctx = useContext(ReportContext);
    if (!ctx) throw new Error('useReport must be used inside ReportProvider');
    return ctx;
};

export { REPORT_KEY };
