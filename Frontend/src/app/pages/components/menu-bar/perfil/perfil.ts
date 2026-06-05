import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, Subscription, map, take } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { ModalService } from '../../../../core/services/modal.service';
import { ColaboradorService } from '../../../../core/services/colaborador.service'; // Ajuste o caminho
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

  // Variáveis para controle de edição local
  editandoNome = false;
  nomeEditado = '';
  
  // Dados adicionais mockados ou vindos do modelo que você forneceu
  userCargo = 'Desenvolvedor';
  userCpf = '000.000.000-00';
  userMatricula = 'ORION-2026';

  private subPerfil?: Subscription;

  constructor(
    private modalService: ModalService,
    private authService: AuthService,
    private colaboradorService: ColaboradorService,
    private sanitizer: DomSanitizer
  ) {
    this.userName$ = this.authService.userName$;
    this.userImage$ = this.authService.userImage$.pipe(
      map(base64 => this.sanitizarImagem(base64))
    );
    this.empresaNome$ = this.authService.empresaNome$;
    this.empresaLogo$ = this.authService.empresaLogo$.pipe(
      map(base64 => this.sanitizarImagem(base64))
    );
  }

  ngOnInit(): void {
    this.subPerfil = this.modalService.abrirPerfil$.subscribe(() => {
      this.cardPerfil.abrir();
      // Inicializa o input com o nome atual do usuário
      this.userName$.pipe(take(1)).subscribe(nome => this.nomeEditado = nome || '');
    });
  }

  ngOnDestroy(): void {
    this.subPerfil?.unsubscribe();
  }

  // Ativa o modo de edição do nome
  alternarEdicaoNome() {
    this.editandoNome = !this.editandoNome;
  }

  // Salva a alteração do Nome
  salvarNome() {
    if (this.nomeEditado.trim()) {
      this.authService.atualizarNomeEmMemoria(this.nomeEditado);
      this.editandoNome = false;
      // Opcional: Chamar uma rota de alteração de dados cadastrais no backend aqui futuramente
    }
  }

  // Detecta a nova foto selecionada pelo usuário
  onFotoSelecionada(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const arquivo: File = input.files[0];
      
      // Obtém o id atual do usuário de forma reativa e segura
      this.authService.userId$.pipe(take(1)).subscribe(id => {
        if (!id) {
          alert('Erro: ID do usuário não encontrado. Faça login novamente.');
          return;
        }

        // 1. Envia a foto para a API do seu Spring Boot (/api/colaboradores/{id}/upload-foto)
        this.colaboradorService.uploadFoto(id, arquivo).subscribe({
          next: (res) => {
            // 2. Converte localmente em base64 apenas para renderização instantânea do preview na tela
            const reader = new FileReader();
            reader.onload = () => {
              const base64Resultado = reader.result as string;
              // Remove o prefixo "data:image/...;base64," para manter o padrão puro do seu banco
              const stringBase64Pura = base64Resultado.split(',')[1];
              this.authService.atualizarFotoEmMemoria(stringBase64Pura);
            };
            reader.readAsDataURL(arquivo);
          },
          error: (err) => {
            console.error('Erro no upload da foto:', err);
            alert('Não foi possível atualizar a foto no servidor.');
          }
        });
      });
    }
  }

  private sanitizarImagem(base64: string | null): SafeUrl | null {
    if (!base64) return null;
    const prefixo = base64.startsWith('data:image') ? '' : 'data:image/jpeg;base64,';
    return this.sanitizer.bypassSecurityTrustUrl(`${prefixo}${base64}`);
  }
}