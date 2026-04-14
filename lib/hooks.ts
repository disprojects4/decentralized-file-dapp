import { useContext } from 'react';
import { UserContext } from '@/app/providers';

/**
 * Hook to access user context (wallet connection state)
 */
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
