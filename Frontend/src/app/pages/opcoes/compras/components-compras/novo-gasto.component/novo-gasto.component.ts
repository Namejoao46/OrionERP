import { Component, ChangeDetectorRef } from '@angular/core'; // 🔥 Adicionado ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovimentacaoService } from '../../../../../core/services/finance/movimentacao.service'; 

@Component({
  selector: 'app-novo-gasto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './novo-gasto.component.html',
  styleUrl: './novo-gasto.component.css'
})
export class NovoGastoComponent {
  // 🔥 Inicialize o valor estritamente vazio para não travar a primeira checagem
  gasto = {
    descricao: '',
    valor: null,
    categoria: '',
    metodoPagamento: '',
    tipo: 'SAIDA' 
  };

  categorias = ['Infraestrutura', 'Logística', 'Marketing', 'Fornecedores', 'Impostos', 'Outros'];
  metodos = ['PIX', 'Boleto', 'Cartão de Crédito', 'Transferência'];

  // 🔥 Injete o cdr no construtor
  constructor(
    private movimentacaoService: MovimentacaoService,
    private cdr: ChangeDetectorRef 
  ) {} 

  salvarGasto() {
    if (!this.gasto.descricao || !this.gasto.valor) {
      alert('Por favor, preencha a descrição e o valor.');
      return;
    }

    this.movimentacaoService.registrarMovimentacaoManual(this.gasto).subscribe({
      next: (res) => {
        alert('Gasto manual registrado com sucesso no Financeiro!');
        this.limparFormulario();
      },
      error: (err) => console.error('Erro ao registrar despesa:', err)
    });
  }

  limparFormulario() {
    this.gasto = { 
      descricao: '', 
      valor: null, 
      categoria: '', 
      metodoPagamento: '', 
      tipo: 'SAIDA' 
    };
    // 🔥 Força o Angular a validar e aceitar a mudança de valores imediatamente, eliminando o erro NG0100
    this.cdr.detectChanges(); 
  }
}