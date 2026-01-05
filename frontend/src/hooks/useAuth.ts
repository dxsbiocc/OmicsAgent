/**
 * 认证相关 Hook
 * 提供登录、注册、登出等认证功能
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/libs/api";
import type { User, UserCreate, UserLogin } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseAuthReturn extends AuthState {
  login: (credentials: UserLogin) => Promise<void>;
  register: (userData: UserCreate) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  sendVerificationEmail: (email?: string) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  checkEmailVerificationStatus: () => Promise<{
    is_email_verified: boolean;
    email: string;
  }>;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // 初始化认证状态
  useEffect(() => {
    const initAuth = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        // 直接尝试获取当前用户信息
        // 如果成功，说明已认证；如果失败，说明未认证
        try {
          const currentUser = await authApi.getCurrentUser();
          setState({
            user: currentUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // 未认证或token无效，设置为未认证状态（这是正常情况，不是错误）
          console.log("用户未登录，设置为未认证状态");
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error("初始化认证状态失败:", error);
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: "初始化认证状态失败",
        });
      }
    };

    initAuth();
  }, []);

  // 登录
  const login = useCallback(
    async (credentials: UserLogin) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await authApi.login(credentials);

        // 优先使用响应中的用户信息，如果没有则通过API获取
        let currentUser: User | null = null;
        if (response.user) {
          currentUser = response.user;
        } else {
          currentUser = await authApi.getCurrentUser();
        }
        console.log("currentUser", currentUser);
        setState({
          user: currentUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // 登录成功后跳转到首页或指定页面
        // 检查是否有重定向参数
        const urlParams = new URLSearchParams(window.location.search);
        const redirectPath = urlParams.get("redirect");
        router.push(
          redirectPath && redirectPath !== "/auth/login" ? redirectPath : "/"
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "登录失败";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [router]
  );

  // 注册
  const register = useCallback(
    async (userData: UserCreate) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await authApi.register(userData);

        // 优先使用响应中的用户信息，如果没有则通过API获取
        let currentUser;
        if (response.user) {
          currentUser = response.user;
        } else {
          currentUser = await authApi.getCurrentUser();
        }

        setState({
          user: currentUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // 注册成功后跳转到首页
        router.push("/");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "注册失败";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [router]
  );

  // 登出
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("登出失败:", error);
    }

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    // 登出后跳转到登录页
    router.push("/auth/login");
  }, [router]);

  // 清除错误
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // 刷新用户信息
  const refreshUser = useCallback(async () => {
    try {
      const isLoggedIn = await authApi.isLoggedIn();
      if (isLoggedIn) {
        const currentUser = await authApi.getCurrentUser();
        setState((prev) => ({
          ...prev,
          user: currentUser,
          isAuthenticated: true,
        }));
      }
    } catch (error) {
      console.error("刷新用户信息失败:", error);
      // 如果刷新失败，可能是 token 过期，执行登出
      logout();
    }
  }, [logout]);

  // 发送邮箱验证码
  const sendVerificationEmail = useCallback(async (email?: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      await authApi.sendVerificationEmail(email);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "发送验证码失败";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  // 验证邮箱
  const verifyEmail = useCallback(async (code: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const response = await authApi.verifyEmail(code);

      // 更新用户信息
      setState((prev) => ({
        ...prev,
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "邮箱验证失败";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  // 重新发送验证码
  const resendVerificationEmail = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      await authApi.resendVerificationEmail();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "重新发送失败";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  // 检查邮箱验证状态
  const checkEmailVerificationStatus = useCallback(async () => {
    try {
      return await authApi.checkEmailVerificationStatus();
    } catch (error) {
      console.error("检查邮箱验证状态失败:", error);
      throw error;
    }
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    clearError,
    refreshUser,
    sendVerificationEmail,
    verifyEmail,
    resendVerificationEmail,
    checkEmailVerificationStatus,
  };
}
