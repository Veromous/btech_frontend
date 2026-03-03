import { useState } from 'react';
import {
    Bell, Download, PackageMinus, HelpCircle,
    ChevronDown, MessageCircle, Mail, BookOpen,
    ShieldCheck, UserCog, Search, ExternalLink, Zap,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FaqItem { q: string; a: string; }
interface Section {
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    faqs: FaqItem[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const SECTIONS: Section[] = [
    {
        id: 'notifications',
        icon: <Bell size={18} />,
        title: 'Notifications & Alerts',
        description: 'Stay informed about replies, updates, and activity.',
        faqs: [
            { q: 'How do I get notified when someone replies to my thread?', a: 'Notifications are sent automatically when a user replies to any thread you have posted. You will see a badge on the Discussions tab. In-app notifications appear at the top-right of every page.' },
            { q: 'Can I turn off reply notifications?', a: 'Yes. Go to Account Settings → Notification Preferences and toggle off "Thread replies". You can fine-tune per-topic or per-thread quiet hours.' },
            { q: 'How do I get alerts when a new dataset in my category is uploaded?', a: 'On the Datasets page, click the bell icon on any category badge. You will receive an in-app notification every time a new dataset matching that category is added.' },
            { q: 'Why am I not receiving any notifications?', a: 'Make sure you are signed in. If notifications are enabled but not arriving, check that your browser allows notifications for this site (Site Settings → Notifications → Allow).' },
        ],
    },
    {
        id: 'discussions',
        icon: <MessageCircle size={18} />,
        title: 'Discussions & Threads',
        description: 'Create, manage, and navigate community conversations.',
        faqs: [
            { q: 'How do I start a new discussion?', a: 'Navigate to the Discussions page and click the "New Thread" button (top right). Fill in a title, a message body, and choose a relevant category, then click Post.' },
            { q: 'How do I clear or delete a thread I created?', a: 'Open the thread, click the three-dot menu (⋯) on your post, and select "Delete Thread". This permanently removes the thread and all its replies. This action cannot be undone.' },
            { q: 'Can I edit a reply after posting it?', a: 'Currently editing is not supported for replies. Delete the reply and post a corrected version. Edit support is planned for a future release.' },
            { q: 'How do I search for a specific discussion?', a: 'Use the search bar at the top of the Discussions page. Type any keyword from the title or body. You can also filter by category using the chip filters below the search bar.' },
            { q: 'What does the Like button do?', a: 'Clicking 👍 on a thread records one appreciation vote. You can only like each thread once. The count persists across sessions and is visible to all users.' },
        ],
    },
    {
        id: 'datasets',
        icon: <Download size={18} />,
        title: 'Getting Datasets',
        description: 'Find, preview, and download Cameroon datasets.',
        faqs: [
            { q: 'How do I search for a dataset?', a: 'Go to the Datasets page. Type keywords (e.g. "malaria", "rainfall") into the search bar. Autocomplete will suggest matching entries. You can also filter by category, file type (CSV / JSON / Excel), and file size.' },
            { q: 'How do I download a dataset?', a: 'Click on a dataset card to open its detail view. You will find a Download button with the file format and size shown. Datasets marked Open Access do not require sign-in; others require a free account.' },
            { q: 'What file formats are available?', a: 'DataCenter provides datasets in three formats: CSV, JSON, and Excel (.xlsx). The file type is shown on every dataset card and can be filtered from the Filter panel.' },
            { q: 'Can I preview a dataset before downloading?', a: 'Yes. Clicking a dataset card opens a preview panel showing the first 50 rows and basic metadata (source, region, last updated, licence).' },
            { q: 'How do I cite a dataset in my research?', a: 'Each dataset detail page includes a "Cite This Dataset" section with a ready-made APA / MLA / BibTeX citation you can copy directly into your paper.' },
        ],
    },
    {
        id: 'remove-datasets',
        icon: <PackageMinus size={18} />,
        title: 'Removing Datasets',
        description: 'Remove, report, or request deletion of datasets.',
        faqs: [
            { q: 'How do I remove a dataset I uploaded?', a: 'Navigate to your Profile → My Uploads. Find the dataset and click the trash icon. You will be asked to confirm before permanent deletion.' },
            { q: 'Can I remove a dataset from my saved list?', a: 'Yes. Go to Profile → Saved Datasets, find the entry, and click the bookmark icon again to remove it from your list. This does not delete the dataset from the platform.' },
            { q: 'How do I report a dataset with incorrect information?', a: 'Open the dataset detail page and click the flag icon (⚑) at the top right. Select a reason and submit. The admin team reviews all reports within 48 hours.' },
            { q: 'What happens after I report a dataset?', a: 'The dataset is flagged internally. If the report is valid, the dataset is removed or corrected and you receive an in-app notification of the outcome.' },
        ],
    },
    {
        id: 'account',
        icon: <UserCog size={18} />,
        title: 'Account & Privacy',
        description: 'Manage your profile, email, password and data privacy.',
        faqs: [
            { q: 'How do I change my display name or email?', a: 'Click your avatar (top right) → Account Settings. Update your name or email and click Save. Email changes require re-verification.' },
            { q: 'How do I reset my password?', a: 'On the Login page click "Forgot password?". Enter your email address and we will send a secure reset link valid for 1 hour.' },
            { q: 'How do I delete my account?', a: 'Go to Account Settings → Danger Zone → Delete Account. All your threads, replies, and uploads will be permanently removed. This cannot be reversed.' },
            { q: 'Who can see my activity on the platform?', a: 'Your threads and replies are public. Your email is never shown publicly — only your display name and avatar initial are visible to other users.' },
        ],
    },
    {
        id: 'security',
        icon: <ShieldCheck size={18} />,
        title: 'Security & Trust',
        description: 'How DataCenter keeps your data and account safe.',
        faqs: [
            { q: 'How is my authentication data protected?', a: 'Authentication is handled by Firebase, which encrypts all credentials. Passwords are never stored on our servers. You can also sign in via Google or GitHub for added security.' },
            { q: 'Are datasets virus-scanned before being served?', a: 'Yes. All uploaded files are scanned with ClamAV before they become available for download. Files that fail the scan are quarantined and never served.' },
            { q: 'Is my download history stored?', a: 'Download counts are recorded at the dataset level (total downloads) but individual download history is kept private and only visible to you in your Profile.' },
        ],
    },
];

// ─── Accordion Item ───────────────────────────────────────────────────────────
const AccordionItem = ({ faq, index }: { faq: FaqItem; index: number }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className={`rounded-xl overflow-hidden border transition-all duration-300 ${open ? 'border-gray-900 shadow-md' : 'border-gray-100 hover:border-gray-300'}`}>
            <button
                onClick={() => setOpen(!open)}
                className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors duration-200 ${open ? 'bg-gray-900' : 'bg-white hover:bg-gray-50'}`}
            >
                <span className={`text-sm font-semibold pr-4 ${open ? 'text-white' : 'text-gray-800'}`}>
                    <span className={`mr-2 text-xs font-bold ${open ? 'text-gray-400' : 'text-gray-300'}`}>0{index + 1}</span>
                    {faq.q}
                </span>
                <ChevronDown
                    size={16}
                    className={`shrink-0 transition-all duration-300 ${open ? 'rotate-180 text-white' : 'text-gray-400'}`}
                />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96' : 'max-h-0'}`}>
                <p className="text-sm text-gray-600 leading-relaxed px-5 pb-5 pt-4 bg-gray-50 border-t border-gray-100">
                    {faq.a}
                </p>
            </div>
        </div>
    );
};

// ─── Section Card ─────────────────────────────────────────────────────────────
const SectionCard = ({ section, index }: { section: Section; index: number }) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <div
            id={section.id}
            className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 group
                ${expanded ? 'border-gray-900 shadow-xl' : 'border-gray-100 hover:border-gray-300 hover:shadow-lg'}`}
        >
            {/* Header row */}
            <button
                onClick={() => setExpanded(!expanded)}
                className={`w-full flex items-center justify-between px-6 py-5 text-left transition-colors duration-200
                    ${expanded ? 'bg-gray-900' : 'bg-white hover:bg-gray-50'}`}
            >
                <div className="flex items-center gap-4">
                    {/* Number */}
                    <span className={`text-xs font-bold tabular-nums ${expanded ? 'text-gray-500' : 'text-gray-200'}`}>
                        {String(index + 1).padStart(2, '0')}
                    </span>
                    {/* Icon bubble */}
                    <div className={`p-2.5 rounded-xl border transition-all duration-200
                        ${expanded ? 'bg-white text-gray-900 border-gray-200' : 'bg-gray-100 text-gray-700 border-gray-200 group-hover:bg-gray-900 group-hover:text-white group-hover:border-gray-900'}`}>
                        {section.icon}
                    </div>
                    <div className="text-left">
                        <p className={`text-sm font-bold transition-colors ${expanded ? 'text-white' : 'text-gray-900'}`}>
                            {section.title}
                        </p>
                        <p className={`text-xs mt-0.5 transition-colors ${expanded ? 'text-gray-400' : 'text-gray-400'}`}>
                            {section.description}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all
                        ${expanded ? 'bg-white text-gray-900 border-white' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                        {section.faqs.length} FAQs
                    </span>
                    <ChevronDown
                        size={16}
                        className={`transition-all duration-300 ${expanded ? 'rotate-180 text-white' : 'text-gray-400'}`}
                    />
                </div>
            </button>

            {/* FAQs */}
            <div className={`transition-all duration-500 overflow-hidden ${expanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-6 py-5 space-y-3 bg-gray-50 border-t border-gray-100">
                    {section.faqs.map((faq, i) => (
                        <AccordionItem key={i} faq={faq} index={i} />
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─── Support Page ─────────────────────────────────────────────────────────────
const Support = () => {
    const [search, setSearch] = useState('');

    const searchResults = search.trim()
        ? SECTIONS.flatMap((s) =>
            s.faqs
                .filter((f) =>
                    f.q.toLowerCase().includes(search.toLowerCase()) ||
                    f.a.toLowerCase().includes(search.toLowerCase())
                )
                .map((f) => ({ ...f, section: s.title, icon: s.icon }))
        )
        : [];

    return (
        <div className="flex-1 bg-gray-50 min-h-screen px-8 pr-10 pt-10 pb-16">

            {/* ── Hero ── */}
            <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-gray-900 animate-pulse" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Help Center</span>
                </div>
                <h1 className="text-5xl font-extrabold text-black leading-tight mb-3">Support</h1>
                <p className="text-2xl font-bold text-gray-900 leading-snug mb-3">
                    We've got answers —<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">
                        whatever your question.
                    </span>
                </p>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xl">
                    Step-by-step guidance on using DataCenter — discussions, datasets, account privacy,
                    notifications, and security. Can't find what you need? Reach out directly.
                </p>
                {/* Live indicator */}
                <div className="flex items-center gap-2 mt-4">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-700" />
                    </span>
                    <span className="text-xs text-gray-400 font-medium">Support team online · Mon–Fri, 08:00–18:00 WAT</span>
                </div>
            </div>

            {/* ── Search ── */}
            <div className="relative mb-10 max-w-2xl">
                <div className="flex items-center gap-3 bg-white border-2 border-gray-200 rounded-2xl px-5 py-4 shadow-sm focus-within:border-gray-900 focus-within:shadow-lg transition-all duration-300">
                    <Search size={16} className="text-gray-400 shrink-0" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search help articles… e.g. 'how to download' or 'notifications'"
                        className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-700 transition font-bold text-xs px-2 py-1 rounded-lg hover:bg-gray-100">✕</button>
                    )}
                </div>
            </div>

            {/* ── Search results ── */}
            {search.trim() && (
                <div className="mb-10 max-w-2xl">
                    {searchResults.length === 0 ? (
                        <div className="bg-white border border-gray-100 rounded-2xl py-14 px-8 text-center shadow-sm">
                            <p className="text-2xl mb-2">🔍</p>
                            <p className="text-sm font-semibold text-gray-700 mb-1">No results for "{search}"</p>
                            <p className="text-xs text-gray-400">Try different keywords or browse sections below.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-xs text-gray-400 font-medium mb-3">
                                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                            </p>
                            {searchResults.map((r, i) => (
                                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer group">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1.5 bg-gray-100 rounded-lg text-gray-600 group-hover:bg-gray-900 group-hover:text-white transition-all duration-200">
                                            {r.icon}
                                        </div>
                                        <span className="text-xs text-gray-400 font-semibold">{r.section}</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 mb-1.5 group-hover:text-gray-700 transition">{r.q}</p>
                                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{r.a}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Quick nav ── */}
            {!search.trim() && (
                <>
                    <div className="flex flex-wrap gap-2 mb-8">
                        {SECTIONS.map((s, i) => (
                            <a
                                key={s.id}
                                href={`#${s.id}`}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-600
                                    hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-200 shadow-sm hover:shadow-md group"
                            >
                                <span className="text-gray-400 group-hover:text-gray-300 transition-colors">{String(i + 1).padStart(2, '0')}</span>
                                {s.title}
                            </a>
                        ))}
                    </div>

                    {/* ── Sections ── */}
                    <div className="grid gap-4 mb-14">
                        {SECTIONS.map((s, i) => (
                            <SectionCard key={s.id} section={s} index={i} />
                        ))}
                    </div>
                </>
            )}

            {/* ── Contact cards ── */}
            <div className="border-t-2 border-gray-900 pt-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-base font-bold text-gray-900">Still need help?</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Our team responds within 2 business hours.</p>
                    </div>
                    <Zap size={18} className="text-gray-300" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Email */}
                    <a href="mailto:support@datacenter-cm.org"
                        className="group flex items-center gap-4 bg-white border-2 border-gray-100 rounded-2xl p-5
                            hover:border-gray-900 hover:shadow-xl transition-all duration-300"
                    >
                        <div className="p-3 bg-gray-100 text-gray-700 rounded-xl border border-gray-200
                            group-hover:bg-gray-900 group-hover:text-white group-hover:border-gray-900 transition-all duration-300 shrink-0">
                            <Mail size={20} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900">Email us</p>
                            <p className="text-xs text-gray-400 truncate">support@datacenter-cm.org</p>
                        </div>
                        <ExternalLink size={13} className="text-gray-200 group-hover:text-gray-500 transition shrink-0 ml-auto" />
                    </a>

                    {/* Live Chat */}
                    <a href="https://t.me/datacenter_cm" target="_blank" rel="noreferrer"
                        className="group flex items-center gap-4 bg-white border-2 border-gray-100 rounded-2xl p-5
                            hover:border-gray-900 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                    >
                        {/* animated background sweep on hover */}
                        <span className="absolute inset-0 bg-gray-900 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out rounded-2xl" />
                        <div className="relative z-10 p-3 bg-gray-100 text-gray-700 rounded-xl border border-gray-200
                            group-hover:bg-white group-hover:text-gray-900 group-hover:border-gray-100 transition-all duration-300 shrink-0">
                            <MessageCircle size={20} />
                        </div>
                        <div className="relative z-10 min-w-0">
                            <p className="text-sm font-bold text-gray-900 group-hover:text-white transition-colors duration-300">Live Chat</p>
                            <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Chat on Telegram ↗</p>
                        </div>
                        <ExternalLink size={13} className="relative z-10 text-gray-200 group-hover:text-gray-400 transition shrink-0 ml-auto" />
                    </a>

                    {/* Docs */}
                    <a href="#"
                        className="group flex items-center gap-4 bg-white border-2 border-gray-100 rounded-2xl p-5
                            hover:border-gray-900 hover:shadow-xl transition-all duration-300"
                    >
                        <div className="p-3 bg-gray-100 text-gray-700 rounded-xl border border-gray-200
                            group-hover:bg-gray-900 group-hover:text-white group-hover:border-gray-900 transition-all duration-300 shrink-0">
                            <BookOpen size={20} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900">Full Docs</p>
                            <p className="text-xs text-gray-400">Data API & developer guide</p>
                        </div>
                        <ExternalLink size={13} className="text-gray-200 group-hover:text-gray-500 transition shrink-0 ml-auto" />
                    </a>
                </div>
            </div>

            {/* ── Tip banner ── */}
            <div className="mt-10 bg-gray-900 text-white rounded-2xl px-6 py-5 flex items-center gap-4 shadow-xl">
                <div className="p-2.5 bg-white/10 rounded-xl shrink-0">
                    <HelpCircle size={20} className="text-white" />
                </div>
                <p className="text-xs leading-relaxed text-gray-300">
                    <span className="font-bold text-white">Pro tip:</span>{' '}
                    Use the search bar to instantly surface any help article without scrolling.
                    The Support page is always one click away in the left navbar.
                </p>
            </div>
        </div>
    );
};

export default Support;
