import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProdutoService } from '../../../../../core/services/erp/Produto.service';

@Component({
  selector: 'app-produtos-grid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produtos-grid.html',
  styleUrl: './produtos-grid.css',
})
export class ProdutosGrid implements OnInit {
  produtos: any[] = [];
  termoBusca: string = '';

  private produtoService = inject(ProdutoService);

  ngOnInit() {
    this.carregarEstoque();
  }

  carregarEstoque() {
    // Tipamos o subscribe para evitar o erro "Object is of type unknown"
    this.produtoService.listarTodos().subscribe({
      next: (dados: any[]) => {
        this.produtos = dados;
      },
      error: (err: any) => {
        console.error('Erro ao carregar produtos:', err);
      }
    });
  }

  get produtosFiltrados() {
    if (!this.termoBusca) return this.produtos;
    const termo = this.termoBusca.toLowerCase();
    return this.produtos.filter((p: any) => 
      p.nome.toLowerCase().includes(termo) || 
      p.id.toString().includes(termo)
    );
  }
}