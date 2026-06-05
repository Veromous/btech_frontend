import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Search, Database, MessageCircle, Contact, Flag,
  FileX, Clock, HeartPulse, TrendingUp, CloudSun, BrainCircuit, Users
} from 'lucide-react';
import { useState, useEffect } from 'react';

// ─── HeroSection ─────────────────────────────────────────────────────────────
interface HeroProps {
  isAuthenticated: boolean;
  userName?: string;
  query: string;
  setQuery: (v: string) => void;
}

const HeroSection = ({ isAuthenticated, userName, query, setQuery }: HeroProps) => (
  <div className="flex flex-col items-start mt-6 sm:mt-10 px-4 sm:px-6 w-full">
    <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-1.5">
      {isAuthenticated && userName ? `Welcome, ${userName} 👋` : 'Welcome to DataCenter'}
    </h1>
    <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed">
      {isAuthenticated && userName
        ? 'Dive into curated datasets tailored to your research. Explore, analyse, and uncover insights that matter to you.'
        : 'Get updated, carefully curated datasets aligned with your research topic. Discover the data you need — fast, precise, and always relevant.'}
    </p>
    <div className="w-full">
      <div className="flex items-center border border-gray-800 rounded-lg px-3 py-2 bg-white shadow-sm">
        <Search size={16} className="text-gray-400 mr-2 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search anything..."
          className="flex-1 outline-none text-gray-700 text-sm placeholder-gray-400 bg-transparent"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600 ml-2 text-base leading-none">
            ×
          </button>
        )}
      </div>
    </div>
  </div>
);

// ─── Quick Actions ────────────────────────────────────────────────────────────
const quickActions = [
  { icon: <Database size={16} />, label: 'Datasets', description: 'Browse & download research data', path: '/datasets', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100', iconBg: 'bg-blue-100' },
  { icon: <MessageCircle size={16} />, label: 'Discussions', description: 'Join the research conversation', path: '/discussions', color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-100', iconBg: 'bg-indigo-100' },
  { icon: <Contact size={16} />, label: 'Support', description: 'Get help from our team', path: '/support', color: 'bg-violet-50 text-violet-600 hover:bg-violet-100 border-violet-100', iconBg: 'bg-violet-100' },
  { icon: <Flag size={16} />, label: 'Reports', description: 'View data quality reports', path: '/reports', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-100', iconBg: 'bg-purple-100' },
];

const QuickActions = () => {
  const navigate = useNavigate();
  return (
    <div className="px-4 sm:px-6 mt-6 sm:mt-10">
      <h2 className="text-xs font-semibold text-gray-700 mb-3 tracking-wide uppercase">Quick Actions</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className={`flex items-center gap-2 px-3 py-3 rounded-xl border transition-all duration-200 cursor-pointer text-left w-full ${action.color}`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${action.iconBg}`}>{action.icon}</div>
            <div>
              <p className="font-semibold text-xs">{action.label}</p>
              <p className="text-[10px] opacity-70 mt-0.5 hidden sm:block">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Recommended For You ──────────────────────────────────────────────────────
interface RecommendedDataset {
  id: number;
  name: string;
  description: string;
  category: string;
  region: string;
  year: number | null;
  rowCount: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  Health: 'bg-rose-50 text-rose-600 border-rose-100',
  Agriculture: 'bg-green-50 text-green-600 border-green-100',
  Education: 'bg-blue-50 text-blue-600 border-blue-100',
  Finance: 'bg-amber-50 text-amber-700 border-amber-100',
  Climate: 'bg-sky-50 text-sky-600 border-sky-100',
  Technology: 'bg-violet-50 text-violet-600 border-violet-100',
  Social: 'bg-pink-50 text-pink-600 border-pink-100',
};
const catColor = (c: string) => CATEGORY_COLORS[c] ?? 'bg-gray-100 text-gray-600 border-gray-200';

const RecommendedSection = ({ uid }: { uid?: string }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<RecommendedDataset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setItems([]); setLoading(false); return; }
    setLoading(true);
    fetch(`${BASE_URL}/catalog/recommended?uid=${encodeURIComponent(uid)}&limit=6`)
      .then((r) => r.json())
      .then((data: RecommendedDataset[]) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [uid]);

  return (
    <div className="px-4 sm:px-6 mt-6 sm:mt-10">
      <h2 className="text-xs font-semibold text-gray-700 mb-3 tracking-wide uppercase">
        Recommended for you
      </h2>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-8 sm:py-12 bg-white rounded-xl border border-dashed border-gray-200">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mb-2" />
          <p className="text-gray-400 text-xs">Finding datasets for you…</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 sm:py-12 bg-white rounded-xl border border-dashed border-gray-200">
          <FileX size={28} className="text-gray-300 mb-2" />
          <p className="text-gray-400 text-xs font-medium">Nothing to see here yet...</p>
          <p className="text-gray-300 text-[10px] mt-1">
            {uid
              ? 'Search and explore datasets — recommendations build from your activity.'
              : 'Sign in and explore datasets to get personalised recommendations.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {items.map((ds) => (
            <button
              key={ds.id}
              onClick={() => navigate('/datasets')}
              className="bg-white border border-gray-100 rounded-xl p-3.5 text-left hover:shadow-md hover:border-gray-200 transition-all duration-200 group flex flex-col gap-2 cursor-pointer"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catColor(ds.category)}`}>
                  {ds.category}
                </span>
                <span className="text-[10px] text-gray-400">{ds.region}</span>
              </div>
              <p className="text-[13px] font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-1">
                {ds.name}
              </p>
              <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{ds.description}</p>
              <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-auto pt-1">
                {ds.year && <span>{ds.year}</span>}
                <span>{ds.rowCount} rows</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Recent Activity ──────────────────────────────────────────────────────────
interface ActivityItem {
  type: string;
  title: string;
  description: string;
  author: string;
  timestamp: number;
  icon: string;
}

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

const timeAgo = (ts: number): string => {
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(ts * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const typeBadge: Record<string, { bg: string; text: string; label: string }> = {
  discussion: { bg: 'bg-indigo-50', text: 'text-indigo-600', label: 'Discussion' },
  reply:      { bg: 'bg-sky-50',    text: 'text-sky-600',    label: 'Reply' },
  catalog:    { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Dataset' },
};

const RecentActivity = () => {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/activity`)
      .then(r => r.json())
      .then((data: ActivityItem[]) => { setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="px-4 sm:px-6 mt-6 sm:mt-10">
      <h2 className="text-xs font-semibold text-gray-700 mb-3 tracking-wide uppercase">
        Recent Activity
      </h2>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-8 sm:py-12 bg-white rounded-xl border border-dashed border-gray-200">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mb-2" />
          <p className="text-gray-400 text-xs">Loading activity…</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 sm:py-12 bg-white rounded-xl border border-dashed border-gray-200">
          <Clock size={28} className="text-gray-300 mb-2" />
          <p className="text-gray-400 text-xs font-medium">No activity yet</p>
          <p className="text-gray-300 text-[10px] mt-1">Discussions, replies, and uploads will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden shadow-sm">
          {items.map((item, i) => {
            const badge = typeBadge[item.type] ?? typeBadge.discussion;
            return (
              <div
                key={`${item.type}-${item.timestamp}-${i}`}
                className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-150"
              >
                {/* Icon */}
                <span className="text-base mt-0.5 shrink-0 select-none">{item.icon}</span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-[13px] font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-xs">
                      {item.title}
                    </p>
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium ${badge.bg} ${badge.text}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate">{item.description}</p>
                </div>

                {/* Meta */}
                <div className="shrink-0 text-right">
                  <p className="text-[10px] text-gray-400 whitespace-nowrap">{timeAgo(item.timestamp)}</p>
                  <p className="text-[10px] text-gray-300 mt-0.5 truncate max-w-[80px]">{item.author}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Popular Categories ───────────────────────────────────────────────────────
const categories = [
  { label: 'Health', icon: <HeartPulse size={14} />, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', hoverBg: 'hover:bg-blue-100', tag: '2.4k datasets' },
  { label: 'Finance', icon: <TrendingUp size={14} />, bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', hoverBg: 'hover:bg-indigo-100', tag: '1.8k datasets' },
  { label: 'Climate', icon: <CloudSun size={14} />, bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100', hoverBg: 'hover:bg-sky-100', tag: '1.1k datasets' },
  { label: 'AI / ML', icon: <BrainCircuit size={14} />, bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100', hoverBg: 'hover:bg-violet-100', tag: '3.2k datasets' },
  { label: 'Social Science', icon: <Users size={14} />, bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', hoverBg: 'hover:bg-purple-100', tag: '900 datasets' },
];

const PopularCategories = () => {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="px-4 sm:px-6 mt-6 sm:mt-10 mb-8 sm:mb-12">
      <h2 className="text-xs font-semibold text-gray-700 mb-3 tracking-wide uppercase">
        Popular Categories
      </h2>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => setActive(active === cat.label ? null : cat.label)}
            className={`
              flex items-center gap-1.5 px-2.5 py-2 rounded-xl border transition-all duration-200 cursor-pointer
              ${cat.bg} ${cat.text} ${cat.border} ${cat.hoverBg}
              ${active === cat.label ? 'ring-2 ring-offset-1 ring-current shadow-sm scale-[1.03]' : ''}
            `}
          >
            <span>{cat.icon}</span>
            <div className="text-left">
              <p className="font-semibold text-xs leading-none">{cat.label}</p>
              <p className="text-[10px] opacity-60 mt-0.5">{cat.tag}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [query, setQuery] = useState('');

  const PageContent = () => (
    <>
      <QuickActions />
      <RecommendedSection uid={user?.uid} />
      <RecentActivity />
      <PopularCategories />
    </>
  );

  return (
    <div className='flex-1 bg-gray-50 min-h-screen'>
      <HeroSection
        isAuthenticated={isAuthenticated}
        userName={user?.name}
        query={query}
        setQuery={setQuery}
      />
      <PageContent />
    </div>
  );
}

export default Home
