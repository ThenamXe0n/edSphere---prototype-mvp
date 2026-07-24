import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { FiMail, FiLock, FiEye, FiEyeOff, FiBookOpen, FiGithub, FiLinkedin } from 'react-icons/fi';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await login(data);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-100/50">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/eduSphereLogo.png" alt="EduSphere Logo" className="w-16 h-16 object-contain mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800">Welcome to EduSphere</h2>
          <p className="text-sm text-slate-400 mt-1">Sign in to manage your school workspace</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                <FiMail size={18} />
              </span>
              <input
                type="email"
                placeholder="you@school.com"
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${
                  errors.email ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-indigo-100'
                } rounded-xl text-sm focus:outline-none focus:ring-4 transition duration-150`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: 'Please enter a valid email address',
                  },
                })}
              />
            </div>
            {errors.email && (
              <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                <FiLock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-3 bg-slate-50 border ${
                  errors.password ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-indigo-100'
                } rounded-xl text-sm focus:outline-none focus:ring-4 transition duration-150`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="text-xs text-red-500 mt-1 block">{errors.password.message}</span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition duration-150 shadow-md shadow-indigo-600/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-6 pt-6 border-t border-slate-100 space-y-3">
          <p className="text-sm text-slate-500">
            Want to register your school?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 transition">
              Create an account
            </Link>
          </p>
          <div>
            <p className="text-xs text-slate-400">
              Developed by <span className="text-indigo-600 font-semibold">Nameet Mandwal</span>
            </p>
            <div className="flex items-center justify-center space-x-3 mt-2">
              <a
                href="https://github.com/ThenamXe0n"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-indigo-600 transition"
                title="GitHub"
              >
                <FiGithub size={14} />
              </a>
              <a
                href="https://www.linkedin.com/in/nameet-mandwal-601b201b3/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-indigo-600 transition"
                title="LinkedIn"
              >
                <FiLinkedin size={14} />
              </a>
              <a
                href="mailto:thenameet0@gmail.com"
                className="text-slate-400 hover:text-indigo-600 transition"
                title="Email"
              >
                <FiMail size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
