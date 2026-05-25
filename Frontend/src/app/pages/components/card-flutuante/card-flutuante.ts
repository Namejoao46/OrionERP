import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-card-flutuante',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './card-flutuante.html',
  styleUrl: './card-flutuante.css',
})
export class CardFlutuante {
  exibir: boolean = false; // Agora ela não precisa ser @Input obrigatoriamente
  @Input() titulo: string = 'Aviso';

  abrir() {
    this.exibir = true;
  }

  fechar() {
    this.exibir = false;
  }
}
