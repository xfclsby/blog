import { createContext, useContext, useState, useEffect } from 'react';
import { getUser } from '../services/github';
import { REPO_OWNER } from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('github_token'));
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const login = (newToken) => {
    localStorage.setItem('github_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('github_token');
    setToken(null);
    setUser(null);
    setIsAdmin(false);
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const userData = await getUser();
          setUser(userData);
          setIsAdmin(userData.login === REPO_OWNER);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          logout();
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
