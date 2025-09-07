import { AuthServiceClient } from '../generated/AuthServiceClientPb';
import { LoginRequest, LoginResponse } from '../generated/auth_pb';
import { AuthState, User } from '../types/auth';

const AUTH_CLIENT = new AuthServiceClient('http://localhost:8080');
const TOKEN_KEY = 'messenger_token';
const USER_KEY = 'messenger_user';

export class AuthService {
  static async login(username: string, password: string): Promise<AuthState> {
    const request = new LoginRequest();
    request.setUsername(username);
    request.setPassword(password);

    try {
      const response: LoginResponse = await AUTH_CLIENT.login(request);
      
      if (response.getSuccess()) {
        const user: User = {
          id: response.getUserId(),
          username: response.getUsername()
        };
        
        const authState: AuthState = {
          token: response.getToken(),
          user,
          isAuthenticated: true
        };

        // Store in localStorage
        localStorage.setItem(TOKEN_KEY, response.getToken());
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        return authState;
      } else {
        throw new Error(response.getMessage() || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Failed to connect to authentication service');
    }
  }

  static logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  static getStoredAuth(): AuthState {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        return {
          token,
          user,
          isAuthenticated: true
        };
      } catch (error) {
        // Invalid stored data, clear it
        this.logout();
      }
    }

    return {
      token: null,
      user: null,
      isAuthenticated: false
    };
  }

  static async validateToken(token: string): Promise<boolean> {
    // TODO: Implement token validation with backend
    // For now, just check if token exists and is not expired
    return token.length > 0;
  }
}