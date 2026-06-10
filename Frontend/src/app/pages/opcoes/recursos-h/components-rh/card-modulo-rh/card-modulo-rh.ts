import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-modulo-rh',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-modulo-rh.html',
  styleUrl: './card-modulo-rh.css'
})
export class CardModuloRhComponent {
  @Input() titulo: string = '';
  @Input() descricao: string = '';
  @Input() icone: string = '';
}