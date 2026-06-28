import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 🔥 Adicionado ChangeDetectorRef
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

  // 🔥 Injetado o ChangeDetectorRef (cdr) no construtor
  constructor(
    private movimentacaoService: MovimentacaoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    console.log('[🔍 RASTREAMENTO - KPI] Solicitando dados corretos de gastos ao servidor...');
    
    this.movimentacaoService.obterDashboardGastos().subscribe({
      next: (dados) => {
        console.log('[✅ RASTREAMENTO - KPI] Dados brutos recebidos:', dados);
        
        this.dadosDashboard = {
          totalComprado: dados?.totalComprado ?? 0,
          comprasMes: dados?.comprasMes ?? 0,
          pedidosPendentes: dados?.pedidosPendentes ?? 0,
          fornecedoresAtivos: dados?.fornecedoresAtivos ?? 47,
          trendTotal: dados?.trendTotal ?? 0,
          trendMes: dados?.trendMes ?? 0
        };
        
        console.log('[📊 RASTREAMENTO - KPI] Forçando renderização imediata do HTML...');
        
        // 🔥 Força o Angular a renderizar os valores na tela sem precisar de cliques ou interações
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('[❌ RASTREAMENTO - KPI] Falha na requisição dos cards:', err);
      }
    });
  }
}