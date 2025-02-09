import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { AddLink } from './AddLink';
import { LinkList } from './LinkList';

interface UserProfile {
  username: string;
  bio: string;
  avatar: string;
  socialLinks: any[];
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeMenu, setActiveMenu] = useState('links');
  const [stats, setStats] = useState({
    totalClicks: 0,
    totalLinks: 0,
    avgClicksPerDay: 0
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!auth.currentUser) return;

      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        setProfile(userDoc.data() as UserProfile);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Błąd podczas wylogowywania:', error);
    }
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'links':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AddLink />
            <LinkList />
          </div>
        );
      case 'dashboard':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Witaj, @{profile?.username}!</h2>
            <p className="text-gray-400">
              To jest Twój dashboard. Tutaj możesz zarządzać swoimi linkami,
              sprawdzać statystyki i dostosowywać wygląd swojego profilu.
            </p>
          </div>
        );
      default:
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Sekcja w budowie</h2>
            <p className="text-gray-400">Ta funkcjonalność będzie dostępna wkrótce.</p>
          </div>
        );
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <nav className="dashboard-nav">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl gradient-text">OneLink</h1>
            <div className="h-6 w-px bg-white/10"></div>
            <Link 
              to={`/${profile?.username}`} 
              className="text-sm text-gray-400 hover:text-white transition-colors"
              target="_blank"
            >
              Zobacz swój profil
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="quick-action-btn text-red-400 hover:text-red-300"
            >
              <i className="fas fa-sign-out-alt"></i>
              Wyloguj
            </button>
          </div>
        </nav>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-grid">
          <aside className="dashboard-sidebar">
            <div className="profile-card mb-6">
              <div className="profile-header">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.username}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="profile-avatar">
                    {profile?.username?.[0].toUpperCase()}
                  </div>
                )}
                <div className="profile-info">
                  <h2 className="profile-username">@{profile?.username}</h2>
                  <p className="profile-bio">{profile?.bio || 'Brak opisu'}</p>
                </div>
              </div>

              <Link
                to="/edit"
                className="quick-action-btn w-full justify-center mt-4"
              >
                <i className="fas fa-edit"></i>
                Edytuj profil
              </Link>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => setActiveMenu('dashboard')}
                className={`menu-item w-full ${activeMenu === 'dashboard' ? 'active' : ''}`}
              >
                <i className="fas fa-chart-line"></i>
                Dashboard
              </button>
              <button
                onClick={() => setActiveMenu('links')}
                className={`menu-item w-full ${activeMenu === 'links' ? 'active' : ''}`}
              >
                <i className="fas fa-link"></i>
                Linki
              </button>
              <button
                onClick={() => setActiveMenu('appearance')}
                className={`menu-item w-full ${activeMenu === 'appearance' ? 'active' : ''}`}
              >
                <i className="fas fa-paint-brush"></i>
                Wygląd
              </button>
              <button
                onClick={() => setActiveMenu('settings')}
                className={`menu-item w-full ${activeMenu === 'settings' ? 'active' : ''}`}
              >
                <i className="fas fa-cog"></i>
                Ustawienia
              </button>
            </nav>
          </aside>

          <div className="dashboard-main">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}; 