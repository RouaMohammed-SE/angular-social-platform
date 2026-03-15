import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserDataResponse } from '../../models/user-data.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly httpClient = inject(HttpClient);

  private readonly TOKEN_KEY = 'userToken';

  sendRegisterData(data: object): Observable<UserDataResponse> {
    return this.httpClient.post<UserDataResponse>(environment.apiUrl + '/users/signup', data);
  }

  sendLoginData(data: object): Observable<any> {
    return this.httpClient.post<UserDataResponse>(environment.apiUrl + '/users/signin', data);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
