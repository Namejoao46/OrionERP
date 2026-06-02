import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-cards-indicadores',
  imports: [CommonModule],
  templateUrl: './cards-indicadores.html',
  styleUrl: './cards-indicadores.css',
})
export class CardsIndicadores {
  cards = [
    { titulo: 'VENDAS HOJE', valor: 'R$ 25.256,88', porcentagem: '5,23%', positivo: true, variacao: '5,23%' },
    { titulo: 'VENDAS ESTE MÊS', valor: 'R$ 45.543,05', porcentagem: '12,55%', positivo: true, variacao: '12,55%' },
    { titulo: 'VENDAS EM ANDAMENTO', valor: '32', porcentagem: '10,50%', positivo: true, variacao: '10,50%' },
    { titulo: 'VENDAS ATRASADA', valor: '5', porcentagem: '-2,02%', positivo: false, variacao: '-2,02%' }
  ];
}
