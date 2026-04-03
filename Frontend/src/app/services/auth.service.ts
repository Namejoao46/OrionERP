import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  private tokenSubject = new BehaviorSubject<string | null>(null)
  private userNameSubject = new BehaviorSubject<string | null>(null);
  private userImageSubject = new BehaviorSubject<string | null>(null);

  token$ = this.tokenSubject.asObservable();
  userName$ = this.userNameSubject.asObservable();
  userImage$ = this.userImageSubject.asObservable();

  constructor(private http: HttpClient) {}
  
  login(login: string, senha: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, {
      login: login,
      senha: senha
    });
  }

  setUserData(token: string, nome: string, foto: string) {
    this.tokenSubject.next(token);
    this.userNameSubject.next(nome);
    this.userImageSubject.next(foto);
  }

  logout() {
    this.tokenSubject.next(null);
    this.userNameSubject.next(null);
    this.userImageSubject.next(null);
  }
}
