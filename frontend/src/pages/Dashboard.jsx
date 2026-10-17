import React, { useState, useEffect } from 'react';
import { Calendar, BookOpen, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { courseAPI, settingsAPI, taskAPI } from '../api';

export default function Dashboard({ profile, onSelectCourse, onShowToast }) {
  const [courses, setCourses] = useState([]);
  const [settings, setSettings] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, [profile.id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch courses
      const coursesResponse = await courseAPI.getSelected(profile.id);
      setCourses(coursesResponse.data);

      // Fetch settings for exam date
      const settingsResponse = await settingsAPI.get(profile.id);
      setSettings(settingsResponse.data);

      // Calculate days remaining
      const examDate = new Date(settingsResponse.data.midterm_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const days = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
      setDaysRemaining(days);

      // Fetch today's tasks
      const tasksResponse = await taskAPI.getToday(profile.id);
      setTodayTasks(tasksResponse.data);
    } catch (error) {
      onShowToast('Failed to load dashboard', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallPreparation = () => {
    if (courses.length === 0) return 0;
    const sum = courses.reduce((acc, c) => acc + c.preparation_percentage, 0);
    return Math.round(sum / courses.length);
  };

  const getTotalPendingLectures = () => {
    return courses.reduce((acc, c) => acc + c.pending_lectures, 0);
  };

  const getTotalLectures = () => {
    return courses.reduce((acc, c) => acc + c.total_lectures, 0);
  };

  const getCountdownColor = () => {
    if (daysRemaining < 0) return 'text-red-600';
    if (daysRemaining < 7) return 'text-orange-600';
    return 'text-green-600';
  };

  const getCountdownMessage = () => {
    if (daysRemaining < 0) return `Exam started ${Math.abs(daysRemaining)} days ago`;
    if (daysRemaining === 0) return 'Exam is today!';
    if (daysRemaining === 1) return 'Exam tomorrow!';
    return `${daysRemaining} days until exams`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin-slow text-4xl mb-4">📚</div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Welcome back, {profile.name}! 👋
          </h1>
          <p className="text-slate-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Countdown Banner */}
        <div className={`bg-gradient-to-r ${daysRemaining >= 7 ? 'from-green-50 to-emerald-50 border-green-200' : daysRemaining >= 0 ? 'from-orange-50 to-amber-50 border-orange-200' : 'from-red-50 to-pink-50 border-red-200'} border-l-4 rounded-xl p-6 mb-8 shadow-lg`}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-slate-600 font-medium">Midterm Exams Countdown</p>
              <p className={`text-3xl md:text-4xl font-bold ${getCountdownColor()}`}>
                {Math.abs(daysRemaining)} days
              </p>
            </div>
            <Calendar className={`${getCountdownColor()}`} size={48} />
          </div>
          <p className="text-slate-600">
            Exam Date: {new Date(settings?.midterm_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <p className={`text-sm font-medium mt-2 ${getCountdownColor()}`}>
            {getCountdownMessage()}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Total Courses</p>
                <p className="text-3xl font-bold text-slate-900">{courses.length}</p>
              </div>
              <BookOpen size={40} className="text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Overall Prep</p>
                <p className="text-3xl font-bold text-slate-900">{calculateOverallPreparation()}%</p>
              </div>
              <TrendingUp size={40} className="text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Total Lectures</p>
                <p className="text-3xl font-bold text-slate-900">{getTotalLectures()}</p>
              </div>
              <CheckCircle size={40} className="text-orange-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Pending</p>
                <p className="text-3xl font-bold text-slate-900">{getTotalPendingLectures()}</p>
              </div>
              <Clock size={40} className="text-purple-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">📅 Today's Tasks</h2>
              {todayTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle size={48} className="mx-auto text-green-300 mb-4" />
                  <p className="text-slate-500">No tasks for today. Great! 🎉</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayTasks.map(task => (
                    <div key={task.id} className={`p-4 rounded-lg border-l-4 ${
                      task.is_completed ? 'bg-green-50 border-green-500' : 'bg-blue-50 border-blue-500'
                    }`}>
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={task.is_completed}
                          readOnly
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h4 className={`font-medium ${task.is_completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-slate-600">{task.description}</p>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Course Priority */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">⚠️ Priority Courses</h2>
            {courses.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 text-sm">No courses selected yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {courses
                  .sort((a, b) => a.preparation_percentage - b.preparation_percentage)
                  .slice(0, 5)
                  .map(course => (
                    <div key={course.id} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-slate-900 truncate">{course.abbreviation}</h4>
                        <span className="text-sm font-bold text-slate-700">{course.preparation_percentage}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${course.preparation_percentage}%` }}></div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">📚 Your Courses</h2>
          {courses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 text-lg">No courses selected yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map(course => (
                <div
                  key={course.id}
                  onClick={() => onSelectCourse(course)}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer overflow-hidden border-t-4"
                  style={{ borderTopColor: course.color_accent }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{course.name}</h3>
                        <p className="text-sm text-slate-500">{course.abbreviation}</p>
                      </div>
                      <div className="text-2xl opacity-50">📖</div>
                    </div>

                    {/* Lecture progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-slate-600">Lectures</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {course.completed_lectures}/{course.total_lectures}
                        </p>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: course.total_lectures > 0
                              ? `${(course.completed_lectures / course.total_lectures) * 100}%`
                              : '0%'
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {course.pending_lectures} pending
                      </p>
                    </div>

                    {/* Preparation percentage */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-slate-600">Exam Prep</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {course.preparation_percentage}%
                        </p>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${course.preparation_percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Last updated */}
                    <p className="text-xs text-slate-400">
                      Updated {new Date(course.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
