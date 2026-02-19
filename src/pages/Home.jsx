import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFiles, getFileContent } from '../services/github';
import matter from 'gray-matter';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const files = await getFiles('posts');
        const fileList = Array.isArray(files) ? files : [files];
        const postFiles = fileList.filter(file => file.name.endsWith('.md'));
        
        const postsData = await Promise.all(postFiles.map(async (file) => {
          try {
            const { content } = await getFileContent(file.path);
            const { data } = matter(content);
            return {
              ...data,
              slug: file.name.replace('.md', ''),
              path: file.path,
              sha: file.sha
            };
          } catch (e) {
            console.error(`Error parsing ${file.name}:`, e);
            return null;
          }
        }));

        setPosts(postsData.filter(Boolean).sort((a, b) => new Date(b.date) - new Date(a.date)));
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
          Latest Stories
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Thoughts, tutorials, and insights about software development and design.
        </p>
      </div>

      {posts.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 text-lg">No posts found.</p>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.article 
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white dark:bg-dark-surface rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-800 flex flex-col h-full"
              >
                <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                
                <div className="p-8 flex flex-col flex-grow">
                  <div className="mb-4">
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full text-xs font-semibold tracking-wide uppercase">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <Link to={`/post/${post.slug}`}>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {post.title || post.slug}
                      </h2>
                    </Link>
                  </div>
                  
                  {post.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow leading-relaxed line-clamp-3">
                      {post.description}
                    </p>
                  )}
                  
                  <div className="pt-6 mt-auto border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      {post.date ? dayjs(post.date).format('MMMM D, YYYY') : 'No Date'}
                    </span>
                    <span className="flex items-center text-blue-500 font-medium group-hover:translate-x-1 transition-transform">
                      Read more <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
      )}
    </div>
  );
}
