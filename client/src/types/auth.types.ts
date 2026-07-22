export interface User {
  id: number;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
