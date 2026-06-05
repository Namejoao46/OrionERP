import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MenuComponent } from "../menu/menu.component";
import { AuthService } from '../../../core/services/auth.service';
import { MensagemService } from '../../../core/services/mensagem.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CaixaboxService } from '../../../core/services/caixabox.service';
import { CaixaboxOption } from '../caixa-box/caixa-box';
import { Observable, interval, Subscription } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-menu-bar',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, MenuComponent],
  templateUrl: './menu-bar.component.html',
  styleUrl: './menu-bar.component.css'
})
export class MenuBarComponent implements OnInit, OnDestroy {
  userName$: Observable<string | null>;
  userImage$: Observable<SafeUrl | null>;
  
  // Tipagem assíncrona alinhada às streams do AuthService
  empresaNome$: Observable<string | null>;
  empresaLogo$: Observable<SafeUrl | null>;
  
  temNovasMensagens: boolean = false;
  quantidadeNotificacoes: number = 0;
  private qteMensagensAnterior: number = 0;
  private pollSub?: Subscription;

  constructor(
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private caixabox: CaixaboxService,
    private router: Router,
    private mensagemService: MensagemService,
    private notificationService: NotificationService
  ) {
    // Escuta ativa do usuário logado
    this.userName$ = this.authService.userName$;
    this.userImage$ = this.authService.userImage$.pipe(
      map((base64: any) => this.sanitizarImagem(base64))
    );

    // Escuta ativa da empresa (Exibe dinamicamente com base no papel/role de quem logou)
    this.empresaNome$ = this.authService.empresaNome$; 
    this.empresaLogo$ = this.authService.empresaLogo$.pipe(
      map((base64: any) => this.sanitizarImagem(base64))
    );
  }

  private sanitizarImagem(base64: string | null): SafeUrl | null {
    if (!base64) return null;
    const prefixo = base64.startsWith('data:image') ? '' : 'data:image/jpeg;base64,';
    return this.sanitizer.bypassSecurityTrustUrl(`${prefixo}${base64}`);
  }

  ngOnInit(): void {
    this.monitorarMensagens();
    this.atualizarBadgeNotificacoes();
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  monitorarMensagens() {
    this.pollSub = interval(10000).pipe(
      startWith(0),
      switchMap(() => this.mensagemService.contarNaoLidas())
    ).subscribe(total => {
      if (total > this.qteMensagensAnterior) {
        this.notificationService.show('Nova mensagem recebida!', 'info');
      }
      this.qteMensagensAnterior = total;
      this.temNovasMensagens = total > 0;
    });
  }

  atualizarBadgeNotificacoes() {
    const lidas = JSON.parse(localStorage.getItem('notificacoes_lidas') || '[]');
    const todas = [1, 2]; 
    this.quantidadeNotificacoes = todas.filter(id => !lidas.includes(id)).length;
  }

  abrirNotificacoes(origem: HTMLElement) {
    const lidas = JSON.parse(localStorage.getItem('notificacoes_lidas') || '[]');
    const opcoesFixas = [
      { id: 1, label: 'Você tem uma nova venda', value: 'venda', icon: 'fa fa-cart-plus' },
      { id: 2, label: 'Relatório mensal disponível', value: 'relatorio', icon: 'fa fa-file' }
    ];

    const filtradas = opcoesFixas.filter(opt => !lidas.includes(opt.id));

    this.caixabox.exibir(origem, filtradas).subscribe(acao => {
      if (acao) {
        const selecionada = filtradas.find(f => f.value === acao);
        if (selecionada) {
          lidas.push(selecionada.id);
          localStorage.setItem('notificacoes_lidas', JSON.stringify(lidas));
          this.atualizarBadgeNotificacoes();
        }
      }
    });
  }

  abrirMensagens(origem: HTMLElement) {
    this.mensagemService.buscarPendentes().subscribe(msgs => {
      const opcoes: CaixaboxOption[] = msgs.map(m => ({
        label: `${m.remetente}: ${m.conteudo}`,
        value: m.remetente,
        icon: 'fa fa-comment'
      }));

      if (opcoes.length === 0) opcoes.push({ label: 'Nenhuma mensagem nova', value: '' });

      this.caixabox.exibir(origem, opcoes).subscribe(remetente => {
        if (remetente) {
          this.router.navigate(['/chat'], { queryParams: { usuario: remetente } });
          this.temNovasMensagens = false;
        }
      });
    });
  }

  abrirMenuPerfil(origem: HTMLElement) {
    // 🛠️ Removido o 'id' para respeitar estritamente o tipo CaixaboxOption
    const opcoes: CaixaboxOption[] = [
      { label: 'Meu Perfil', value: 'perfil', icon: 'fa fa-user' },
      { label: 'Sair', value: 'logout', icon: 'fa fa-sign-out' }
    ];
    
    this.caixabox.exibir(origem, opcoes).subscribe(acao => {
      if (acao === 'logout') { 
        this.authService.logout(); 
        this.router.navigate(['/login']); 
      } else if (acao === 'perfil') {
        this.router.navigate(['/perfil']);
      }
    });
  }
}