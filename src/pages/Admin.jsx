import { useState, useEffect } from 'react';
import { getFiles, deleteFile } from '../services/github';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaMusic, FaFileAlt, FaSync } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function Admin() {
  const [posts, setPosts] = useState([]);
  const [music, setMusic] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin, loading: authLoading } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    try {
      // Handle potential 404s if directories don't exist
      const fetchSafe = async (path) => {
        try {
          const res = await getFiles(path);
          return Array.isArray(res) ? res : [];
        } catch (e) {
          return [];
        }
      };

      const [postsData, musicData] = await Promise.all([
        fetchSafe('posts'),
        fetchSafe('public/music')
      ]);
      
      setPosts(postsData.filter(f => f.name.endsWith('.md')));
      setMusic(musicData.filter(f => f.name.match(/\.(mp3|ogg|wav)$/i)));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchData();
    } else if (!authLoading && !isAdmin) {
      setLoading(false);
    }
  }, [isAdmin, authLoading]);

  const handleDelete = async (file, type) => {
    if (!window.confirm(`Are you sure you want to delete "${file.name}"?`)) return;
    
    try {
      // Optimistic update: Remove from UI immediately
      if (type === 'post') {
        setPosts(prev => prev.filter(p => p.sha !== file.sha));
      } else {
        setMusic(prev => prev.filter(m => m.sha !== file.sha));
      }

      await deleteFile(file.path, file.sha, `Delete ${type}: ${file.name}`);
      
      // Delay fetch to allow GitHub API to propagate changes, just in case
      setTimeout(fetchData, 2000);
    } catch (error) {
      console.error('Delete error:', error);
      alert(`Failed to delete ${file.name}`);
      // Revert optimistic update by fetching fresh data
      fetchData();
    }
  };

  if (authLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    </div>
  );

  if (!isAdmin) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h2 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h2>
      <p className="text-gray-600 dark:text-gray-400">You do not have permission to view this page.</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white">Admin Dashboard</h1>
        <button
            onClick={fetchData}
            disabled={loading}
            className="p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl transition-all"
        >
            <FaSync className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Posts Section */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-surface rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800"
        >
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <FaFileAlt className="text-blue-500" />
                    Posts ({posts.length})
                </h2>
                <Link 
                    to="/editor" 
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-colors"
                >
                    <FaPlus /> New Post
                </Link>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
                {posts.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No posts found.</div>
                ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                        {posts.map(post => (
                            <li key={post.sha} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 flex justify-between items-center transition-colors">
                                <span className="font-medium text-gray-700 dark:text-gray-200 truncate flex-1 mr-4">
                                    {post.name.replace('.md', '')}
                                </span>
                                <div className="flex gap-2">
                                    <Link 
                                        to={`/editor/${post.name.replace('.md', '')}`}
                                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <FaEdit />
                                    </Link>
                                    <button 
                                        onClick={() => handleDelete(post, 'post')}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </motion.div>

        {/* Music Section */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-dark-surface rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800"
        >
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <FaMusic className="text-purple-500" />
                    Music ({music.length})
                </h2>
                <Link 
                    to="/music" 
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm transition-colors"
                >
                    <FaPlus /> Upload
                </Link>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
                {music.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No music found.</div>
                ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                        {music.map(song => (
                            <li key={song.sha} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 flex justify-between items-center transition-colors">
                                <span className="font-medium text-gray-700 dark:text-gray-200 truncate flex-1 mr-4">
                                    {song.name}
                                </span>
                                <button 
                                    onClick={() => handleDelete(song, 'music')}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <FaTrash />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </motion.div>
      </div>
    </div>
  );
}