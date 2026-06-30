import { computed, inject, Injectable, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

export interface LoginUserCredentials {
  username: string;
  password: string;
}

export interface RegisterUserCredentials {
  username: string;
  emailAddress: string;
  password: string;
}

export interface RegisterUserState {
  statusCode: number;
  success: boolean;
  errorTitle: string;
  errorDetail: string;
}

export interface LoginUserState {
  statusCode: number;
  success: boolean;
  errorTitle: string;
  errorDetail: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserAuthService {
  private http: HttpClient = inject(HttpClient);
  private _platformId = inject(PLATFORM_ID);

  private _accessToken: WritableSignal<string | null> = signal<string | null>(null);

  public readonly isAuthenticated = computed(() => !!this._accessToken());

  constructor() {
    if (isPlatformBrowser(this._platformId)) {
      try {
        this._accessToken.set(localStorage.getItem('accessToken'));
      } catch {
        this._accessToken.set(null);
      }
    }
  }

  updateToken(newToken: string) {
    localStorage.setItem('accessToken', newToken);
    this._accessToken.set(newToken);
  }

  async refreshAccessToken(): Promise<string> {
    try {
      const res = await lastValueFrom(
        this.http.post<{token: string}>(`${environment.apiBaseUrl}/v1/auth/refresh`, {})
      );

      this.updateToken(res.token);
      return res.token;
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  public async loginUser(
    credentials: LoginUserCredentials,
  ): Promise<LoginUserState> {
    try {
    const res = await lastValueFrom(
      this.http.post<{ token: string }>(`${environment.apiBaseUrl}/v1/auth/login`, credentials),
    );

    this.updateToken(res.token);
    return {success: true, errorTitle: '', errorDetail: '', statusCode: 200};
    } catch (error) {
      const err = error as HttpErrorResponse;
      return {
        success: false,
        errorTitle: err.error.title || "Authentication failed",
        errorDetail: err.error.detail || "Invalid credentials.",
        statusCode: err.status,
      }
    }
  }

  public async registerUser(
    credentials: RegisterUserCredentials,
  ): Promise<RegisterUserState> {
    try {
      const res = await lastValueFrom(
        this.http.post<{token: string}>(`${environment.apiBaseUrl}/v1/auth/register`, credentials)
      );

      this.updateToken(res.token);
      return {success: true, errorTitle: '', errorDetail: '', statusCode: 204};
    } catch (error) {
      const err = error as HttpErrorResponse;
      return {
        success: false,
        errorTitle: err.error.title || "Registration failed",
        errorDetail: err.error.detail || "",
        statusCode: err.status,
      }
    }
  }

  logout() {
    localStorage.removeItem('accessToken');
    this._accessToken.set(null);
  }
}
