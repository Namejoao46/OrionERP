import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProdutoService } from '../../../../core/services/erp/Produto.service';

@Component({
  selector: 'app-produtos-grid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produtos-grid.html',
  styleUrl: './produtos-grid.css',
})
export class ProdutosGrid implements OnInit {
  public produtos: any[] = [];
  public termoBusca: string = '';

  private produtoService = inject(ProdutoService);

  ngOnInit() {
    this.carregarEstoque();
  }

  carregarEstoque() {
    // Puxa a listagem global independente de fornecedor logado
    this.produtoService.listarTodos().subscribe({
      next: (dados: any[]) => {
        this.produtos = dados;
      },
      error: (err: any) => {
        console.error('Erro ao carregar catálogo global de produtos:', err);
      }
    });
  }

  // Getter computado para busca incremental em tempo real
  get produtosFiltrados() {
    if (!this.termoBusca) return this.produtos;
    
    const termo = this.termoBusca.toLowerCase().trim();
    return this.produtos.filter((p: any) => 
      // Mapeado para p.descricao para bater com a estrutura do seu Back-end Java
      p.descricao?.toLowerCase().includes(termo) || 
      p.id?.toString().includes(termo)
    );
  }
}