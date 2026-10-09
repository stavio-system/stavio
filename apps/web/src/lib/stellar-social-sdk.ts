/**
 * Stellar Social SDK — stub module
 * The vendored SDK has broken .js extension imports incompatible with Next.js.
 * Auth is handled directly in use-auth.tsx via Freighter API and Google JWT decoding.
 * This file exists to satisfy any remaining imports without causing build errors.
 */

export const StellarSocialSDK = null;

export type AuthMethod = 'google' | 'apple' | 'facebook' | 'wallet';
export type UserRole = 'guest' | 'host' | 'tenant' | 'dual';

export interface SocialAuthConfig {
  clientId: string;
  method: AuthMethod;
}

export interface StellarUser {
  publicKey: string;
  email?: string;
  role?: UserRole;
}
