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
    { titulo: 'VENDAS HOJE', valor: 25256.88, porcentagem: '+5,23%', positivo: true },
    { titulo: 'VENDAS ESTE MÊS', valor: 45543.05, porcentagem: '+12,55%', positivo: true },
    { titulo: 'VENDAS EM ANDAMENTO', valor: 32, porcentagem: '+10,50%', positivo: true, isCount: true },
    { titulo: 'VENDAS ATRASADA', valor: 5, porcentagem: '-2,02%', positivo: false, isCount: true }
  ];
}
