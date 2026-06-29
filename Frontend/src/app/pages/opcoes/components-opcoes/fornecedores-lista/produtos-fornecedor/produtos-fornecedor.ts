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
    // Se o ID já estiver disponível no carregamento inicial, faz a busca
    if (this.fornecedorId) {
      this.carregarProdutos();
    }

    // Escuta eventos de salvamento do modal para atualizar a lista sem F5
    this.subProdutoSalvo = this.modalService.produtoSalvo$.subscribe(() => {
      console.log('[TRACKING-PRODUTOS] Novo produto detectado, atualizando lista do fornecedor.');
      this.carregarProdutos();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // 🚀 MELHORIA: Removido o bloqueio de 'firstChange'. Se o ID vier na inicialização por fluxo assíncrono do pai, ele roda!
    if (changes['fornecedorId']) {
      const idAtual = changes['fornecedorId'].currentValue;
      console.log('[TRACKING-PRODUTOS] Alteração detectada no ID do Fornecedor pelo Input:', idAtual);
      
      if (idAtual) {
        this.fornecedorId = idAtual;
        this.carregarProdutos();
      }
    }
  }

  carregarProdutos() {
    if (!this.fornecedorId) {
      console.warn('[TRACKING-PRODUTOS] Abortando carregamento: fornecedorId está nulo ou inválido.');
      return;
    }

    this.isLoading = true;
    // 🚀 MELHORIA: Cast explícito para Number prevenindo incompatibilidades de tipo com a URL do Backend
    const idFormatado = Number(this.fornecedorId);

    this.produtoService.listarPorFornecedor(idFormatado).subscribe({
      next: (dados) => {
        console.log(`[TRACKING-PRODUTOS] Sucesso! Encontrados ${dados?.length || 0} itens para o fornecedor #${idFormatado}`, dados);
        this.produtos = dados || [];
        this.produtosFiltrados = dados || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[TRACKING-PRODUTOS] Falha ao recuperar produtos do fornecedor logado:', err);
        this.produtos = [];
        this.produtosFiltrados = [];
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