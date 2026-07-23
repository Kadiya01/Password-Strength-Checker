export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
