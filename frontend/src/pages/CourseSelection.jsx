import React, { useState, useEffect } from 'react';
import { ChevronRight, Loader } from 'lucide-react';
import { courseAPI } from '../api';

export default function CourseSelection({ profile, onComplete, onBack }) {
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getAll();
      setAllCourses(response.data);
      
      // Get already selected courses for this profile
      const selectedResponse = await courseAPI.getSelected(profile.id);
      setSelectedCourses(selectedResponse.data.map(c => c.course_id));
    } catch (err) {
      setError('Failed to load courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCourse = (courseId) => {
    if (selectedCourses.includes(courseId)) {
      setSelectedCourses(selectedCourses.filter(id => id !== courseId));
    } else {
      setSelectedCourses([...selectedCourses, courseId]);
    }
  };

  const handleContinue = async () => {
    try {
      setLoading(true);
      
      // Get current selections
      const currentSelected = await courseAPI.getSelected(profile.id);
      const currentSelectedIds = currentSelected.data.map(c => c.course_id);

      // Add new courses
      for (const courseId of selectedCourses) {
        if (!currentSelectedIds.includes(courseId)) {
          await courseAPI.add(profile.id, courseId);
        }
      }

      // Remove deselected courses
      for (const course of currentSelected.data) {
        if (!selectedCourses.includes(course.course_id)) {
          await courseAPI.remove(course.id);
        }
      }

      onComplete();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && allCourses.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin-slow text-4xl mb-4">📚</div>
          <p className="text-slate-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Select Your Courses</h1>
          <p className="text-slate-600">Hello, {profile.name}! Select the courses you're currently studying.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Course grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {allCourses.map(course => (
            <div
              key={course.id}
              onClick={() => toggleCourse(course.id)}
              className={`p-6 rounded-xl cursor-pointer transition-all ${
                selectedCourses.includes(course.id)
                  ? 'bg-blue-50 border-2 border-blue-500 shadow-lg'
                  : 'bg-white border-2 border-slate-200 hover:border-slate-300 shadow'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{course.name}</h3>
                  <p className="text-sm text-slate-500">{course.abbreviation}</p>
                </div>
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                  selectedCourses.includes(course.id)
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-slate-300'
                }`}>
                  {selectedCourses.includes(course.id) && (
                    <span className="text-white text-sm">✓</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-400">Click to select</p>
            </div>
          ))}
        </div>

        {/* Selection summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Selected Courses</p>
              <p className="text-2xl font-bold text-slate-900">{selectedCourses.length}/{allCourses.length}</p>
            </div>
            <div className="text-right text-slate-600 text-sm">
              {selectedCourses.length === 0 ? (
                <p>Select at least one course to continue</p>
              ) : (
                <p className="text-green-600 font-medium">✓ Ready to continue</p>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleContinue}
            disabled={selectedCourses.length === 0 || loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={20} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                Continue <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
