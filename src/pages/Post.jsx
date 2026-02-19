import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFileContent } from '../services/github';
import ReactMarkdown from 'react-markdown';
import matter from 'gray-matter';
import Giscus from '@giscus/react';
import { Helmet } from 'react-helmet-async';
import { REPO_OWNER, REPO_NAME } from '../config';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function Post() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const file = await getFileContent(`posts/${slug}.md`);
        const { data, content } = matter(file.content);
        setPost({ ...data, content, sha: file.sha });
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    </div>
  );
  if (!post) return <div className="text-center py-10 text-red-500 text-xl">Post not found.</div>;

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800"
    >
      <Helmet>
        <title>{post.title} | My Blog</title>
        <meta name="description" content={post.description || post.title} />
      </Helmet>
      
      <header className="mb-12 border-b border-gray-200 dark:border-gray-700 pb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-gray-900 dark:text-white leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
          {post.title}
        </h1>
        <div className="flex flex-wrap justify-center items-center gap-4 text-gray-500 dark:text-gray-400 text-sm">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            {post.date}
          </span>
          {post.tags && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-semibold">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>
      
      <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-img:rounded-xl prose-img:shadow-lg leading-relaxed">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
      
      <div className="mt-16 pt-10 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
          Comments
        </h3>
        <Giscus
          repo={`${REPO_OWNER}/${REPO_NAME}`}
          repoId="YOUR_REPO_ID" 
          category="Announcements"
          categoryId="YOUR_CATEGORY_ID"
          mapping="pathname"
          strict="0"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="bottom"
          theme={theme === 'dark' ? 'dark' : 'light'}
          lang="en"
          loading="lazy"
        />
      </div>
    </motion.article>
  );
}
