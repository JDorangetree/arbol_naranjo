export interface User {
  id: string;
  email: string;
  displayName: string;
  childName: string;
  childBirthDate: Date;
  createdAt: Date;
  settings: UserSettings;
}

export interface UserSettings {
  currency: 'COP' | 'USD';
  theme: 'light' | 'dark' | 'colorful';
  preferredVisualization: 'tree' | 'piggybank' | 'garden';
  monthlyGoal: number;
  notifications: boolean;
}

export const defaultUserSettings: UserSettings = {
  currency: 'COP',
  theme: 'light',
  preferredVisualization: 'tree',
  monthlyGoal: 500000,
  notifications: true,
};
