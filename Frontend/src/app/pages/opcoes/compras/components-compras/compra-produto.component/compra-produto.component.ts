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
    precoCustoUnitario: null as number | null,
    status: 'Em Análise' // 🔥 ADICIONADO: Propriedade dinâmica para o formulário
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
      next: (dados: any) => {
        this.fornecedores = dados;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Erro ao buscar fornecedores:', err)
    });
  }

  // Método engatado no evento (change) do seletor de Fornecedores
  aoAlterarFornecedor(): void {
    this.compra.produtoId = null;
    this.compra.precoCustoUnitario = null;
    this.produtos = [];

    if (this.fornecedorSelecionadoId) {
      const fornecedorId = Number(this.fornecedorSelecionadoId);
      
      this.produtoService.listarPorFornecedor(fornecedorId).subscribe({
        next: (dados: any) => {
          this.produtos = dados;
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error('Erro ao buscar produtos por fornecedor:', err)
      });
    }
  }

  // Preenche automaticamente o preço sugerido quando o usuário escolhe o produto real
  aoAlterarProduto(): void {
    if (this.compra.produtoId !== null) {
      const prod = this.produtos.find(p => p.id === Number(this.compra.produtoId));
      if (prod) {
        this.compra.precoCustoUnitario = prod.precoCusto; 
      }
    }
  }

  salvarCompra() {
    if (this.compra.produtoId === null || !this.compra.quantidadeComprada || !this.compra.precoCustoUnitario) {
      alert('Por favor, preencha todos os campos do pedido de compra.');
      return;
    }

    const empresaId = localStorage.getItem('empresaId');

    const pedidoPayload = {
      produto: { 
        id: Number(this.compra.produtoId) 
      },
      fornecedor: {
        id: Number(this.fornecedorSelecionadoId)
      },
      quantidade: Number(this.compra.quantidadeComprada),
      valorTotal: Number(this.compra.quantidadeComprada) * Number(this.compra.precoCustoUnitario),
      status: this.compra.status, // 🔥 ALTERADO: Agora envia dinamicamente o status selecionado da tela
      dataPedido: new Date().toISOString(),
      empresa: empresaId ? { id: Number(empresaId) } : null
    };

    this.compraService.registrarCompraFornecedor(pedidoPayload).subscribe({
      next: () => {
        alert(`Pedido de compra registrado com sucesso (${this.compra.status})!`);
        this.limparFormulario();
      },
      error: (err: any) => {
        console.error('Erro ao registrar pedido de compra:', err);
        const detalhe = err.error?.detalhe || 'Erro de validação nas regras de negócio do servidor.';
        alert(`Erro ao salvar: ${detalhe}`);
      }
    });
  }

  limparFormulario() {
    this.fornecedorSelecionadoId = null;
    this.produtos = [];
    this.compra = { 
      produtoId: null, 
      quantidadeComprada: null, 
      precoCustoUnitario: null,
      status: 'Em Análise' // 🔥 Reseta voltando para o padrão padrão estável
    };
    this.cdr.detectChanges(); 
  }
}