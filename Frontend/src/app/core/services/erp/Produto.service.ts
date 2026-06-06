import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private apiUrl = 'http://localhost:8080/api/produtos';

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  listarAtivos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ativos`);
  }

  buscar(termo: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/buscar`, { params: { termo } });
  }

  cadastrar(produto: any): Observable<any> {
    return this.http.post(this.apiUrl, produto);
  }

  editar(id: number, produto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, produto);
  }

  alterarStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, {}, { params: { status } });
  }
}