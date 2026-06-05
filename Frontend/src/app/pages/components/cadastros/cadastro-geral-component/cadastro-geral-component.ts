import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { EmpresaService } from '../../../../core/services/empresa.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-cadastro-geral',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cadastro-geral-component.html',
  styleUrl: './cadastro-geral-component.css',
})
export class CadastroGeralComponent implements OnInit {
  // Objeto Empresa espelhado com o Back-end
  empresa = { nomeFantasia: '', cnpj: '', plano: 'Basico' };
  
  // 🚀 EXPANDIDO: Objeto usuário contendo TODOS os atributos exigidos pela entidade Java/Banco
  usuario = { 
    login: '', 
    senha: '', 
    nome: '', 
    sobrenome: '', 
    cpf: '', 
    dataNascimento: '', 
    endereco: '', 
    cargo: '', 
    matricula: '',
    tipoColaborador: ''
  };
  
  roleLogado: string = '';
  logoArquivo: File | null = null;

  constructor(
    private http: HttpClient, 
    private empresaService: EmpresaService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router 
  ) {}

  ngOnInit() {
    this.roleLogado = this.authService.getRole(); 
    console.log('🔍 [INIT] Componente carregado. Perfil do usuário logado:', this.roleLogado);
  }

  salvar() {
    console.log('==================================================');
    console.log('🏁 [START] INICIANDO O PROCESSO DE SALVAMENTO');
    console.log('➡️ Quem está tentando cadastrar (Role):', this.roleLogado);
    console.log('📦 Estado atual do objeto "empresa":', JSON.stringify(this.empresa));
    console.log('📦 Estado atual do objeto "usuario" (Senha omitida):', { ...this.usuario, senha: '***' });
    console.log('==================================================');
    
    if (this.roleLogado === 'ADMIN_DEV') {
      this.cadastrarEmpresaEMaster();
    } else if (this.roleLogado === 'MASTER') {
      this.cadastrarColaborador();
    }
  }

  onFileSelected(event: any) {
    const arquivo: File = event.target.files[0];
    if (arquivo) {
      this.logoArquivo = arquivo;
      console.log('📁 [FILE] Arquivo de logo selecionado:', arquivo.name, `(${arquivo.size} bytes)`);
    }
  }

  private cadastrarEmpresaEMaster() {
    console.log('➡️ [ETAPA 1] Enviando dados da empresa para EmpresaService...');
    console.log('➡️ Dados enviados (Payload):', this.empresa);
    
    this.empresaService.cadastrar(this.empresa, this.logoArquivo).subscribe({
      next: (empresaCriada: any) => {
        console.log('✅ [SUCESSO ETAPA 1] Empresa criada no Back-end!');
        console.log('↩️ Retorno do servidor (Objeto salvo):', empresaCriada);
        
        // Montando o payload do usuário Master acoplando TODOS os campos digitados
        const payloadMaster = { 
          ...this.usuario, 
          role: 'MASTER', 
          tipoColaborador: 'MASTER', // Dono/Master assume a string MASTER por padrão
          empresa: { id: empresaCriada.id } 
        };

        console.log('➡️ [ETAPA 2] Preparando inserção do Usuário Master...');
        this.enviarRequisicaoAuth(payloadMaster, 'Empresa e Usuário Master criados com sucesso!');
      },
      error: (err: any) => {
        console.error('❌ [ERRO ETAPA 1] Falha ao cadastrar a empresa.');
        console.error('↩️ Detalhes técnicos do erro recebido:', err);
        
        const msg = this.extrairMensagemErro(err, 'Erro ao cadastrar empresa.');
        this.notificationService.show(msg, 'error', 4000);
      }
    });
  }

  private cadastrarColaborador() {
    const dadosLogado = this.authService.getUsuarioLogado();
    console.log('ℹ️ Recuperando ID da empresa do administrador logado:', dadosLogado?.empresa?.id);
    
    const payloadColab = { 
      ...this.usuario, 
      role: 'COLABORADOR', 
      empresa: { id: dadosLogado.empresa.id } 
    };

    console.log('➡️ Enviando requisição POST para /api/colaboradores/cadastrar');
    console.log('➡️ Payload completo enviado:', JSON.stringify({ ...payloadColab, senha: '***' }));

    this.http.post('http://localhost:8080/api/colaboradores/cadastrar', payloadColab).subscribe({
      next: (colabCriado: any) => {
        console.log('✅ [SUCESSO] Colaborador cadastrado com sucesso!');
        console.log('↩️ Retorno do servidor (Objeto salvo):', colabCriado);
        
        this.notificationService.show('Colaborador adicionado à sua equipe com sucesso!', 'success');
        this.sairDaPagina();
      },
      error: (err: any) => {
        console.error('❌ [ERRO] Falha ao cadastrar o colaborador.');
        console.error('↩️ Detalhes técnicos do erro recebido:', err);
        
        const msg = this.extrairMensagemErro(err, 'Erro ao cadastrar colaborador.');
        this.notificationService.show(msg, 'error', 4000);
      }
    });
  }

  private enviarRequisicaoAuth(payload: any, mensagemSucesso: string) {
    console.log('➡️ Disparando requisição POST para /api/auth/registrar');
    console.log('➡️ Payload completo enviado para Auth:', JSON.stringify({ ...payload, senha: '***' }));

    this.http.post('http://localhost:8080/api/auth/registrar', payload).subscribe({
      next: (respostaAuth: any) => {
        console.log('✅ [SUCESSO ETAPA 2] Registro de autenticação concluído com êxito!');
        console.log('↩️ Retorno do servidor:', respostaAuth);
        
        this.notificationService.show(mensagemSucesso, 'success');
        this.sairDaPagina();
      },
      error: (err: any) => {
        console.error('❌ [ERRO ETAPA 2] Falha no endpoint de registro de autenticação.');
        console.error('↩️ Detalhes técnicos do erro recebido:', err);
        
        const msg = this.extrairMensagemErro(err, 'Verifique os dados informados.');
        this.notificationService.show(msg, 'error', 4000);
      }
    });
  }

  private extrairMensagemErro(err: any, mensagemPadrao: string): string {
    console.log('🔍 [ANALISADOR DE ERRO] Investigando a estrutura do erro retornado...');
    
    if (err.error?.detalhe) {
      console.log('💡 Mensagem capturada de "err.error.detalhe":', err.error.detalhe);
      return err.error.detalhe;
    } 
    
    if (typeof err.error === 'string') {
      try {
        const erroJson = JSON.parse(err.error);
        console.log('💡 Mensagem capturada via parse da String JSON:', erroJson.detalhe);
        return erroJson.detalhe || mensagemPadrao;
      } catch (e) {
        console.log('💡 Erro identificado como String simples (Texto puro):', err.error);
        return err.error;
      }
    }

    console.log('⚠️ Estrutura desconhecida ou vazia. Utilizando fallback (mensagem de segurança):', err.message);
    return err.message || mensagemPadrao;
  }

  private sairDaPagina() {
    console.log('🔄 [REDIRECT] Agendando redirecionamento para a Dashboard...');
    this.limparFormulario();
    setTimeout(() => {
      this.router.navigate(['/dashboard']); 
    }, 1500);
  }

  private limparFormulario() {
    console.log('🧹 [CLEAN] Limpando dados do formulário e resetando estados...');
    this.usuario = { 
      login: '', 
      senha: '', 
      nome: '', 
      sobrenome: '', 
      cpf: '', 
      dataNascimento: '', 
      endereco: '', 
      cargo: '', 
      matricula: '',
      tipoColaborador: ''
    };
    this.empresa = { nomeFantasia: '', cnpj: '', plano: 'Basico' };
    this.logoArquivo = null;

    const fileInput = document.getElementById('logoInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}