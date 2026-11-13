import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user.model';

import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${API_BASE_URL}/api/auth`;
  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    const savedUser = localStorage.getItem('escola_user');
    if (savedUser) {
      try {
        this.currentUser.set(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('escola_user');
      }
    }
  }

  login(email: string, senha: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, senha }).pipe(
      tap(res => {
        const user: User = {
          id: res.id,
          nome: res.nome,
          email: res.email,
          role: res.role,
          matricula: res.matricula,
          token: res.token
        };
        this.currentUser.set(user);
        localStorage.setItem('escola_user', JSON.stringify(user));
        localStorage.setItem('escola_token', res.token);
      })
    );
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('escola_user');
    localStorage.removeItem('escola_token');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('escola_token');
  }

  isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  getRole(): string | null {
    return this.currentUser()?.role || null;
  }
}
