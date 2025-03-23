import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { login as apiLogin, logout as apiLogout, getUserInfo } from '@/api/auth';
import type { UserInfo, UserSettings, UserState } from '@/types/user';
import { defaultSettings } from '@/types/user';
import { storage } from '@/utils/storage';

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(storage.get('token'));
  const userInfo = ref<UserInfo | null>(null);
  const settings = ref<UserSettings>(storage.get('userSettings') || defaultSettings);

  // 计算属性：是否已登录
  const isLoggedIn = computed(() => !!token.value);

  async function login(username: string, password: string) {
    try {
      const { token: newToken, user } = await apiLogin({ username, password });
      token.value = newToken;
      userInfo.value = user;
      storage.set('token', newToken);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // 开发模式登录
  function devLogin() {
    const mockToken = 'dev_token_' + Date.now();
    const mockUser = {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      roles: ['admin'],
      permissions: ['*'],
    };

    token.value = mockToken;
    userInfo.value = mockUser;
    storage.set('token', mockToken);
    storage.set('userInfo', mockUser);
    return true;
  }

  async function logout() {
    try {
      await apiLogout();
      token.value = null;
      userInfo.value = null;
      storage.remove('token');
      storage.remove('userInfo');
      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  async function fetchUserInfo() {
    try {
      const user = await getUserInfo();
      userInfo.value = user;
      return true;
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      throw error;
    }
  }

  function updateSettings(newSettings: Partial<UserSettings>) {
    settings.value = { ...settings.value, ...newSettings };
    storage.set('userSettings', settings.value);
  }

  return {
    token,
    userInfo,
    settings,
    isLoggedIn,
    login,
    devLogin,
    logout,
    fetchUserInfo,
    updateSettings,
  };
});