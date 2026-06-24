import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GastosService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  listarPedidosRecentes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pedidos-compra`);
  }

  registrarGastoManual(gasto: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/movimentacoes`, {
      ...gasto,
      tipo: 'SAIDA', // Força o tipo de movimentação como saída financeira
      dataHora: new Date().toISOString()
    });
  }

  obterDashboard(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/movimentacoes/dashboard`);
  }
}