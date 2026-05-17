import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-produtos-grid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produtos-grid.html',
  styleUrl: './produtos-grid.css',
})
export class ProdutosGrid {
  @Input() produtos: any[] = [];

  termoBusca: string = '';

  get produtosFiltrados() {
    return this.produtos.filter(p => 
      p.nome.toLowerCase().includes(this.termoBusca.toLowerCase())
    );
  }
}
