import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getPublicInstitutesApi } from '../services/apiCollection';
import { FiUser, FiMail, FiLock, FiBookOpen, FiGithub, FiLinkedin } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Register = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        setLoading(true);
        const res = await getPublicInstitutesApi();
        setInstitutes(res.data.institutes || []);
      } catch (err) {
        console.error('Failed to load registered institutes:', err);
        toast.error('Failed to load registered institutes.');
      } finally {
        setLoading(false);
      }
    };
    fetchInstitutes();
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await authRegister(data);
      toast.success('Admin account registered successfully!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-100/50">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 mb-4 shrink-0">
            <FiBookOpen size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Join Your Institute</h2>
          <p className="text-sm text-slate-400 mt-1">Register an Admin account for your institute</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* --- ADMIN DETAILS --- */}
          <div className="space-y-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
              1. Admin Account
            </h3>
            
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                  <FiUser size={18} />
                </span>
                <input
                  type="text"
                  placeholder="John Doe"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                    errors.name ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-indigo-100'
                  } rounded-xl text-sm focus:outline-none focus:ring-4 transition duration-150`}
                  {...register('name', { required: 'Name is required' })}
                />
              </div>
              {errors.name && (
                <span className="text-xs text-red-500 mt-1 block">{errors.name.message}</span>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Admin Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                  <FiMail size={18} />
                </span>
                <input
                  type="email"
                  placeholder="admin@school.com"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                    errors.email ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-indigo-100'
                  } rounded-xl text-sm focus:outline-none focus:ring-4 transition duration-150`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: 'Enter a valid email',
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
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                    errors.password ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-indigo-100'
                  } rounded-xl text-sm focus:outline-none focus:ring-4 transition duration-150`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Must be at least 6 characters' },
                  })}
                />
              </div>
              {errors.password && (
                <span className="text-xs text-red-500 mt-1 block">{errors.password.message}</span>
              )}
            </div>
          </div>

          {/* --- INSTITUTE DETAILS (DROPDOWN) --- */}
          <div className="space-y-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
              2. Institute
            </h3>

            {/* School Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Select Your Institute
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                  <FiBookOpen size={18} />
                </span>
                <select
                  disabled={loading}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                    errors.institute ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-indigo-100'
                  } rounded-xl text-sm focus:outline-none focus:ring-4 transition duration-150 disabled:opacity-60`}
                  {...register('institute', { required: 'Please select an institute' })}
                >
                  <option value="">
                    {loading ? 'Loading institutes...' : 'Select Institute...'}
                  </option>
                  {institutes.map((inst) => (
                    <option key={inst._id} value={inst._id}>
                      {inst.name} ({inst.code})
                    </option>
                  ))}
                </select>
              </div>
              {errors.institute && (
                <span className="text-xs text-red-500 mt-1 block">{errors.institute.message}</span>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full py-3 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition duration-150 shadow-md shadow-indigo-600/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-6 pt-6 border-t border-slate-100 space-y-3">
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition">
              Sign In
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

export default Register;
