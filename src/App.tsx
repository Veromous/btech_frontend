import { Route, Routes, useLocation, Link } from 'react-router'
import { useState, useRef, useEffect } from 'react'
import { LogOut } from 'lucide-react'
import './App.css'
import Navbar from './components/Navbar'
import Home from './routes/Home'
import Login from './routes/Login'
import Signup from './routes/Signup'
import Datasets from './routes/Datasets'
import Discussions from './routes/Discussions'
import Support from './routes/Support'
import Reports from './routes/Reports'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ReportProvider } from './context/ReportContext'
import SplashScreen from './components/SplashScreen'

const AUTH_ROUTES = ['/login', '/signup'];

// ─── Global top bar ───────────────────────────────────────────────────────────
const TopBar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node))
        setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="flex justify-end items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-4 bg-gray-50 border-b border-gray-100">
      {isAuthenticated && user ? (
        <div ref={dropRef} className="relative min-w-0">
          {/* Avatar button */}
          <button
            onClick={() => setDropOpen(!dropOpen)}
            className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 hover:opacity-80 transition"
          >
            <span className="text-xs sm:text-sm text-gray-500 font-medium truncate max-w-[80px] sm:max-w-[140px]">{user.name}</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black text-white flex items-center justify-center text-xs sm:text-sm font-bold select-none shadow-sm shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </button>

          {/* Dropdown */}
          {dropOpen && (
            <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-xl shadow-lg w-52 sm:w-60 p-4">
              {/* Account info */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
              <hr className="border-gray-100 mb-2" />
              {/* Logout */}
              <button
                onClick={() => { logout(); setDropOpen(false); }}
                className="flex items-center gap-2 w-full text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg px-2 py-1.5 transition"
              >
                <LogOut size={14} /> Log out
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <Link to="/login" className="text-black text-xs sm:text-sm font-semibold hover:opacity-70 transition">Sign in</Link>
          <Link to="/signup" className="px-3 sm:px-4 py-1.5 sm:py-2 bg-black text-white text-xs sm:text-sm rounded-lg font-semibold hover:bg-gray-800 transition">Sign up</Link>
        </>
      )}
    </div>
  );
};

// ─── App routes ───────────────────────────────────────────────────────────────
const AppRoutes = () => {
  const { loading } = useAuth();
  const location = useLocation();
  const isAuthPage = AUTH_ROUTES.includes(location.pathname);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <div className='flex'>
      {!isAuthPage && <Navbar />}
      <div className={`min-w-0 ${isAuthPage ? 'w-full' : 'flex-1 flex flex-col min-h-screen overflow-x-hidden'}`}>
        {!isAuthPage && <TopBar />}
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/datasets' element={<Datasets />} />
          <Route path='/discussions' element={<Discussions />} />
          <Route path='/support' element={<Support />} />
          <Route path='/reports' element={<Reports />} />
        </Routes>
      </div>
    </div>
  );
};


function App() {
  return (
    <AuthProvider>
      <ReportProvider>
        <AppRoutes />
      </ReportProvider>
    </AuthProvider>
  );
}

export default App
