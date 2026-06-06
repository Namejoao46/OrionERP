import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ColaboradorService {
  // Garantindo que aponta para o Backend (8080)
  private apiUrl = 'http://localhost:8080/api/colaboradores'; 

  constructor(private http: HttpClient) { }

  listarEquipe(): Observable<any[]> {
    console.log('============= [ColaboradorService] -> DISPARANDO GET /equipe =============');
    return this.http.get<any[]>(`${this.apiUrl}/equipe`).pipe(
      tap({
        next: (response) => {
          console.log('============= [ColaboradorService] <- SUCESSO GET /equipe =============');
          console.log('Qtd de colaboradores retornados:', response ? response.length : 0);
          console.log('Dados da Equipe:', response);
          console.log('========================================================================');
        },
        error: (err) => {
          console.error('============= [ColaboradorService] ! ERRO GET /equipe =============');
          console.error('Status do erro:', err.status);
          console.error('Detalhes do erro:', err);
          console.log('========================================================================');
        }
      })
    );
  }

  uploadFoto(id: number, foto: File): Observable<any> {
    console.log('============= [ColaboradorService] -> DISPARANDO POST /upload-foto =============');
    console.log('Parâmetro ID enviado:', id);
    console.log('Dados do arquivo capturado:', {
      nomeArquivo: foto?.name,
      tamanho: foto?.size + ' bytes',
      tipoMime: foto?.type
    });

    const formData = new FormData();
    formData.append('foto', foto);

    return this.http.post(`${this.apiUrl}/${id}/upload-foto`, formData, { responseType: 'text' }).pipe(
      tap({
        next: (responseString) => {
          console.log('============= [ColaboradorService] <- SUCESSO POST /upload-foto =============');
          console.log('Resposta textual do servidor:', responseString);
          console.log('==============================================================================');
        },
        error: (err) => {
          console.error('============= [ColaboradorService] ! ERRO POST /upload-foto =============');
          console.error('Status da falha:', err.status);
          console.error('Mensagem de erro capturada:', err.message);
          console.log('==============================================================================');
        }
      })
    );
  }

  cadastrar(colaborador: any): Observable<any> {
    console.log('============= [ColaboradorService] -> DISPARANDO POST /cadastrar =============');
    console.log('Payload enviado para criação:', JSON.stringify(colaborador, null, 2));

    return this.http.post(`${this.apiUrl}/cadastrar`, colaborador).pipe(
      tap({
        next: (response) => {
          console.log('============= [ColaboradorService] <- SUCESSO POST /cadastrar =============');
          console.log('Objeto persistido retornado pelo Backend:', response);
          console.log('===========================================================================');
        },
        error: (err) => {
          console.error('============= [ColaboradorService] ! ERRO POST /cadastrar =============');
          console.error('Status:', err.status);
          console.error('Resposta de erro do servidor:', err.error);
          console.log('===========================================================================');
        }
      })
    );
  }

  atualizarPerfil(id: number, colaborador: any): Observable<any> {
    console.log('============= [ColaboradorService] -> DISPARANDO PUT /atualizar-perfil =============');
    console.log('ID enviado na URL da rota:', id);
    console.log('Payload do formulário interceptado para envio:', JSON.stringify(colaborador, null, 2));

    return this.http.put(`${this.apiUrl}/${id}/atualizar-perfil`, colaborador).pipe(
      tap({
        next: (response) => {
          console.log('============= [ColaboradorService] <- SUCESSO PUT /atualizar-perfil =============');
          console.log('Response atualizado retornado pelo Hibernate:', response);
          console.log('===================================================================================');
        },
        error: (err) => {
          console.error('============= [ColaboradorService] ! ERRO PUT /atualizar-perfil =============');
          console.error('Status HTTP:', err.status);
          console.error('Conteúdo da falha retornada:', err.error);
          console.log('===================================================================================');
        }
      })
    );
  }
}