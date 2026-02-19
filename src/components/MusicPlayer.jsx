import { useEffect, useRef, useState } from 'react';
import { useMusic } from '../context/MusicContext';
import { useAuth } from '../context/AuthContext';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaMusic, FaTachometerAlt, FaSlidersH, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function MusicPlayer() {
  const { currentSong, isPlaying, togglePlay, setIsPlaying, playlist, playSong } = useMusic();
  const { user } = useAuth();
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const gainNodeRef = useRef(null);
  const filtersRef = useRef([]);

  const [progress, setProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showControls, setShowControls] = useState(false);
  const [eqPreset, setEqPreset] = useState('Normal');

  // EQ Presets (Gain values in dB for Low, Mid, High)
  const EQ_PRESETS = {
    'Normal': [0, 0, 0],
    'Pop': [-2, 4, 2],
    'Rock': [4, 0, 4],
    'Jazz': [3, -2, 3],
    'Classical': [4, 2, -2],
    'Bass Boost': [8, -2, -4],
  };

  useEffect(() => {
    // Initialize Web Audio API
    if (!audioContextRef.current && currentSong) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      // Create source from audio element
      if (audioRef.current) {
        // Fix for "The HTMLMediaElement passed to createMediaElementSource is already connected to another MediaElementSourceNode."
        // We only create it once.
        if (!sourceNodeRef.current) {
            sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
            
            // Create filters (3-band EQ: LowShelf, Peaking, HighShelf)
            const lowFilter = audioContextRef.current.createBiquadFilter();
            lowFilter.type = 'lowshelf';
            lowFilter.frequency.value = 320;

            const midFilter = audioContextRef.current.createBiquadFilter();
            midFilter.type = 'peaking';
            midFilter.frequency.value = 1000;
            midFilter.Q.value = 0.5;

            const highFilter = audioContextRef.current.createBiquadFilter();
            highFilter.type = 'highshelf';
            highFilter.frequency.value = 3200;

            // Gain node for overall volume (optional, but good practice)
            gainNodeRef.current = audioContextRef.current.createGain();

            // Connect nodes: Source -> Low -> Mid -> High -> Gain -> Destination
            sourceNodeRef.current.connect(lowFilter);
            lowFilter.connect(midFilter);
            midFilter.connect(highFilter);
            highFilter.connect(gainNodeRef.current);
            gainNodeRef.current.connect(audioContextRef.current.destination);

            filtersRef.current = [lowFilter, midFilter, highFilter];
        }
      }
    }

    // Apply EQ settings when preset changes
    if (filtersRef.current.length === 3) {
      const gains = EQ_PRESETS[eqPreset];
      filtersRef.current[0].gain.value = gains[0];
      filtersRef.current[1].gain.value = gains[1];
      filtersRef.current[2].gain.value = gains[2];
    }

    // Handle Playback Rate
    if (audioRef.current) {
        audioRef.current.playbackRate = playbackRate;
    }

  }, [currentSong, eqPreset, playbackRate]);

  // Resume AudioContext on user interaction (browser policy)
  useEffect(() => {
    if (isPlaying && audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, [isPlaying]);

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

  if (!currentSong || !user) return null;

  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
        audioRef.current.playbackRate = rate;
    }
  };

  const handleEqChange = (preset) => {
    setEqPreset(preset);
    // EQ update logic is handled in useEffect
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[95%] max-w-3xl bg-white/80 dark:bg-dark-surface/90 backdrop-blur-xl rounded-full shadow-2xl border border-white/20 dark:border-gray-700 p-4 z-50 flex items-center justify-between flex-col md:flex-row gap-4"
      >
        <div className="absolute top-0 left-0 h-1 bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        
        <div className="flex items-center space-x-4 flex-1 min-w-0 w-full md:w-auto">
          <div className={`p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 ${isPlaying ? 'animate-spin-slow' : ''}`}>
            <FaMusic className="text-white w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{currentSong.name}</h3>
            <span className="text-xs text-blue-500 font-medium">Now Playing</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 w-full md:w-auto">
             {/* Main Controls */}
             <div className="flex items-center space-x-4">
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

            {/* Extra Controls Toggle */}
            <button 
                onClick={() => setShowControls(!showControls)} 
                className={`p-2 rounded-lg transition-colors ${showControls ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'text-gray-500 dark:text-gray-400 hover:text-blue-500'}`}
                title="Audio Settings"
            >
                <FaSlidersH />
            </button>
        </div>

        {/* Extended Controls Panel */}
        <AnimatePresence>
            {showControls && (
                <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="w-full overflow-hidden bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Playback Speed */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-2">
                                <FaTachometerAlt /> Speed: {playbackRate}x
                            </h4>
                            <div className="flex gap-2 flex-wrap">
                                {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(rate => (
                                    <button
                                        key={rate}
                                        onClick={() => handlePlaybackRateChange(rate)}
                                        className={`px-3 py-1 text-xs rounded-full border transition-all ${
                                            playbackRate === rate 
                                            ? 'bg-blue-500 text-white border-blue-500' 
                                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-blue-500'
                                        }`}
                                    >
                                        {rate}x
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* EQ Presets */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-2">
                                <FaSlidersH /> Environment: {eqPreset}
                            </h4>
                            <div className="flex gap-2 flex-wrap">
                                {Object.keys(EQ_PRESETS).map(preset => (
                                    <button
                                        key={preset}
                                        onClick={() => handleEqChange(preset)}
                                        className={`px-3 py-1 text-xs rounded-full border transition-all ${
                                            eqPreset === preset 
                                            ? 'bg-purple-500 text-white border-purple-500' 
                                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-purple-500'
                                        }`}
                                    >
                                        {preset}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
        
        <audio
          crossOrigin="anonymous" // Essential for Web Audio API with external resources
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
