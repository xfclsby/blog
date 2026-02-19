import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createFile, updateFile, getFileContent } from '../services/github';
import { useAuth } from '../context/AuthContext';
import matter from 'gray-matter';
import { motion } from 'framer-motion';

export default function Editor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [sha, setSha] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (slug) {
      const fetchPost = async () => {
        try {
          const file = await getFileContent(`posts/${slug}.md`);
          const { data, content } = matter(file.content);
          setTitle(data.title);
          setDescription(data.description || '');
          setTags(data.tags ? data.tags.join(', ') : '');
          setContent(content);
          setSha(file.sha);
        } catch (error) {
          console.error("Error fetching post:", error);
        }
      };
      fetchPost();
    }
  }, [slug, token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const frontMatter = {
      title,
      date: new Date().toISOString().split('T')[0],
      description,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    const fileContent = matter.stringify(content, frontMatter);
    const fileName = slug ? `${slug}.md` : `${title.toLowerCase().replace(/\s+/g, '-')}.md`;
    const path = `posts/${fileName}`;

    try {
      if (slug) {
        await updateFile(path, fileContent, sha, `Update post: ${title}`);
      } else {
        await createFile(path, fileContent, `Create post: ${title}`);
      }
      navigate('/');
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Error saving post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-white dark:bg-dark-surface p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
        <h1 className="text-3xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
          {slug ? 'Edit Post' : 'New Post'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Title</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-900 dark:text-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tags (comma separated)</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-900 dark:text-white"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="react, tutorial, design"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-900 dark:text-white h-24 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Content (Markdown)</label>
            <textarea
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-900 dark:text-white font-mono h-96"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transform hover:scale-[1.02] transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Saving...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
