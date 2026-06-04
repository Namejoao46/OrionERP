import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ApexChart, ApexPlotOptions } from 'ng-apexcharts';

@Component({
  selector: 'app-metas-vendas',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './metas-vendas.html',
  styleUrl: './metas-vendas.css',
})
export class MetasVendas {
  public porcentagem: number = 75;
  public metaMes: number = 80652.00;
  public realizados: number = 53246.00;
  public faltam: number = 27406.00;

  public chartOptions = {
    series: [this.porcentagem],
    chart: {
      type: "radialBar" as ApexChart['type'],
      height: 150,
      sparkline: { enabled: true }
    },
    colors: ["#00c3ff"], // Ciano elétrico mapeado do seu ERP
    plotOptions: {
      radialBar: {
        hollow: {
          size: "70%" // Espessura interna do círculo
        },
        track: {
          background: "#141c2f", // Fundo da pista não preenchida
          strokeWidth: "100%"
        },
        dataLabels: {
          show: true,
          name: { show: false }, // Esconde a label padrão superior
          value: {
            show: true,
            fontSize: "20px",
            fontWeight: "700",
            color: "#ffffff",
            offsetY: 8,
            formatter: (val: number) => `${val}%`
          }
        }
      }
    } as ApexPlotOptions
  };
}