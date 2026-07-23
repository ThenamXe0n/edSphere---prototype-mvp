import React from 'react';

const Loader = ({ message = 'Loading, please wait...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-6">
      <div className="relative flex items-center justify-center">
        {/* Outer Ring */}
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        {/* Inner Ring (Counter-rotating) */}
        <div className="absolute w-10 h-10 border-4 border-indigo-50 border-b-indigo-400 rounded-full animate-spin [animation-direction:reverse]"></div>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">{message}</p>
    </div>
  );
};

export default Loader;
