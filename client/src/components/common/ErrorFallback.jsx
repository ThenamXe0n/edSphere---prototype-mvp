import React from 'react';
import { BiErrorCircle } from 'react-icons/bi';

const ErrorFallback = ({ 
  title = 'An error occurred', 
  message = 'We could not fetch the requested data. Please try again.',
  retryAction 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-6 text-center">
      <div className="p-3 bg-red-50 text-red-500 rounded-2xl mb-4">
        <BiErrorCircle size={48} />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6">{message}</p>
      {retryAction && (
        <button
          onClick={retryAction}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition duration-150 shadow-sm"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorFallback;
