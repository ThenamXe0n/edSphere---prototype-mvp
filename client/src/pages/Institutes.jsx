import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getAllInstitutesApi, createInstituteApi } from '../services/apiCollection';
import { FiPlus, FiBook, FiMail, FiMapPin, FiAward, FiBriefcase, FiUsers, FiBookOpen } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';
import ErrorFallback from '../components/common/ErrorFallback';

const Institutes = () => {
  const { setPageTitle } = useOutletContext();
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    setPageTitle('Institutes Console');
  }, [setPageTitle]);

  const fetchInstitutes = async () => {
    try {
      setLoading(true);
      const res = await getAllInstitutesApi();
      setInstitutes(res.data.institutes || []);
      setError(null);
    } catch (err) {
      setError('Could not fetch registered institutes.');
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
      toast.success('Institute successfully registered!');
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

  if (loading) return <Loader message="Accessing system registry..." />;
  if (error) return <ErrorFallback retryAction={fetchInstitutes} message={error} />;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Educational Tenants</h2>
          <p className="text-sm text-slate-500">{institutes.length} registered institutional tenants</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          <FiPlus size={16} />
          <span>Onboard Institute</span>
        </button>
      </div>

      {/* Grid of tenants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {institutes.map((inst) => (
          <div key={inst._id} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs hover:shadow-md transition duration-200 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-800 text-base">{inst.name}</h3>
                <span className="inline-block mt-1.5 px-2.5 py-0.5 text-[10px] font-bold uppercase bg-slate-50 border border-slate-200 text-slate-650 rounded-lg">
                  Code: {inst.code}
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <FiBook size={20} />
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-500">
              {inst.contactEmail && (
                <p className="flex items-center space-x-2">
                  <FiMail className="text-slate-400" />
                  <span>{inst.contactEmail}</span>
                </p>
              )}
              {inst.address && (
                <p className="flex items-center space-x-2">
                  <FiMapPin className="text-slate-400" />
                  <span>{inst.address}</span>
                </p>
              )}
            </div>

            {/* Micro Stats inside Card */}
            <div className="pt-4 border-t border-slate-50 grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                <FiUsers className="mx-auto text-indigo-500 mb-1" />
                <span className="block text-xs font-bold text-slate-700">{inst.stats?.students || 0}</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase">Students</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                <FiBriefcase className="mx-auto text-emerald-500 mb-1" />
                <span className="block text-xs font-bold text-slate-700">{inst.stats?.teachers || 0}</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase">Teachers</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                <FiBookOpen className="mx-auto text-amber-500 mb-1" />
                <span className="block text-xs font-bold text-slate-700">{inst.stats?.courses || 0}</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase">Courses</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Onboard Institute Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-100 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Register Institutional Tenant</h3>

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
                  Unique Code
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
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition duration-150 cursor-pointer"
                >
                  {saving ? 'Creating...' : 'Onboard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Institutes;
