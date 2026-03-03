import { Logs, Plus, Minus, Home, Database, MessageCircle, Contact, Flag, User, LogOut } from 'lucide-react'
// import logo from '../assets/logo.png';
import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LARGE_SCREEN = 1024; // px — nav opens by default above this

const menuItems = [
  {
    icons: <Home size={25} />,
    label: 'Home',
    path: '/'
  },
  {
    icons: <Database size={25} />,
    label: 'Datasets',
    path: '/datasets'
  },
  {
    icons: <MessageCircle size={25} />,
    label: 'Discussions',
    path: '/discussions'
  },
  {
    icons: <Contact size={25} />,
    label: 'Support',
    path: '/support'
  },
  {
    icons: <Flag size={25} />,
    label: 'Reports',
    path: '/reports'
  }
]

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();

  // open by default on large screens, closed on small screens
  const [open, setOpen] = useState(() => window.innerWidth >= LARGE_SCREEN);

  // keep in sync when the window is resized
  useEffect(() => {
    const onResize = () => setOpen(window.innerWidth >= LARGE_SCREEN);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  //Form state
  const [openFOrm, setOpenForm] = useState(false)

  // Profile popup (shown in collapsed nav)
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  //Function for opening file picker
  const fileRef = useRef<HTMLInputElement | null>(null);

  const openFilePicker = () => {
    fileRef.current?.click();
  }

  return (
    <nav className={`sticky top-0 z-50 shadow-md h-screen p-2 flex flex-col border border-r border-gray-200 ${open ? 'w-56' : 'w-18'} duration-500 bg-white text-black`}>

      <div className='border-b px-3 py-3 h-20 flex justify-between items-center'>
        <span className={`font-bold text-xl ${!open && 'w-0 opacity-0 overflow-hidden'} duration-500 truncate`}>DataCenter</span>
        <div><Logs size={30} className={`cursor-pointer duration-500 ${!open && 'rotate-180'}`} onClick={() => setOpen(!open)} /></div>
      </div>

      {/* Add New Dataset Section */}

      <div className='mt-3 relative'>
        <button
          onClick={() => setOpenForm(!openFOrm)}
          className='shadow-md rounded-full w-fit p-2 flex items-center bg-blue-600 text-white hover:bg-blue-700 duration-300'>
          {openFOrm
            ? <Minus size={40} className='cursor-pointer' />
            : <Plus size={40} className='cursor-pointer' />}
          <p className={`${!open && 'hidden duration-500'} duration-500 font-semibold text-lg pr-4`}>Upload</p>
        </button>

        <form className={`absolute  mt-1 top-0 px-4 py-4 border border-gray-200 text-black rounded-lg w-64 bg-white shadow-lg ease-out-in duration-500 ${!openFOrm && 'hidden'}  ${open ? 'left-56 z-50' : 'left-18 z-50'}`}>
          <p className='italic'>Select a file to upload</p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv, .xlsx, .xls"
            className='block w-full text-sm' />
          <button
            onClick={openFilePicker}
            type="button"
            className='mt-3 w-full bg-white text-blue-500 py-1 rounded'>Upload Dataset</button>
        </form>

      </div>

      <ul className="flex-1">
        {menuItems.map((item) => (
          <li
            key={item.label}
            className="mt-4 "
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md duration-300 cursor-pointer flex items-center gap-3 relative group
                ${isActive ? 'text-black' : 'text-gray-600 hover:text-black'}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -right-2 top-0 h-full w-1 bg-black rounded-l" />
                  )}
                  <div className="transition-colors duration-300">{item.icons}</div>

                  <p
                    className={`${!open && 'w-0 translate-x-24'} duration-500 overflow-hidden font-semibold transition-colors`}
                  >
                    {item.label}
                  </p>

                  <p
                    className={`${open && 'hidden'} absolute left-32 shadow-md rounded-md duration-300 overflow-hidden
                    group-hover:left-16 w-0 p-0 group-hover:p-2 group-hover:w-fit bg-white font-semibold`}
                  >
                    {item.label}
                  </p>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>



      {/* User footer */}
      <div ref={profileRef} className='relative flex flex-col px-3 py-2 gap-1'>

        {/* Profile popup — shown when nav is collapsed */}
        {!open && profileOpen && isAuthenticated && user && (
          <div className="absolute bottom-12 left-12 z-50 bg-white border border-gray-200 rounded-xl shadow-lg w-52 p-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            <hr className="border-gray-100 mb-2" />
            <button
              onClick={() => { logout(); setProfileOpen(false); }}
              className="flex items-center gap-2 w-full text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg px-2 py-1.5 transition"
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        )}

        <div className='flex gap-2 items-center'>
          {/* Clickable icon — toggles popup when collapsed */}
          <button
            onClick={() => !open && setProfileOpen(!profileOpen)}
            className={`shrink-0 ${!open ? 'cursor-pointer hover:opacity-70' : 'cursor-default'} transition`}
          >
            <User size={30} />
          </button>

          {/* Expanded state: name + email inline */}
          <div className={`leading-5 min-w-0 ${!open && 'w-0 translate-x-24'} duration-500 overflow-hidden`}>
            {isAuthenticated && user ? (
              <>
                <p className='text-sm font-medium truncate'>{user.name}</p>
                <span className='text-xs text-gray-400 truncate'>{user.email}</span>
              </>
            ) : (
              <p className="text-sm">Guest</p>
            )}
          </div>
        </div>

        {/* Logout row — only visible when expanded */}
        {isAuthenticated && (
          <button
            onClick={logout}
            className={`flex items-center gap-2 text-xs text-red-500 hover:text-red-700 transition duration-200 px-1 mt-1 ${!open && 'hidden'}`}
          >
            <LogOut size={14} />
            <span>Log out</span>
          </button>
        )}
      </div>
    </nav>

  )
}

export default Navbar
