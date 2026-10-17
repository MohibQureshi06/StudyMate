import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import ProfileSelection from './pages/ProfileSelection';
import CourseSelection from './pages/CourseSelection';
import Dashboard from './pages/Dashboard';
import CourseWorkspace from './pages/CourseWorkspace';
import Settings from './pages/Settings';
import Toast from './components/Toast';

function App() {
  const [currentPage, setCurrentPage] = useState('profile-selection');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState('light');

  // Auto-hide sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleNavigate = (page, profile = null, course = null) => {
    setCurrentPage(page);
    if (profile) setSelectedProfile(profile);
    if (course) setSelectedCourse(course);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    setSelectedProfile(null);
    setSelectedCourse(null);
    setCurrentPage('profile-selection');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'profile-selection':
        return <ProfileSelection onSelectProfile={(profile) => {
          setSelectedProfile(profile);
          setCurrentPage('course-selection');
        }} />;
      
      case 'course-selection':
        return <CourseSelection 
          profile={selectedProfile}
          onComplete={() => handleNavigate('dashboard')}
          onBack={() => handleLogout()}
        />;
      
      case 'dashboard':
        return <Dashboard
          profile={selectedProfile}
          onSelectCourse={(course) => handleNavigate('course-workspace', null, course)}
          onShowToast={showToast}
        />;
      
      case 'course-workspace':
        return <CourseWorkspace
          profile={selectedProfile}
          course={selectedCourse}
          onShowToast={showToast}
        />;
      
      case 'settings':
        return <Settings
          profile={selectedProfile}
          onShowToast={showToast}
          onThemeChange={(newTheme) => setTheme(newTheme)}
        />;
      
      default:
        return <ProfileSelection onSelectProfile={(profile) => {
          setSelectedProfile(profile);
          setCurrentPage('course-selection');
        }} />;
    }
  };

  const renderSidebar = () => {
    if (currentPage === 'profile-selection') return null;

    return (
      <aside className={`fixed md:static w-64 h-screen bg-slate-900 text-white transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} z-40`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="text-2xl font-bold">📚 StudyMate</div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden"
            >
              <X size={24} />
            </button>
          </div>

          {selectedProfile && (
            <div className="bg-slate-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-400">Current Profile</p>
              <p className="text-lg font-semibold truncate">{selectedProfile.name}</p>
            </div>
          )}

          <nav className="space-y-2">
            <button
              onClick={() => handleNavigate('dashboard')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${currentPage === 'dashboard' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => handleNavigate('course-selection')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${currentPage === 'course-selection' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
            >
              📚 My Courses
            </button>
            <button
              onClick={() => handleNavigate('settings')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${currentPage === 'settings' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
            >
              ⚙️ Settings
            </button>
          </nav>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleLogout}
            className="w-full bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors"
          >
            🔄 Switch Profile
          </button>
        </div>
      </aside>
    );
  };

  return (
    <div className={`flex ${theme}`}>
      {/* Mobile menu button */}
      {currentPage !== 'profile-selection' && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed md:hidden bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg z-50"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Sidebar */}
      {renderSidebar()}

      {/* Main content */}
      <main className="flex-1 min-h-screen bg-slate-50">
        {renderPage()}
      </main>

      {/* Toast notification */}
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && currentPage !== 'profile-selection' && (
        <div
          className="fixed md:hidden inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
