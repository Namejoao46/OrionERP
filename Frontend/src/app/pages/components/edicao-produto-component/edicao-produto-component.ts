import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProdutoService } from '../../../core/services/erp/Produto.service';
import { NotificationService } from '../../../core/services/ui/notification.service';

@Component({
  selector: 'app-edicao-produto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edicao-produto-component.html',
  styleUrl: './edicao-produto-component.css'
})
export class EdicaoProdutoComponent {
  @Input() produto: any;
  @Output() salvo = new EventEmitter<void>();

  private produtoService = inject(ProdutoService);
  private notificationService = inject(NotificationService);

  salvarAlteracoes() {
    // Monta o payload garantindo tipos numéricos e referências nulas limpas
    const payloadUpdate = {
      ...this.produto,
      estoqueAtual: this.produto.estoqueAtual !== null && this.produto.estoqueAtual !== undefined ? +this.produto.estoqueAtual : 0,
      precoVenda: this.produto.precoVenda !== null && this.produto.precoVenda !== undefined ? +this.produto.precoVenda : 0,
      fornecedorId: this.produto.fornecedorId || this.produto.fornecedor?.id
    };

    console.log('[TRACKING-EDICAO] Enviando payload atualizado:', payloadUpdate);

    this.produtoService.editar(this.produto.id, payloadUpdate).subscribe({
      next: () => {
        this.notificationService.show('Produto atualizado com sucesso!', 'success');
        this.salvo.emit(); // Fecha o modal e avisa o Grid
      },
      error: (err) => {
        console.error('[ERRO BACK-END]', err);
        const msgErro = err?.error || 'Erro ao atualizar o produto no servidor.';
        this.notificationService.show(msgErro, 'error', 4000);
      }
    });
  }
}