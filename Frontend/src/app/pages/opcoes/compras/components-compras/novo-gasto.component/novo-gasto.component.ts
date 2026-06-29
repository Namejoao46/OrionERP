import { Component, ChangeDetectorRef } from '@angular/core'; 
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
  // Estrutura do Gasto Manual
  gasto = {
    descricao: '',
    valor: null,
    categoria: '',
    metodoPagamento: '',
    tipo: 'SAIDA' 
  };

  categorias = ['Infraestrutura', 'Logística', 'Marketing', 'Fornecedores', 'Impostos', 'Outros'];
  metodos = ['PIX', 'Boleto', 'Cartão de Crédito', 'Transferência'];

  constructor(
    private movimentacaoService: MovimentacaoService,
    private cdr: ChangeDetectorRef 
  ) {} 

  salvarGasto() {
    if (!this.gasto.descricao || !this.gasto.valor) {
      alert('Por favor, preencha a descrição e o valor.');
      return;
    }

    // 🔥 Recupera a empresa logada do localStorage para isolar o registro
    const empresaId = localStorage.getItem('empresaId'); 
    
    // Injeta o ID da empresa no payload enviado ao backend
    const gastoPayload = {
      ...this.gasto,
      empresaId: empresaId ? Number(empresaId) : null 
    };

    this.movimentacaoService.registrarMovimentacaoManual(gastoPayload).subscribe({
      next: (res: any) => { 
        alert('Gasto manual registrado com sucesso no Financeiro!');
        this.limparFormulario();
      },
      error: (err: any) => console.error('Erro ao registrar despesa:', err)
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
    this.cdr.detectChanges(); 
  }
}