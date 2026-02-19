import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { motion } from 'framer-motion';

export default function Header() {
  const { token, logout } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Music', path: '/music' },
  ];

  if (token) {
    navLinks.push({ name: 'New Post', path: '/editor' });
  }

  return (
    <header className="sticky top-0 z-50 bg-white/70 dark:bg-dark-surface/70 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 hover:scale-105 transition-transform">
          My Blog
        </Link>
        
        <nav className="flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 font-medium transition-colors relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
          
          <div className="flex items-center space-x-4 pl-4 border-l border-gray-300 dark:border-gray-700">
            <ThemeToggle />
            
            {token ? (
              <button 
                onClick={logout} 
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-all transform hover:scale-105"
              >
                Logout
              </button>
            ) : (
              <Link 
                to="/login" 
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-all transform hover:scale-105 shadow-lg shadow-blue-500/30"
              >
                Login
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
