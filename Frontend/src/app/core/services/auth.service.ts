import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { EmpresaService } from './empresa.service'; 

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
    console.log('============= [AuthService] INICIALIZANDO CONSTRUTOR =============');
    const idSalvo = localStorage.getItem('empresaId');
    const roleSalva = localStorage.getItem('userRole');
    
    console.log('Estados restaurados do LocalStorage:', {
      userId: localStorage.getItem('userId'),
      userName: localStorage.getItem('userName'),
      userRole: roleSalva,
      empresaId: idSalvo,
      existeFoto: !!localStorage.getItem('userImage')
    });

    if (idSalvo && roleSalva !== 'SUPER_ADMIN') {
      console.log(`[AuthService] Disparando busca automática da empresa vinculada ID: ${idSalvo}`);
      this.carregarDadosEmpresa(idSalvo);
    }
    console.log('==================================================================');
  }

  login(login: string, senha: string): Observable<any> {
    console.log('============= [AuthService] -> ENVIANDO REQUISIÇÃO DE LOGIN =============');
    console.log('Login informado:', login);
    
    return this.http.post<any>(`${this.apiUrl}/login`, { login, senha }).pipe(
      tap({
        next: (res) => {
          console.log('============= [AuthService] <- RESPOSTA DE LOGIN SUCESSO =============');
          console.log('Dados crus retornados pelo endpoint de login:', res);
          this.setUserData(res);
          console.log('========================================================================');
        },
        error: (err) => {
          console.error('============= [AuthService] ! ERRO NA AUTENTICAÇÃO DE LOGIN =============');
          console.error('Status:', err.status);
          console.error('Detalhe do erro de autenticação:', err.error);
          console.log('========================================================================');
        }
      })
    );
  }

  setUserData(dados: any) {
    console.log('============= [AuthService] EXECUTANDO MENSURAÇÃO E PERSISTÊNCIA DADOS (setUserData) =============');
    if (!dados) {
      console.error('[AuthService] Erro Crítico: Nenhum dado foi fornecido para setUserData.');
      return;
    }

    // Alvo da correção: extrai de 'dados.id' ou fallback para 'dados.userId'
    const idUsuario = dados.id || dados.userId;
    console.log('ID mapeado e resolvido do back-end para indexação:', idUsuario);

    if (idUsuario) {
      localStorage.setItem('userId', idUsuario.toString());
      this.userIdSubject.next(Number(idUsuario));
    } else {
      console.warn('[AuthService] Atenção: O payload do servidor não trouxe propriedades válidas de ID de usuário.');
    }

    if (dados.token) localStorage.setItem('token', dados.token);
    if (dados.nome) localStorage.setItem('userName', dados.nome);
    
    // GUARDAR DEMAIS INFORMAÇÕES LOGO NO LOGIN (Evita formulário em branco no primeiro acesso)
    if (dados.sobrenome) localStorage.setItem('userSobrenome', dados.sobrenome);
    if (dados.cargo) localStorage.setItem('userCargo', dados.cargo);
    if (dados.cpf) localStorage.setItem('userCpf', dados.cpf);
    if (dados.matricula) localStorage.setItem('userMatricula', dados.matricula);
    if (dados.endereco) localStorage.setItem('userEndereco', dados.endereco);
    if (dados.tipoColaborador) localStorage.setItem('userTipoColaborador', dados.tipoColaborador);
    if (dados.dataNascimento) localStorage.setItem('userDataNascimento', dados.dataNascimento);

    this.tokenSubject.next(dados.token || null);
    this.userNameSubject.next(dados.nome || null);

    if (dados.foto) {
      const fotoLimpa = dados.foto.replace(/\s/g, '');
      console.log(`[AuthService] Foto recebida. Tamanho da String Base64 limpa: ${fotoLimpa.length} caracteres.`);
      localStorage.setItem('userImage', fotoLimpa);
      this.userImageSubject.next(fotoLimpa);
    } else {
      console.log('[AuthService] Campo de foto veio nulo/vazio do servidor.');
    }

    if (dados.role) {
      const roleLimpa = dados.role.toString().replace('ROLE_', '').trim().toUpperCase();
      console.log('[AuthService] Nível de acesso (Role) mapeado:', roleLimpa);
      localStorage.setItem('userRole', roleLimpa);
      this.userRoleSubject.next(roleLimpa);
    }
    console.log('==================================================================================================');
  }

  private carregarDadosEmpresa(empresaId: number | string) {
    this.empresaService.buscarPorId(empresaId).subscribe({
      next: (empresa) => {
        console.log('============= [AuthService] <- EMPRESA PARCEIRA LOCALIZADA =============');
        console.log('Dados brutos da empresa retornados:', empresa);
        
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
        console.log('========================================================================');
      },
      error: (err) => {
        console.error('============= [AuthService] ! ERRO BUSCA DE EMPRESA VINCULADA =============');
        console.error(err);
        console.log('===========================================================================');
      }
    });
  }

  isAuthenticated(): boolean {
    const autenticado = !!this.tokenSubject.value;
    console.log('[AuthService] Verificação isAuthenticated():', autenticado);
    return autenticado;
  }

  getRole(): string {
    return this.userRoleSubject.value || '';
  }

  getUsuarioLogado(): any {
    const estadoAtual = {
      token: this.tokenSubject.value,
      nome: this.userNameSubject.value,
      role: this.userRoleSubject.value,
      empresaId: localStorage.getItem('empresaId'),
      empresaNome: this.empresaNomeSubject.value,
      empresaLogo: this.empresaLogoSubject.value
    };
    console.log('[AuthService] Captura instantânea de getUsuarioLogado():', estadoAtual);
    return estadoAtual;
  }

  atualizarNomeEmMemoria(novoNome: string) {
    console.log(`[AuthService] Atualizando nome de exibição em memória: "${novoNome}"`);
    localStorage.setItem('userName', novoNome);
    this.userNameSubject.next(novoNome);
  }

  atualizarDadosPerfilEmMemoria(respostaBack: any) {
    console.log('[AuthService] Sincronizando dados adicionais do perfil no LocalStorage:', respostaBack);
    if (respostaBack.sobrenome) localStorage.setItem('userSobrenome', respostaBack.sobrenome);
    if (respostaBack.cargo) localStorage.setItem('userCargo', respostaBack.cargo);
    if (respostaBack.cpf) localStorage.setItem('userCpf', respostaBack.cpf);
    if (respostaBack.matricula) localStorage.setItem('userMatricula', respostaBack.matricula);
    if (respostaBack.endereco) localStorage.setItem('userEndereco', respostaBack.endereco);
  }

  atualizarFotoEmMemoria(base64Foto: string) {
    console.log('[AuthService] Injetando nova foto Base64 reativa na memória...');
    const fotoLimpa = base64Foto.replace(/\s/g, '');
    localStorage.setItem('userImage', fotoLimpa);
    this.userImageSubject.next(fotoLimpa);
  }

  logout() {
    console.warn('============= [AuthService] DISPARANDO LOGOUT / LIMPEZA DE SESSÃO =============');
    localStorage.clear();
    this.userIdSubject.next(null);
    this.tokenSubject.next(null);
    this.userNameSubject.next(null);
    this.userImageSubject.next(null);
    this.userRoleSubject.next(null);
    this.empresaNomeSubject.next(null);
    this.empresaLogoSubject.next(null);
    console.log('[AuthService] Limpeza executada. Todos os Subjects voltaram para null.');
    console.log('================================================================================');
  }
}