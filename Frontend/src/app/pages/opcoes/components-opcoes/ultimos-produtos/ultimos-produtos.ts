import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProdutoService } from '../../../../core/services/erp/Produto.service';
import { ModalService } from '../../../../core/services/ui/modal.service'; // Injetado para escutar atualizações

@Component({
  selector: 'app-ultimos-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ultimos-produtos.html',
  styleUrl: './ultimos-produtos.css',
})
export class UltimosProdutos implements OnInit, OnDestroy {
  public ultimos: any[] = [];

  private produtoService = inject(ProdutoService);
  private modalService = inject(ModalService);
  private cdr = inject(ChangeDetectorRef); // Força a renderização automática imediata

  private subProdutoSalvo!: Subscription;

  ngOnInit(): void {
    // 1. Carrega imediatamente ao entrar na página
    this.carregarUltimos();

    // 2. Escuta salvamentos no modal para manter a barra lateral atualizada em tempo real
    this.subProdutoSalvo = this.modalService.produtoSalvo$.subscribe(() => {
      console.log('[TRACKING-ULTIMOS] Atualização detectada no modal, atualizando sidebar...');
      this.carregarUltimos();
    });
  }

  carregarUltimos(): void {
    console.log('[TRACKING-ULTIMOS] Buscando lançamentos recentes...');
    this.produtoService.listarTodos().subscribe({
      next: (dados: any[]) => {
        // Ordena pela data mais recente e pega os 5 primeiros
        this.ultimos = [...dados]
          .sort((a, b) => {
            const dataB = b.data ? new Date(b.data).getTime() : 0;
            const dataA = a.data ? new Date(a.data).getTime() : 0;
            return dataB - dataA;
          })
          .slice(0, 5);
        
        // Força o HTML a desenhar os novos valores imediatamente
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erro ao carregar últimos produtos:', err);
      }
    });
  }

  ngOnDestroy(): void {
    // Evita estouro de memória cancelando o subscribe ao sair da página
    if (this.subProdutoSalvo) {
      this.subProdutoSalvo.unsubscribe();
    }
  }
}