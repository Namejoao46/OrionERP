import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MenuComponent } from "../menu/menu.component";
import { AuthService } from '../../../services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CaixaboxService } from '../../../services/caixabox.service';
import { CaixaboxOption } from '../caixa-box/caixa-box';

@Component({
  selector: 'app-menu-bar',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, MenuComponent],
  templateUrl: './menu-bar.component.html',
  styleUrl: './menu-bar.component.css'
})
export class MenuBarComponent {
  userName$: Observable<string | null>;
  userImage$: Observable<SafeUrl | null>;

  constructor(
    private authService: AuthService, 
    private sanitizer: DomSanitizer,
    private caixabox: CaixaboxService
  ) {
    this.userName$ = this.authService.userName$;

    // Tratamos a string Base64 para ser aceita pelo Angular como uma URL segura
    this.userImage$ = this.authService.userImage$.pipe(
      map(base64 => {
        if (!base64) return null;
        
        // Verifica se a string já possui o prefixo, se não, adiciona
        const prefixo = base64.startsWith('data:image') ? '' : 'data:image/jpeg;base64,';
        return this.sanitizer.bypassSecurityTrustUrl(`${prefixo}${base64}`);
      })
    );

    // Log de verificação no console
    this.authService.userImage$.subscribe(img => {
      if (img) {
        console.log("Base64 carregado no MenuBar:", img.substring(0, 50) + "...");
      } else {
        console.log("Nenhuma imagem de usuário encontrada.");
      }
    });
  }

  abrirNotificacoes(origem: HTMLElement) {
    const opcoes: CaixaboxOption[] = [
      { label: 'Você tem uma nova venda', value: 'venda', icon: 'fa fa-cart-plus' },
      { label: 'Relatório mensal disponível', value: 'relatorio', icon: 'fa fa-file' },
      { label: 'Ver todas', value: 'todas' }
    ];

    this.caixabox.exibir(origem, opcoes).subscribe(acao => {
      if (acao) console.log('Notificação clicada:', acao);
    });
  }

  abrirMensagens(origem: HTMLElement) {
    const opcoes: CaixaboxOption[] = [
      { label: 'Suporte Orion: Olá!', value: 'msg_1', icon: 'fa fa-comment' },
      { label: 'Nova mensagem do Admin', value: 'msg_2', icon: 'fa fa-comment' }
    ];

    this.caixabox.exibir(origem, opcoes).subscribe(acao => {
      if (acao) console.log('Mensagem selecionada:', acao);
    });
  }

  abrirMenuPerfil(origem: HTMLElement) {
    const opcoes: CaixaboxOption[] = [
      { label: 'Meu Perfil', value: 'perfil', icon: 'fa fa-user' },
      { label: 'Configurações', value: 'config', icon: 'fa fa-cog' },
      { label: 'Sair do Sistema', value: 'logout', icon: 'fa fa-sign-out' }
    ];

    this.caixabox.exibir(origem, opcoes).subscribe(acao => {
      if (acao === 'logout') {
        this.authService.logout(); // Exemplo de ação real
      } else if (acao === 'perfil') {
        // redirecionar via router
      }
    });
  }
}