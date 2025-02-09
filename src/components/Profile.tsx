import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

interface UserProfile {
  username: string;
  bio?: string;
  avatar?: string;
  socialLinks: SocialLink[];
}

interface DiscordLink {
  type: string;
  discordId: string;
  url: string;
}

interface DiscordProfile {
  username: string;
  discriminator: string;
  avatar: string | null;
  banner: string | null;
  accentColor: number | null;
  status?: string;
}

export const Profile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [discordLinks, setDiscordLinks] = useState<DiscordLink[]>([]);
  const [discordProfile, setDiscordProfile] = useState<DiscordProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDiscordProfile = async (discordId: string) => {
      try {
        const response = await fetch(`https://discord.com/api/v10/users/${discordId}`, {
          headers: {
            'Authorization': `Bot ${import.meta.env.VITE_DISCORD_BOT_TOKEN}`
          }
        });
        
        if (!response.ok) throw new Error('Nie udało się pobrać danych z Discorda');
        
        const data = await response.json();
        setDiscordProfile(data);
      } catch (err) {
        console.error('Error fetching Discord profile:', err);
      }
    };

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');

        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', username?.toLowerCase()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError('Profil nie został znaleziony');
          return;
        }

        const userData = querySnapshot.docs[0].data() as UserProfile;
        setProfile(userData);

        const linksRef = collection(db, 'links');
        const linksQuery = query(
          linksRef, 
          where('userId', '==', querySnapshot.docs[0].id),
          where('type', '==', 'discord')
        );
        const linksSnapshot = await getDocs(linksQuery);
        const discordLinksData = linksSnapshot.docs.map(doc => doc.data() as DiscordLink);
        setDiscordLinks(discordLinksData);

        // Jeśli znaleziono link do Discorda, pobierz informacje o profilu
        if (discordLinksData.length > 0) {
          await fetchDiscordProfile(discordLinksData[0].discordId);
        }

      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Wystąpił błąd podczas ładowania profilu');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  const getDiscordAvatarUrl = (userId: string, avatarHash: string | null) => {
    if (!avatarHash) return 'https://cdn.discordapp.com/embed/avatars/0.png';
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png?size=128`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-2">404</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-primary py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="glass-effect p-8 rounded-2xl text-center">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.username}
              className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-indigo-500/20"
            />
          ) : (
            <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-2xl font-bold">
              {profile.username[0].toUpperCase()}
            </div>
          )}

          <h1 className="text-2xl font-bold gradient-text mb-2">@{profile.username}</h1>
          
          {profile.bio && (
            <p className="text-gray-400 mb-6">{profile.bio}</p>
          )}

          <div className="space-y-4">
            {discordProfile && discordLinks.length > 0 && (
              <div className="glass-effect p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <img
                    src={getDiscordAvatarUrl(discordLinks[0].discordId, discordProfile.avatar)}
                    alt={discordProfile.username}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="text-left flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{discordProfile.username}</h3>
                      <span className="text-gray-400 text-sm">#{discordProfile.discriminator}</span>
                    </div>
                    {discordProfile.status && (
                      <p className="text-sm text-gray-400">{discordProfile.status}</p>
                    )}
                  </div>
                  <i className="fab fa-discord text-2xl text-[#5865F2]"></i>
                </div>
              </div>
            )}

            {profile.socialLinks?.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 p-3 rounded-lg glass-effect hover:bg-white/5 transition-all"
              >
                <span className="text-xl" dangerouslySetInnerHTML={{ __html: link.icon }} />
                <span>{link.platform}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 