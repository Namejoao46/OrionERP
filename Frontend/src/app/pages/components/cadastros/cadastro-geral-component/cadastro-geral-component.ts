import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { EmpresaService } from '../../../../core/services/core/empresa.service';
import { NotificationService } from '../../../../core/services/ui/notification.service';

@Component({
  selector: 'app-cadastro-geral',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cadastro-geral-component.html',
  styleUrl: './cadastro-geral-component.css',
})
export class CadastroGeralComponent implements OnInit {
  
  empresa = { 
    nomeFantasia: '', 
    cnpj: '', 
    plano: 'Basico',
    capitalMesAtual: null,
    capitalMesAnterior: null
  };
  
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
  fotoUsuarioArquivo: File | null = null; 

  // Variáveis para armazenar as URLs de preview local das imagens
  logoPreviewUrl: string | null = null;
  fotoPreviewUrl: string | null = null;

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
    console.log('==================================================');
    
    if (this.roleLogado === 'ADMIN_DEV') {
      this.cadastrarEmpresaEMaster();
    } else if (this.roleLogado === 'MASTER') {
      this.cadastrarColaborador();
    }
  }

  onLogoSelected(event: any) {
    const arquivo: File = event.target.files[0];
    if (arquivo) {
      this.logoArquivo = arquivo;
      // Gera o preview local para renderizar na tela imediatamente
      this.logoPreviewUrl = URL.createObjectURL(arquivo);
      console.log('📁 [FILE-LOGO] Arquivo de logo selecionado:', arquivo.name);
    }
  }

  onFotoUsuarioSelected(event: any) {
    const arquivo: File = event.target.files[0];
    if (arquivo) {
      this.fotoUsuarioArquivo = arquivo;
      // Gera o preview local para renderizar na tela imediatamente
      this.fotoPreviewUrl = URL.createObjectURL(arquivo);
      console.log('📁 [FILE-USER] Arquivo de foto selecionado:', arquivo.name);
    }
  }

  private cadastrarEmpresaEMaster() {
    console.log('➡️ [ETAPA 1] Enviando dados da empresa com capitais para EmpresaService...');
    
    this.empresaService.cadastrar(this.empresa, this.logoArquivo).subscribe({
      next: (empresaCriada: any) => {
        console.log('✅ [SUCESSO ETAPA 1] Empresa criada no Back-end! ID:', empresaCriada.id);
        
        const payloadMaster = { 
          ...this.usuario, 
          role: 'MASTER', 
          tipoColaborador: 'MASTER', 
          empresa: { id: empresaCriada.id } 
        };

        console.log('➡️ [ETAPA 2] Preparando inserção do Usuário Master...');
        this.enviarRequisicaoAuth(payloadMaster, 'Empresa e Usuário Master criados com sucesso!');
      },
      error: (err: any) => {
        console.error('❌ [ERRO ETAPA 1] Falha ao cadastrar a empresa.');
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

    this.http.post('http://localhost:8080/api/colaboradores/cadastrar', payloadColab).subscribe({
      next: (colabCriado: any) => {
        console.log('✅ [SUCESSO] Colaborador cadastrado base concluído. ID gerado:', colabCriado.id);
        
        if (this.fotoUsuarioArquivo && colabCriado.id) {
          this.fazerUploadFotoPerfil(colabCriado.id, 'Colaborador adicionado à sua equipe com sucesso!');
        } else {
          this.notificationService.show('Colaborador adicionado à sua equipe com sucesso!', 'success');
          this.sairDaPagina();
        }
      },
      error: (err: any) => {
        console.error('❌ [ERRO] Falha ao cadastrar o colaborador.');
        const msg = this.extrairMensagemErro(err, 'Erro ao cadastrar colaborador.');
        this.notificationService.show(msg, 'error', 4000);
      }
    });
  }

  private enviarRequisicaoAuth(payload: any, mensagemSucesso: string) {
    this.http.post('http://localhost:8080/api/auth/registrar', payload).subscribe({
      next: (respostaAuth: any) => {
        console.log('✅ [SUCESSO ETAPA 2] Registro de autenticação concluído! ID Usuário:', respostaAuth.id);
        
        if (this.fotoUsuarioArquivo && respostaAuth.id) {
          this.fazerUploadFotoPerfil(respostaAuth.id, mensagemSucesso);
        } else {
          this.notificationService.show(mensagemSucesso, 'success');
          this.sairDaPagina();
        }
      },
      error: (err: any) => {
        console.error('❌ [ERRO ETAPA 2] Falha no endpoint de registro de autenticação.');
        const msg = this.extrairMensagemErro(err, 'Verifique os dados informados.');
        this.notificationService.show(msg, 'error', 4000);
      }
    });
  }

  private fazerUploadFotoPerfil(usuarioId: number, msgSucessoOriginal: string) {
    if (!this.fotoUsuarioArquivo) return;
    
    const formData = new FormData();
    formData.append('foto', this.fotoUsuarioArquivo);

    console.log(`➡️ [MEDIA-UPLOAD] Transmitindo foto para o ID: ${usuarioId}`);
    
    // CORREÇÃO: Alterado de .put para .post e corrigida a rota para /upload-foto para espelhar seu Controller Java
    this.http.post(`http://localhost:8080/api/colaboradores/${usuarioId}/upload-foto`, formData).subscribe({
      next: () => {
        console.log('✅ [SUCESSO MEDIA] Foto de perfil enviada e persistida.');
        this.notificationService.show(msgSucessoOriginal, 'success');
        this.sairDaPagina();
      },
      error: (err) => {
        console.error('⚠️ [AVISO MEDIA] Registro textual salvo, mas falha ao enviar foto.', err);
        this.notificationService.show('Cadastro realizado, porém houve falha ao salvar a imagem.', 'info', 4000);
        this.sairDaPagina();
      }
    });
  }

  private extrairMensagemErro(err: any, mensagemPadrao: string): string {
    if (err.error?.detalhe) return err.error.detalhe;
    if (typeof err.error === 'string') {
      try {
        const erroJson = JSON.parse(err.error);
        return erroJson.detalhe || mensagemPadrao;
      } catch (e) {
        return err.error;
      }
    }
    return err.message || mensagemPadrao;
  }

  private sairDaPagina() {
    this.limparFormulario();
    setTimeout(() => {
      this.router.navigate(['/dashboard']); 
    }, 1500);
  }

  private limparFormulario() {
    this.usuario = { 
      login: '', senha: '', nome: '', sobrenome: '', cpf: '', 
      dataNascimento: '', endereco: '', cargo: '', matricula: '', tipoColaborador: ''
    };
    this.empresa = { nomeFantasia: '', cnpj: '', plano: 'Basico', capitalMesAtual: null, capitalMesAnterior: null };
    this.logoArquivo = null;
    this.fotoUsuarioArquivo = null;
    this.logoPreviewUrl = null;
    this.fotoPreviewUrl = null;

    const logoInput = document.getElementById('logoInput') as HTMLInputElement;
    if (logoInput) logoInput.value = '';

    const fotoInput = document.getElementById('fotoUsuarioInput') as HTMLInputElement;
    if (fotoInput) fotoInput.value = '';
  }
}