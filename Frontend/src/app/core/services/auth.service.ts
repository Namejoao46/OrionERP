import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  // Subjects para reagir a mudanças de estado em tempo real no app
  private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('token'));
  private userNameSubject = new BehaviorSubject<string | null>(localStorage.getItem('userName'));
  private userImageSubject = new BehaviorSubject<string | null>(localStorage.getItem('userImage'));
  private userRoleSubject = new BehaviorSubject<string | null>(localStorage.getItem('userRole'));

  // Observables para os componentes assinarem
  token$ = this.tokenSubject.asObservable();
  userName$ = this.userNameSubject.asObservable();
  userImage$ = this.userImageSubject.asObservable();
  userRole$ = this.userRoleSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(login: string, senha: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { login, senha }).pipe(
      tap(res => {
        // Ao logar, já salvamos os dados automaticamente
        this.setUserData(res);
      })
    );
  }

  setUserData(dados: any) {
    // Salva no LocalStorage para persistir após F5
    localStorage.setItem('token', dados.token);
    localStorage.setItem('userName', dados.nome);
    localStorage.setItem('userRole', dados.role);
    
    // Importante: Salvando o ID da empresa vindo do back
    if (dados.empresaId) {
      localStorage.setItem('empresaId', dados.empresaId.toString());
    }

    if (dados.foto) {
      const fotoLimpa = dados.foto.replace(/\s/g, '');
      localStorage.setItem('userImage', fotoLimpa);
      this.userImageSubject.next(fotoLimpa);
    }

    // Notifica todos os componentes interessados
    this.tokenSubject.next(dados.token);
    this.userNameSubject.next(dados.nome);
    this.userRoleSubject.next(dados.role);
  }

  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  getRole(): string {
    return this.userRoleSubject.value || '';
  }

  getUsuarioLogado(): any {
    return {
      token: this.tokenSubject.value,
      nome: this.userNameSubject.value,
      role: this.userRoleSubject.value,
      empresaId: localStorage.getItem('empresaId')
    };
  }

  logout() {
    localStorage.clear();
    this.tokenSubject.next(null);
    this.userNameSubject.next(null);
    this.userImageSubject.next(null);
    this.userRoleSubject.next(null);
  }
}