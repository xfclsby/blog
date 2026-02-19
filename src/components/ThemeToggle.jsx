import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none transition-colors duration-300"
      aria-label="Toggle Theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        {theme === 'dark' ? (
          <MoonIcon className="w-6 h-6 text-yellow-300" />
        ) : (
          <SunIcon className="w-6 h-6 text-orange-500" />
        )}
      </motion.div>
    </button>
  );
}
