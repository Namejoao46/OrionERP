import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VendaService {
  private apiUrl = 'http://localhost:8080/api/vendas'; // Alinhe com a rota do seu controller de vendas

  constructor(private http: HttpClient) {}

  // Mapeia o método registrarVendaDigital
  registrarVendaDigital(produtoId: number, quantidadeVendida: number): Observable<void> {
    // Como os parâmetros geralmente vão via URL/Query no Spring (@RequestParam)
    const params = new HttpParams()
      .set('produtoId', produtoId.toString())
      .set('quantidadeVendida', quantidadeVendida.toString());

    return this.http.post<void>(`${this.apiUrl}/digital`, {}, { params });
  }
}