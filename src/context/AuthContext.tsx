import {
    createContext, useContext, useEffect, useState, type ReactNode
} from 'react';
import {
    onAuthStateChanged, signOut,
    signInWithEmailAndPassword, createUserWithEmailAndPassword,
    signInWithPopup, updateProfile,
    type User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../firebase';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';


// ─── Types ────────────────────────────────────────────────────────────────────
interface User {
    uid: string;
    name: string;
    email: string;
    photoURL: string | null;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    signupWithEmail: (name: string, email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    loginWithGithub: () => Promise<void>;
    logout: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Helper: notify backend ───────────────────────────────────────────────────
const notifyBackend = async (firebaseUser: FirebaseUser) => {
    try {
        const idToken = await firebaseUser.getIdToken();
        await fetch(`${BASE_URL}/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
        });
    } catch {
        // backend may not be running in dev; non-fatal
        console.warn('Could not verify token with backend — is it running?');
    }
};

const mapFirebaseUser = (u: FirebaseUser): User => ({
    uid: u.uid,
    name: u.displayName ?? u.email?.split('@')[0] ?? 'User',
    email: u.email ?? '',
    photoURL: u.photoURL,
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Listen for Firebase auth state changes
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
            setLoading(false);
        });
        return unsub;
    }, []);

    const loginWithEmail = async (email: string, password: string) => {
        const { user: u } = await signInWithEmailAndPassword(auth, email, password);
        await notifyBackend(u);
    };

    const signupWithEmail = async (name: string, email: string, password: string) => {
        const { user: u } = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(u, { displayName: name });
        await notifyBackend(u);
    };

    const loginWithGoogle = async () => {
        const { user: u } = await signInWithPopup(auth, googleProvider);
        await notifyBackend(u);
    };

    const loginWithGithub = async () => {
        const { user: u } = await signInWithPopup(auth, githubProvider);
        await notifyBackend(u);
    };

    const logout = async () => {
        if (user?.uid) {
            try {
                await fetch(`${BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uid: user.uid }),
                });
            } catch { /* non-fatal */ }
        }
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{
            user, isAuthenticated: !!user, loading,
            loginWithEmail, signupWithEmail, loginWithGoogle, loginWithGithub, logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
