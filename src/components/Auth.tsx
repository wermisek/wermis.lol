import { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Link } from 'react-router-dom';

export const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      setError('Wystąpił błąd podczas logowania przez Google');
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential') {
        setError('Nieprawidłowy email lub hasło');
      } else {
        setError('Wystąpił błąd podczas logowania');
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
            <h1 className="text-4xl gradient-text mb-3">OneLink</h1>
            <p className="text-gray-400">Twoje linki w jednym miejscu</p>
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={signIn} className="space-y-4 mt-6">
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
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            <button 
              type="submit" 
              className="auth-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <i className="fas fa-circle-notch fa-spin mr-2"></i>
                  Logowanie...
                </span>
              ) : (
                'Zaloguj się'
              )}
            </button>

            <Link 
              to="/register" 
              className="auth-button-secondary block text-center"
              tabIndex={isLoading ? -1 : 0}
            >
              Stwórz nowe konto
            </Link>
          </form>

          <div className="auth-divider">
            <span className="auth-divider-text">lub</span>
          </div>

          <button
            onClick={signInWithGoogle}
            className="flex items-center justify-center gap-3 w-full p-3 rounded-lg 
              border border-white/10 hover:bg-white/5 text-white font-medium 
              transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            disabled={isLoading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M23.766 12.2764c0-.9175-.07-1.7935-.2036-2.6325H12.24v4.9515h6.4556c-.2789 1.4976-1.1325 2.7675-2.4124 3.6193l-.0001.0147 3.5028 2.7133.0242.0024c2.2324-2.0645 3.5168-5.0947 3.5168-8.6687" fill="#4285F4"/>
              <path d="M12.2399 23.9999c2.9336 0 5.3924-.9711 7.1899-2.6284l-3.5269-2.7157c-.9782.6556-2.2284 1.0446-3.663 1.0446-2.8157 0-5.2036-1.9015-6.0577-4.4572l-.1185.0101-.3443 2.7465-.045.0124c1.7644 3.5357 5.377 5.9877 9.5655 5.9877" fill="#34A853"/>
              <path d="M6.1822 15.9999c-.2135-.6395-.336-1.3245-.336-2.0285 0-.7015.1225-1.386.3358-2.0256l-.0057-.1354-3.5165-2.7315-.1153.0547C1.6677 10.3379 1.3394 11.6714 1.3394 13c0 1.3286.3283 2.6621.9561 3.8664l3.8867-2.8665" fill="#FBBC05"/>
              <path d="M12.2399 6.4999c1.9933 0 3.3351.8615 4.1007 1.5815l3.1453-3.0752C17.5694 3.1814 15.1111 2 12.2399 2 8.0518 2 4.4387 4.4518 2.6739 7.9999l3.6866 2.8665c.8541-2.5557 3.242-4.4665 5.8794-4.4665" fill="#EA4335"/>
            </svg>
            Kontynuuj z Google
          </button>
        </div>
      </div>
    </div>
  );
}; 