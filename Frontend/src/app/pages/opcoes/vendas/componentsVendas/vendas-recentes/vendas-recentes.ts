import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-vendas-recentes',
  imports: [CommonModule],
  templateUrl: './vendas-recentes.html',
  styleUrl: './vendas-recentes.css',
})
export class VendasRecentes {
    vendas = [
    { id: '#000114', cliente: 'Prime Digital', vendedor: 'Leandro Silva', valor: 2500, status: 'Fechada', data: '20/05/2026' },
    { id: '#000115', cliente: 'Tech Solutions', vendedor: 'Filipe Carvalho', valor: 7000, status: 'Em Andamento', data: '22/05/2026' },
    { id: '#000116', cliente: 'Max Center', vendedor: 'Mariana Gomes', valor: 4000, status: 'Em Negociação', data: '25/05/2026' },
    { id: '#000117', cliente: 'BlueWave Solutions', vendedor: 'Patricia Nunes', valor: 3250, status: 'Atrasada', data: '19/05/2026' },
    { id: '#000118', cliente: 'Farmácia Vida', vendedor: 'Rafael Martins', valor: 5360, status: 'Fechada', data: '21/05/2026' }
  ];

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(/ /g, '-');
  }
}
