import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
);

const GitHubIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
);

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signupWithEmail, loginWithGoogle, loginWithGithub } = useAuth();
    const navigate = useNavigate();

    // Fire-and-forget welcome email — never blocks the signup flow
    const sendWelcomeEmail = (userEmail: string, userName: string) => {
        fetch(`${BASE_URL}/auth/welcome-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail, name: userName }),
        }).catch(() => { /* silent — email failure never blocks signup */ });
    };

    const handleError = (err: unknown) => {
        console.error('Auth error:', err);
        const msg = (err as { code?: string })?.code ?? '';
        if (msg.includes('email-already-in-use'))
            setError('This email is already registered. Try signing in.');
        else if (msg.includes('weak-password'))
            setError('Password must be at least 6 characters.');
        else
            setError('Something went wrong. Please try again.');
    };

    const handleEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirm) { setError('Passwords do not match.'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setLoading(true);
        try {
            const user = await signupWithEmail(name, email, password);
            sendWelcomeEmail(user.email, user.name);
            navigate('/');
        }
        catch (err) { handleError(err); }
        finally { setLoading(false); }
    };

    const handleGoogle = async () => {
        setError('');
        try {
            const user = await loginWithGoogle();
            sendWelcomeEmail(user.email, user.name);
            navigate('/');
        }
        catch (err) { handleError(err); }
    };

    const handleGithub = async () => {
        setError('');
        try {
            const user = await loginWithGithub();
            sendWelcomeEmail(user.email, user.name);
            navigate('/');
        }
        catch (err) { handleError(err); }
    };

    return (
        <div className="min-h-screen w-full flex">

            {/* ── Left panel ── */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 bg-black text-white px-14 py-12">
                <span className="text-xl font-bold tracking-tight">DataCenter</span>
                <div>
                    <h2 className="text-4xl font-bold leading-snug mb-4">
                        Start your research<br />journey today.
                    </h2>
                    <p className="text-gray-400 text-base leading-relaxed max-w-sm">
                        Create a free account and get instant access to curated datasets,
                        research discussions, and data quality reports.
                    </p>
                </div>
                <p className="text-xs text-gray-600">© {new Date().getFullYear()} DataCenter</p>
            </div>

            {/* ── Right panel ── */}
            <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 bg-white overflow-y-auto">
                <div className="w-full max-w-sm">

                    {/* Heading */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
                    <p className="text-sm text-gray-400 mb-8">
                        Already have an account?{' '}
                        <Link to="/login" className="text-black font-semibold underline underline-offset-2">
                            Sign in
                        </Link>
                    </p>

                    {/* Social */}
                    <div className="flex flex-col gap-3 mb-6">
                        <button onClick={handleGoogle}
                            className="flex items-center justify-center gap-2.5 w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                            <GoogleIcon /> Sign up with Google
                        </button>
                        <button onClick={handleGithub}
                            className="flex items-center justify-center gap-2.5 w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                            <GitHubIcon /> Sign up with GitHub
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-xs text-gray-400">or</span>
                        <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleEmail} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Full Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)}
                                placeholder="John Doe" required
                                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition bg-gray-50" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com" required
                                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition bg-gray-50" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                                placeholder="At least 6 characters" required
                                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition bg-gray-50" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                                placeholder="Repeat your password" required
                                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition bg-gray-50" />
                        </div>

                        {error && (
                            <p className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">{error}</p>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-900 transition disabled:opacity-50 mt-1">
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;
