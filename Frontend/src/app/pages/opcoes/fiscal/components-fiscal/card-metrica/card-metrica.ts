import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-metrica',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-metrica.html',
  styleUrl: './card-metrica.css'
})
export class CardMetricaComponent {
  @Input() titulo: string = '';
  @Input() valor: string = '';
  @Input() rodape: string = '';
  @Input() icone: string = '';
  @Input() bgColor: string = '#050a30';
}