import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getAllTeachersApi, createTeacherApi, getAllInstitutesApi } from '../services/apiCollection';
import useAuth from '../hooks/useAuth';
import { FiPlus, FiBriefcase, FiMail, FiCalendar, FiUser, FiInfo } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';
import ErrorFallback from '../components/common/ErrorFallback';

const Teachers = () => {
  const { setPageTitle } = useOutletContext();
  const { user } = useAuth();
  
  const [teachers, setTeachers] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    setPageTitle('Faculty Registry');
  }, [setPageTitle]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getAllTeachersApi();
      setTeachers(res.data.teachers || []);

      if (user.role === 'Super Admin') {
        const instRes = await getAllInstitutesApi();
        setInstitutes(instRes.data.institutes || []);
      }
      setError(null);
    } catch (err) {
      setError('Could not retrieve faculty listing.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await createTeacherApi(data);
      toast.success('Teacher successfully onboarded!');
      setShowModal(false);
      reset();
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to onboard teacher';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader message="Accessing faculty registers..." />;
  if (error) return <ErrorFallback retryAction={fetchData} message={error} />;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Faculty Members</h2>
          <p className="text-sm text-slate-500">{teachers.length} active instructors registered</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          <FiPlus size={16} />
          <span>Onboard Teacher</span>
        </button>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm shadow-slate-100/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Faculty Name</th>
                <th className="px-6 py-4">Email Address</th>
                <th className="px-6 py-4">Registered Date</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-650">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-slate-400 font-medium">
                    No teachers registered in your portal yet.
                  </td>
                </tr>
              ) : (
                teachers.map((teach) => (
                  <tr key={teach._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xs border border-indigo-100">
                        {teach.name[0]}
                      </div>
                      <span className="font-semibold text-slate-800">{teach.name}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <span className="flex items-center space-x-1.5">
                        <FiMail className="text-slate-400" />
                        <span>{teach.email}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      <span className="flex items-center space-x-1.5">
                        <FiCalendar className="text-slate-400" />
                        <span>{new Date(teach.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-50 border border-emerald-250 text-emerald-700 tracking-wider">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Teacher Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-100 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Onboard Faculty Instructor</h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Professor Richard Feyman"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm focus:outline-none"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <span className="text-xs text-red-500 block mt-1">{errors.name.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. feyman@school.edu"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm focus:outline-none"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: 'Enter a valid email address'
                    }
                  })}
                />
                {errors.email && <span className="text-xs text-red-500 block mt-1">{errors.email.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Temporary Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm focus:outline-none"
                  {...register('password', { 
                    required: 'Temporary password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                />
                {errors.password && <span className="text-xs text-red-500 block mt-1">{errors.password.message}</span>}
              </div>

              {/* Institute selector (Super Admin only) */}
              {user.role === 'Super Admin' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Assign Institute
                  </label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm focus:outline-none"
                    {...register('institute', { required: 'Institute is required' })}
                  >
                    <option value="">Select Institute...</option>
                    {institutes.map((inst) => (
                      <option key={inst._id} value={inst._id}>
                        {inst.name} ({inst.code})
                      </option>
                    ))}
                  </select>
                  {errors.institute && <span className="text-xs text-red-500 block mt-1">{errors.institute.message}</span>}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition duration-150 cursor-pointer"
                >
                  {saving ? 'Onboarding...' : 'Onboard Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
