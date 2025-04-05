import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/components/ui/toaster";
import { useLocalStorage } from "./use-local-storage";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginUser: (username: string, password: string) => Promise<void>;
  registerUser: (userData: RegisterData) => Promise<void>;
  logoutUser: () => void;
};

type RegisterData = {
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: "farmer" | "specialist";
  specialization?: string;
  bio?: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useLocalStorage<User | null>("user", null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Login function
  const loginUser = async (username: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const userData = await response.json();
      setUser(userData);
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.fullName}!`,
        variant: "success",
      });
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Register function
  const registerUser = async (userData: RegisterData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const newUser = await response.json();
      setUser(newUser);
      toast({
        title: "Registration successful",
        description: `Welcome to AgriConnect, ${newUser.fullName}!`,
        variant: "success",
      });
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logoutUser = async () => {
    try {
      // Call the logout API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      
      // Clear user from local storage
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear the user if the API call fails
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out, but there was an error on the server.",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        loginUser,
        registerUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}