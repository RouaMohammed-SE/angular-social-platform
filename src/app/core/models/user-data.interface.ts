export interface UserDataResponse {
  success: boolean;
  message: string;
  data: Data;
}

export interface Data {
  token: string;
  tokenType: string;
  expiresIn: string;
  user: User;
}

export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  photo: string;
  cover: string;
}
