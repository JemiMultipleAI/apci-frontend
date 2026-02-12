import { useState, useEffect } from 'react';
import apiClient from '@/lib/api/client';
import { getCompanyId, setCompanyId } from '@/lib/cookies';

export interface UserInfo {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  company_id?: string | null;
}

export function useUser() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async (retries = 3): Promise<void> => {
      try {
        const response = await apiClient.get('/auth/me');
        if (response.data.success) {
          const userData = response.data.data;
          setUser(userData);
          
          // Sync company_id cookie if it changed
          const currentCompanyId = getCompanyId();
          const newCompanyId = userData.company_id || null;
          if (currentCompanyId !== newCompanyId) {
            setCompanyId(newCompanyId);
          }
          setLoading(false);
          setError(null);
        }
      } catch (err: any) {
        // Retry on failure
        if (retries > 0) {
          setTimeout(() => fetchUser(retries - 1), 1000);
        } else {
          console.error('Failed to fetch user info after retries:', err);
          setError(err.response?.data?.error?.message || 'Failed to fetch user info');
          setLoading(false);
        }
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error, role: user?.role as string | undefined };
}
