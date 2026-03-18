import { ApiResponse } from './api-response.interface';
import { User } from './user.interface';

export interface UserData {
  token: string;
  tokenType: string;
  expiresIn: string;
  user: User;
}

export type UserDataResponse = ApiResponse<UserData>;
