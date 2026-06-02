import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-metas-vendas',
  imports: [CommonModule],
  templateUrl: './metas-vendas.html',
  styleUrl: './metas-vendas.css',
})
export class MetasVendas {
  porcentagem: number = 75;
  metaMes: number = 80652.00;
  realizados: number = 53246.00;
  faltam: number = 27406.00;
}
