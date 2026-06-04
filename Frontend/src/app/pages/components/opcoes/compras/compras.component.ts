import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ChartEvolucao } from "./components-compras/chat-evolucao/chat-evolucao";
import { ChartStatus } from "./components-compras/chat-status/chat-status";
import { CardsKpi } from "./components-compras/cards-kpi/cards-kpi";
import { TabelaPedidos } from "./components-compras/tabela-pedidos/tabela-pedidos";

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ChartEvolucao,
    ChartStatus,
    CardsKpi,
    TabelaPedidos
],
  templateUrl: './compras.component.html',
  styleUrl: './compras.component.css'
})
export class ComprasComponent {
  // Aqui no futuro você buscará os dados de um Service e passará para os filhos via @Input
}