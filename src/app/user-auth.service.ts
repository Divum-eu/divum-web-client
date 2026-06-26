import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

export interface LoginUserCredentials {
  username: string;
  password: string;
}

export interface RegisterUserCredentials {
  username: string;
  email: string;
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
  constructor(private http: HttpClient) {}

  public async loginUser(
    credentials: LoginUserCredentials,
  ): Promise<LoginUserState> {
    try {
    const res = await lastValueFrom(
      this.http.post<{token: string}>('http://localhost:8080/api/v1/auth/login', credentials));

    localStorage.setItem('accessToken', res.token);
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
        this.http.post<{token: string}>('http://localhost:8080/api/v1/auth/register', credentials)
      );

      localStorage.setItem('accessToken', res.token);
      return {success: true, errorTitle: '', errorDetail: '', statusCode: 204};
    } catch (error) {
      console.log(error);
      const err = error as HttpErrorResponse;
      return {
        success: false,
        errorTitle: err.error.title || "Registration failed",
        errorDetail: err.error.detail || "",
        statusCode: err.status,
      }
    }
  }
}
