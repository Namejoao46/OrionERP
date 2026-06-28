import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MovimentacaoService {
  private apiUrl = 'http://localhost:8080/api/movimentacoes';

  constructor(private http: HttpClient) {}

  // Mapeia o @GetMapping da listarTodas()
  listarTodas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Mapeia o @GetMapping("/dashboard")
  obterDashboard(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`);
  }

  // Mapeia o @PostMapping da criarManualmente()
  registrarMovimentacaoManual(movimentacao: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      ...movimentacao,
      dataHora: new Date().toISOString() // Garante o envio da data atual formatada
    });
  }
}