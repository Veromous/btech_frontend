import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Search, Database, MessageCircle, Contact, Flag,
  FileX, Clock, HeartPulse, TrendingUp, CloudSun, BrainCircuit, Users
} from 'lucide-react';
import { useState } from 'react';

// ─── HeroSection ─────────────────────────────────────────────────────────────
interface HeroProps {
  isAuthenticated: boolean;
  userName?: string;
  query: string;
  setQuery: (v: string) => void;
}

const HeroSection = ({ isAuthenticated, userName, query, setQuery }: HeroProps) => (
  <div className="flex flex-col items-start mt-10 px-8 w-full pr-10">
    <h1 className="text-3xl font-semibold text-gray-900 mb-2">
      {isAuthenticated && userName ? `Welcome, ${userName} 👋` : 'Welcome to DataCenter'}
    </h1>
    <p className="text-gray-500 text-base mb-6 leading-relaxed">
      {isAuthenticated && userName
        ? 'Dive into curated datasets tailored to your research. Explore, analyse, and uncover insights that matter to you.'
        : 'Get updated, carefully curated datasets aligned with your research topic. Discover the data you need — fast, precise, and always relevant.'}
    </p>
    <div className="w-full">
      <div className="flex items-center border border-gray-800 rounded-lg px-4 py-2.5 bg-white shadow-sm">
        <Search size={20} className="text-gray-400 mr-3 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search anything..."
          className="flex-1 outline-none text-gray-700 text-sm placeholder-gray-400 bg-transparent"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600 ml-2 text-lg leading-none">
            ×
          </button>
        )}
      </div>
    </div>
  </div>
);

// ─── Quick Actions ────────────────────────────────────────────────────────────
const quickActions = [
  { icon: <Database size={22} />, label: 'Datasets', description: 'Browse & download research data', path: '/datasets', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100', iconBg: 'bg-blue-100' },
  { icon: <MessageCircle size={22} />, label: 'Discussions', description: 'Join the research conversation', path: '/discussions', color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-100', iconBg: 'bg-indigo-100' },
  { icon: <Contact size={22} />, label: 'Support', description: 'Get help from our team', path: '/support', color: 'bg-violet-50 text-violet-600 hover:bg-violet-100 border-violet-100', iconBg: 'bg-violet-100' },
  { icon: <Flag size={22} />, label: 'Reports', description: 'View data quality reports', path: '/reports', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-100', iconBg: 'bg-purple-100' },
];

const QuickActions = () => {
  const navigate = useNavigate();
  return (
    <div className="px-8 mt-10 pr-10">
      <h2 className="text-base font-semibold text-gray-700 mb-4 tracking-wide uppercase">Quick Actions</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className={`flex items-center gap-3 px-4 py-4 rounded-xl border transition-all duration-200 cursor-pointer text-left w-full ${action.color}`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${action.iconBg}`}>{action.icon}</div>
            <div>
              <p className="font-semibold text-sm">{action.label}</p>
              <p className="text-xs opacity-70 mt-0.5">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Recommended For You ──────────────────────────────────────────────────────
const RecommendedSection = () => (
  <div className="px-8 mt-10 pr-10">
    <h2 className="text-base font-semibold text-gray-700 mb-4 tracking-wide uppercase">
      Recommended for you
    </h2>
    <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
      <FileX size={36} className="text-gray-300 mb-3" />
      <p className="text-gray-400 text-sm font-medium">Nothing to see here...</p>
      <p className="text-gray-300 text-xs mt-1">Your personalised datasets will appear once available.</p>
    </div>
  </div>
);

// ─── Recent Activity ──────────────────────────────────────────────────────────
const RecentActivity = () => (
  <div className="px-8 mt-10 pr-10">
    <h2 className="text-base font-semibold text-gray-700 mb-4 tracking-wide uppercase">
      Recent Activity
    </h2>
    <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
      <Clock size={36} className="text-gray-300 mb-3" />
      <p className="text-gray-400 text-sm font-medium">Nothing to see here...</p>
      <p className="text-gray-300 text-xs mt-1">Your recent downloads and views will show up here.</p>
    </div>
  </div>
);

// ─── Popular Categories ───────────────────────────────────────────────────────
const categories = [
  { label: 'Health', icon: <HeartPulse size={20} />, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', hoverBg: 'hover:bg-blue-100', tag: '2.4k datasets' },
  { label: 'Finance', icon: <TrendingUp size={20} />, bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', hoverBg: 'hover:bg-indigo-100', tag: '1.8k datasets' },
  { label: 'Climate', icon: <CloudSun size={20} />, bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100', hoverBg: 'hover:bg-sky-100', tag: '1.1k datasets' },
  { label: 'AI / ML', icon: <BrainCircuit size={20} />, bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100', hoverBg: 'hover:bg-violet-100', tag: '3.2k datasets' },
  { label: 'Social Science', icon: <Users size={20} />, bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', hoverBg: 'hover:bg-purple-100', tag: '900 datasets' },
];

const PopularCategories = () => {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="px-8 mt-10 pr-10 mb-12">
      <h2 className="text-base font-semibold text-gray-700 mb-4 tracking-wide uppercase">
        Popular Categories
      </h2>
      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => setActive(active === cat.label ? null : cat.label)}
            className={`
              flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer
              ${cat.bg} ${cat.text} ${cat.border} ${cat.hoverBg}
              ${active === cat.label ? 'ring-2 ring-offset-1 ring-current shadow-sm scale-[1.03]' : ''}
            `}
          >
            <span>{cat.icon}</span>
            <div className="text-left">
              <p className="font-semibold text-sm leading-none">{cat.label}</p>
              <p className="text-xs opacity-60 mt-0.5">{cat.tag}</p>
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
      <RecommendedSection />
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
