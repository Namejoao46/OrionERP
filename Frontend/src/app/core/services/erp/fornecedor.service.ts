import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';

export interface Fornecedor {
  id?: number;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  cnaePrincipal?: string;
  crt?: number;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  cidade?: string;
  uf?: string;
  cMun?: string;
  telefone?: string;
  foto?: string;
  email?: string;
  chavePix?: string;
  leadTime?: number;
  limiteCredito?: number;
  observacoes?: string;
}

@Injectable({ providedIn: 'root' })
export class FornecedorService {
  private apiUrl = 'http://localhost:8080/api/fornecedores';

  constructor(private http: HttpClient) {
    console.log('[TRACKING-SERVICE] FornecedorService instanciado e pronto para monitoramento.');
  }

  private obterUserRole(): string {
    const role = localStorage.getItem('userRole') || 'USER'; 
    console.log(`[TRACKING-SERVICE] Verificando Contexto de Segurança. Role atual detectada: "${role}"`);
    return role;
  }

  private criarHeadersSeguranca(): HttpHeaders {
    const role = this.obterUserRole();
    console.log('[TRACKING-SERVICE] Injetando metadados de auditoria nos cabeçalhos HTTP.');
    return new HttpHeaders({ 'User-Role': role });
  }

  listarTodos(): Observable<Fornecedor[]> {
    const startTime = performance.now();
    console.log(`[TRACKING-SERVICE] [GET] Solicitando listagem geral de fornecedores à rota: ${this.apiUrl}`);

    return this.http.get<Fornecedor[]>(this.apiUrl).pipe(
      tap((res) => {
        const endTime = performance.now();
        console.log(`[TRACKING-SERVICE] [SUCCESS] Listagem retornada. Registros encontrados: ${res.length} | Tempo de resposta: ${(endTime - startTime).toFixed(2)}ms`);
      }),
      catchError((err) => {
        console.error(`[TRACKING-SERVICE] [CRITICAL-ERROR] Falha ao recuperar fornecedores da rota ${this.apiUrl}`, err);
        return throwError(() => err);
      })
    );
  }

  salvar(fornecedor: Fornecedor): Observable<Fornecedor> {
    const startTime = performance.now();
    const headers = this.criarHeadersSeguranca();
    console.log(`[TRACKING-SERVICE] [POST] Invocando persistência de dados textuais. URL: ${this.apiUrl}/salvar`, { payload: fornecedor });

    return this.http.post<Fornecedor>(`${this.apiUrl}/salvar`, fornecedor, { headers }).pipe(
      tap((res) => {
        const endTime = performance.now();
        console.log(`[TRACKING-SERVICE] [SUCCESS] Persistência concluída no banco de dados. ID gerado/atualizado: ${res.id} | Tempo: ${(endTime - startTime).toFixed(2)}ms`);
      }),
      catchError((err) => {
        console.error(`[TRACKING-SERVICE] [ERROR] Falha na requisição de salvamento. Código HTTP: ${err.status}`, { payloadRecusado: fornecedor, erro: err });
        return throwError(() => err);
      })
    );
  }

  // ADICIONADO: Método de deleção/rollback para manter a integridade do ERP
  deletar(id: number): Observable<void> {
    const startTime = performance.now();
    const headers = this.criarHeadersSeguranca();
    console.log(`[TRACKING-SERVICE] [DELETE] Solicitando remoção/rollback do registro ID: ${id}`);

    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }).pipe(
      tap(() => {
        const endTime = performance.now();
        console.log(`[TRACKING-SERVICE] [SUCCESS] Registro excluído com sucesso. Tempo: ${(endTime - startTime).toFixed(2)}ms`);
      }),
      catchError((err) => {
        console.error(`[TRACKING-SERVICE] [ERROR] Erro ao tentar remover o fornecedor órfão de ID: ${id}`, err);
        return throwError(() => err);
      })
    );
  }

  importarXml(arquivo: File): Observable<Fornecedor> {
    const startTime = performance.now();
    console.log(`[TRACKING-SERVICE] [POST] Transmitindo payload binário (XML) para processamento fiscal. Arquivo: ${arquivo.name} | Tamanho: ${arquivo.size} bytes`);
    
    const formData = new FormData();
    formData.append('xml', arquivo);

    return this.http.post<Fornecedor>(`${this.apiUrl}/importar-xml`, formData).pipe(
      tap((res) => {
        const endTime = performance.now();
        console.log(`[TRACKING-SERVICE] [SUCCESS] XML processado e mapeado pelo backend. Dados do Emitente extraídos:`, res, `| Tempo: ${(endTime - startTime).toFixed(2)}ms`);
      }),
      catchError((err) => {
        console.error(`[TRACKING-SERVICE] [ERROR] Falha estrutural ou de validação no parseamento do XML da nota.`, err);
        return throwError(() => err);
      })
    );
  }

  uploadFoto(id: number, arquivoFoto: File): Observable<Fornecedor> {
    const startTime = performance.now();
    const headers = this.criarHeadersSeguranca();
    console.log(`[TRACKING-SERVICE] [PUT] Iniciando upload multipart da imagem do fornecedor. ID Alvo: ${id} | Nome do arquivo: ${arquivoFoto.name}`);

    const formData = new FormData();
    formData.append('foto', arquivoFoto);

    return this.http.put<Fornecedor>(`${this.apiUrl}/${id}/foto`, formData, { headers }).pipe(
      tap((res) => {
        const endTime = performance.now();
        console.log(`[TRACKING-SERVICE] [SUCCESS] Upload de foto executado e vinculado com sucesso ao ID ${id}. Tempo: ${(endTime - startTime).toFixed(2)}ms`);
      }),
      catchError((err) => {
        console.error(`[TRACKING-SERVICE] [ERROR] Erro no pipe de upload da imagem para o ID ${id}.`, err);
        return throwError(() => err);
      })
    );
  }
}