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

  private empresaNomeSubject = new BehaviorSubject<string | null>(localStorage.getItem('empresaNome'));
  private empresaLogoSubject = new BehaviorSubject<string | null>(localStorage.getItem('empresaLogo'));

  token$ = this.tokenSubject.asObservable();
  userName$ = this.userNameSubject.asObservable();
  userImage$ = this.userImageSubject.asObservable();
  userRole$ = this.userRoleSubject.asObservable();

  empresaNome$ = this.empresaNomeSubject.asObservable();
  empresaLogo$ = this.empresaLogoSubject.asObservable();

  constructor(
    private http: HttpClient, 
    private empresaService: EmpresaService
  ) {
    const idSalvo = localStorage.getItem('empresaId');
    const roleSalva = localStorage.getItem('userRole');
    
    // Se não for Super Admin e tiver ID salvo no LocalStorage (F5), restaura os dados da empresa
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
    localStorage.setItem('token', dados.token);
    localStorage.setItem('userName', dados.nome);
    localStorage.setItem('userRole', dados.role);
    
    this.tokenSubject.next(dados.token);
    this.userNameSubject.next(dados.nome);
    this.userRoleSubject.next(dados.role);

    if (dados.foto) {
      const fotoLimpa = dados.foto.replace(/\s/g, '');
      localStorage.setItem('userImage', fotoLimpa);
      this.userImageSubject.next(fotoLimpa);
    }

    // 🚀 Validação Estratégica da Empresa e Regra do Super Admin
    if (dados.role === 'SUPER_ADMIN' || !dados.empresaId) {
      // É Administrador Orion global: Limpa os registros locais para herdar o padrão visual neutro
      localStorage.removeItem('empresaId');
      localStorage.removeItem('empresaNome');
      localStorage.removeItem('empresaLogo');
      this.empresaNomeSubject.next(null);
      this.empresaLogoSubject.next(null);
    } else {
      // É Empresa Cliente / Master normal: Salva o vínculo e solicita carga ao EmpresaService
      localStorage.setItem('empresaId', dados.empresaId.toString());
      this.carregarDadosEmpresa(dados.empresaId);
    }
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
      error: (err) => console.error('Erro ao buscar dados complementares da empresa parceira:', err)
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

  logout() {
    localStorage.clear();
    this.tokenSubject.next(null);
    this.userNameSubject.next(null);
    this.userImageSubject.next(null);
    this.userRoleSubject.next(null);
    
    // 🔥 Reseta o estado reativo corporativo no encerramento da sessão
    this.empresaNomeSubject.next(null);
    this.empresaLogoSubject.next(null);
  }
}