import { Component, OnInit, OnChanges, OnDestroy, SimpleChanges, inject, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ModalService } from '../../../../../core/services/ui/modal.service';
import { ProdutoService } from '../../../../../core/services/erp/Produto.service';

@Component({
  selector: 'app-produtos-fornecedor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produtos-fornecedor.html',
  styleUrl: './produtos-fornecedor.css'
})
export class ProdutosFornecedor implements OnInit, OnChanges, OnDestroy {
  private produtoService = inject(ProdutoService);
  private modalService = inject(ModalService);
  private cdr = inject(ChangeDetectorRef);

  @Input() fornecedorId!: number;
  @Input() fornecedorNome: string = 'Fornecedor';

  public produtos: any[] = [];
  public produtosFiltrados: any[] = [];
  public termoPesquisa: string = '';
  public isLoading: boolean = false;

  private subProdutoSalvo!: Subscription;

  ngOnInit(): void {
    if (this.fornecedorId) {
      this.carregarProdutos();
    }

    // Escuta eventos de salvamento do modal para atualizar a lista do fornecedor sem F5
    this.subProdutoSalvo = this.modalService.produtoSalvo$.subscribe(() => {
      console.log('[TRACKING-PRODUTOS] Novo produto detectado, atualizando lista do fornecedor.');
      this.carregarProdutos();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fornecedorId'] && !changes['fornecedorId'].firstChange) {
      console.log('[TRACKING-PRODUTOS] Alteração detectada no ID do Fornecedor. Atualizando lista de itens.');
      this.carregarProdutos();
    }
  }

  carregarProdutos() {
    this.isLoading = true;
    this.produtoService.listarPorFornecedor(this.fornecedorId).subscribe({
      next: (dados) => {
        this.produtos = dados;
        this.produtosFiltrados = dados;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[TRACKING-PRODUTOS] Falha ao recuperar produtos do fornecedor logado:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filtrarProdutos() {
    const termo = this.termoPesquisa.toLowerCase().trim();
    if (!termo) {
      this.produtosFiltrados = this.produtos;
      return;
    }
    this.produtosFiltrados = this.produtos.filter(p => 
      p.descricao?.toLowerCase().includes(termo)
    );
  }

  abrirDetalhesProduto(produto: any) {
    console.log('[TRACKING-PRODUTOS] Disparando abertura do Card Flutuante:', produto);
    this.modalService.notificarAbrirCardProduto(produto);
  }

  // 🌟 NOVO: Abre o card do formulário limpo, injetando o vínculo do fornecedor atual
  adicionarNovoProduto() {
    const novoProdutoVazio = {
      descricao: '',
      estoqueAtual: 0,
      precoVenda: 0,
      fornecedorId: this.fornecedorId,
      fornecedor: {
        id: this.fornecedorId,
        nome: this.fornecedorNome
      },
      status: 'ATIVO'
    };
    
    console.log('[TRACKING-PRODUTOS] Abrindo formulário para novo SKU vinculado ao Fornecedor ID:', this.fornecedorId);
    this.modalService.notificarAbrirCardProduto(novoProdutoVazio);
  }

  ngOnDestroy(): void {
    if (this.subProdutoSalvo) {
      this.subProdutoSalvo.unsubscribe();
    }
  }
}