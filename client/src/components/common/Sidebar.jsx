import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { 
  FiGrid, 
  FiUsers, 
  FiBookOpen, 
  FiCalendar, 
  FiList,
  FiBook,
  FiBriefcase,
  FiX,
  FiGithub,
  FiLinkedin,
  FiMail
} from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const getLinks = (role) => {
    const base = [
      { path: '/dashboard', label: 'Dashboard', icon: <FiGrid size={18} /> }
    ];

    switch (role) {
      case 'Super Admin':
        return [
          ...base,
          { path: '/institutes', label: 'Institutes', icon: <FiBook size={18} /> },
          { path: '/teachers', label: 'Teachers', icon: <FiBriefcase size={18} /> },
          { path: '/students', label: 'Students', icon: <FiUsers size={18} /> },
          { path: '/courses', label: 'Courses', icon: <FiBookOpen size={18} /> }
        ];
      case 'Institute Admin':
        return [
          ...base,
          { path: '/teachers', label: 'Teachers', icon: <FiBriefcase size={18} /> },
          { path: '/students', label: 'Students', icon: <FiUsers size={18} /> },
          { path: '/courses', label: 'Courses', icon: <FiBookOpen size={18} /> },
          { path: '/attendance', label: 'Attendance', icon: <FiCalendar size={18} /> }
        ];
      case 'Teacher':
        return [
          ...base,
          { path: '/courses', label: 'My Courses', icon: <FiBookOpen size={18} /> },
          { path: '/attendance', label: 'Record Attendance', icon: <FiCalendar size={18} /> }
        ];
      case 'Student':
        return [
          ...base,
          { path: '/courses', label: 'Browse Courses', icon: <FiBookOpen size={18} /> },
          { path: '/attendance', label: 'My Attendance', icon: <FiCalendar size={18} /> }
        ];
      default:
        return base;
    }
  };

  const navLinks = getLinks(user?.role);

  return (
    <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 h-screen bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 transform shrink-0 lg:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <img src="/eduSphereLogo.png" alt="EduSphere Logo" className="w-8 h-8 object-contain shrink-0" />
          <span className="font-bold text-white text-base tracking-wider">
            EduSphere
          </span>
        </div>
        {/* Mobile close button */}
        <button 
          onClick={onClose}
          className="lg:hidden text-slate-400 hover:text-white p-1 focus:outline-none cursor-pointer"
        >
          <FiX size={18} />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-150 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'hover:bg-slate-800 hover:text-slate-100'
              }`
            }
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-center space-y-2">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">
            Version 1.0.0
          </p>
          <p className="text-[9px] text-slate-500 font-medium tracking-wide">
            Developed by <span className="text-indigo-400 font-semibold">Nameet Mandwal</span>
          </p>
        </div>
        <div className="flex items-center justify-center space-x-3">
          <a
            href="https://github.com/ThenamXe0n"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-indigo-400 transition"
            title="GitHub"
          >
            <FiGithub size={13} />
          </a>
          <a
            href="https://www.linkedin.com/in/nameet-mandwal-601b201b3/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-indigo-400 transition"
            title="LinkedIn"
          >
            <FiLinkedin size={13} />
          </a>
          <a
            href="mailto:thenameet0@gmail.com"
            className="text-slate-500 hover:text-indigo-400 transition"
            title="Email"
          >
            <FiMail size={13} />
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
