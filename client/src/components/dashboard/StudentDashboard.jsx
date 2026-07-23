import React, { useEffect, useState } from 'react';
import { getAllCoursesApi, getStudentAttendanceApi, getCourseProgressApi } from '../../services/apiCollection';
import Loader from '../common/Loader';
import ErrorFallback from '../common/ErrorFallback';
import { FiBookOpen, FiCalendar, FiAward, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({ totalClasses: 0, attendancePercentage: 0 });
  const [coursesProgress, setCoursesProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      // Fetch published courses in the institute
      const coursesRes = await getAllCoursesApi();
      const courseList = coursesRes.data.courses || [];
      setCourses(courseList);

      // Fetch attendance statistics (using 'me' as placeholder)
      try {
        const attendanceRes = await getStudentAttendanceApi('me');
        setAttendanceStats(attendanceRes.data.stats || { totalClasses: 0, attendancePercentage: 0 });
      } catch (attErr) {
        console.error('Could not load attendance stats', attErr);
      }

      // Fetch progress for each course
      const progressPromises = courseList.map(async (course) => {
        try {
          const progressRes = await getCourseProgressApi(course._id);
          return { courseId: course._id, progress: progressRes.data };
        } catch (progErr) {
          return { courseId: course._id, progress: { percentage: 0 } };
        }
      });

      const progressResults = await Promise.all(progressPromises);
      const progressMap = progressResults.reduce((acc, curr) => {
        acc[curr.courseId] = curr.progress;
        return acc;
      }, {});

      setCoursesProgress(progressMap);
      setError(null);
    } catch (err) {
      setError('Could not load student learning metrics.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  if (loading) return <Loader message="Compiling your dashboard..." />;
  if (error) return <ErrorFallback retryAction={fetchStudentData} message={error} />;

  // Calculate overall average progress
  const progressValues = Object.values(coursesProgress);
  const averageProgress =
    progressValues.length > 0
      ? Math.round(progressValues.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / progressValues.length)
      : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Student Learning Desk</h2>
        <p className="text-sm text-slate-500">Track your courses progress, completed lessons, and class attendance</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Stat 1: Overall Progress */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl flex items-center space-x-4 shadow-sm shadow-slate-100/50">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <FiAward size={22} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Learning Progress</p>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <h3 className="text-2xl font-bold text-slate-800">{averageProgress}%</h3>
            </div>
            {/* Simple progress bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${averageProgress}%` }}></div>
            </div>
          </div>
        </div>

        {/* Stat 2: Courses Enrolled */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl flex items-center space-x-4 shadow-sm shadow-slate-100/50">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <FiBookOpen size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Enrolled Courses</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{courses.length}</h3>
          </div>
        </div>

        {/* Stat 3: Attendance Ratio */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl flex items-center space-x-4 shadow-sm shadow-slate-100/50">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FiCalendar size={22} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Class Attendance Ratio</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{attendanceStats.attendancePercentage}%</h3>
            <p className="text-[10px] text-slate-400 mt-1">{attendanceStats.totalClasses} total lectures logged</p>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm shadow-slate-100/50">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800">My Curriculum Registry</h3>
          <Link to="/courses" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition">
            Browse Courses
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {courses.length === 0 ? (
            <p className="text-center py-10 text-sm text-slate-400">No courses listed in your institute yet.</p>
          ) : (
            courses.map((course) => {
              const progress = coursesProgress[course._id] || { percentage: 0, completedCount: 0, totalLessons: 0 };
              return (
                <div key={course._id} className="px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 transition">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl overflow-hidden flex items-center justify-center text-indigo-600 font-bold shrink-0">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        course.title[0]
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 truncate">{course.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">Instructor: {course.instructor?.name}</p>
                      
                      {/* Progress representation */}
                      <div className="flex items-center space-x-2 mt-2 w-full max-w-xs">
                        <div className="flex-1 bg-slate-100 h-1 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${progress.percentage}%` }}></div>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500 shrink-0">{progress.percentage}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-slate-400 shrink-0">
                      {progress.completedCount} / {progress.totalLessons} lessons done
                    </span>
                    <Link
                      to={`/courses/${course._id}`}
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-white border border-indigo-200 hover:bg-indigo-600 rounded-lg transition duration-150 cursor-pointer"
                    >
                      Study Now
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
