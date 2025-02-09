import { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';

interface Link {
  id: string;
  title: string;
  url: string;
  description: string;
  clicks: number;
  userId: string;
  createdAt: string;
}

export const LinkList = () => {
  const [links, setLinks] = useState<Link[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'links'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const linkData: Link[] = [];
      snapshot.forEach((doc) => {
        linkData.push({ id: doc.id, ...doc.data() } as Link);
      });
      setLinks(linkData.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'links', id));
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };

  const handleClick = async (link: Link) => {
    try {
      await updateDoc(doc(db, 'links', link.id), {
        clicks: link.clicks + 1
      });
      window.open(link.url, '_blank');
    } catch (error) {
      console.error('Error updating clicks:', error);
    }
  };

  if (links.length === 0) {
    return (
      <div className="glass-effect p-8 rounded-xl text-center">
        <h3 className="text-xl font-medium text-gray-300 mb-2">Brak linków</h3>
        <p className="text-gray-400">Dodaj swój pierwszy link używając formularza obok.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {links.map((link) => (
        <div key={link.id} className="glass-effect p-6 rounded-xl transition-all hover:scale-[1.02]">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold gradient-text">{link.title}</h3>
            <button
              onClick={() => handleDelete(link.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          {link.description && (
            <p className="text-gray-400 mb-3 text-sm">{link.description}</p>
          )}
          <div className="flex justify-between items-center">
            <button
              onClick={() => handleClick(link)}
              className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Otwórz link
            </button>
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-sm">{link.clicks}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 