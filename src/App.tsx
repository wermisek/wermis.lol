import { useAuthState } from 'react-firebase-hooks/auth';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { Auth } from './components/Auth';
import { Register } from './components/Register';
import { Profile } from './components/Profile';
import { EditProfile } from './components/EditProfile';
import { Dashboard } from './components/Dashboard';
import './index.css';

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="/edit" element={user ? <EditProfile /> : <Navigate to="/" />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/:username" element={<Profile />} />
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/dashboard" />
            ) : (
              <Auth />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
