import React, { useEffect, useState } from 'react';
import { getAllInstitutesApi, createInstituteApi } from '../../services/apiCollection';
import Loader from '../common/Loader';
import ErrorFallback from '../common/ErrorFallback';
import { FiHome, FiUsers, FiBookOpen, FiPlus, FiBriefcase } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const SuperAdminDashboard = () => {
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchInstitutes = async () => {
    try {
      setLoading(true);
      const res = await getAllInstitutesApi();
      setInstitutes(res.data.institutes);
      setError(null);
    } catch (err) {
      setError('Could not load institutes list.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutes();
  }, []);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await createInstituteApi(data);
      toast.success('Institute registered successfully!');
      setShowModal(false);
      reset();
      fetchInstitutes();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create institute';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader message="Fetching system status..." />;
  if (error) return <ErrorFallback retryAction={fetchInstitutes} message={error} />;

  // Calculate totals
  const totalInstitutes = institutes.length;
  const totalStudents = institutes.reduce((acc, inst) => acc + (inst.stats?.students || 0), 0);
  const totalTeachers = institutes.reduce((acc, inst) => acc + (inst.stats?.teachers || 0), 0);
  const totalCourses = institutes.reduce((acc, inst) => acc + (inst.stats?.courses || 0), 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome & Stats Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Super Administrator Console</h2>
          <p className="text-sm text-slate-500">Overview of all active educational tenants</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition duration-150 shadow-sm cursor-pointer"
        >
          <FiPlus size={16} />
          <span>New Institute</span>
        </button>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl flex items-center space-x-4 shadow-sm shadow-slate-100/50">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <FiHome size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Institutes</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{totalInstitutes}</h3>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl flex items-center space-x-4 shadow-sm shadow-slate-100/50">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <FiUsers size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Students</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{totalStudents}</h3>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl flex items-center space-x-4 shadow-sm shadow-slate-100/50">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FiBriefcase size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Teachers</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{totalTeachers}</h3>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl flex items-center space-x-4 shadow-sm shadow-slate-100/50">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <FiBookOpen size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Courses</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{totalCourses}</h3>
          </div>
        </div>
      </div>

      {/* Institutes Table */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm shadow-slate-100/50">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">Registered Institutes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Admin Email</th>
                <th className="px-6 py-4 text-center">Students</th>
                <th className="px-6 py-4 text-center">Teachers</th>
                <th className="px-6 py-4 text-center">Courses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {institutes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400 font-medium">
                    No institutes registered yet.
                  </td>
                </tr>
              ) : (
                institutes.map((inst) => (
                  <tr key={inst._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-semibold text-slate-800">{inst.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700 rounded-lg">
                        {inst.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{inst.admin?.email || 'N/A'}</td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">{inst.stats?.students}</td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">{inst.stats?.teachers}</td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">{inst.stats?.courses}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Institute Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-100 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Register New Institute</h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Institute Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Oxford University"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm focus:outline-none"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <span className="text-xs text-red-500 block mt-1">{errors.name.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Unique Code (Uppercase, Alphanumeric)
                </label>
                <input
                  type="text"
                  placeholder="e.g. OXFORD"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm focus:outline-none"
                  {...register('code', { required: 'Code is required' })}
                />
                {errors.code && <span className="text-xs text-red-500 block mt-1">{errors.code.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. contact@oxford.edu"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm focus:outline-none"
                  {...register('contactEmail')}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. London, UK"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm focus:outline-none"
                  {...register('address')}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition duration-150 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition duration-150 cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
