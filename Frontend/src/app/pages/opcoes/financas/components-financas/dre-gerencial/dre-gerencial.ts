import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dre-gerencial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dre-gerencial.html',
  styleUrl: './dre-gerencial.css'
})
export class DreGerencialComponent {
  itensDRE = [
    { label: 'Receitas', valor: 'R$ 1.567.230,80', porcentagem: '▲ 14,3%', class: 'positivo' },
    { label: 'Despesas', valor: 'R$ 1.023.540,60', porcentagem: '▲ 6,8%', class: 'negativo' },
    { label: 'Lucro', valor: 'R$ 543.690,20', porcentagem: '▲ 23,7%', class: 'positivo' }
  ];
}