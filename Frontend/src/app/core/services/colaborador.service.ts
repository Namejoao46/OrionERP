import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ColaboradorService {
  // Garantindo que aponta para o Backend (8080)
  private apiUrl = 'http://localhost:8080/api/colaboradores'; 

  constructor(private http: HttpClient) { }

  /**
   * Cria o cabeçalho com o Token para o SecurityFilter do Java aceitar a requisição
   */
  private getOptions() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  listarTodos(): Observable<any[]> {
    // Agora enviamos as opções com o cabeçalho de segurança
    return this.http.get<any[]>(this.apiUrl, this.getOptions());
  }

  // Útil para quando o Master for cadastrar um colaborador
  cadastrar(colaborador: any): Observable<any> {
    return this.http.post(this.apiUrl, colaborador, this.getOptions());
  }
}