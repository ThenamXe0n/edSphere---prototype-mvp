import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-6">
      <h1 className="text-6xl font-extrabold text-indigo-600">404</h1>
      <h3 className="text-xl font-bold text-slate-800 mt-4">Page Not Found</h3>
      <p className="text-sm text-slate-500 max-w-sm mt-2">
        The page you are trying to access does not exist or has been relocated.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition duration-150 shadow-md shadow-indigo-600/10 cursor-pointer"
      >
        Return to Safety
      </Link>
    </div>
  );
};

export default NotFound;
