import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompraService } from '../../../../../core/services/finance/compra.service';
import { Fornecedor, FornecedorService } from '../../../../../core/services/erp/fornecedor.service';
import { ProdutoService } from '../../../../../core/services/erp/Produto.service';


@Component({
  selector: 'app-compra-produto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compra-produto.component.html',
  styleUrl: './compra-produto.component.css'
})
export class CompraProdutoComponent implements OnInit {
  
  // Guardando o fornecedorId selecionado para o fluxo
  fornecedorSelecionadoId: number | null = null;

  compra = {
    produtoId: null as number | null,
    quantidadeComprada: null as number | null,
    precoCustoUnitario: null as number | null
  };

  // Listas reais carregadas da API
  fornecedores: Fornecedor[] = [];
  produtos: any[] = []; 

  constructor(
    private compraService: CompraService,
    private fornecedorService: FornecedorService,
    private produtoService: ProdutoService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.carregarFornecedores();
  }

  // Busca os fornecedores cadastrados na inicialização
  carregarFornecedores(): void {
    this.fornecedorService.listarTodos().subscribe({
      next: (dados) => {
        this.fornecedores = dados;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao buscar fornecedores:', err)
    });
  }

  // 🔥 Método engatado no evento (change) do seletor de Fornecedores
  aoAlterarFornecedor(): void {
    // Reseta o produto selecionado anteriormente caso mude de fornecedor
    this.compra.produtoId = null;
    this.compra.precoCustoUnitario = null;
    this.produtos = [];

    if (this.fornecedorSelecionadoId) {
      // Carrega os produtos vinculados de forma dinâmica filtrados na API
      this.produtoService.listarPorFornecedor(this.fornecedorSelecionadoId).subscribe({
        next: (dados) => {
          this.produtos = dados;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erro ao buscar produtos por fornecedor:', err)
      });
    }
  }

  // Preenche automaticamente o preço sugerido quando o usuário escolhe o produto real
  aoAlterarProduto(): void {
    const prod = this.produtos.find(p => p.id === Number(this.compra.produtoId));
    if (prod) {
      this.compra.precoCustoUnitario = prod.precoCusto; // ou o campo correspondente ao valor no seu backend
    }
  }

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
    this.fornecedorSelecionadoId = null;
    this.produtos = [];
    this.compra = { 
      produtoId: null, 
      quantidadeComprada: null, 
      precoCustoUnitario: null 
    };
    this.cdr.detectChanges(); 
  }
}