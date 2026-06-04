import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private abrirFornecedorSource = new Subject<void>();
  abrirFornecedor$ = this.abrirFornecedorSource.asObservable();

  notificarAbrirFornecedor() {
    this.abrirFornecedorSource.next();
  }
}