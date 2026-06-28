import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 🔥 Adicionado ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ApexChart, ApexStroke } from 'ng-apexcharts'; 
import { MovimentacaoService } from '../../../../../core/services/finance/movimentacao.service'; 

@Component({
  selector: 'app-chart-evolucao',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule], 
  templateUrl: './chat-evolucao.html',
  styleUrl: './chat-evolucao.css'
})
export class ChartEvolucao implements OnInit {
  
  public chartOptions: any = {
    series: [{ name: "Compras", data: [] }],
    chart: {
      type: "area" as ApexChart['type'],
      height: 250,
      toolbar: { show: false },
      background: 'transparent',
      zoom: { enabled: false }
    },
    colors: ["#1e51dc"],
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 }
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" as ApexStroke['curve'], width: 3 },
    grid: { borderColor: "#15294a", strokeDashArray: 3 },
    xaxis: {
      categories: [],
      labels: { style: { colors: "#6b7c96" } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { colors: "#6b7c96" },
        formatter: (val: number) => `R$ ${(val / 1000).toFixed(1)}K`
      }
    },
    theme: { mode: "dark" }
  };

  // 🔥 Injetado cdr no construtor
  constructor(
    private movimentacaoService: MovimentacaoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarDadosGrafico();
  }

  carregarDadosGrafico(): void {
    console.log('[🔍 RASTREAMENTO - EVOLUÇÃO] Buscando histórico mensal do gráfico...');
    
    this.movimentacaoService.obterEvolucaoCompras().subscribe({
      next: (dados) => {
        console.log('[✅ RASTREAMENTO - EVOLUÇÃO] Dados recebidos do banco Firebird:', dados);
        
        if (!dados || dados.length === 0) {
          console.warn('[⚠️ RASTREAMENTO - EVOLUÇÃO] Lista de evolução retornou vazia.');
          return;
        }

        const meses = dados.map(item => item.mes);
        const valores = dados.map(item => item.total);

        this.chartOptions.series = [{ name: "Compras", data: valores }];
        this.chartOptions.xaxis = { ...this.chartOptions.xaxis, categories: meses };
        
        console.log('[📊 RASTREAMENTO - EVOLUÇÃO] Forçando atualização visual do gráfico...');
        this.cdr.detectChanges(); // 🔥 Notifica o HTML e o ApexCharts para redesenhar na hora
      },
      error: (err) => {
        console.error("[❌ RASTREAMENTO - EVOLUÇÃO] Erro ao carregar evolução:", err);
      }
    });
  }
}