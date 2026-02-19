import { createContext, useContext, useState } from 'react';

const MusicContext = createContext();

export const useMusic = () => useContext(MusicContext);

export const MusicProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const playSong = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const setSongs = (songs) => {
    setPlaylist(songs);
  };

  return (
    <MusicContext.Provider value={{ currentSong, playlist, isPlaying, playSong, togglePlay, setSongs, setIsPlaying }}>
      {children}
    </MusicContext.Provider>
  );
};
