import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private apiUrl = 'http://localhost:8080/api/compras'; // Alinhe com a rota do seu controller de compras

  constructor(private http: HttpClient) {}

  // Mapeia o método registrarCompraFornecedor
  registrarCompraFornecedor(produtoId: number, quantidadeComprada: number, precoCustoUnitario: number): Observable<void> {
    const params = new HttpParams()
      .set('produtoId', produtoId.toString())
      .set('quantidadeComprada', quantidadeComprada.toString())
      .set('precoCustoUnitario', precoCustoUnitario.toString());

    return this.http.post<void>(`${this.apiUrl}/fornecedor`, {}, { params });
  }
}