import React, { useEffect, useState } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import { 
  getCourseByIdApi, 
  addLessonApi, 
  deleteLessonApi, 
  markLessonCompleteApi, 
  getCourseProgressApi 
} from '../services/apiCollection';
import useAuth from '../hooks/useAuth';
import { FiPlus, FiTrash2, FiPlay, FiCheck, FiArrowLeft, FiClock, FiVideo } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';
import ErrorFallback from '../components/common/ErrorFallback';
import VideoPlayer from '../components/common/VideoPlayer';

const CourseDetails = () => {
  const { id: courseId } = useParams();
  const { setPageTitle } = useOutletContext();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [progress, setProgress] = useState({ completedLessons: [], percentage: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    setPageTitle('Curriculum Classroom');
  }, [setPageTitle]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      // Fetch course details
      const courseRes = await getCourseByIdApi(courseId);
      const fetchedCourse = courseRes.data.course;
      setCourse(fetchedCourse);

      if (fetchedCourse.lessons && fetchedCourse.lessons.length > 0) {
        setActiveLesson((prev) => {
          if (!prev) return fetchedCourse.lessons[0];
          const found = fetchedCourse.lessons.find((l) => l._id === prev._id);
          return found || fetchedCourse.lessons[0];
        });
      } else {
        setActiveLesson(null);
      }

      // Fetch progress if student is logged in
      if (user.role === 'Student') {
        const progressRes = await getCourseProgressApi(courseId);
        setProgress(progressRes.data);
      }
      setError(null);
    } catch (err) {
      setError('Could not retrieve course contents.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const handleToggleLessonComplete = async (lessonId) => {
    try {
      const res = await markLessonCompleteApi(courseId, lessonId);
      setProgress({
        completedLessons: res.data.completedLessons,
        percentage: res.data.percentage,
      });
      toast.success(res.data.completedLessons.includes(lessonId) ? 'Lesson marked complete!' : 'Lesson status reset.');
    } catch (err) {
      toast.error('Failed to update progress.');
      console.error(err);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (window.confirm('Delete this lesson from the curriculum?')) {
      try {
        await deleteLessonApi(courseId, lessonId);
        toast.success('Lesson deleted.');
        loadCourseData();
      } catch (err) {
        toast.error('Failed to delete lesson.');
        console.error(err);
      }
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await addLessonApi(courseId, data);
      toast.success('Lesson added to course!');
      setShowModal(false);
      reset();
      loadCourseData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add lesson';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader message="Setting up your classroom..." />;
  if (error) return <ErrorFallback retryAction={loadCourseData} message={error} />;

  const lessons = course?.lessons || [];
  const isInstructor = user.role !== 'Student';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Back link */}
      <div>
        <Link to="/courses" className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition">
          <FiArrowLeft size={16} />
          <span>Curriculum Directory</span>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start shadow-xs">
        <div className="w-full md:w-64 aspect-video md:aspect-square bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center text-slate-350">
          {course.thumbnail ? (
            <img src={`${import.meta.env.VITE_API_BASE_URL || ''}${course.thumbnail}`} alt="" className="w-full h-full object-cover" />
          ) : (
            <FiBookOpen size={64} />
          )}
        </div>
        
        <div className="flex-1 space-y-4">
          <div>
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase bg-indigo-50 border border-indigo-150 text-indigo-700 rounded-md tracking-wider">
              {course.category || 'Curriculum'}
            </span>
            <h2 className="text-2xl font-bold text-slate-800 mt-2">{course.title}</h2>
            <p className="text-xs text-slate-400 mt-1">Instructor: {course.instructor?.name || 'Assigned faculty'}</p>
          </div>
          
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">{course.description || 'No description provided.'}</p>
          
          {/* Progress bar for students */}
          {user.role === 'Student' && (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 max-w-sm">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1.5">
                <span>Learning Progress</span>
                <span>{progress.percentage}% Done</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full transition-all duration-350" style={{ width: `${progress.percentage}%` }}></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                Completed {progress.completedLessons?.length || 0} of {lessons.length} total lessons
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Classroom Workspace: Video Player & Syllabus Playlist Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Video Player & Current Lesson info */}
        <div className="lg:col-span-2 space-y-6">
          <VideoPlayer videoUrl={activeLesson?.videoUrl} title={activeLesson?.title} />
          
          {activeLesson ? (
            <div className="bg-white border border-slate-100 p-6 rounded-3xl space-y-4 shadow-sm shadow-slate-100/50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Lesson {activeLesson.order || 0}
                  </span>
                  <h3 className="text-lg font-bold text-slate-800 mt-0.5">{activeLesson.title}</h3>
                  <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1 font-medium">
                    <span className="flex items-center space-x-1">
                      <FiClock size={12} />
                      <span>{activeLesson.duration || 0} minutes</span>
                    </span>
                  </div>
                </div>
                
                {/* Completed status check button for Student */}
                {user.role === 'Student' && (
                  <button
                    onClick={() => handleToggleLessonComplete(activeLesson._id)}
                    className={`inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer shadow-sm ${
                      progress.completedLessons?.includes(activeLesson._id)
                        ? 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-500 hover:text-indigo-650'
                    }`}
                  >
                    <FiCheck size={14} />
                    <span>
                      {progress.completedLessons?.includes(activeLesson._id)
                        ? 'Completed!'
                        : 'Mark Complete'}
                    </span>
                  </button>
                )}
              </div>
              
              <p className="text-sm text-slate-650 leading-relaxed pt-2 border-t border-slate-50">
                {activeLesson.description || 'No detailed instructions provided for this module.'}
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-100 p-6 rounded-3xl text-center text-slate-450 font-medium shadow-sm shadow-slate-100/50">
              Select a module from the syllabus to start learning.
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Syllabus Playlist Checklist */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm shadow-slate-100/50 flex flex-col h-fit">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Syllabus Playlist</h3>
                <p className="text-xs text-slate-450 mt-0.5">{lessons.length} lectures listed</p>
              </div>
              {isInstructor && (
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition duration-150 shadow-sm cursor-pointer"
                >
                  <FiPlus size={14} />
                  <span>Add</span>
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
              {lessons.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400 font-medium">
                  No modules have been configured yet.
                </div>
              ) : (
                lessons.map((lesson) => {
                  const isCompleted = progress.completedLessons?.includes(lesson._id);
                  const isActive = activeLesson?._id === lesson._id;
                  return (
                    <div
                      key={lesson._id}
                      onClick={() => setActiveLesson(lesson)}
                      className={`px-5 py-4 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition duration-150 ${
                        isActive ? 'bg-indigo-50/40 border-l-4 border-indigo-600' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        {/* Play/Complete Indicators */}
                        {user.role === 'Student' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Stop click setting active lesson!
                              handleToggleLessonComplete(lesson._id);
                            }}
                            className={`w-4.5 h-4.5 rounded flex items-center justify-center shrink-0 border transition-all duration-150 cursor-pointer mt-0.5 ${
                              isCompleted
                                ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm'
                                : 'border-slate-300 hover:border-indigo-400'
                            }`}
                          >
                            {isCompleted && <FiCheck size={10} />}
                          </button>
                        ) : (
                          <div className={`w-4.5 h-4.5 rounded-full border text-slate-550 flex items-center justify-center shrink-0 mt-0.5 text-[8px] ${
                            isActive ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-slate-50 border-slate-200'
                          }`}>
                            <FiPlay size={8} />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-xs font-semibold leading-tight truncate ${
                            isActive ? 'text-indigo-600 font-bold' : 'text-slate-700'
                          }`}>
                            {lesson.order}. {lesson.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 mt-1 block font-medium">{lesson.duration || 0} mins</span>
                        </div>
                      </div>

                      {isInstructor && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLesson(lesson._id);
                          }}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition cursor-pointer"
                          title="Delete Lesson"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Lesson Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-100 w-full max-w-md rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Add Lesson Content</h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Lesson Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Newton's First Law"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm focus:outline-none"
                  {...register('title', { required: 'Lesson title is required' })}
                />
                {errors.title && <span className="text-xs text-red-500 block mt-1">{errors.title.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Video URL (YouTube / Loom)
                </label>
                <input
                  type="url"
                  placeholder="e.g. https://www.youtube.com/watch?..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm focus:outline-none"
                  {...register('videoUrl')}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  placeholder="15"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm focus:outline-none"
                  {...register('duration', { valueAsNumber: true })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Sequence / Order
                </label>
                <input
                  type="number"
                  placeholder="1"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm focus:outline-none"
                  {...register('order', { valueAsNumber: true })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Lesson Summary
                </label>
                <textarea
                  placeholder="Provide details about the lesson scope..."
                  rows="3"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm focus:outline-none resize-none"
                  {...register('description')}
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
                  {saving ? 'Adding...' : 'Add Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
