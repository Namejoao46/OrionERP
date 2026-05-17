import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FornecedoresLista } from "../components-opcoes/fornecedores-lista/fornecedores-lista";
import { ProdutosGrid } from "../components-opcoes/produtos-grid/produtos-grid";
import { UltimosProdutos } from "../components-opcoes/ultimos-produtos/ultimos-produtos";
import { Grafico } from "../components-opcoes/grafico/grafico";

@Component({
  selector: 'app-estoque',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, FornecedoresLista, ProdutosGrid, UltimosProdutos, Grafico],
  templateUrl: './estoque.html',
  styleUrl: './estoque.css',
})
export class Estoque {
  produtos = [
    { id: 101, nome: 'Placa de Vídeo RTX', qtd: 15, preco: 3500.00 },
    { id: 102, nome: 'Processador i9', qtd: 8, preco: 2800.00 },
    { id: 103, nome: 'Memória RAM 16GB', qtd: 40, preco: 450.00 },
    { id: 104, nome: 'Placa de Vídeo RTX', qtd: 15, preco: 3500.00 },
    { id: 105, nome: 'Processador i9', qtd: 8, preco: 2800.00 },
    { id: 106, nome: 'Memória RAM 16GB', qtd: 40, preco: 450.00 },
    { id: 107, nome: 'Placa de Vídeo RTX', qtd: 15, preco: 3500.00 },
    { id: 108, nome: 'Processador i9', qtd: 8, preco: 2800.00 },
    { id: 109, nome: 'Memória RAM 16GB', qtd: 40, preco: 450.00 },
    { id: 110, nome: 'Placa de Vídeo RTX', qtd: 15, preco: 3500.00 },
    { id: 111, nome: 'Processador i9', qtd: 8, preco: 2800.00 },
    { id: 112, nome: 'Memória RAM 16GB', qtd: 40, preco: 450.00 }
  ];

  ultimos = this.produtos.slice(-15).map(p => ({
    nome: p.nome,
    qtd: p.qtd,
    data: new Date() // ou a data real de inserção
  }));
}
