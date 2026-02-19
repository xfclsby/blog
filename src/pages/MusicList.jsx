import { useEffect, useState } from 'react';
import { getFiles } from '../services/github';
import { useMusic } from '../context/MusicContext';
import { FaPlay, FaPause } from 'react-icons/fa';

export default function MusicList() {
  const [songs, setSongsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playSong, currentSong, isPlaying, togglePlay, setSongs } = useMusic();

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const files = await getFiles('public/music');
        const musicFiles = (Array.isArray(files) ? files : [files]).filter(file => 
            file.name.endsWith('.mp3') || file.name.endsWith('.ogg') || file.name.endsWith('.wav')
        );
        setSongsList(musicFiles);
        setSongs(musicFiles);
      } catch (error) {
        console.error("Error fetching music:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMusic();
  }, [setSongs]);

  if (loading) return <div className="text-center py-10">Loading music...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Music Library</h1>
      <div className="bg-white rounded shadow overflow-hidden">
        {songs.length === 0 ? (
            <p className="p-4 text-gray-500">No music found.</p>
        ) : (
            <ul className="divide-y">
            {songs.map((song) => {
                const isCurrent = currentSong && currentSong.name === song.name;
                return (
                <li key={song.name} className={`p-4 hover:bg-gray-50 flex justify-between items-center ${isCurrent ? 'bg-blue-50' : ''}`}>
                    <span className="font-medium">{song.name}</span>
                    <button 
                        onClick={() => {
                            if (isCurrent) {
                                togglePlay();
                            } else {
                                playSong(song);
                            }
                        }}
                        className="p-2 rounded-full hover:bg-gray-200 text-blue-600"
                    >
                        {isCurrent && isPlaying ? <FaPause /> : <FaPlay />}
                    </button>
                </li>
                );
            })}
            </ul>
        )}
      </div>
    </div>
  );
}
