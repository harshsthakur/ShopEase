import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to get auth header
  const getAuthHeader = () => {
    const token = localStorage.getItem('shopease_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // Fetch profile on initial boot if token exists
  const checkAuth = async () => {
    const token = localStorage.getItem('shopease_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/profile', {
        headers: getAuthHeader(),
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        // Token might have expired
        localStorage.removeItem('shopease_token');
        setUser(null);
      }
    } catch (err) {
      console.error('Error verifying auth status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('shopease_token', data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        wishlist: data.wishlist || [],
        wellnessPoints: data.wellnessPoints || 0,
        badges: data.badges || [],
      });
      return { success: true, role: data.role };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('shopease_token', data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        wishlist: data.wishlist || [],
        wellnessPoints: data.wellnessPoints || 0,
        badges: data.badges || [],
      });
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('shopease_token');
    setUser(null);
  };

  // Update profile handler
  const updateProfile = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const body = { name, email };
      if (password) body.password = password;

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      if (data.token) {
        localStorage.setItem('shopease_token', data.token);
      }

      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        wishlist: data.wishlist || [],
        wellnessPoints: data.wellnessPoints || 0,
        badges: data.badges || [],
      });
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Add item to wishlist
  const addToWishlist = async (productId) => {
    if (!user) return { success: false, message: 'Please log in to add to wishlist' };
    
    try {
      const response = await fetch('/api/auth/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();
      if (response.ok) {
        setUser(prev => ({ ...prev, wishlist: data.wishlist }));
        return { success: true };
      } else {
        throw new Error(data.message || 'Failed to add to wishlist');
      }
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId) => {
    if (!user) return { success: false, message: 'Please log in' };

    try {
      const response = await fetch(`/api/auth/wishlist/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });

      const data = await response.json();
      if (response.ok) {
        setUser(prev => ({ ...prev, wishlist: data.wishlist }));
        return { success: true };
      } else {
        throw new Error(data.message || 'Failed to remove from wishlist');
      }
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        addToWishlist,
        removeFromWishlist,
        getAuthHeader,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
