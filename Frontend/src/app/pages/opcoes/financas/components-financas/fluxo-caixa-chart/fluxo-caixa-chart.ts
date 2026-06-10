import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-fluxo-caixa-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './fluxo-caixa-chart.html',
  styleUrl: './fluxo-caixa-chart.css'
})
export class FluxoCaixaChartComponent {
  public chartOptions: any = {
    series: [
      { name: 'Entradas', data: [150, 210, 180, 290, 230, 310] },
      { name: 'Saídas', data: [-80, -120, -90, -140, -110, -130] }
    ],
    chart: {
      type: 'area',
      height: 250,
      toolbar: { show: false },
      background: 'transparent'
    },
    colors: ['#00bf71', '#ff3366'], // Verde para entradas, Magenta para saídas
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    grid: { borderColor: 'rgba(43, 151, 250, 0.1)' },
    xaxis: {
      categories: ['Mai/25', 'Jun/25', 'Jul/25', 'Ago/25', 'Set/25', 'Out/25'],
      labels: { style: { colors: '#94a3b8' } }
    },
    yaxis: { labels: { style: { colors: '#94a3b8' } } },
    theme: { mode: 'dark' },
    fill: {
      type: 'gradient',
      gradient: { opacityFrom: 0.4, opacityTo: 0.05 }
    }
  };
}