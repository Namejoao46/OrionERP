import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core'; // Adicionado OnInit e inject
import { FormsModule } from '@angular/forms';
import { ProdutoService } from '../../../../core/services/erp/Produto.service'; // Ajuste o caminho do serviço se necessário

@Component({
  selector: 'app-ultimos-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ultimos-produtos.html',
  styleUrl: './ultimos-produtos.css',
})
export class UltimosProdutos implements OnInit {
  // Array que alimenta o seu *ngFor no HTML
  ultimos: any[] = [];

  // Injeta o serviço de forma limpa usando inject()
  private produtoService = inject(ProdutoService);

  ngOnInit(): void {
    this.carregarUltimos();
  }

  carregarUltimos(): void {
    this.produtoService.listarTodos().subscribe({
      next: (dados: any[]) => {
        // Ordena pela data mais recente e extrai apenas os 5 primeiros
        this.ultimos = [...dados]
          .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
          .slice(0, 5);
      },
      error: (err: any) => {
        console.error('Erro ao carregar últimos produtos:', err);
      }
    });
  }
}