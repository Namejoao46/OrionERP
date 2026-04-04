import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  // Inicializa os Subjects com o que já estiver no localStorage
  private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('token'));
  private userNameSubject = new BehaviorSubject<string | null>(localStorage.getItem('userName'));
  private userImageSubject = new BehaviorSubject<string | null>(localStorage.getItem('userImage'));

  token$ = this.tokenSubject.asObservable();
  userName$ = this.userNameSubject.asObservable();
  userImage$ = this.userImageSubject.asObservable();

  constructor(private http: HttpClient) {}
  
  login(login: string, senha: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { login, senha });
  }

  setUserData(token: string, nome: string, foto: string | null) {
    localStorage.setItem('token', token);
    localStorage.setItem('userName', nome);
    
    if (foto) {
      // Remove espaços ou quebras de linha que o JSON possa ter inserido
      const fotoLimpa = foto.replace(/\s/g, '');
      localStorage.setItem('userImage', fotoLimpa);
      this.userImageSubject.next(fotoLimpa);
    } else {
      localStorage.removeItem('userImage');
      this.userImageSubject.next(null);
    }

    this.tokenSubject.next(token);
    this.userNameSubject.next(nome);
  }

  logout() {
    localStorage.clear();
    this.tokenSubject.next(null);
    this.userNameSubject.next(null);
    this.userImageSubject.next(null);
  }
}