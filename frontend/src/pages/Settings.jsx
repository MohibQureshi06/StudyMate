import React, { useState, useEffect } from 'react';
import { Download, Upload, Trash2, Save, Loader } from 'lucide-react';
import { settingsAPI } from '../api';

export default function Settings({ profile, onShowToast, onThemeChange }) {
  const [midtermDate, setMidtermDate] = useState('2026-11-02');
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [profile.id]);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.get(profile.id);
      setMidtermDate(response.data.midterm_date);
      setTheme(response.data.theme || 'light');
    } catch (error) {
      onShowToast('Failed to load settings', 'error');
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      await settingsAPI.update(profile.id, {
        midterm_date: midtermDate,
        theme: theme
      });
      onThemeChange(theme);
      onShowToast('Settings saved', 'success');
    } catch (error) {
      onShowToast('Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      const response = await settingsAPI.export(profile.id);
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `studymate-backup-${profile.name}-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      onShowToast('Data exported successfully', 'success');
    } catch (error) {
      onShowToast('Failed to export data', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImportLoading(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const exportData = JSON.parse(e.target.result);
          await settingsAPI.import(profile.id, exportData);
          await loadSettings();
          onShowToast('Data imported successfully', 'success');
        } catch (error) {
          onShowToast('Invalid backup file', 'error');
        } finally {
          setImportLoading(false);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      onShowToast('Failed to import data', 'error');
      setImportLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">⚙️ Settings</h1>

        {/* Exam Date Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">📅 Exam Date</h2>
          <p className="text-slate-600 mb-4">Set the date when your midterm exams begin.</p>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">Midterm Start Date</label>
              <input
                type="date"
                value={midtermDate}
                onChange={(e) => setMidtermDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSaveSettings}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={20} /> Save
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-slate-500 mt-3">
            Current exam date: {new Date(midtermDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Theme Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">🎨 Theme</h2>
          <div className="space-y-3">
            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer" style={{ borderColor: theme === 'light' ? '#3b82f6' : '#e2e8f0' }}>
              <input
                type="radio"
                value="light"
                checked={theme === 'light'}
                onChange={(e) => setTheme(e.target.value)}
                className="mr-3"
              />
              <span className="font-medium text-slate-900">Light Theme</span>
            </label>
            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer" style={{ borderColor: theme === 'dark' ? '#3b82f6' : '#e2e8f0' }}>
              <input
                type="radio"
                value="dark"
                checked={theme === 'dark'}
                onChange={(e) => setTheme(e.target.value)}
                className="mr-3"
              />
              <span className="font-medium text-slate-900">Dark Theme</span>
            </label>
          </div>
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={20} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save size={20} /> Save Theme
              </>
            )}
          </button>
        </div>

        {/* Backup & Restore */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">💾 Backup & Restore</h2>
          <p className="text-slate-600 mb-6">Export your profile data to a JSON file for backup. You can import it back later to restore all your study materials.</p>
          
          <div className="space-y-4">
            {/* Export */}
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 mb-3">📥 Export Data</h3>
              <p className="text-sm text-slate-600 mb-4">Download all your profile data including courses, notes, tasks, and settings.</p>
              <button
                onClick={handleExport}
                disabled={exportLoading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {exportLoading ? (
                  <>
                    <Loader size={20} className="animate-spin" /> Exporting...
                  </>
                ) : (
                  <>
                    <Download size={20} /> Export Data
                  </>
                )}
              </button>
            </div>

            {/* Import */}
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 mb-3">📤 Import Data</h3>
              <p className="text-sm text-slate-600 mb-4">Restore your data from a previously exported backup file.</p>
              <label className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer">
                {importLoading ? (
                  <>
                    <Loader size={20} className="animate-spin" /> Importing...
                  </>
                ) : (
                  <>
                    <Upload size={20} /> Import Data
                  </>
                )}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={importLoading}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-4">⚠️ Danger Zone</h2>
          <p className="text-red-700 mb-6">These actions are permanent and cannot be undone.</p>
          
          {confirmReset ? (
            <div className="bg-white p-4 rounded-lg mb-4 border-l-4 border-red-600">
              <p className="text-slate-900 font-medium mb-3">Are you sure? This will delete all study data for this profile.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setConfirmReset(false);
                    onShowToast('Profile reset disabled - not implemented', 'warning');
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={20} /> Reset All Study Data
            </button>
          )}
        </div>

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
          <h3 className="font-medium text-blue-900 mb-2">ℹ️ Important Information</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• All your data is stored locally in the SQLite database</li>
            <li>• Regular backups are recommended</li>
            <li>• Exported backup files can be shared securely</li>
            <li>• Your data never leaves your local computer</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
