import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MensagemService {

  private apiUrl = 'http://localhost:8080/api/mensagens';

  constructor(private http: HttpClient) {}

  private getHttpOptions() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  enviarMensagem(destinatario: string, conteudo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/enviar`, { 
      destinatario: destinatario, 
      mensagem: conteudo  // Mudado de 'conteudo' para 'mensagem'
    }, this.getHttpOptions());
  }

  buscarConversa(contato: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/conversa/${contato}`, this.getHttpOptions());
  }

  listarUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios`, this.getHttpOptions());
  }

  buscarPendentes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pendentes`, this.getHttpOptions());
  }

  marcarComoLida(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/marcar-lida`, { id }, this.getHttpOptions());
  }

  contarNaoLidas(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/contar-nao-lidas`, this.getHttpOptions());
  }

  listarMensagensRecentes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/recentes`, this.getHttpOptions());
  }
}