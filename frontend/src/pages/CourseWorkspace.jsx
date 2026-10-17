import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Save, Trash2, BookOpen, Star, FileText, CheckSquare } from 'lucide-react';
import { courseAPI, lectureAPI, topicAPI, noteAPI, taskAPI } from '../api';

export default function CourseWorkspace({ profile, course, onShowToast }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [courseData, setCourseData] = useState(course);
  const [lectures, setLectures] = useState([]);
  const [syllabus, setSyllabus] = useState('');
  const [syllabusTopics, setSyllabusTopics] = useState([]);
  const [importantTopics, setImportantTopics] = useState([]);
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [editingSyllabusMode, setEditingSyllabusMode] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [newImportantTopic, setNewImportantTopic] = useState({ title: '', reason: '', priority: 'high' });
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: [] });
  const [newTask, setNewTask] = useState({ title: '', description: '', due_date: '', priority: 'medium' });
  const [totalLectures, setTotalLectures] = useState(course.total_lectures);
  const [completedLectures, setCompletedLectures] = useState(course.completed_lectures);
  const [prepPercentage, setPrepPercentage] = useState(course.preparation_percentage);

  useEffect(() => {
    loadAllData();
  }, [course.id]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [lecturesRes, syllabusRes, topicsRes, importantRes, notesRes, tasksRes] = await Promise.all([
        lectureAPI.getAll(course.id),
        topicAPI.getSyllabus(course.id),
        topicAPI.getTopics(course.id),
        topicAPI.getImportant(course.id),
        noteAPI.getAll(course.id),
        taskAPI.getForCourse(course.id)
      ]);

      setLectures(lecturesRes.data);
      setSyllabus(syllabusRes.data?.content || '');
      setSyllabusTopics(topicsRes.data);
      setImportantTopics(importantRes.data);
      setNotes(notesRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      onShowToast('Failed to load course data', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLectures = async () => {
    try {
      const updated = await courseAPI.update(course.id, {
        total_lectures: totalLectures,
        completed_lectures: completedLectures,
        preparation_percentage: prepPercentage
      });
      setCourseData(updated.data);
      setTotalLectures(updated.data.total_lectures);
      setCompletedLectures(updated.data.completed_lectures);
      setPrepPercentage(updated.data.preparation_percentage);
      onShowToast('Lectures updated', 'success');
    } catch (error) {
      onShowToast(error.response?.data?.error || 'Failed to update', 'error');
    }
  };

  const handleSaveSyllabus = async () => {
    try {
      await topicAPI.updateSyllabus(course.id, syllabus);
      setEditingSyllabusMode(false);
      onShowToast('Syllabus saved', 'success');
    } catch (error) {
      onShowToast('Failed to save syllabus', 'error');
    }
  };

  const handleAddTopic = async () => {
    if (!newTopic.trim()) {
      onShowToast('Topic title required', 'warning');
      return;
    }
    try {
      await topicAPI.createTopic(course.id, { title: newTopic.trim() });
      setNewTopic('');
      await loadAllData();
      onShowToast('Topic added', 'success');
    } catch (error) {
      onShowToast('Failed to add topic', 'error');
    }
  };

  const handleToggleTopicCompletion = async (topicId, isCompleted) => {
    try {
      await topicAPI.updateTopic(topicId, { is_completed: !isCompleted });
      await loadAllData();
    } catch (error) {
      onShowToast('Failed to update topic', 'error');
    }
  };

  const handleDeleteTopic = async (topicId) => {
    try {
      await topicAPI.deleteTopic(topicId);
      await loadAllData();
      onShowToast('Topic deleted', 'success');
    } catch (error) {
      onShowToast('Failed to delete topic', 'error');
    }
  };

  const handleAddImportantTopic = async () => {
    if (!newImportantTopic.title.trim()) {
      onShowToast('Topic title required', 'warning');
      return;
    }
    try {
      await topicAPI.createImportant(course.id, newImportantTopic);
      setNewImportantTopic({ title: '', reason: '', priority: 'high' });
      await loadAllData();
      onShowToast('Important topic added', 'success');
    } catch (error) {
      onShowToast('Failed to add topic', 'error');
    }
  };

  const handleDeleteImportantTopic = async (topicId) => {
    try {
      await topicAPI.deleteImportant(topicId);
      await loadAllData();
      onShowToast('Topic deleted', 'success');
    } catch (error) {
      onShowToast('Failed to delete topic', 'error');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.title.trim()) {
      onShowToast('Note title required', 'warning');
      return;
    }
    try {
      await noteAPI.create({
        profile_course_id: course.id,
        ...newNote
      });
      setNewNote({ title: '', content: '', tags: [] });
      await loadAllData();
      onShowToast('Note created', 'success');
    } catch (error) {
      onShowToast('Failed to create note', 'error');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await noteAPI.delete(noteId);
      await loadAllData();
      onShowToast('Note deleted', 'success');
    } catch (error) {
      onShowToast('Failed to delete note', 'error');
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      onShowToast('Task title required', 'warning');
      return;
    }
    try {
      await taskAPI.create({
        profile_id: profile.id,
        profile_course_id: course.id,
        ...newTask
      });
      setNewTask({ title: '', description: '', due_date: '', priority: 'medium' });
      await loadAllData();
      onShowToast('Task created', 'success');
    } catch (error) {
      onShowToast('Failed to create task', 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskAPI.delete(taskId);
      await loadAllData();
      onShowToast('Task deleted', 'success');
    } catch (error) {
      onShowToast('Failed to delete task', 'error');
    }
  };

  const handleToggleTaskCompletion = async (taskId, isCompleted) => {
    try {
      await taskAPI.update(taskId, { is_completed: !isCompleted });
      await loadAllData();
    } catch (error) {
      onShowToast('Failed to update task', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft size={20} /> Back to Dashboard
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{course.name}</h1>
          <p className="text-slate-600">{course.abbreviation}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-slate-600">Lectures</p>
            <p className="text-2xl font-bold text-slate-900">{completedLectures}/{totalLectures}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-slate-600">Preparation</p>
            <p className="text-2xl font-bold text-slate-900">{prepPercentage}%</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-slate-600">Important Topics</p>
            <p className="text-2xl font-bold text-slate-900">{importantTopics.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow mb-8">
          <div className="flex flex-wrap border-b border-slate-200">
            {['overview', 'outline', 'topics', 'notes', 'tasks'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium transition-colors text-sm md:text-base ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'overview' && '📊 Overview'}
                {tab === 'outline' && '📄 Course Outline'}
                {tab === 'topics' && '⭐ Important Topics'}
                {tab === 'notes' && '📝 Notes'}
                {tab === 'tasks' && '✓ Tasks'}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Update Lecture Progress</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Total Lectures</label>
                      <input
                        type="number"
                        value={totalLectures}
                        onChange={(e) => setTotalLectures(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Completed</label>
                      <input
                        type="number"
                        value={completedLectures}
                        onChange={(e) => setCompletedLectures(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleUpdateLectures}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                </div>

                <hr className="border-slate-200" />

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Exam Preparation</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Preparation Level: {prepPercentage}%
                    </label>
                    <input
                      type="range"
                      value={prepPercentage}
                      onChange={(e) => setPrepPercentage(parseInt(e.target.value))}
                      min="0"
                      max="100"
                      className="w-full"
                    />
                  </div>
                  <button
                    onClick={handleUpdateLectures}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Update Preparation
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'outline' && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">📚 Course Outline / Syllabus</h3>
                {editingSyllabusMode ? (
                  <div>
                    <textarea
                      value={syllabus}
                      onChange={(e) => setSyllabus(e.target.value)}
                      placeholder="Paste or enter your course syllabus here..."
                      className="w-full h-64 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={handleSaveSyllabus}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <Save size={18} /> Save
                      </button>
                      <button
                        onClick={() => setEditingSyllabusMode(false)}
                        className="bg-slate-300 hover:bg-slate-400 text-slate-900 px-4 py-2 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {syllabus ? (
                      <div className="bg-slate-50 p-4 rounded-lg mb-4 max-h-96 overflow-y-auto whitespace-pre-wrap font-mono text-sm text-slate-700">
                        {syllabus}
                      </div>
                    ) : (
                      <div className="bg-slate-100 p-8 rounded-lg text-center text-slate-500 mb-4">
                        No syllabus added yet
                      </div>
                    )}
                    <button
                      onClick={() => setEditingSyllabusMode(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Edit Syllabus
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'topics' && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">⭐ Important Topics</h3>
                
                <div className="bg-slate-50 p-4 rounded-lg mb-6">
                  <input
                    type="text"
                    value={newImportantTopic.title}
                    onChange={(e) => setNewImportantTopic({ ...newImportantTopic, title: e.target.value })}
                    placeholder="Topic title..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    value={newImportantTopic.reason}
                    onChange={(e) => setNewImportantTopic({ ...newImportantTopic, reason: e.target.value })}
                    placeholder="Why is this topic important?..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-3 h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <select
                      value={newImportantTopic.priority}
                      onChange={(e) => setNewImportantTopic({ ...newImportantTopic, priority: e.target.value })}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                    <button
                      onClick={handleAddImportantTopic}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Plus size={18} /> Add
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {importantTopics.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No important topics yet</p>
                  ) : (
                    importantTopics.map(topic => (
                      <div key={topic.id} className="bg-slate-50 p-4 rounded-lg border-l-4 border-yellow-500">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-slate-900">{topic.title}</h4>
                          <button
                            onClick={() => handleDeleteImportantTopic(topic.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        {topic.reason && (
                          <p className="text-sm text-slate-600 mb-2">{topic.reason}</p>
                        )}
                        <p className="text-xs text-slate-500">Priority: {topic.priority}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">📝 Notes</h3>
                
                <div className="bg-slate-50 p-4 rounded-lg mb-6">
                  <input
                    type="text"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    placeholder="Note title..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    placeholder="Note content..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-3 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddNote}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Plus size={18} /> Add Note
                  </button>
                </div>

                <div className="space-y-3">
                  {notes.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No notes yet</p>
                  ) : (
                    notes.map(note => (
                      <div key={note.id} className="bg-white border border-slate-200 p-4 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-slate-900">{note.title}</h4>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        {note.content && (
                          <p className="text-sm text-slate-700 mb-2">{note.content}</p>
                        )}
                        {note.tags && note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {note.tags.map((tag, i) => (
                              <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">✓ Tasks</h3>
                
                <div className="bg-slate-50 p-4 rounded-lg mb-6">
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Task title..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <input
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                    <button
                      onClick={handleAddTask}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <Plus size={18} /> Add Task
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {tasks.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No tasks yet</p>
                  ) : (
                    tasks.map(task => (
                      <div key={task.id} className={`p-4 rounded-lg border-l-4 ${task.is_completed ? 'bg-green-50 border-green-500' : 'bg-blue-50 border-blue-500'}`}>
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={task.is_completed}
                            onChange={() => handleToggleTaskCompletion(task.id, task.is_completed)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <h4 className={`font-medium ${task.is_completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                              {task.title}
                            </h4>
                          </div>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
