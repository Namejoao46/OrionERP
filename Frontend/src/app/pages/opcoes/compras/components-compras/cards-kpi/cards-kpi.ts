import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovimentacaoService } from '../../../../../core/services/finance/movimentacao.service';

@Component({
  selector: 'app-cards-kpi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cards-kpi.html',
  styleUrl: './cards-kpi.css',
})
export class CardsKpi implements OnInit {
  
  dadosDashboard: any = {
    totalComprado: 0,
    comprasMes: 0,
    pedidosPendentes: 0,
    fornecedoresAtivos: 0,
    trendTotal: 0,
    trendMes: 0
  };

  constructor(private movimentacaoService: MovimentacaoService) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.movimentacaoService.obterDashboard().subscribe({
      next: (dados) => {
        this.dadosDashboard = dados;
      },
      error: (err) => {
        console.error('Erro ao carregar dados do KPI:', err);
      }
    });
  }
}