import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MensagemService {
  // Garanta que a porta 8080 está correta para o seu Backend
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

  // Ajustado: O componente chama 'enviarMensagem' com (destinatario, conteudo)
  enviarMensagem(destinatario: string, conteudo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/enviar`, { destinatario, conteudo }, this.getHttpOptions());
  }

  buscarConversa(contato: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/conversa/${contato}`, this.getHttpOptions());
  }

  listarUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios`, this.getHttpOptions());
  }

  // Outros métodos auxiliares
  buscarPendentes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/pendentes`, this.getHttpOptions());
  }

  marcarComoLida(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/marcar-lida`, { id }, this.getHttpOptions());
  }
}