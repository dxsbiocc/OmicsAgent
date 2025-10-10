/**
 * 邮箱验证 Hook
 * 提供邮箱验证相关的状态和功能
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';

interface EmailVerificationState {
  isVerified: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useEmailVerification() {
  const { user, checkEmailVerificationStatus } = useAuthContext();
  const [state, setState] = useState<EmailVerificationState>({
    isVerified: user?.is_email_verified || false,
    isLoading: false,
    error: null,
  });

  // 检查邮箱验证状态
  const checkStatus = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await checkEmailVerificationStatus();
      setState(prev => ({
        ...prev,
        isVerified: result.is_email_verified,
        isLoading: false,
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '检查验证状态失败';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [checkEmailVerificationStatus]);

  // 当用户信息变化时更新验证状态
  useEffect(() => {
    if (user) {
      setState(prev => ({
        ...prev,
        isVerified: user.is_email_verified || false,
      }));
    }
  }, [user]);

  return {
    ...state,
    checkStatus,
  };
}
