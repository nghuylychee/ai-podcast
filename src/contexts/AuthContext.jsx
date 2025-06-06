import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Implement actual login logic here
      // For now, just simulate a login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: '1',
        name: 'Nguyễn Huy',
        email: email,
        avatar: 'NH',
        savedPodcasts: [] // Add savedPodcasts array to user data
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      return mockUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Implement actual signup logic here
      // For now, just simulate a signup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: '1',
        name: 'Nguyễn Huy',
        email: email,
        avatar: 'NH',
        savedPodcasts: [] // Add savedPodcasts array to user data
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      return mockUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Implement actual logout logic here
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser(null);
      localStorage.removeItem('user');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const savePodcast = async (podcast) => {
    if (!user) {
      throw new Error('Please login to save podcasts');
    }

    try {
      setLoading(true);
      setError(null);

      // Update user's saved podcasts
      const updatedUser = {
        ...user,
        savedPodcasts: [...user.savedPodcasts, podcast]
      };

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      return updatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removePodcast = async (podcastId) => {
    if (!user) {
      throw new Error('Please login to manage podcasts');
    }

    try {
      setLoading(true);
      setError(null);

      // Remove podcast from user's saved podcasts
      const updatedUser = {
        ...user,
        savedPodcasts: user.savedPodcasts.filter(p => p.id !== podcastId)
      };

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      return updatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    savePodcast,
    removePodcast
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 