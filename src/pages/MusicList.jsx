import { useEffect, useState, useRef } from 'react';
import { getFiles, uploadMusic } from '../services/github';
import { useMusic } from '../context/MusicContext';
import { useAuth } from '../context/AuthContext';
import { FaPlay, FaPause, FaCloudUploadAlt, FaMusic, FaSync } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function MusicList() {
  const [songs, setSongsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { playSong, currentSong, isPlaying, togglePlay, setSongs } = useMusic();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const fileInputRef = useRef(null);

  const fetchMusic = async () => {
    setLoading(true);
    // Timeout promise to prevent infinite loading
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timed out')), 10000)
    );

    try {
      const files = await Promise.race([getFiles('public/music'), timeoutPromise]);
      const musicFiles = (Array.isArray(files) ? files : [files]).filter(file => 
          file && file.name && file.name.match(/\.(mp3|ogg|wav)$/i)
      );
      setSongsList(musicFiles);
      setSongs(musicFiles);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setSongsList([]);
        setSongs([]);
      } else {
        console.error("Error fetching music:", error);
        // Don't alert on timeout/network errors to avoid spamming, just log
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMusic();
    }
  }, [user]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(mp3|ogg|wav)$/i)) {
      alert('Please upload an audio file (mp3, ogg, wav)');
      return;
    }

    setUploading(true);
    try {
      await uploadMusic(file);
      alert('Music uploaded successfully! List will refresh in 3 seconds due to GitHub API delay.');
      // Wait for GitHub API to update
      setTimeout(async () => {
          await fetchMusic();
      }, 3000);
    } catch (error) {
      console.error('Error uploading music:', error);
      alert('Error uploading music: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  if (authLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    </div>
  );

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <FaMusic className="text-6xl text-gray-300 mb-6" />
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Music Library</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
          Please log in with your GitHub account to listen to music.
        </p>
        <a 
          href="/#/login" 
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transform hover:scale-[1.02] transition-all duration-200"
        >
          Log In to Listen
        </a>
      </div>
    );
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
          Music Library
        </h1>
        {isAdmin && (
          <div className="flex gap-4">
            <button
              onClick={fetchMusic}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-all duration-200"
              title="Refresh List"
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".mp3,.ogg,.wav"
            />
            <button
              onClick={handleUploadClick}
              disabled={uploading}
              className={`flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 transform hover:scale-[1.02] transition-all duration-200 ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <FaCloudUploadAlt className="text-xl" />
              {uploading ? 'Uploading...' : 'Upload Music'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
        {songs.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
                <FaMusic className="text-6xl mb-4 opacity-20" />
                <p className="text-xl">No music found.</p>
                {isAdmin && <p className="mt-2 text-sm">Upload some tunes to get the party started!</p>}
            </div>
        ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {songs.map((song, index) => {
                const isCurrent = currentSong && currentSong.name === song.name;
                return (
                <motion.li 
                    key={song.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 flex justify-between items-center transition-colors ${isCurrent ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''}`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${isCurrent ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                            <FaMusic />
                        </div>
                        <span className={`font-medium text-lg ${isCurrent ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>
                            {song.name}
                        </span>
                    </div>
                    <button 
                        onClick={() => {
                            if (isCurrent) {
                                togglePlay();
                            } else {
                                playSong(song);
                            }
                        }}
                        className={`p-3 rounded-full transition-all transform hover:scale-110 shadow-md ${isCurrent && isPlaying 
                            ? 'bg-blue-500 text-white hover:bg-blue-600' 
                            : 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                    >
                        {isCurrent && isPlaying ? <FaPause /> : <FaPlay className="ml-1" />}
                    </button>
                </motion.li>
                );
            })}
            </ul>
        )}
      </div>
    </div>
  );
}
