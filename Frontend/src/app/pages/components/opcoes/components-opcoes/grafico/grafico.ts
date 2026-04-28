import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

export interface CardConfig {
  titulo: string;       // Ex: "Produtos em falta"
  subtitulo: string;    // Ex: "Total de vendas"
  valor: number;        // Ex: 41
  percentual: string;   // Ex: "7,48%"
  comparacao: string;   // Ex: "+14"
  tipo: 'verde' | 'laranja' | 'vermelho'; // controla cor do gráfico
}

@Component({
  selector: 'app-grafico',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './grafico.html',
  styleUrls: ['./grafico.css'],
})
export class Grafico {
  @Input() config!: CardConfig;
}
