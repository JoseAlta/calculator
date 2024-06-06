import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8000/api';
  private readonly TOKEN_KEY = 'access_token';

  private userId:any;
  constructor(private http: HttpClient) { }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials);
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logout`, {});
  }
  saveToken(token: string) {
    sessionStorage.setItem(this.TOKEN_KEY, token);
    // this.userId =userId;
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }
  clearToken() {
    sessionStorage.removeItem(this.TOKEN_KEY);
  }
  saveUser(userId:any){
    this.userId =userId;
  }
  getUserId(): any {
    return this.userId;
  }

}
