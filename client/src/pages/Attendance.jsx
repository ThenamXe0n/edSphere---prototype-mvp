import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getAllCoursesApi, getAllStudentsApi, recordAttendanceApi, getStudentAttendanceApi } from '../services/apiCollection';
import useAuth from '../hooks/useAuth';
import { FiCheckSquare, FiCalendar, FiBookOpen, FiUser, FiInfo, FiActivity } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';
import ErrorFallback from '../components/common/ErrorFallback';

const Attendance = () => {
  const { setPageTitle } = useOutletContext();
  const { user } = useAuth();
  
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  
  // Student view states
  const [studentLogs, setStudentLogs] = useState([]);
  const [studentStats, setStudentStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setPageTitle(user.role === 'Student' ? 'My Attendance' : 'Attendance Portal');
  }, [setPageTitle, user.role]);

  const loadBaseData = async () => {
    try {
      setLoading(true);
      if (user.role === 'Student') {
        // Load student logs (using 'me' placeholder)
        const res = await getStudentAttendanceApi('me');
        setStudentLogs(res.data.logs || []);
        setStudentStats(res.data.stats || null);
      } else {
        // Load courses list for selecting
        const res = await getAllCoursesApi();
        setCourses(res.data.courses || []);
        if (res.data.courses?.length > 0) {
          setSelectedCourse(res.data.courses[0]._id);
        }
      }
      setError(null);
    } catch (err) {
      setError('Could not load attendance registry.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBaseData();
  }, [user.role]);

  // When teacher selects course and clicks load students
  const handleLoadStudentsForAttendance = async () => {
    if (!selectedCourse) {
      toast.error('Please select a course first.');
      return;
    }

    try {
      setLoading(true);
      const res = await getAllStudentsApi({ limit: 100 });
      const studentList = res.data.students || [];

      // Map students to status tracker
      // Defaulting status to 'Present' makes taking attendance fast!
      const mapped = studentList.map((stud) => ({
        studentId: stud._id,
        firstName: stud.firstName,
        lastName: stud.lastName,
        admissionNumber: stud.admissionNumber,
        status: 'Present', 
      }));

      setStudents(mapped);
      toast.success(`${studentList.length} student records loaded.`);
    } catch (err) {
      toast.error('Failed to load students.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, newStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status: newStatus } : s))
    );
  };

  const handleSubmitAttendance = async () => {
    if (students.length === 0) return;
    
    setSubmitting(true);
    try {
      const records = students.map((s) => ({
        studentId: s.studentId,
        status: s.status,
      }));

      await recordAttendanceApi({
        courseId: selectedCourse,
        date: attendanceDate,
        records,
      });

      toast.success('Attendance records logged successfully!');
      setStudents([]); // Clear sheet after saving
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit attendance';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && courses.length === 0 && studentLogs.length === 0) {
    return <Loader message="Accessing registry..." />;
  }

  if (error) return <ErrorFallback retryAction={loadBaseData} message={error} />;

  // RENDER STUDENT VIEW
  if (user.role === 'Student') {
    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-100 p-6 rounded-2xl flex items-center space-x-4 shadow-sm shadow-slate-100/50">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <FiCheckSquare size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attendance Rate</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{studentStats?.attendancePercentage || 0}%</h3>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-6 rounded-2xl flex items-center space-x-4 shadow-sm shadow-slate-100/50">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <FiActivity size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lectures Present</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{studentStats?.present || 0}</h3>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-6 rounded-2xl flex items-center space-x-4 shadow-sm shadow-slate-100/50">
            <div className="p-3 bg-red-50 text-red-650 rounded-xl">
              <FiInfo size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lectures Absent</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{studentStats?.absent || 0}</h3>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-6 rounded-2xl flex items-center space-x-4 shadow-sm shadow-slate-100/50">
            <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
              <FiCalendar size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Logs</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{studentStats?.totalClasses || 0}</h3>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm shadow-slate-100/50">
          <div className="px-6 py-5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Attendance History Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {studentLogs.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-12 text-slate-400 font-medium">
                      No attendance logs registered for your profile yet.
                    </td>
                  </tr>
                ) : (
                  studentLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {new Date(log.date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-850">{log.courseId?.title}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-wider border ${
                          log.status === 'Present'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                            : log.status === 'Absent'
                            ? 'bg-red-50 text-red-700 border-red-255'
                            : 'bg-amber-50 text-amber-700 border-amber-250'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // RENDER TEACHER / ADMIN VIEW
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Selector Header */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row gap-6 items-stretch md:items-end">
        {/* Course Select */}
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Select Course Curriculum
          </label>
          <div className="relative">
            <select
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-50 rounded-xl text-sm focus:outline-none focus:border-slate-300"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Choose course...</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Select */}
        <div className="w-full md:w-56">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Class Date
          </label>
          <input
            type="date"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-50 rounded-xl text-sm focus:outline-none focus:border-slate-300"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleLoadStudentsForAttendance}
          className="px-5 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/10 cursor-pointer text-center"
        >
          Load Class Roll
        </button>
      </div>

      {/* Student Attendance List */}
      {students.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm shadow-slate-100/50">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Class Roll Sheet</h3>
              <p className="text-xs text-slate-400 mt-0.5">{students.length} students loaded</p>
            </div>
            <button
              onClick={handleSubmitAttendance}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition duration-150 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Submit Attendance'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Admission</th>
                  <th className="px-6 py-4 text-center">Mark Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {students.map((stud) => (
                  <tr key={stud.studentId} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {stud.firstName} {stud.lastName}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{stud.admissionNumber}</td>
                    
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center space-x-6">
                        {/* Present */}
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`status-${stud.studentId}`}
                            value="Present"
                            checked={stud.status === 'Present'}
                            onChange={() => handleStatusChange(stud.studentId, 'Present')}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                          />
                          <span className="text-sm font-semibold text-emerald-700">Present</span>
                        </label>

                        {/* Absent */}
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`status-${stud.studentId}`}
                            value="Absent"
                            checked={stud.status === 'Absent'}
                            onChange={() => handleStatusChange(stud.studentId, 'Absent')}
                            className="w-4 h-4 text-red-650 focus:ring-red-500 border-slate-300"
                          />
                          <span className="text-sm font-semibold text-red-650">Absent</span>
                        </label>

                        {/* Leave */}
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`status-${stud.studentId}`}
                            value="Leave"
                            checked={stud.status === 'Leave'}
                            onChange={() => handleStatusChange(stud.studentId, 'Leave')}
                            className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-slate-300"
                          />
                          <span className="text-sm font-semibold text-amber-600">Leave</span>
                        </label>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
