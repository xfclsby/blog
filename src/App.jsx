import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MusicProvider } from './context/MusicContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './Layout';
import Home from './pages/Home';
import Post from './pages/Post';
import Editor from './pages/Editor';
import Login from './pages/Login';
import MusicList from './pages/MusicList';
import Admin from './pages/Admin';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;
  
  return children;
};

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
                  <Route 
                    path="editor" 
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <Editor />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="editor/:slug" 
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <Editor />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="admin" 
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <Admin />
                      </ProtectedRoute>
                    } 
                  />
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
