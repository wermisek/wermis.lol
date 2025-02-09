import { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';

export const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateUsername = (username: string) => {
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
  };

  const checkUsernameAvailability = async (username: string) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username.toLowerCase()));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    setError('');
    setIsLoading(true);

    try {
      // Walidacja
      if (!validateUsername(username)) {
        throw new Error('Nazwa użytkownika może zawierać tylko litery, cyfry i podkreślenia (3-20 znaków)');
      }

      if (password !== confirmPassword) {
        throw new Error('Hasła nie są takie same');
      }

      if (password.length < 6) {
        throw new Error('Hasło musi mieć minimum 6 znaków');
      }

      // Sprawdź czy nazwa użytkownika jest dostępna
      const isUsernameAvailable = await checkUsernameAvailability(username);
      if (!isUsernameAvailable) {
        throw new Error('Ta nazwa użytkownika jest już zajęta');
      }

      // Utwórz konto użytkownika
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Aktualizuj profil użytkownika
      await updateProfile(user, {
        displayName: username
      });

      // Utwórz dokument użytkownika w kolekcji users
      await setDoc(doc(db, 'users', user.uid), {
        username: username.toLowerCase(),
        email,
        bio: '',
        avatar: '',
        socialLinks: [],
        createdAt: new Date().toISOString()
      });

      // Przekieruj do dashboardu
      navigate('/dashboard');

    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Ten email jest już zajęty');
      } else if (error.code === 'auth/weak-password') {
        setError('Hasło jest za słabe');
      } else if (error.code === 'auth/invalid-email') {
        setError('Nieprawidłowy adres email');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Problem z połączeniem internetowym');
      } else {
        setError(error.message || 'Wystąpił błąd podczas rejestracji');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-form">
          <div className="text-center mb-8">
            <h1 className="text-4xl gradient-text mb-3">Dołącz do OneLink</h1>
            <p className="text-gray-400">Stwórz swoje konto w kilka sekund</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4 mt-6">
            <div className="auth-input-group">
              <label htmlFor="username">Nazwa użytkownika</label>
              <i className="fas fa-user auth-input-icon"></i>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="auth-input"
                placeholder="twoja_nazwa"
                required
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_]{3,20}"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-400 mt-1">
                Tylko litery, cyfry i podkreślenia (3-20 znaków)
              </p>
            </div>

            <div className="auth-input-group">
              <label htmlFor="email">Email</label>
              <i className="fas fa-envelope auth-input-icon"></i>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                placeholder="twoj@email.com"
                required
                disabled={isLoading}
              />
            </div>

            <div className="auth-input-group">
              <label htmlFor="password">Hasło</label>
              <i className="fas fa-lock auth-input-icon"></i>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                placeholder="Minimum 6 znaków"
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>

            <div className="auth-input-group">
              <label htmlFor="confirmPassword">Potwierdź hasło</label>
              <i className="fas fa-lock auth-input-icon"></i>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="auth-input"
                placeholder="Powtórz hasło"
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>

            <button 
              type="submit" 
              className="auth-button mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <i className="fas fa-circle-notch fa-spin mr-2"></i>
                  Tworzenie konta...
                </span>
              ) : (
                'Stwórz konto'
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6">
            Masz już konto?{' '}
            <Link 
              to="/" 
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
              tabIndex={isLoading ? -1 : 0}
            >
              Zaloguj się
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}; 