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
  FiX
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
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500 text-white font-bold text-lg shadow-sm">
            E
          </div>
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
      <div className="p-4 border-t border-slate-800 text-center">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest">
          Version 1.0.0
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
