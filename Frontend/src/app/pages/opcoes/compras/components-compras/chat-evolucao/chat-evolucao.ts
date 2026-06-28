import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ApexChart, ApexStroke } from 'ng-apexcharts'; 
import { MovimentacaoService } from '../../../../../core/services/finance/movimentacao.service'; // Ajuste o caminho real

@Component({
  selector: 'app-chart-evolucao',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule], 
  templateUrl: './chat-evolucao.html',
  styleUrl: './chat-evolucao.css'
})
export class ChartEvolucao implements OnInit {
  
  // Opções do gráfico iniciadas com estruturas vazias para aguardar a API
  public chartOptions: any = {
    series: [{
      name: "Compras",
      data: [] // Começa vazio
    }],
    chart: {
      type: "area" as ApexChart['type'],
      height: 250,
      toolbar: { show: false },
      background: 'transparent'
    },
    colors: ["#1e51dc"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
      }
    },
    dataLabels: { enabled: false },
    stroke: { 
      curve: "smooth" as ApexStroke['curve'], 
      width: 3 
    },
    grid: {
      borderColor: "#15294a",
      strokeDashArray: 3
    },
    xaxis: {
      categories: [], // Começa vazio
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

  constructor(private movimentacaoService: MovimentacaoService) {}

  ngOnInit(): void {
    this.carregarDadosGrafico();
  }

  carregarDadosGrafico(): void {
    this.movimentacaoService.obterEvolucaoCompras().subscribe({
      next: (dados) => {

        const meses = dados.map(item => item.mes);
        const valores = dados.map(item => item.total);

        this.chartOptions.series = [{
          name: "Compras",
          data: valores
        }];

        this.chartOptions.xaxis = {
          ...this.chartOptions.xaxis,
          categories: meses
        };
      },
      error: (err) => {
        console.error("Erro ao carregar evolução de compras:", err);
      }
    });
  }
}