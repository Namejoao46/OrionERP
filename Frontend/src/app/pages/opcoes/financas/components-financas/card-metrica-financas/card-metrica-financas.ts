import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-metrica-financas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-metrica-financas.html',
  styleUrl: './card-metrica-financas.css'
})
export class CardMetricaFinancasComponent {
  @Input() titulo: string = '';
  @Input() valor: string = '';
  @Input() rodape: string = '';
  @Input() icone: string = '';
}