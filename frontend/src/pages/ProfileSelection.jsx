import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, User } from 'lucide-react';
import { profileAPI } from '../api';

export default function ProfileSelection({ onSelectProfile }) {
  const [profiles, setProfiles] = useState([]);
  const [newProfileName, setNewProfileName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getAll();
      setProfiles(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load profiles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    if (!newProfileName.trim()) {
      setError('Profile name cannot be empty');
      return;
    }

    if (profiles.length >= 5) {
      setError('Maximum 5 profiles allowed');
      return;
    }

    try {
      const response = await profileAPI.create(newProfileName.trim());
      setProfiles([...profiles, response.data]);
      setNewProfileName('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create profile');
    }
  };

  const handleRenameProfile = async (profileId) => {
    if (!editName.trim()) return;

    try {
      const response = await profileAPI.update(profileId, editName.trim());
      setProfiles(profiles.map(p => p.id === profileId ? response.data : p));
      setEditingId(null);
      setEditName('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to rename profile');
    }
  };

  const handleDeleteProfile = async (profileId) => {
    try {
      await profileAPI.delete(profileId);
      setProfiles(profiles.filter(p => p.id !== profileId));
      setConfirmDeleteId(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin-slow text-4xl mb-4">📚</div>
          <p className="text-slate-600">Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">📚 StudyMate</h1>
          <p className="text-xl text-slate-600">Personal Exam Preparation Manager</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Create new profile section */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            {profiles.length >= 5 ? '✓ Maximum profiles created' : 'Create a New Profile'}
          </h2>
          
          <form onSubmit={handleCreateProfile} className={profiles.length >= 5 ? 'opacity-50 pointer-events-none' : ''}>
            <div className="flex gap-3">
              <input
                type="text"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="Enter your name..."
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={profiles.length >= 5}
              />
              <button
                type="submit"
                disabled={profiles.length >= 5}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={20} /> Create
              </button>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              {profiles.length}/5 profiles created
            </p>
          </form>
        </div>

        {/* Profiles grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profiles.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <User size={48} className="text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No profiles yet. Create one to get started!</p>
            </div>
          ) : (
            profiles.map(profile => (
              <div
                key={profile.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
              >
                {/* Profile edit mode */}
                {editingId === profile.id ? (
                  <div className="p-6">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRenameProfile(profile.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 px-4 py-2 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Profile display mode */}
                    <div
                      onClick={() => onSelectProfile(profile)}
                      className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xl">
                          👤
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">{profile.name}</h3>
                      <p className="text-sm text-slate-500">
                        Created {new Date(profile.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="border-t border-slate-200 p-4 flex gap-2 bg-slate-50">
                      <button
                        onClick={() => {
                          setEditingId(profile.id);
                          setEditName(profile.name);
                        }}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit2 size={18} /> Rename
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(profile.id)}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 size={18} /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Delete confirmation dialog */}
        {confirmDeleteId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Delete Profile?</h3>
              <p className="text-slate-600 mb-6">
                This will delete the profile and all associated data. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDeleteProfile(confirmDeleteId);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
