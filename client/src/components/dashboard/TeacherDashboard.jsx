import React, { useEffect, useState } from 'react';
import { getAllCoursesApi } from '../../services/apiCollection';
import Loader from '../common/Loader';
import ErrorFallback from '../common/ErrorFallback';
import { FiBookOpen, FiList, FiPlus, FiCalendar } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeacherStats = async () => {
    try {
      setLoading(true);
      // Fetch only the courses taught by this logged-in teacher
      const res = await getAllCoursesApi({ myCourses: 'true' });
      setCourses(res.data.courses || []);
      setError(null);
    } catch (err) {
      setError('Could not load course statistics.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherStats();
  }, []);

  if (loading) return <Loader message="Fetching course statistics..." />;
  if (error) return <ErrorFallback retryAction={fetchTeacherStats} message={error} />;

  // Calculate totals
  const totalCourses = courses.length;
  const totalLessons = courses.reduce((acc, c) => acc + (c.lessons?.length || 0), 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Teacher Workspace</h2>
          <p className="text-sm text-slate-500">Plan lessons, manage courses, and log student attendance</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/attendance"
            className="inline-flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition duration-150 shadow-xs"
          >
            <FiCalendar size={16} />
            <span>Attendance Portal</span>
          </Link>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Card 1: My Courses */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl flex items-center space-x-4 shadow-sm shadow-slate-100/50">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <FiBookOpen size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Courses Instructed</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{totalCourses}</h3>
          </div>
        </div>

        {/* Card 2: Total Lessons */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl flex items-center space-x-4 shadow-sm shadow-slate-100/50">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FiList size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Lessons Configured</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{totalLessons}</h3>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm shadow-slate-100/50">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800">My Curriculum Registry</h3>
          <Link to="/courses" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition">
            Manage Courses
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {courses.length === 0 ? (
            <p className="text-center py-10 text-sm text-slate-400">You have not created any courses yet.</p>
          ) : (
            courses.map((course) => (
              <div key={course._id} className="px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 transition">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl overflow-hidden flex items-center justify-center text-indigo-600 font-bold shrink-0">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      course.title[0]
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{course.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{course.category || 'No category'} • {course.lessons?.length || 0} Lessons</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg uppercase ${
                    course.status === 'Published' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {course.status}
                  </span>
                  <Link
                    to={`/courses/${course._id}`}
                    className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-white border border-indigo-200 hover:bg-indigo-600 rounded-lg transition duration-150 cursor-pointer"
                  >
                    View Lessons
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
