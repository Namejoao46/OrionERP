import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core'; 
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-menu-fixo',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './menu-fixo.component.html',
  styleUrl: './menu-fixo.component.css'
})
export class MenuFixoComponent implements OnInit {
  isMenuAberto: boolean = true;
  roleAtual: string | null = null; // Variável para garantir a exibição
  
  protected authService = inject(AuthService);

  @Output() onToggleMenu = new EventEmitter<boolean>();
  @Output() onAbrirChat = new EventEmitter<void>();
  @Output() onAbrirCadastro = new EventEmitter<void>();

  ngOnInit() {
    this.authService.userRole$.subscribe(role => {
      this.roleAtual = role;
      console.log('Tentativa 1 (Observable):', role);

      // 2. Se falhar, tenta direto pelo valor atual do Subject no Service
      if (!this.roleAtual) {
        this.roleAtual = (this.authService as any).userRoleSubject?.value;
        console.log('Tentativa 2 (Subject):', this.roleAtual);
      }

      // 3. Se ainda falhar, busca direto na "fonte" (LocalStorage)
      if (!this.roleAtual) {
        this.roleAtual = localStorage.getItem('userRole');
        console.log('Tentativa 3 (LocalStorage):', this.roleAtual);
      }
    });
  }

  toggleMenu() {
    this.isMenuAberto = !this.isMenuAberto;
    this.onToggleMenu.emit(this.isMenuAberto);
  }

  notificarCliqueChat() { this.onAbrirChat.emit(); }

  notificarCliqueCadastro() { this.onAbrirCadastro.emit(); }
}