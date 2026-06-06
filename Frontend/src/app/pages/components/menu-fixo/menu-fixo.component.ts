import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject, OnInit, OnDestroy } from '@angular/core'; 
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-menu-fixo',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './menu-fixo.component.html',
  styleUrl: './menu-fixo.component.css'
})
export class MenuFixoComponent implements OnInit, OnDestroy {
  isMenuAberto: boolean = true;
  roleAtual: string | null = null; 
  
  private roleSub?: Subscription;
  protected authService = inject(AuthService);

  @Output() onToggleMenu = new EventEmitter<boolean>();
  @Output() onAbrirChat = new EventEmitter<void>();
  @Output() onAbrirCadastro = new EventEmitter<void>();

  ngOnInit() {
    // 🔎 DETECTIVE 4: Verificar se o componente do menu foi iniciado
    console.log('>>> [Menu Fixo] Componente foi renderizado no DOM. Aguardando a role...');

    this.roleSub = this.authService.userRole$.subscribe({
      next: (role) => {
        // 🔎 DETECTIVE 5: O que chegou no canal de comunicação (Observable)?
        console.log('>>> [Menu Fixo] Chegou no canal do menu a role: "' + role + '"');
        
        if (role) {
          this.roleAtual = role.trim().toUpperCase();
        } else {
          this.roleAtual = null;
        }
        
        // 🔎 DETECTIVE 6: Qual foi o veredito do HTML?
        console.log('>>> [Menu Fixo] Estado final da variável no HTML: "' + this.roleAtual + '"');
      },
      error: (err) => console.error('Erro ao ler permissões no menu fixo:', err)
    });
  }

  ngOnDestroy() {
    this.roleSub?.unsubscribe();
  }

  toggleMenu() {
    this.isMenuAberto = !this.isMenuAberto;
    this.onToggleMenu.emit(this.isMenuAberto);
  }

  notificarCliqueChat() { 
    this.onAbrirChat.emit(); 
  }

  notificarCliqueCadastro() { 
    this.onAbrirCadastro.emit(); 
  }
}