import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-resumo-financeiro',
  imports: [CommonModule],
  templateUrl: './resumo-financeiro.html',
  styleUrl: './resumo-financeiro.css',
})
export class ResumoFinanceiro {
  resumos = [
    { label: 'Receita Hoje', valor: 25256.88 },
    { label: 'Receita no Mês', valor: 45543.05 },
    { label: 'Despesas do Mês', valor: 8478.36 },
    { label: 'Contas a Receber', valor: 10467.55 },
    { label: 'Contas a Pagar', valor: 18544.24 },
    { label: 'Saldo Previsto', valor: 12564.31 }
  ];
}
