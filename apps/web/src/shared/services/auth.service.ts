import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.serverUrl;

  constructor(private http: HttpClient) {}

  // Sign up new user
  signup(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/signup`, data, {
      withCredentials: true
    });
  }

  // Login user
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, 
      { email, password }, 
      { withCredentials: true }
    );
  }

  // Logout user
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}, {
      withCredentials: true
    });
  }

  // Get current user from localStorage
  getCurrentUser(): any {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  // Save user to localStorage
  setCurrentUser(user: any): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  // Clear user from localStorage
  clearCurrentUser(): void {
    localStorage.removeItem('currentUser');
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  }
}