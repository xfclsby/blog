import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { MusicProvider } from './context/MusicContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './Layout';
import Home from './pages/Home';
import Post from './pages/Post';
import Editor from './pages/Editor';
import Login from './pages/Login';
import MusicList from './pages/MusicList';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <ThemeProvider>
          <MusicProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="post/:slug" element={<Post />} />
                  <Route path="editor" element={<Editor />} />
                  <Route path="editor/:slug" element={<Editor />} />
                  <Route path="login" element={<Login />} />
                  <Route path="music" element={<MusicList />} />
                </Route>
              </Routes>
            </Router>
          </MusicProvider>
        </ThemeProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
