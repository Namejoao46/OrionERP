import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProdutoService } from '../../../../core/services/erp/Produto.service';

@Component({
  selector: 'app-ultimos-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ultimos-produtos.html',
  styleUrl: './ultimos-produtos.css',
})
export class UltimosProdutos implements OnInit {
  ultimos: any[] = [];

  private produtoService = inject(ProdutoService);

  ngOnInit(): void {
    this.carregarUltimos();
  }

  carregarUltimos(): void {
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
      },
      error: (err: any) => {
        console.error('Erro ao carregar últimos produtos:', err);
      }
    });
  }
}