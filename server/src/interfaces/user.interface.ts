export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  createdAt: Date;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
}
