import { useEffect, useRef, useState } from 'react';
import { useMusic } from '../context/MusicContext';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaMusic } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function MusicPlayer() {
  const { currentSong, isPlaying, togglePlay, setIsPlaying, playlist, playSong } = useMusic();
  const audioRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentSong && audioRef.current) {
        if (isPlaying) {
            audioRef.current.play().catch(e => console.error("Play error:", e));
        } else {
            audioRef.current.pause();
        }
    }
  }, [currentSong, isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setProgress((current / duration) * 100);
    }
  };

  const handleEnded = () => {
      if (!playlist || playlist.length === 0) return;
      
      const currentIndex = playlist.findIndex(s => s.name === currentSong.name);
      if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
          playSong(playlist[currentIndex + 1]);
      } else {
          setIsPlaying(false);
      }
  };

  const handleNext = () => {
    if (!playlist) return;
    const currentIndex = playlist.findIndex(s => s.name === currentSong.name);
    if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
        playSong(playlist[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (!playlist) return;
    const currentIndex = playlist.findIndex(s => s.name === currentSong.name);
    if (currentIndex !== -1 && currentIndex > 0) {
        playSong(playlist[currentIndex - 1]);
    }
  };

  if (!currentSong) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-2xl bg-white/80 dark:bg-dark-surface/90 backdrop-blur-xl rounded-full shadow-2xl border border-white/20 dark:border-gray-700 p-4 z-50 flex items-center justify-between"
      >
        <div className="absolute top-0 left-0 h-1 bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className={`p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 ${isPlaying ? 'animate-spin-slow' : ''}`}>
            <FaMusic className="text-white w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{currentSong.name}</h3>
            <span className="text-xs text-blue-500 font-medium">Now Playing</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 ml-4">
          <button onClick={handlePrev} className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
            <FaStepBackward />
          </button>
          <button 
            onClick={togglePlay} 
            className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transform hover:scale-110 transition-all"
          >
            {isPlaying ? <FaPause /> : <FaPlay className="ml-1" />}
          </button>
          <button onClick={handleNext} className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
            <FaStepForward />
          </button>
        </div>
        
        <audio
          ref={audioRef}
          src={currentSong.download_url}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={handleEnded}
          onTimeUpdate={handleTimeUpdate}
        />
      </motion.div>
    </AnimatePresence>
  );
}
