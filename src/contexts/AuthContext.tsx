import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, create a mock user
      const mockUser = {
        id: "1",
        email,
        name: "John Doe",
        role: "user", // Default role for demo
      };
      
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });

      // Redirect based on role
      switch (mockUser.role) {
        case "event-organizer":
          navigate("/organizer");
          break;
        case "stall-organizer":
          navigate("/stall-organizer");
          break;
        case "stall-manager":
          navigate("/stall-manager");
          break;
        case "user":
          navigate("/"); // Regular users go to homepage
          break;
        default:
          navigate("/");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid credentials. Please try again.",
      });
    }
  };

  const signup = async (email: string, password: string, name: string, role: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: "1",
        email,
        name,
        role,
      };
      
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
      toast({
        title: "Welcome!",
        description: "Your account has been created successfully.",
      });

      // Redirect based on role
      switch (role) {
        case "event-organizer":
          navigate("/organizer");
          break;
        case "stall-organizer":
          navigate("/stall-organizer");
          break;
        case "stall-manager":
          navigate("/stall-manager");
          break;
        case "user":
          navigate("/"); // Regular users go to homepage
          break;
        default:
          navigate("/");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not create account. Please try again.",
      });
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthService } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  verificationStatus: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing user session on load
    const fetchCurrentUser = async () => {
      try {
        const response = await AuthService.getCurrentUser();
        setUser(response.data.user);
      } catch (error) {
        console.error('Failed to fetch current user', error);
        // Clear any stale tokens
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await AuthService.login(email, password);
      setUser(response.data.user);
      
      // Display success toast
      toast({
        title: 'Login successful',
        description: `Welcome back, ${response.data.user.firstName}!`,
        variant: 'default',
      });
    } catch (error: any) {
      console.error('Login failed', error);
      
      // Display error toast
      toast({
        title: 'Login failed',
        description: error.response?.data?.message || 'An error occurred during login',
        variant: 'destructive',
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setLoading(true);
      const response = await AuthService.register(userData);
      setUser(response.data.user);
      
      // Display success toast
      toast({
        title: 'Registration successful',
        description: 'Your account has been created successfully!',
        variant: 'default',
      });
    } catch (error: any) {
      console.error('Registration failed', error);
      
      // Display error toast
      toast({
        title: 'Registration failed',
        description: error.response?.data?.message || 'An error occurred during registration',
        variant: 'destructive',
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
      
      // Display success toast
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Logout failed', error);
      
      // Force logout on the client side even if the server request fails
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
