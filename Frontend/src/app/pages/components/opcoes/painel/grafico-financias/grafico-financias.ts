import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppSparkline } from './sparkline';

interface CardDados {
  valorTexto: string;    // O texto em String ("R$ 32.350,00")
  valorNumerico: number; // O número puro usado para balançar a linha do gráfico
  titulo: string;
  corSucesso: boolean;
}

@Component({
  selector: 'app-grafico-financias',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, AppSparkline],
  templateUrl: './grafico-financias.html',
  styleUrl: './grafico-financias.css',
})
export class GraficoFinancias implements AfterViewInit, OnDestroy {
  private intervaloSimulacao: any;

  public cards: CardDados[] = [
    { valorTexto: 'R$52.350,00', valorNumerico: 52350, titulo: 'RECEITA TOTAL', corSucesso: true },
    { valorTexto: 'R$12.100,00', valorNumerico: 12100, titulo: 'TOTAL DE DESPESAS', corSucesso: false },
    { valorTexto: 'R$20.250,00', valorNumerico: 20250, titulo: 'LUCRO LÍQUIDO', corSucesso: true },
    { valorTexto: 'R$4.350,00', valorNumerico: 4350, titulo: 'CONTAS A PAGAR', corSucesso: false },
    { valorTexto: 'R$8.900,00', valorNumerico: 8900, titulo: 'CONTAS A RECEBER', corSucesso: true },
    { valorTexto: '3/4', valorNumerico: 3, titulo: 'QUADRO DE PESSOAL ATIVO', corSucesso: true },
    { valorTexto: 'R$15.000,00', valorNumerico: 15000, titulo: 'ESTOQUE', corSucesso: true },
    { valorTexto: 'R$0,00', valorNumerico: 0, titulo: 'CARD 8 VAZIO', corSucesso: true },
    { valorTexto: 'R$0,00', valorNumerico: 0, titulo: 'CARD 9 VAZIO', corSucesso: false },
    { valorTexto: 'R$0,00', valorNumerico: 0, titulo: 'CARD 10 VAZIO', corSucesso: true }
  ];

  ngAfterViewInit(): void {
    // SIMULAÇÃO EM TEMPO REAL: Simula dados mudando sozinhos a cada 1.5 segundos
    this.intervaloSimulacao = setInterval(() => {
      this.cards.forEach(card => {
        // Gera uma variação aleatória de ganho ou perda de até 15% para simular a flutuação
        const variacao = (Math.random() - 0.5) * (card.valorNumerico * 0.15 || 500);
        card.valorNumerico = Math.max(0, Math.round(card.valorNumerico + variacao));
        
        // Se for formatação de dinheiro, atualiza o texto visual do h1
        if (card.titulo !== 'QUADRO DE PESSOAL ATIVO') {
          card.valorTexto = card.valorNumerico.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        } else {
          // Se for o quadro de pessoal, faz oscilar aleatoriamente entre 1 e 4
          card.valorNumerico = Math.floor(Math.random() * 4) + 1;
          card.valorTexto = `${card.valorNumerico}/4`;
        }
      });
    }, 1500);
  }

  ngOnDestroy(): void {
    if (this.intervaloSimulacao) clearInterval(this.intervaloSimulacao);
  }
}