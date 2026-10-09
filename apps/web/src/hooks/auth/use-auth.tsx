'use client';

import { type ReactNode, createContext, useContext, useEffect, useState } from 'react';
import type { AuthContextType, SocialUser } from '~/types/auth';

const AuthContext = createContext<AuthContextType>({
  user: null,
  account: null,
  isAuthenticated: false,
  isLoading: true,
  authMethod: null,
  loginWithGoogle: async () => {},
  loginWithFreighter: async () => {},
  logout: () => {},
  getBalance: async () => [],
  sendPayment: async () => '',
});

const STORAGE_KEY = 'stavio_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SocialUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authMethod, setAuthMethod] = useState<'google' | 'freighter' | null>(null);

  // Restore persisted session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.publicKey) {
          setUser(parsed);
          setAuthMethod(parsed.authMethod || null);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persistUser = (u: SocialUser, method: 'google' | 'freighter') => {
    const toStore = { ...u, authMethod: method };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    setUser(u);
    setAuthMethod(method);
  };

  const loginWithGoogle = async (credentialResponse?: any) => {
    setIsLoading(true);
    try {
      if (!credentialResponse?.credential) {
        throw new Error('No Google credential provided');
      }
      const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      const userData: SocialUser = {
        publicKey: `G_${payload.sub}`,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        authMethod: 'google',
        role: 'guest',
      } as any;
      persistUser(userData, 'google');
    } catch (err) {
      console.error('Google login failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithFreighter = async () => {
    setIsLoading(true);
    try {
      const freighter = (window as any).freighter;
      if (!freighter)
        throw new Error(
          'Freighter wallet is not installed. Please install the Freighter browser extension.'
        );

      await freighter.requestAccess();
      const publicKey: string = await freighter.getPublicKey();
      if (!publicKey) throw new Error('Could not retrieve public key from Freighter');

      const userData: SocialUser = {
        publicKey,
        name: `${publicKey.slice(0, 8)}...`,
        authMethod: 'freighter',
      } as any;
      persistUser(userData, 'freighter');
    } catch (err) {
      console.error('Freighter login failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAuthMethod(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        account: null,
        isAuthenticated: !!user?.publicKey,
        isLoading,
        authMethod,
        loginWithGoogle,
        loginWithFreighter,
        logout,
        getBalance: async () => [],
        sendPayment: async () => { throw new Error('Use PaymentButton for payments'); },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
