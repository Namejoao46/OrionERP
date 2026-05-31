import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FornecedorService {
  private apiUrl = 'http://localhost:8080/api/fornecedores';

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  salvar(fornecedor: any): Observable<any> {
    return this.http.post(this.apiUrl, fornecedor);
  }

  // Envia o XML para o Java processar os dados do emitente
  importarXml(arquivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('xml', arquivo);
    return this.http.post(`${this.apiUrl}/importar-xml`, formData);
  }
}