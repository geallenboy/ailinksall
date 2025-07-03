export interface User {
  id: string;
  email: string;
  fullName: string | null;
  avatar: string | null;
  bio?: string | null;
  skillLevel?: string | null;
  isAdmin?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthUser extends User {
  // 扩展的认证相关字段
  sessionId?: string;
  lastLoginAt?: Date;
} 