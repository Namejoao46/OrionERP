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

  registrarToken(username: string, token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/registrar-token`, { username, token }, this.getHttpOptions());
  }

  // Agora só envia destinatário e mensagem, remetente vem do JWT
  enviarMensagem(destinatario: string, mensagem: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/enviar`, { destinatario, mensagem }, this.getHttpOptions());
  }

  // Busca mensagens pendentes do usuário logado (não precisa passar destinatário)
  buscarPendentes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/pendentes`, this.getHttpOptions());
  }

  marcarComoLida(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/marcar-lida`, { id }, this.getHttpOptions());
  }

  // Novo: lista todos os usuários exceto o logado
  listarUsuarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios`, this.getHttpOptions());
  }

  buscarConversa(contato: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/conversa/${contato}`, this.getHttpOptions());
  }

}
