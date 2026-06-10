import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { FornecedorService } from '../../../../core/services/erp/fornecedor.service';
import { ModalService } from '../../../../core/services/ui/modal.service';

@Component({
  selector: 'app-fornecedores-lista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fornecedores-lista.html',
  styleUrl: './fornecedores-lista.css',
})
export class FornecedoresLista implements OnInit, OnDestroy {
  fornecedores: any[] = [];
  private modalService = inject(ModalService);
  private service = inject(FornecedorService);
  private cdr = inject(ChangeDetectorRef);
  
  private subSalvo!: Subscription;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  ngOnInit() { 
    // Carrega na inicialização padrão
    this.carregarFornecedores(); 

    // Escuta em tempo real se algum fornecedor foi cadastrado. Se foi, recarrega sem atraso!
    this.subSalvo = this.modalService.fornecedorSalvo$.subscribe(() => {
      console.log('[TRACKING-LISTA] Evento de salvamento detectado via Service. Atualizando agora...');
      this.carregarFornecedores();
    });
  }

  // Toda vez que a view ganhar foco ou o Angular checar a árvore, forçamos a busca se necessário
  // Isso resolve o problema de sair e voltar para a página e ela estar desatualizada
  carregarFornecedores() {
    console.log('[TRACKING-LISTA] Buscando lista atualizada no banco de dados...');
    this.service.listarTodos().subscribe({
      next: (dados) => {
        this.fornecedores = dados;
        console.log(`[TRACKING-LISTA] Grid renderizado com sucesso. Total: ${dados.length} itens.`);
        // Força o template horizontal do OrionERP a remontar os avatares na hora
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[TRACKING-LISTA] Erro ao listar fornecedores:', err);
      }
    });
  }

  abrirModalCriar() {
    this.modalService.notificarAbrirFornecedor(); // Avisa a Home!
  }

  abrirProdutosDoFornecedor(fornecedor: any) {
    console.log('[TRACKING-LISTA] Fornecedor selecionado:', fornecedor);
    
    // Passamos o objeto do fornecedor completo para quem estiver ouvindo
    this.modalService.notificarAbrirCardProduto(fornecedor); 
  }

  scrollLeft() { this.scrollContainer.nativeElement.scrollBy({ left: -120, behavior: 'smooth' }); }
  scrollRight() { this.scrollContainer.nativeElement.scrollBy({ left: 120, behavior: 'smooth' }); }

  ngOnDestroy() {
    // Evita vazamento de memória ao destruir o componente
    if (this.subSalvo) {
      this.subSalvo.unsubscribe();
    }
  }
}