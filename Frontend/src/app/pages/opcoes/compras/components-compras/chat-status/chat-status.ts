import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 🔥 Adicionado ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApexChart, ApexPlotOptions, NgApexchartsModule } from 'ng-apexcharts';
import { MovimentacaoService } from '../../../../../core/services/finance/movimentacao.service';

@Component({
  selector: 'app-chart-status',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, NgApexchartsModule],
  templateUrl: './chat-status.html',
  styleUrl: './chat-status.css',
})
export class ChartStatus implements OnInit {
  
  public legendaCustomizada: any[] = [];
  
  public chartOptions: any = {
    series: [], 
    chart: {
      type: "donut" as ApexChart['type'],
      height: 250,
      background: 'transparent'
    },
    labels: [],
    colors: ["#00e676", "#ffd600", "#1e51dc", "#ff1744"],
    dataLabels: { enabled: false },
    legend: { show: false },
    plotOptions: {
      pie: {
        donut: {
          size: "75%",
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              color: '#6b7c96',
              fontSize: '12px',
              formatter: () => this.chartOptions.series.reduce((a: number, b: number) => a + b, 0).toString()
            },
            value: {
              color: '#ffffff',
              fontSize: '22px',
              fontWeight: 'bold',
              show: true
            }
          }
        }
      }
    } as ApexPlotOptions,
    stroke: { show: false },
    theme: { mode: "dark" }
  };

  // 🔥 Injetado cdr no construtor
  constructor(
    private movimentacaoService: MovimentacaoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    console.log('[🔍 RASTREAMENTO - STATUS] Buscando dados do gráfico de Donut...');
    
    this.movimentacaoService.obterComprasPorStatus().subscribe({
      next: (dados) => {
        console.log('[✅ RASTREAMENTO - STATUS] Dados recebidos:', dados);
        
        if (!dados || dados.length === 0) {
          console.warn('[⚠️ RASTREAMENTO - STATUS] Nenum dado de status recebido.');
          return;
        }

        const series = dados.map(item => item.quantidade);
        const labels = dados.map(item => item.status);
        const totalGeral = series.reduce((acc, cur) => acc + cur, 0);

        this.chartOptions.series = series;
        this.chartOptions.labels = labels;

        this.legendaCustomizada = dados.map((item, index) => {
          const pct = totalGeral > 0 ? ((item.quantidade / totalGeral) * 100).toFixed(0) : 0;
          return {
            status: item.status,
            quantidade: item.quantidade,
            porcentagem: pct,
            classeCss: this.obterClasseCss(item.status),
            icone: this.obterIcone(item.status)
          };
        });

        console.log('[📊 RASTREAMENTO - STATUS] Forçando renderização do Donut e da Legenda...');
        this.cdr.detectChanges(); // 🔥 Força o Donut que estava travado a carregar na tela
      },
      error: (err) => console.error('[❌ RASTREAMENTO - STATUS] Erro ao buscar status de compras:', err)
    });
  }

  obterClasseCss(status: string): string {
    if(!status) return 'cancelado';
    if(status.toLowerCase().includes('aprovado')) return 'aprovado';
    if(status.toLowerCase().includes('análise') || status.toLowerCase().includes('analise')) return 'analise';
    if(status.toLowerCase().includes('recebido')) return 'recebido';
    return 'cancelado';
  }

  obterIcone(status: string): string {
    if(!status) return '✕';
    if(status.toLowerCase().includes('aprovado')) return '✓';
    if(status.toLowerCase().includes('análise') || status.toLowerCase().includes('analise')) return '🕒';
    if(status.toLowerCase().includes('recebido')) return '📦';
    return '✕';
  }
}