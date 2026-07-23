import React from 'react';
import useAuth from '../../hooks/useAuth';
import { FiLogOut, FiUser, FiMenu } from 'react-icons/fi';

const Navbar = ({ pageTitle = 'Dashboard', onMenuClick }) => {
  const { user, logout } = useAuth();

  const getRoleColor = (role) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Institute Admin':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Teacher':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Student':
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-25 flex items-center justify-between w-full h-16 px-6 bg-white border-b border-slate-100 shadow-xs shrink-0">
      <div className="flex items-center space-x-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-slate-500 hover:text-slate-700 p-1 mr-1 focus:outline-none cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <FiMenu size={20} />
        </button>
        <h1 className="text-lg font-bold text-slate-800 hidden sm:block">
          {user?.institute?.name || 'EduSphere Super Console'}
        </h1>
        <span className="text-slate-300 hidden sm:inline">|</span>
        <h2 className="text-sm font-medium text-slate-500">{pageTitle}</h2>
      </div>

      <div className="flex items-center space-x-4">
        {/* User Badge */}
        <div className="hidden md:flex flex-col items-end">
          <span className="text-sm font-semibold text-slate-700 leading-tight">{user?.name}</span>
          <span className={`mt-0.5 text-[10px] font-bold px-2 py-0.5 border rounded-full uppercase tracking-wider ${getRoleColor(user?.role)}`}>
            {user?.role}
          </span>
        </div>

        {/* Profile Avatar */}
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 text-slate-600 font-semibold text-sm border border-slate-200 overflow-hidden shadow-inner">
          {/* We'll load the profile image or fallback to initials */}
          {user?.profileImage ? (
            <img src={`${import.meta.env.VITE_API_BASE_URL || ''}${user.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            getInitials(user?.name)
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Sign Out"
          className="flex items-center justify-center w-9 h-9 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 border border-slate-100 hover:border-red-100 rounded-xl transition duration-150 cursor-pointer shadow-xs"
        >
          <FiLogOut size={16} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
