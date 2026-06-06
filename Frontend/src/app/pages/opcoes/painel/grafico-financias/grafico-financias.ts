import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgApexchartsModule, ApexChart } from 'ng-apexcharts';

interface CardDados {
  valorTexto: string;
  valorNumerico: number;
  titulo: string;
  corSucesso: boolean;
  historico: number[]; // Guarda os pontos para a linha do gráfico
  chartOptions: any;   // Configurações individuais do ApexChart
}

@Component({
  selector: 'app-grafico-financias',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './grafico-financias.html',
  styleUrl: './grafico-financias.css',
})
export class GraficoFinancias implements AfterViewInit, OnDestroy {
  private intervaloSimulacao: any;
  private maxPontosNaTela = 12;

  public cards: CardDados[] = [
    { valorTexto: 'R$ 52.350,00', valorNumerico: 52350, titulo: 'RECEITA TOTAL', corSucesso: true, historico: [], chartOptions: {} },
    { valorTexto: 'R$ 12.100,00', valorNumerico: 12100, titulo: 'TOTAL DE DESPESAS', corSucesso: false, historico: [], chartOptions: {} },
    { valorTexto: 'R$ 20.250,00', valorNumerico: 20250, titulo: 'LUCRO LÍQUIDO', corSucesso: true, historico: [], chartOptions: {} },
    { valorTexto: 'R$ 4.350,00', valorNumerico: 4350, titulo: 'CONTAS A PAGAR', corSucesso: false, historico: [], chartOptions: {} },
    { valorTexto: 'R$ 8.900,00', valorNumerico: 8900, titulo: 'CONTAS A RECEBER', corSucesso: true, historico: [], chartOptions: {} },
    { valorTexto: '3/4', valorNumerico: 3, titulo: 'QUADRO DE PESSOAL ATIVO', corSucesso: true, historico: [], chartOptions: {} },
    { valorTexto: 'R$ 15.000,00', valorNumerico: 15000, titulo: 'ESTOQUE', corSucesso: true, historico: [], chartOptions: {} },
    { valorTexto: 'R$ 0,00', valorNumerico: 0, titulo: 'CARD 8 VAZIO', corSucesso: true, historico: [], chartOptions: {} },
    { valorTexto: 'R$ 0,00', valorNumerico: 0, titulo: 'CARD 9 VAZIO', corSucesso: false, historico: [], chartOptions: {} },
    { valorTexto: 'R$ 0,00', valorNumerico: 0, titulo: 'CARD 10 VAZIO', corSucesso: true, historico: [], chartOptions: {} }
  ];

  constructor() {
    // Inicializa o histórico e as configurações de cada card
    this.cards.forEach(card => {
      card.historico = Array(this.maxPontosNaTela).fill(card.valorNumerico);
      card.chartOptions = this.gerarConfiguracaoGrafico(card.historico, card.corSucesso);
    });
  }

  ngAfterViewInit(): void {
    // SIMULAÇÃO EM TEMPO REAL: Atualiza os dados a cada 1.5 segundos
    this.intervaloSimulacao = setInterval(() => {
      this.cards.forEach(card => {
        const variacao = (Math.random() - 0.5) * (card.valorNumerico * 0.15 || 500);
        card.valorNumerico = Math.max(0, Math.round(card.valorNumerico + variacao));
        
        if (card.titulo !== 'QUADRO DE PESSOAL ATIVO') {
          card.valorTexto = card.valorNumerico.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        } else {
          card.valorNumerico = Math.floor(Math.random() * 4) + 1;
          card.valorTexto = `${card.valorNumerico}/4`;
        }

        // Atualiza o array do histórico de pontos do ApexCharts
        card.historico.push(card.valorNumerico);
        if (card.historico.length > this.maxPontosNaTela) {
          card.historico.shift();
        }

        // Força a atualização do gráfico injetando a nova série de dados
        card.chartOptions.series = [{ data: [...card.historico] }];
      });
    }, 1500);
  }

  ngOnDestroy(): void {
    if (this.intervaloSimulacao) clearInterval(this.intervaloSimulacao);
  }

  // Gera o objeto de configuração otimizado do ApexCharts para Sparklines de alta performance
  private gerarConfiguracaoGrafico(dadosIniciais: number[], sucesso: boolean) {
    const corLinha = sucesso ? '#2ef8a0' : '#ff4d4d';
    
    return {
      series: [{
        name: "Valor",
        data: [...dadosIniciais]
      }],
      chart: {
        type: "area" as ApexChart['type'],
        height: "100%",
        sparkline: { enabled: true }, // Ativa o modo compacto (sem eixos, sem labels, sem grades)
        animations: {
          enabled: true,
          easing: "linear",
          dynamicAnimation: { speed: 400 }
        },
        toolbar: { show: false }
      },
      colors: [corLinha],
      stroke: {
        curve: "smooth",
        width: 2.5
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.3,
          opacityTo: 0.0
        }
      },
      tooltip: { enabled: false } // Desativa o popup ao passar o mouse para simular perfeitamente o seu layout anterior
    };
  }
}