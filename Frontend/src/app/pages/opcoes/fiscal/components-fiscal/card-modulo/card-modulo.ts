import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-modulo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-modulo.html',
  styleUrl: './card-modulo.css'
})
export class CardModuloComponent {
  @Input() titulo: string = '';
  @Input() descricao: string = '';
  @Input() icone: string = '';
}