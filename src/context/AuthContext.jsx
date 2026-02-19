import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('github_token'));

  const login = (newToken) => {
    localStorage.setItem('github_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('github_token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
