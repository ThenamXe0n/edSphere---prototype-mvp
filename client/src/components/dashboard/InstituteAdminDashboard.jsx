import React, { useEffect, useState } from 'react';
import { getAllStudentsApi, getAllCoursesApi } from '../../services/apiCollection';
import axiosInstance from '../../utils/axiosInstance';
import Loader from '../common/Loader';
import ErrorFallback from '../common/ErrorFallback';
import { FiUsers, FiBriefcase, FiBookOpen, FiActivity } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const InstituteAdminDashboard = () => {
  const [stats, setStats] = useState({ students: 0, teachers: 0, courses: 0 });
  const [recentStudents, setRecentStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch students list (to get count and recent list)
      const studentsRes = await getAllStudentsApi({ limit: 5 });
      
      // Fetch courses list
      const coursesRes = await getAllCoursesApi();
      
      // Fetch teachers list (using direct axios call to the new users/teachers endpoint)
      const teachersRes = await axiosInstance.get('/users/teachers');

      setStats({
        students: studentsRes.total || 0,
        teachers: teachersRes.data.results || 0,
        courses: coursesRes.data.courses?.length || 0,
      });

      setRecentStudents(studentsRes.data.students || []);
      setTeachers(teachersRes.data.data.teachers || []);
      setError(null);
    } catch (err) {
      setError('Could not load dashboard statistics.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <Loader message="Analyzing school database..." />;
  if (error) return <ErrorFallback retryAction={fetchDashboardData} message={error} />;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">School Administration</h2>
        <p className="text-sm text-slate-500">Manage students, faculty staff, and curriculum</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1: Students */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl flex items-center space-x-4 shadow-sm shadow-slate-100/50">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <FiUsers size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Students Enrolled</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{stats.students}</h3>
          </div>
        </div>

        {/* Card 2: Teachers */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl flex items-center space-x-4 shadow-sm shadow-slate-100/50">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FiBriefcase size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Teachers</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{stats.teachers}</h3>
          </div>
        </div>

        {/* Card 3: Courses */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl flex items-center space-x-4 shadow-sm shadow-slate-100/50">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <FiBookOpen size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Courses Listed</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{stats.courses}</h3>
          </div>
        </div>
      </div>

      {/* Double Column Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Recent Students */}
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm shadow-slate-100/50">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">Recently Enrolled Students</h3>
            <Link to="/students" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition">
              View All
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentStudents.length === 0 ? (
              <p className="text-center py-8 text-sm text-slate-400">No students registered yet.</p>
            ) : (
              recentStudents.map((stud) => (
                <div key={stud._id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold overflow-hidden">
                      {stud.profileImage ? (
                        <img src={`${import.meta.env.VITE_API_BASE_URL || ''}${stud.profileImage}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        stud.firstName[0] + stud.lastName[0]
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{stud.firstName} {stud.lastName}</p>
                      <p className="text-xs text-slate-400">Adm: {stud.admissionNumber}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-wider ${
                    stud.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {stud.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Teachers Directory */}
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm shadow-slate-100/50">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">Faculty Directory</h3>
            <span className="text-xs font-semibold text-slate-400">{teachers.length} Instructors</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-[345px] overflow-y-auto">
            {teachers.length === 0 ? (
              <p className="text-center py-8 text-sm text-slate-400">No teachers registered yet.</p>
            ) : (
              teachers.map((teach) => (
                <div key={teach._id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{teach.name}</p>
                    <p className="text-xs text-slate-400">{teach.email}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                    FACULTY
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstituteAdminDashboard;
