import { createContext, useContext, useState, type ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AnalysisResult {
    qualityScore: number;
    qualityLevel: string;
    warnings: string[];
    rowCount: number;
    columnCount: number;
    cleanedPreview: (string | number | null)[][];
}

export interface UploadRecord {
    id: string;               // unique id
    filename: string;
    uploadedAt: Date;
    result: AnalysisResult;
}

interface UploadContextType {
    uploads: UploadRecord[];
    addUpload: (filename: string, result: AnalysisResult) => void;
    clearUploads: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const UploadContext = createContext<UploadContextType | undefined>(undefined);

export const UploadProvider = ({ children }: { children: ReactNode }) => {
    const [uploads, setUploads] = useState<UploadRecord[]>([]);

    const addUpload = (filename: string, result: AnalysisResult) => {
        setUploads((prev) => [
            {
                id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                filename,
                uploadedAt: new Date(),
                result,
            },
            ...prev,
        ]);
    };

    const clearUploads = () => setUploads([]);

    return (
        <UploadContext.Provider value={{ uploads, addUpload, clearUploads }}>
            {children}
        </UploadContext.Provider>
    );
};

export const useUploads = () => {
    const ctx = useContext(UploadContext);
    if (!ctx) throw new Error('useUploads must be used within UploadProvider');
    return ctx;
};
