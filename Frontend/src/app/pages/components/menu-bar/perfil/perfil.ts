import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, Subscription, map, take } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { ModalService } from '../../../../core/services/modal.service';
import { ColaboradorService } from '../../../../core/services/colaborador.service';
import { CardFlutuante } from '../../card-flutuante/card-flutuante';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, CardFlutuante],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit, OnDestroy {
  @ViewChild('cardPerfil') cardPerfil!: CardFlutuante;

  userName$: Observable<string | null>;
  userImage$: Observable<SafeUrl | null>;
  empresaNome$: Observable<string | null>;
  empresaLogo$: Observable<SafeUrl | null>;

  editandoPerfil = false;
  isMaster = false;

  colaboradorForm: any = {
    nome: '',
    sobrenome: '',
    cargo: '',
    cpf: '',
    matricula: '',
    endereco: '',
    tipoColaborador: '',
    dataNascimento: ''
  };

  private subPerfil?: Subscription;

  constructor(
    private modalService: ModalService,
    private authService: AuthService,
    private colaboradorService: ColaboradorService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {
    console.log('============ [Perfil Component] -> Construtor Inicializado ============');
    
    this.userName$ = this.authService.userName$;
    this.userImage$ = this.authService.userImage$.pipe(
      map(b => {
        console.log(`[Perfil Component] Pipe userImage$ interceptado. Tamanho base64: ${b ? b.length : 0}`);
        return this.sanitizarImagem(b);
      })
    );
    this.empresaNome$ = this.authService.empresaNome$;
    this.empresaLogo$ = this.authService.empresaLogo$.pipe(map(b => this.sanitizarImagem(b)));
    
    const roleAtual = this.authService.getRole();
    console.log('[Perfil Component] Role atual do usuário capturada:', roleAtual);
    this.isMaster = roleAtual === 'MASTER' || roleAtual === 'ADMIN_DEV';
    console.log('========================================================================');
  }

  ngOnInit(): void {
    console.log('[Perfil Component] ngOnInit() configurando escuta do ModalService.');
    this.subPerfil = this.modalService.abrirPerfil$.subscribe(() => {
      console.log('============= [Perfil Component] -> Evento abrirPerfil$ Disparado! =============');
      this.cardPerfil.abrir();
      this.carregarDadosIniciais();
    });
  }

  ngOnDestroy(): void {
    console.log('[Perfil Component] ngOnDestroy() invocado. Cancelando inscrições de RxJS...');
    this.subPerfil?.unsubscribe();
  }

  carregarDadosIniciais() {
    console.log('============= [Perfil Component] -> Executando carregarDadosIniciais() =============');
    this.userName$.pipe(take(1)).subscribe(nome => {
      setTimeout(() => {
        console.log('[Perfil Component] Mapeando chaves do LocalStorage para preenchimento do formulário...');
        
        this.colaboradorForm.nome = nome || localStorage.getItem('userName') || '';
        this.colaboradorForm.sobrenome = localStorage.getItem('userSobrenome') || '';
        this.colaboradorForm.cargo = localStorage.getItem('userCargo') || '';
        this.colaboradorForm.cpf = localStorage.getItem('userCpf') || '';
        this.colaboradorForm.matricula = localStorage.getItem('userMatricula') || '';
        this.colaboradorForm.endereco = localStorage.getItem('userEndereco') || '';
        this.colaboradorForm.tipoColaborador = localStorage.getItem('userTipoColaborador') || '';
        this.colaboradorForm.dataNascimento = localStorage.getItem('userDataNascimento') || '';
        
        console.log('[Perfil Component] Estado atualizado do formulário carregado na tela:', JSON.stringify(this.colaboradorForm, null, 2));
        this.cdr.markForCheck();
        console.log('=====================================================================================');
      });
    });
  }

  alternarEdicao() {
    this.editandoPerfil = !this.editandoPerfil;
    console.log(`[Perfil Component] Modo de edição alternado. Editando agora? -> ${this.editandoPerfil}`);
    if (!this.editandoPerfil) {
      console.log('[Perfil Component] Edição cancelada. Reincorporando dados de segurança originais.');
      this.carregarDadosIniciais();
    }
  }

  salvarPerfilCompleto() {
    console.log('============= [Perfil Component] -> Click detectado em Gravar Perfil =============');
    console.log('Estado cru capturado do formulário no HTML:', JSON.stringify(this.colaboradorForm, null, 2));
    
    this.authService.userId$.pipe(take(1)).subscribe(idFromService => {
      const id = idFromService || Number(localStorage.getItem('userId'));
      const idSeguro = id ? id : 0;
      console.log(`[Perfil Component] Resolvendo ID do usuário para rota PUT. ID Final: ${idSeguro}`);

      // PREVENÇÃO DE PERDA DE DADOS EM TRANSIÇÃO
      const payloadCompleto = {
        ...this.colaboradorForm,
        foto: localStorage.getItem('userImage') || null,
        login: localStorage.getItem('userLogin') || undefined
      };
      
      console.log('[Perfil Component] Payload encapsulado e enviado para o ColaboradorService:', JSON.stringify(payloadCompleto, null, 2));

      this.colaboradorService.atualizarPerfil(idSeguro, payloadCompleto).subscribe({
        next: (resposta: any) => {
          console.log('============= [Perfil Component] <- Retorno de Sucesso HTTP PUT =============');
          console.log('Objeto completo devolvido pela persistência do banco:', resposta);
          
          if (resposta.id) {
            console.log(`[Perfil Component] Sincronizando ID no Storage se alterado: ${resposta.id}`);
            localStorage.setItem('userId', resposta.id.toString());
          }
          
          console.log('[Perfil Component] Sincronizando strings locais de exibição...');
          this.authService.atualizarNomeEmMemoria(resposta.nome);
          localStorage.setItem('userSobrenome', resposta.sobrenome || '');
          localStorage.setItem('userCargo', resposta.cargo || '');
          localStorage.setItem('userCpf', resposta.cpf || '');
          localStorage.setItem('userMatricula', resposta.matricula || '');
          localStorage.setItem('userEndereco', resposta.endereco || '');
          localStorage.setItem('userTipoColaborador', resposta.tipoColaborador || '');
          localStorage.setItem('userDataNascimento', resposta.dataNascimento || '');

          // Aplica o espelho da resposta no formulário local
          this.colaboradorForm = { ...resposta };

          alert('Sucesso! As informações do seu perfil foram updated no OrionERP.');
          this.editandoPerfil = false;
          this.cdr.detectChanges();
          console.log('==================================================================================');
        },
        error: (err) => {
          console.error('============= [Perfil Component] ! Falha Retornada no PUT =============');
          console.error('Detalhamento técnico da pane no salvamento:', err);
          alert('Houve um erro com o servidor ao tentar salvar suas alterações.');
          console.log('========================================================================');
        }
      });
    });
  }

  onFotoSelecionada(event: Event) {
    console.log('============= [Perfil Component] -> Evento (change) acionado no Input File =============');
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const arquivo: File = input.files[0];
      console.log('[Perfil Component] Metadados do arquivo carregado via input:', {
        name: arquivo.name,
        size: arquivo.size,
        type: arquivo.type
      });
      
      this.authService.userId$.pipe(take(1)).subscribe(idFromService => {
        // Tenta pegar do Service, se não achar tenta 'userId', se não tenta 'id' (fallback do login de admin)
        const id = idFromService || 
                   Number(localStorage.getItem('userId')) || 
                   Number(localStorage.getItem('id'));
        
        console.log(`[Perfil Component] ID extraído para envio da foto via FormData: ${id}`);
        
        if (!id || id === 0) {
          console.error('[Perfil Component] Abortando upload de foto: ID do usuário está totalmente nulo, zero ou ausente.');
          alert('Erro interno: Não foi possível obter seu ID de usuário para upload. Tente fazer logout e login novamente.');
          return;
        }

        this.colaboradorService.uploadFoto(id, arquivo).subscribe({
          next: (responseString: string) => {
            console.log('============= [Perfil Component] <- Retorno de Sucesso do Upload de Foto =============');
            console.log('Resposta pura do Backend:', responseString);
            
            console.log('[Perfil Component] Iniciando FileReader para espelhar imagem local instantaneamente...');
            const reader = new FileReader();
            reader.onload = () => {
              const completoBase64 = reader.result as string;
              const rawBase64 = completoBase64.split(',')[1];
              console.log(`[Perfil Component] FileReader concluído. Tamanho da string limpa enviada à memória: ${rawBase64.length}`);
              
              this.authService.atualizarFotoEmMemoria(rawBase64);
              this.cdr.detectChanges();
              
              alert('Foto de perfil alterada com sucesso!');
              console.log('========================================================================================');
            };
            reader.readAsDataURL(arquivo);
          },
          error: (err) => {
            console.error('============= [Perfil Component] ! Falha no Fluxo de Upload =============');
            console.error('Dados da falha no upload da foto:', err);
            alert('Não foi possível atualizar a foto de perfil. Verifique o console do backend.');
            console.log('===========================================================================');
          }
        });
      });
    }
  }

  private sanitizarImagem(base64: string | null): SafeUrl | null {
    if (!base64 || base64 === 'null' || base64.trim() === '') {
      return this.sanitizer.bypassSecurityTrustUrl('https://cdn-icons-png.flaticon.com/512/149/149071.png');
    }
    const prefixo = base64.startsWith('data:image') ? '' : 'data:image/jpeg;base64,';
    return this.sanitizer.bypassSecurityTrustUrl(`${prefixo}${base64}`);
  }
}