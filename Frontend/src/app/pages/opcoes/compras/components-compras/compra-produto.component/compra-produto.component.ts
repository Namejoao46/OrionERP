import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompraService } from '../../../../../core/services/finance/compra.service';

@Component({
  selector: 'app-compra-produto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compra-produto.component.html',
  styleUrl: './compra-produto.component.css'
})
export class CompraProdutoComponent implements OnInit {
  
  compra = {
    produtoId: null as number | null,
    quantidadeComprada: null as number | null,
    precoCustoUnitario: null as number | null
  };

  // Lista simulada de produtos (substitua pela busca do seu serviço de produtos se necessário)
  produtos = [
    { id: 1, descricao: 'Produto A' },
    { id: 2, descricao: 'Produto B' },
    { id: 3, descricao: 'Produto C' }
  ];

  constructor(
    private compraService: CompraService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {}

  salvarCompra() {
    if (!this.compra.produtoId || !this.compra.quantidadeComprada || !this.compra.precoCustoUnitario) {
      alert('Por favor, preencha todos os campos do pedido de compra.');
      return;
    }

    this.compraService.registrarCompraFornecedor(
      this.compra.produtoId,
      this.compra.quantidadeComprada,
      this.compra.precoCustoUnitario
    ).subscribe({
      next: () => {
        alert('Pedido de compra registrado com sucesso!');
        this.limparFormulario();
      },
      error: (err) => console.error('Erro ao registrar pedido de compra:', err)
    });
  }

  limparFormulario() {
    this.compra = { 
      produtoId: null, 
      quantidadeComprada: null, 
      precoCustoUnitario: null 
    };
    this.cdr.detectChanges(); 
  }
}