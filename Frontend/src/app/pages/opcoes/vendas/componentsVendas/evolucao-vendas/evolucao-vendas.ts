import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ApexChart, ApexStroke, ApexXAxis, ApexYAxis } from 'ng-apexcharts';

@Component({
  selector: 'app-evolucao-vendas',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './evolucao-vendas.html',
  styleUrl: './evolucao-vendas.css',
})
export class EvolucaoVendas {
  public periodoSelecionado = 'diario';

  // Banco de dados simulado para a troca de períodos
  private dadosGrafico: Record<string, { categorias: string[]; valores: number[] }> = {
    diario: {
      categorias: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      valores: [12000, 19000, 15000, 25000, 22000, 28000, 14000]
    },
    semanal: {
      categorias: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
      valores: [65000, 85000, 72000, 95000]
    },
    mensal: {
      categorias: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      valores: [15000, 23000, 18000, 29000, 21000, 30000]
    }
  };

  public chartOptions = {
    series: [{
      name: "Vendas",
      data: this.dadosGrafico['diario'].valores
    }],
    chart: {
      type: "area" as ApexChart['type'],
      height: 160,
      toolbar: { show: false },
      background: 'transparent',
      sparkline: { enabled: false }
    },
    colors: ["#00c3ff"], // Seu azul elétrico / ciano
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.0,
      }
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth" as ApexStroke['curve'],
      width: 3
    },
    grid: {
      borderColor: "#14253d",
      strokeDashArray: 0,
      padding: { top: 0, right: 0, bottom: 0, left: -10 }
    },
    xaxis: {
      categories: this.dadosGrafico['diario'].categorias,
      labels: { style: { colors: "#566681", fontSize: '10px' } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    } as ApexXAxis,
    yaxis: {
      labels: {
        style: { colors: "#566681", fontSize: '10px' },
        formatter: (val: number) => `R$ ${val / 1000}k`
      }
    } as ApexYAxis,
    tooltip: { theme: "dark" }
  };

  // Função para mudar os dados ao clicar nos botões
  alterarPeriodo(periodo: string) {
    this.periodoSelecionado = periodo;
    this.chartOptions.series = [{
      name: "Vendas",
      data: this.dadosGrafico[periodo].valores
    }];
    this.chartOptions.xaxis = {
      ...this.chartOptions.xaxis,
      categories: this.dadosGrafico[periodo].categorias
    };
  }
}