import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getAllStudentsApi, createStudentApi, updateStudentApi, deleteStudentApi, getAllInstitutesApi } from '../services/apiCollection';
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiUser, FiSliders } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';
import ErrorFallback from '../components/common/ErrorFallback';
import useAuth from '../hooks/useAuth';

const Students = () => {
  const { setPageTitle } = useOutletContext();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and pagination states
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const { user } = useAuth();
  const [institutes, setInstitutes] = useState([]);

  useEffect(() => {
    if (user?.role === 'Super Admin') {
      const fetchInsts = async () => {
        try {
          const res = await getAllInstitutesApi();
          setInstitutes(res.data.institutes || []);
        } catch (e) {
          console.error('Failed to load institutes list', e);
        }
      };
      fetchInsts();
    }
  }, [user]);

  useEffect(() => {
    setPageTitle('Student Management');
  }, [setPageTitle]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await getAllStudentsApi({
        search,
        course: courseFilter,
        status: statusFilter,
        page,
        limit: 8,
      });
      setStudents(res.data.students);
      setTotalPages(res.pages);
      setTotalStudents(res.total);
      setError(null);
    } catch (err) {
      setError('Could not fetch student profiles.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset page to 1 when filters change
    setPage(1);
  }, [search, courseFilter, statusFilter]);

  useEffect(() => {
    fetchStudents();
  }, [page, search, courseFilter, statusFilter]);

  const handleOpenCreate = () => {
    setCurrentStudent(null);
    reset({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'Male',
      course: '',
      admissionNumber: '',
      status: 'Active',
      institute: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (student) => {
    setCurrentStudent(student);
    reset({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone || '',
      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
      gender: student.gender || 'Male',
      course: student.course || '',
      admissionNumber: student.admissionNumber,
      status: student.status,
      institute: student.institute?._id || student.institute || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student and their login credentials?')) {
      try {
        await deleteStudentApi(id);
        toast.success('Student successfully removed.');
        fetchStudents();
      } catch (err) {
        toast.error('Failed to delete student.');
        console.error(err);
      }
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    const formData = new FormData();
    
    // Append text fields
    Object.keys(data).forEach((key) => {
      if (key !== 'profileImage') {
        formData.append(key, data[key]);
      }
    });

    // Append profileImage file if present
    if (data.profileImage && data.profileImage[0]) {
      formData.append('profileImage', data.profileImage[0]);
    }

    try {
      if (currentStudent) {
        await updateStudentApi(currentStudent._id, formData);
        toast.success('Student profile updated successfully!');
      } else {
        await createStudentApi(formData);
        toast.success('Student registered successfully!');
      }
      setShowModal(false);
      fetchStudents();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save student profile';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Student Directory</h2>
          <p className="text-sm text-slate-500">{totalStudents} enrolled student profiles</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition duration-150 shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          <FiPlus size={16} />
          <span>Register Student</span>
        </button>
      </div>

      {/* Filters Area */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
            <FiSearch size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by name, email, or admission..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-50 rounded-xl text-sm focus:outline-none transition duration-150"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Status */}
          <div className="relative">
            <select
              className="w-full sm:w-40 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Alumni">Alumni</option>
            </select>
          </div>

          {/* Course */}
          <div>
            <input
              type="text"
              placeholder="Filter by course..."
              className="w-full sm:w-48 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      {loading && students.length === 0 ? (
        <Loader message="Fetching directory..." />
      ) : error ? (
        <ErrorFallback retryAction={fetchStudents} message={error} />
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm shadow-slate-100/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Avatar</th>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Admission</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-slate-400 font-medium">
                      No students found matching filters.
                    </td>
                  </tr>
                ) : (
                  students.map((stud) => (
                    <tr key={stud._id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-500 font-bold shadow-inner">
                          {stud.profileImage ? (
                            <img src={`${import.meta.env.VITE_API_BASE_URL || ''}${stud.profileImage}`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            stud.firstName[0] + stud.lastName[0]
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {stud.firstName} {stud.lastName}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs bg-slate-50 px-2 py-0.5 border border-slate-150 text-slate-500 rounded-md">
                          {stud.admissionNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-slate-700">{stud.email}</span>
                          <span className="text-xs text-slate-400 mt-0.5">{stud.phone || 'No phone'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600">{stud.course || 'Unassigned'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-wider border ${
                          stud.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : stud.status === 'Suspended'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {stud.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEdit(stud)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                            title="Edit"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(stud._id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Page {page} of {totalPages}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg disabled:opacity-50 transition cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg disabled:opacity-50 transition cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form Onboarding Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-100 w-full max-w-2xl rounded-3xl p-8 shadow-2xl animate-scaleUp my-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6">
              {currentStudent ? 'Modify Student Profile' : 'Onboard Student Profile'}
            </h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">First Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm focus:outline-none"
                    {...register('firstName', { required: 'First name is required' })}
                  />
                  {errors.firstName && <span className="text-xs text-red-500 block mt-1">{errors.firstName.message}</span>}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Last Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm focus:outline-none"
                    {...register('lastName', { required: 'Last name is required' })}
                  />
                  {errors.lastName && <span className="text-xs text-red-500 block mt-1">{errors.lastName.message}</span>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm focus:outline-none"
                    {...register('email', { required: 'Email is required' })}
                  />
                  {errors.email && <span className="text-xs text-red-500 block mt-1">{errors.email.message}</span>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm focus:outline-none"
                    {...register('phone')}
                  />
                </div>

                {/* Admission Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Admission Number (Unique)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm focus:outline-none"
                    {...register('admissionNumber', { required: 'Admission number is required' })}
                  />
                  {errors.admissionNumber && <span className="text-xs text-red-500 block mt-1">{errors.admissionNumber.message}</span>}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Date of Birth</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm focus:outline-none"
                    {...register('dateOfBirth')}
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Gender</label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm focus:outline-none"
                    {...register('gender')}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Course Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Enrolled Course / Grade</label>
                  <input
                    type="text"
                    placeholder="e.g. Grade 10 Science"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm focus:outline-none"
                    {...register('course')}
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm focus:outline-none"
                    {...register('status')}
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Alumni">Alumni</option>
                  </select>
                </div>

                {/* Profile Image upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Profile Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 file:cursor-pointer"
                    {...register('profileImage')}
                  />
                </div>

                {/* Institute selector for Super Admin */}
                {user?.role === 'Super Admin' && (
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
                    {errors.institute && (
                      <span className="text-xs text-red-500 block mt-1">{errors.institute.message}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/10 transition cursor-pointer"
                >
                  {saving ? 'Registering...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
