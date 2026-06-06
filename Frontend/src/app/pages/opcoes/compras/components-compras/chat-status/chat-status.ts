import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApexChart, ApexPlotOptions, NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-chart-status',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, NgApexchartsModule],
  templateUrl: './chat-status.html',
  styleUrl: './chat-status.css',
})
export class ChartStatus {
  public chartOptions = {
    series: [64, 24, 43, 11],
    chart: {
      type: "donut" as ApexChart['type'], // Força a tipagem correta do ApexCharts
      height: 250,
      background: 'transparent'
    },
    labels: ["Aprovado", "Em Análise", "Recebido", "Cancelado"],
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
              formatter: () => '142'
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
}
