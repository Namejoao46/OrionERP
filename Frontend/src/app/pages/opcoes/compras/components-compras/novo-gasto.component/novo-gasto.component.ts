import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GastosService } from '../../../../../core/services/finance/Gastos.service';

@Component({
  selector: 'app-novo-gasto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './novo-gasto.component.html',
  styleUrl: './novo-gasto.component.css'
})
export class NovoGastoComponent {
  gasto = {
    descricao: '',
    valor: null,
    categoria: '',
    metodoPagamento: ''
  };

  categorias = ['Infraestrutura', 'Logística', 'Marketing', 'Fornecedores', 'Impostos', 'Outros'];
  metodos = ['PIX', 'Boleto', 'Cartão de Crédito', 'Transferência'];

  constructor(private gastosService: GastosService) {}

  salvarGasto() {
    if (!this.gasto.descricao || !this.gasto.valor) {
      alert('Por favor, preencha a descrição e o valor.');
      return;
    }

    this.gastosService.registrarGastoManual(this.gasto).subscribe({
      next: (res) => {
        alert('Gasto manual registrado com sucesso no Financeiro!');
        this.limparFormulario();
      },
      error: (err) => console.error('Erro ao registrar despesa:', err)
    });
  }

  limparFormulario() {
    this.gasto = { descricao: '', valor: null, categoria: '', metodoPagamento: '' };
  }
}