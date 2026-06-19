import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProdutoService } from '../../../../core/services/erp/Produto.service';
import { ModalService } from '../../../../core/services/ui/modal.service';
import { NotificationService } from '../../../../core/services/ui/notification.service';

@Component({
  selector: 'app-produtos-grid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produtos-grid.html',
  styleUrl: './produtos-grid.css',
})
export class ProdutosGrid implements OnInit, OnDestroy {
  public produtos: any[] = [];
  public termoBusca: string = '';

  // 🌟 NOVO: Preferências dinâmicas do usuário para os alertas de estoque
  public mostrarConfig: boolean = false;
  public limiteCritico: number = 3;
  public limiteBaixo: number = 10;

  private produtoService = inject(ProdutoService);
  private modalService = inject(ModalService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  private subProdutoSalvo!: Subscription;

  ngOnInit() {
    this.carregarEstoque();

    this.subProdutoSalvo = this.modalService.produtoSalvo$.subscribe(() => {
      console.log('[TRACKING-GRID] Atualização detectada, recarregando estoque local...');
      this.carregarEstoque();
    });
  }

  carregarEstoque() {
    console.log('[TRACKING-GRID] Disparando carga automática de estoque...');
    this.produtoService.listarTodos().subscribe({
      next: (dados: any[]) => {
        this.produtos = [...dados].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
        console.error('Erro ao carregar catálogo global de produtos:', err);
        this.notificationService.show('Erro ao carregar a listagem de produtos.', 'error');
      }
    });
  }

  // 🌟 NOVO: Método auxiliar para classificar o nível de estoque dinamicamente
  obterClasseEstoque(quantidade: number): 'critico' | 'baixo' | 'normal' {
    const qtd = quantidade ?? 0;
    if (qtd <= this.limiteCritico) return 'critico';
    if (qtd <= this.limiteBaixo) return 'baixo';
    return 'normal';
  }

  obterTextoEstoque(quantidade: number): string {
    const qtd = quantidade ?? 0;
    if (qtd <= this.limiteCritico) return 'Crítico';
    if (qtd <= this.limiteBaixo) return 'Estoque Baixo';
    return 'Normal';
  }

  deletarProduto(id: number) {
    if (confirm('Tem certeza de que deseja excluir permanentemente este produto?')) {
      this.produtoService.deletar(id).subscribe({
        next: () => {
          this.produtos = this.produtos.filter(p => p.id !== id);
          this.notificationService.show('Produto removido com sucesso!', 'success');
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          const msgErro = err?.error || 'Não foi possível remover o produto.';
          this.notificationService.show(msgErro, 'error', 5000);
        }
      });
    }
  }

  abrirEdicao(produto: any) {
    console.log('[TRACKING-GRID] Disparando evento de edição para o card flutuante:', produto);
    this.modalService.notificarAbrirCardProduto({ ...produto });
  }

  get produtosFiltrados() {
    if (!this.termoBusca) return this.produtos;
    
    const termo = this.termoBusca.toLowerCase().trim();
    return this.produtos.filter((p: any) => 
      p.descricao?.toLowerCase().includes(termo) || 
      p.id?.toString().includes(termo)
    );
  }

  ngOnDestroy() {
    if (this.subProdutoSalvo) {
      this.subProdutoSalvo.unsubscribe();
    }
  }
}