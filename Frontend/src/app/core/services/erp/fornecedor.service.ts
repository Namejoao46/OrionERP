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

  private obtenerUserRole(): string {
    const role = localStorage.getItem('userRole') || 'USER'; 
    console.log(`[TRACKING-SERVICE] Verificando Contexto de Segurança. Role atual detectada: "${role}"`);
    return role;
  }

  private obtenerEmpresaId(): string {
    const empresaId = localStorage.getItem('empresaId');
    
    if (!empresaId || empresaId === '0') {
      console.warn('[TRACKING-SERVICE] [WARN] Tenant inválido ("0" ou nulo) detectado. Aplicando fallback seguro para Empresa ID: "1".');
      return '1';
    }
    
    console.log(`[TRACKING-SERVICE] Contexto Multi-Tenant. Empresa-Id detectado: "${empresaId}"`);
    return empresaId;
  }

  private criarHeadersSeguranca(): HttpHeaders {
    const role = this.obtenerUserRole();
    const empresaId = this.obtenerEmpresaId();
    console.log('[TRACKING-SERVICE] Injetando metadados de auditoria e escopo Multi-Tenant nos cabeçalhos HTTP.');
    
    return new HttpHeaders({ 
      'User-Role': role,
      'X-Empresa-Id': empresaId
    });
  }

  listarTodos(): Observable<Fornecedor[]> {
    const startTime = performance.now();
    const headers = this.criarHeadersSeguranca();
    console.log(`[TRACKING-SERVICE] [GET] Solicitando listagem isolada de fornecedores à rota: ${this.apiUrl}`);

    return this.http.get<Fornecedor[]>(this.apiUrl, { headers }).pipe(
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
        console.error(`[TRACKING-SERVICE] [ERROR] Erro ao tentar remover o fornecedor de ID: ${id}`, err);
        return throwError(() => err);
      })
    );
  }

  importarXml(arquivo: File): Observable<Fornecedor> {
    const startTime = performance.now();
    const headers = this.criarHeadersSeguranca();
    console.log(`[TRACKING-SERVICE] [POST] Transmitindo payload binário (XML) para processamento fiscal. Arquivo: ${arquivo.name}`);
    
    const formData = new FormData();
    formData.append('xml', arquivo);

    return this.http.post<Fornecedor>(`${this.apiUrl}/importar-xml`, formData, { headers }).pipe(
      tap((res) => {
        const endTime = performance.now();
        console.log(`[TRACKING-SERVICE] [SUCCESS] XML processado e associado à empresa proprietária. Dados do Emitente:`, res, `| Tempo: ${(endTime - startTime).toFixed(2)}ms`);
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
    console.log(`[TRACKING-SERVICE] [PUT] Iniciando upload multipart da imagem do fornecedor. ID Alvo: ${id}`);

    const formData = new FormData();
    formData.append('foto', arquivoFoto);

    return this.http.put<Fornecedor>(`${this.apiUrl}/${id}/foto`, formData, { headers }).pipe(
      tap((res) => {
        const endTime = performance.now();
        console.log(`[TRACKING-SERVICE] [SUCCESS] Upload de foto executado e vinculado ao ID ${id}. Tempo: ${(endTime - startTime).toFixed(2)}ms`);
      }),
      catchError((err) => {
        console.error(`[TRACKING-SERVICE] [ERROR] Erro no pipe de upload da imagem para o ID ${id}.`, err);
        return throwError(() => err);
      })
    );
  }
}