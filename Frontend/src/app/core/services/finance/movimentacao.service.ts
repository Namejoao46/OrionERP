import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MovimentacaoService {
  private apiUrl = 'http://localhost:8080/api/movimentacoes';

  constructor(private http: HttpClient) {}

  listarTodas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  obterDashboard(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`);
  }

  obterDashboardGastos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard-gastos`);
  }

  obterEvolucaoCompras(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/evolucao-compras`);
  }

  registrarMovimentacaoManual(movimentacao: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      ...movimentacao,
      dataHora: new Date().toISOString()
    });
  }

  obterComprasPorStatus(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8080/api/pedidos-compra/status');
  }
}