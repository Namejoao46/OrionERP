import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ApexChart, ApexStroke } from 'ng-apexcharts'; 

@Component({
  selector: 'app-chart-evolucao',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule], 
  templateUrl: './chat-evolucao.html',
  styleUrl: './chat-evolucao.css'
})
export class ChartEvolucao {
  
  public chartOptions = {
    series: [{
      name: "Compras",
      data: [15000, 18000, 50000, 22000, 65000, 85000]
    }],
    chart: {
      type: "area" as ApexChart['type'], // Corrigido!
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
      curve: "smooth" as ApexStroke['curve'], // Corrigido!
      width: 3 
    },
    grid: {
      borderColor: "#15294a",
      strokeDashArray: 3
    },
    xaxis: {
      categories: ["Dez", "Jan", "Fev", "Mar", "Abr", "Mai"],
      labels: { style: { colors: "#6b7c96" } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { colors: "#6b7c96" },
        formatter: (val: number) => `R$ ${val / 1000}K`
      }
    },
    theme: { mode: "dark" }
  };
}