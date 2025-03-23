/**
 * 用户信息
 */
export interface UserInfo {
  id: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
}

/**
 * 用户设置
 */
export interface UserSettings {
  theme: 'light' | 'dark';
  language: string;
  tableSize: 'small' | 'medium' | 'large';
  showWelcome: boolean;
}

/**
 * 用户状态
 */
export interface UserState {
  token: string | null;
  userInfo: UserInfo | null;
  settings: UserSettings;
}

export const defaultSettings: UserSettings = {
  theme: 'light',
  language: 'zh-CN',
  tableSize: 'medium',
  showWelcome: true,
};