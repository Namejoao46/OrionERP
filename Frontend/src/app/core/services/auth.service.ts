import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('token'));
  private userNameSubject = new BehaviorSubject<string | null>(localStorage.getItem('userName'));
  private userImageSubject = new BehaviorSubject<string | null>(localStorage.getItem('userImage'));
  private userRoleSubject = new BehaviorSubject<string | null>(localStorage.getItem('userRole'));

  token$ = this.tokenSubject.asObservable();
  userName$ = this.userNameSubject.asObservable();
  userImage$ = this.userImageSubject.asObservable();
  userRole$ = this.userRoleSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('AuthService iniciado. Role carregada:', this.userRoleSubject.value);
  }

  getRole(): string {
    return this.userRoleSubject.value || '';
  }

  // Método que estava faltando no erro do terminal
  getUsuarioLogado(): any {
    return {
      token: this.tokenSubject.value,
      nome: this.userNameSubject.value,
      role: this.userRoleSubject.value,
      empresa: { id: localStorage.getItem('empresaId') } 
    };
  }

  login(login: string, senha: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { login, senha });
  }

  // ADICIONE ESTE MÉTODO AQUI:
  isAuthenticated(): boolean {
    // Retorna true se houver um token, false se não houver
    return !!this.tokenSubject.value;
  }

  setUserData(token: string, nome: string, foto: string | null, login: string, role: string) {

    console.log("--- DEBUG LOGIN ---");
    console.log("Token recebido:", token);
    console.log("Nome recebido:", nome);
    console.log("ROLE RECEBIDA:", role);
    console.log("-------------------");

    localStorage.setItem('token', token);
    localStorage.setItem('userName', nome);
    localStorage.setItem('username', login);
    localStorage.setItem('userRole', role);

    if (foto) {
      const fotoLimpa = foto.replace(/\s/g, '');
      localStorage.setItem('userImage', fotoLimpa);
      this.userImageSubject.next(fotoLimpa);
    } else {
      localStorage.removeItem('userImage');
      this.userImageSubject.next(null);
    }

    this.tokenSubject.next(token);
    this.userNameSubject.next(nome);
    this.userRoleSubject.next(role);
  }

  logout() {
    localStorage.clear();
    this.tokenSubject.next(null);
    this.userNameSubject.next(null);
    this.userImageSubject.next(null);
    this.userRoleSubject.next(null);
  }
}