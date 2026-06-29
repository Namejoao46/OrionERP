import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private apiUrl = 'http://localhost:8080/api/pedidos-compra';

  constructor(private http: HttpClient) {}


  registrarCompraFornecedor(pedidoPayload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, pedidoPayload);
  }
}