import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ModalService {

  private abrirFornecedorSource = new Subject<void>();
  abrirFornecedor$ = this.abrirFornecedorSource.asObservable();

  private fornecedorSalvoSource = new Subject<void>();
  fornecedorSalvo$ = this.fornecedorSalvoSource.asObservable();

  private abrirPerfilSource = new Subject<void>();
  abrirPerfil$ = this.abrirPerfilSource.asObservable();

  private abrirCardProdutoSource = new Subject<any>();
  abrirCardProduto$ = this.abrirCardProdutoSource.asObservable();

  notificarAbrirFornecedor() {
    this.abrirFornecedorSource.next();
  }

  notificarAbrirPerfil() {
    this.abrirPerfilSource.next();
  }

  notificarFornecedorSalvo() {
    this.fornecedorSalvoSource.next();
  }

  // Aciona a abertura do card flutuante passando o produto clicado
  notificarAbrirCardProduto(produto: any) {
    this.abrirCardProdutoSource.next(produto);
  }
}