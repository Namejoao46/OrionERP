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
  
}
