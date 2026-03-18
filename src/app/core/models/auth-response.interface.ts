import { ApiResponse } from './api-response.interface';
import { User } from './user.interface';

export interface AuthTokens {
  token: string;
  tokenType: string;
  expiresIn: string;
}

export interface AuthData extends AuthTokens {
  user?: User;
}

export type LoginResponse = ApiResponse<AuthData>;
export type RegisterResponse = ApiResponse<AuthData>;
export type ChangePasswordResponse = ApiResponse<AuthTokens>;
