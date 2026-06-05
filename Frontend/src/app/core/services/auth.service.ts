import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { EmpresaService } from './empresa.service'; // Ajuste o caminho de importação se necessário

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('token'));
  private userNameSubject = new BehaviorSubject<string | null>(localStorage.getItem('userName'));
  private userImageSubject = new BehaviorSubject<string | null>(localStorage.getItem('userImage'));
  private userRoleSubject = new BehaviorSubject<string | null>(localStorage.getItem('userRole'));
  private userIdSubject = new BehaviorSubject<number | null>(
    localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null
  );

  private empresaNomeSubject = new BehaviorSubject<string | null>(localStorage.getItem('empresaNome'));
  private empresaLogoSubject = new BehaviorSubject<string | null>(localStorage.getItem('empresaLogo'));

  token$ = this.tokenSubject.asObservable();
  userName$ = this.userNameSubject.asObservable();
  userImage$ = this.userImageSubject.asObservable();
  userRole$ = this.userRoleSubject.asObservable();
  userId$ = this.userIdSubject.asObservable();

  empresaNome$ = this.empresaNomeSubject.asObservable();
  empresaLogo$ = this.empresaLogoSubject.asObservable();

  constructor(
    private http: HttpClient, 
    private empresaService: EmpresaService
  ) {
    const idSalvo = localStorage.getItem('empresaId');
    const roleSalva = localStorage.getItem('userRole');
    
    if (idSalvo && roleSalva !== 'SUPER_ADMIN') {
      this.carregarDadosEmpresa(idSalvo);
    }
  }

  login(login: string, senha: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { login, senha }).pipe(
      tap(res => {
        this.setUserData(res);
      })
    );
  }

  setUserData(dados: any) {
    if (!dados || !dados.role) return;

    const roleLimpa = dados.role.toString().replace('ROLE_', '').trim().toUpperCase();

    localStorage.setItem('token', dados.token);
    localStorage.setItem('userName', dados.nome);
    localStorage.setItem('userRole', roleLimpa);
    
    // Salva o ID do colaborador logado
    if (dados.id) {
      localStorage.setItem('userId', dados.id.toString());
      this.userIdSubject.next(dados.id);
    }

    this.tokenSubject.next(dados.token);
    this.userNameSubject.next(dados.nome);
    this.userRoleSubject.next(roleLimpa);

    if (dados.foto) {
      const fotoLimpa = dados.foto.replace(/\s/g, '');
      localStorage.setItem('userImage', fotoLimpa);
      this.userImageSubject.next(fotoLimpa);
    }
    // ... resto do seu método carregarDadosEmpresa ...
  }

  private carregarDadosEmpresa(empresaId: number | string) {
    this.empresaService.buscarPorId(empresaId).subscribe({
      next: (empresa) => {
        const nome = empresa.nomeFantasia || empresa.nome;
        const logo = empresa.logo;

        if (nome) {
          localStorage.setItem('empresaNome', nome);
          this.empresaNomeSubject.next(nome);
        }
        if (logo) {
          const logoLimpa = logo.replace(/\s/g, '');
          localStorage.setItem('empresaLogo', logoLimpa);
          this.empresaLogoSubject.next(logoLimpa);
        }
      },
      error: (err) => console.error('Erro ao buscar dados da empresa parceira:', err)
    });
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
      empresaId: localStorage.getItem('empresaId'),
      empresaNome: this.empresaNomeSubject.value,
      empresaLogo: this.empresaLogoSubject.value
    };
  }

  atualizarNomeEmMemoria(novoNome: string) {
    localStorage.setItem('userName', novoNome);
    this.userNameSubject.next(novoNome);
  }

  atualizarFotoEmMemoria(base64Foto: string) {
    const fotoLimpa = base64Foto.replace(/\s/g, '');
    localStorage.setItem('userImage', fotoLimpa);
    this.userImageSubject.next(fotoLimpa);
  }

  logout() {
    localStorage.clear();
    this.userIdSubject.next(null);
    this.tokenSubject.next(null);
    this.userNameSubject.next(null);
    this.userImageSubject.next(null);
    this.userRoleSubject.next(null);
    this.empresaNomeSubject.next(null);
    this.empresaLogoSubject.next(null);
  }
}