import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { getAllCoursesApi, createCourseApi, deleteCourseApi } from '../services/apiCollection';
import axiosInstance from '../utils/axiosInstance';
import useAuth from '../hooks/useAuth';
import { FiPlus, FiBookOpen, FiTrash2, FiVideo, FiEye } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';
import ErrorFallback from '../components/common/ErrorFallback';

const Courses = () => {
  const { setPageTitle } = useOutletContext();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    setPageTitle('Curriculum Registry');
  }, [setPageTitle]);

  const fetchCoursesAndTeachers = async () => {
    try {
      setLoading(true);
      const coursesRes = await getAllCoursesApi();
      setCourses(coursesRes.data.courses || []);

      // If user is Admin or Super Admin, fetch teachers to populate selection dropdown
      if (user.role === 'Super Admin' || user.role === 'Institute Admin') {
        const teachersRes = await axiosInstance.get('/users/teachers');
        setTeachers(teachersRes.data.data.teachers || []);
      }
      setError(null);
    } catch (err) {
      setError('Could not fetch curriculum list.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoursesAndTeachers();
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault(); // Prevent navigating to details
    if (window.confirm('Are you sure you want to delete this course, all its lessons, and student progress records?')) {
      try {
        await deleteCourseApi(id);
        toast.success('Course deleted successfully.');
        fetchCoursesAndTeachers();
      } catch (err) {
        toast.error('Failed to delete course.');
        console.error(err);
      }
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description || '');
    formData.append('category', data.category || '');
    formData.append('status', data.status || 'Draft');
    
    if (data.instructor) {
      formData.append('instructor', data.instructor);
    }

    if (data.thumbnail && data.thumbnail[0]) {
      formData.append('thumbnail', data.thumbnail[0]);
    }

    try {
      await createCourseApi(formData);
      toast.success('Course registered successfully!');
      setShowModal(false);
      reset();
      fetchCoursesAndTeachers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create course';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader message="Fetching curriculum list..." />;
  if (error) return <ErrorFallback retryAction={fetchCoursesAndTeachers} message={error} />;

  const canCreate = user.role !== 'Student';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Course Directories</h2>
          <p className="text-sm text-slate-500">Explore learning courses configured in your workspace</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition duration-150 shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <FiPlus size={16} />
            <span>Create Course</span>
          </button>
        )}
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-100 p-12 text-center rounded-3xl">
            <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl w-fit mx-auto mb-4">
              <FiBookOpen size={36} />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Courses Registered</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">There are no courses listed in your institute directory yet.</p>
          </div>
        ) : (
          courses.map((course) => (
            <Link
              key={course._id}
              to={`/courses/${course._id}`}
              className="group bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition duration-200 flex flex-col h-full"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-slate-100 flex items-center justify-center text-slate-400 font-bold overflow-hidden border-b border-slate-100 shrink-0">
                {course.thumbnail ? (
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL || ''}${course.thumbnail}`}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <FiBookOpen size={48} className="text-slate-350" />
                )}
                <span className="absolute top-3 left-3 bg-slate-900/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider">
                  {course.category || 'Curriculum'}
                </span>
                
                {/* Delete button (If Teacher instructing it or admin) */}
                {user.role !== 'Student' && (
                  <button
                    onClick={(e) => handleDelete(course._id, e)}
                    className="absolute top-3 right-3 p-1.5 bg-white/90 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg shadow-xs hover:scale-105 transition"
                    title="Delete Course"
                  >
                    <FiTrash2 size={14} />
                  </button>
                )}
              </div>

              {/* Info Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                    {course.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center space-x-1">
                    <FiVideo size={14} />
                    <span className="font-semibold text-slate-600">{course.lessons?.length || 0} Lessons</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                    course.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-50 text-slate-500 border border-slate-100'
                  }`}>
                    {course.status}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Create Course Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-100 w-full max-w-md rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Create New Course</h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Course Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Introduction to Physics"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm focus:outline-none"
                  {...register('title', { required: 'Course title is required' })}
                />
                {errors.title && <span className="text-xs text-red-500 block mt-1">{errors.title.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Category / Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Science, Mathematics"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm focus:outline-none"
                  {...register('category')}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Summarize course goals..."
                  rows="3"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm focus:outline-none resize-none"
                  {...register('description')}
                />
              </div>

              {/* Instructor selection: Visible only to Admins/Super Admins */}
              {(user.role === 'Super Admin' || user.role === 'Institute Admin') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Assign Instructor (Teacher)
                  </label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm focus:outline-none"
                    {...register('instructor')}
                  >
                    <option value="">Select Instructor...</option>
                    {teachers.map((teach) => (
                      <option key={teach._id} value={teach._id}>
                        {teach.name} ({teach.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Publishing Status
                </label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm focus:outline-none"
                  {...register('status')}
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Thumbnail Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 file:cursor-pointer"
                  {...register('thumbnail')}
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
                  {saving ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
