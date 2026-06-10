import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-metrica-rh',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-metrica-rh.html',
  styleUrl: './card-metrica-rh.css'
})
export class CardMetricaRhComponent {
  @Input() titulo: string = '';
  @Input() valor: string = '';
  @Input() rodape: string = '';
  @Input() icone: string = '';
}