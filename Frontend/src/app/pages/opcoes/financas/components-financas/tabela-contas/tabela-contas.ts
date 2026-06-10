import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabela-contas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabela-contas.html',
  styleUrl: './tabela-contas.css'
})
export class TabelaContasComponent {
  contas = [
    { doc: 'NF 1258', cliente: 'Cliente Alfa Ltda.', vencimento: '20/05/2026', status: 'A Receber', class: 'receber', valor: 'R$ 8.450,00' },
    { doc: 'NF 1260', cliente: 'Cliente Beta S.A.', vencimento: '22/05/2026', status: 'A Receber', class: 'receber', valor: 'R$ 15.230,00' },
    { doc: 'NF 4587', cliente: 'Fornecedor Gama', vencimento: '18/05/2026', status: 'A Pagar', class: 'pagar', valor: 'R$ 5.780,00' },
    { doc: 'BO 9965', cliente: 'Fornecedor Delta', vencimento: '21/05/2026', status: 'A Pagar', class: 'pagar', valor: 'R$ 12.450,00' }
  ];
}