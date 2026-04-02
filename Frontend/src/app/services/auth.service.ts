import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}
  
  login(login: string, senha: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, {
      login: login,
      senha: senha
    });
  }
}
