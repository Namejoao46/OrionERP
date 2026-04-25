import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu-fixo',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './menu-fixo.component.html',
  styleUrl: './menu-fixo.component.css'
})
export class MenuFixoComponent {
  isMenuAberto: boolean = true; // Começa aberto por padrão

  @Output() onToggleMenu = new EventEmitter<boolean>();
  
  toggleMenu() {
    this.isMenuAberto = !this.isMenuAberto;
    // Emitimos o novo estado (true ou false)
    this.onToggleMenu.emit(this.isMenuAberto);
  }
}
