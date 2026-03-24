import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ChangePasswordResponse,
  LoginResponse,
  RegisterResponse,
} from '../../models/auth-response.interface';
import { environment } from '../../../../environments/environment';
import { buildRequestContext } from '../../interceptors/request-context/request-context';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly httpClient = inject(HttpClient);

  private readonly TOKEN_KEY = 'userToken';

  sendRegisterData(data: object): Observable<RegisterResponse> {
    return this.httpClient.post<RegisterResponse>(environment.apiUrl + '/users/signup', data, {
      context: buildRequestContext({
        skipErrorHandling: true,
        skipLoadingSpinner: true,
      }),
    });
  }

  sendLoginData(data: object): Observable<LoginResponse> {
    return this.httpClient.post<LoginResponse>(environment.apiUrl + '/users/signin', data, {
      context: buildRequestContext({
        skipErrorHandling: true,
        skipLoadingSpinner: true,
      }),
    });
  }

  changePassword(data: object): Observable<ChangePasswordResponse> {
    return this.httpClient.patch<ChangePasswordResponse>(
      `${environment.apiUrl}/users/change-password`,
      data,
      {
        context: buildRequestContext({
          skipErrorHandling: true,
        }),
      },
    );
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('cachedUserProfile');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
