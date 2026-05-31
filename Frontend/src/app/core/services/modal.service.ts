import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ModalService {
  // Canal de comunicação para abrir o cadastro de fornecedor
  private abrirFornecedorSource = new Subject<void>();
  abrirFornecedor$ = this.abrirFornecedorSource.asObservable();

  notificarAbrirFornecedor() {
    this.abrirFornecedorSource.next();
  }
}