import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-evolucao-vendas',
  imports: [CommonModule],
  templateUrl: './evolucao-vendas.html',
  styleUrl: './evolucao-vendas.css',
})
export class EvolucaoVendas {
  periodoSelecionado = 'diario';
}
