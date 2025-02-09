import { useState } from 'react';
import { auth, db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export const AddLink = () => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [discordId, setDiscordId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDiscordLink = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      if (!discordId) {
        throw new Error('Wprowadź ID użytkownika Discord');
      }

      // Dodaj link do Discorda
      await addDoc(collection(db, 'links'), {
        title: 'Discord',
        url: `https://discord.com/users/${discordId}`,
        description: 'Mój profil Discord',
        userId: auth.currentUser?.uid,
        createdAt: new Date().toISOString(),
        type: 'discord',
        discordId: discordId
      });

      setDiscordId('');
      setSuccess('Pomyślnie dodano link do Discorda');
    } catch (err: any) {
      console.error('Error adding Discord link:', err);
      setError(err.message || 'Wystąpił błąd podczas dodawania linku do Discorda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      setIsLoading(true);
      setError('');

      await addDoc(collection(db, 'links'), {
        title,
        url,
        description,
        userId: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
        type: 'custom'
      });

      setTitle('');
      setUrl('');
      setDescription('');
      setSuccess('Link został dodany pomyślnie');
    } catch (err: any) {
      console.error('Error adding link:', err);
      setError(err.message || 'Wystąpił błąd podczas dodawania linku');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-effect p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-6 gradient-text">Dodaj nowy link</h2>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-1">Discord ID</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Twoje Discord ID"
            value={discordId}
            onChange={(e) => setDiscordId(e.target.value)}
            className="flex-1 p-3 rounded-lg bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
            disabled={isLoading}
          />
          <button
            onClick={handleDiscordLink}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] transition-colors"
          >
            <i className="fab fa-discord text-xl"></i>
            {isLoading ? 'Dodawanie...' : 'Dodaj Discord'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Jak znaleźć swoje Discord ID? Włącz tryb developera w Discordzie, kliknij prawym na swój profil i wybierz "Kopiuj ID"
        </p>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-primary text-gray-400">lub dodaj własny link</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Tytuł</label>
          <input
            type="text"
            placeholder="Nazwa twojego linku"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">URL</label>
          <input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Opis (opcjonalnie)</label>
          <textarea
            placeholder="Krótki opis linku..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 h-24 resize-none"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? 'Dodawanie...' : 'Dodaj link'}
        </button>
      </form>
    </div>
  );
}; 