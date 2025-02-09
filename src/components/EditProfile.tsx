import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

const socialPlatforms = {
  facebook: {
    name: 'Facebook',
    icon: '<i class="fab fa-facebook"></i>'
  },
  instagram: {
    name: 'Instagram',
    icon: '<i class="fab fa-instagram"></i>'
  },
  twitter: {
    name: 'Twitter',
    icon: '<i class="fab fa-twitter"></i>'
  },
  youtube: {
    name: 'YouTube',
    icon: '<i class="fab fa-youtube"></i>'
  },
  tiktok: {
    name: 'TikTok',
    icon: '<i class="fab fa-tiktok"></i>'
  },
  github: {
    name: 'GitHub',
    icon: '<i class="fab fa-github"></i>'
  },
  linkedin: {
    name: 'LinkedIn',
    icon: '<i class="fab fa-linkedin"></i>'
  }
};

export const EditProfile = () => {
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [newPlatform, setNewPlatform] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!auth.currentUser) return;

      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setBio(data.bio || '');
        setAvatar(data.avatar || '');
        setSocialLinks(data.socialLinks || []);
      }
    };

    loadProfile();
  }, []);

  const handleAddSocialLink = () => {
    if (!newPlatform || !newUrl) return;

    const platform = socialPlatforms[newPlatform as keyof typeof socialPlatforms];
    if (!platform) return;

    setSocialLinks([
      ...socialLinks,
      {
        platform: platform.name,
        url: newUrl,
        icon: platform.icon
      }
    ]);

    setNewPlatform('');
    setNewUrl('');
  };

  const handleRemoveSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        bio,
        avatar,
        socialLinks
      });

      setSuccess('Profil został zaktualizowany');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Wystąpił błąd podczas zapisywania profilu');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="glass-effect p-6 rounded-xl">
      <h2 className="text-xl font-bold gradient-text mb-6">Edytuj profil</h2>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="auth-input h-24"
            placeholder="Napisz coś o sobie..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            URL Avatara
          </label>
          <input
            type="url"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            className="auth-input"
            placeholder="https://example.com/avatar.jpg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Social Media
          </label>
          
          <div className="space-y-3 mb-4">
            {socialLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-xl" dangerouslySetInnerHTML={{ __html: link.icon }} />
                <span className="flex-1">{link.platform}</span>
                <button
                  onClick={() => handleRemoveSocialLink(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  Usuń
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <select
              value={newPlatform}
              onChange={(e) => setNewPlatform(e.target.value)}
              className="auth-input flex-1"
            >
              <option value="">Wybierz platformę</option>
              {Object.entries(socialPlatforms).map(([key, platform]) => (
                <option key={key} value={key}>
                  {platform.name}
                </option>
              ))}
            </select>
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="auth-input flex-1"
              placeholder="URL profilu"
            />
            <button
              onClick={handleAddSocialLink}
              className="px-4 py-2 bg-indigo-500 rounded hover:bg-indigo-600"
            >
              Dodaj
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="auth-button mt-6"
        >
          Zapisz zmiany
        </button>
      </div>
    </div>
  );
}; 