import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotaRecebimentoService {
  private apiUrl = 'http://localhost:8080/api/notas-recebimento';

  constructor(private http: HttpClient) {}

  // Envia o arquivo XML para o Backend
  importarXml(arquivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('xml', arquivo);
    return this.http.post(`${this.apiUrl}/importar-xml`, formData);
  }

  vincularItem(itemNotaId: number, produtoId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/vincular-item`, { itemNotaId, produtoId });
  }

  confirmarEntrada(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/confirmar`, {});
  }

  listarTodas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}