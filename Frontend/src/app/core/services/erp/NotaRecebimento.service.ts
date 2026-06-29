import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotaRecebimentoService {
  private apiUrl = 'http://localhost:8080/api/notas-recebimento';

  constructor(private http: HttpClient) {
    console.log('[TRACKING-SERVICE] NotaRecebimentoService instanciado para auditoria fiscal.');
  }

  /**
   * 🔒 Cria os cabeçalhos de segurança padronizados para o ecossistema Multi-Tenant.
   * Alinha o envio com o cabeçalho 'X-Empresa-Id' esperado pelo `@RequestHeader` do Java.
   */
  private criarHeadersSeguranca(): HttpHeaders {
    const role = localStorage.getItem('userRole') || 'USER';
    const empresaId = localStorage.getItem('empresaId') || '1'; // Fallback seguro para testes
    
    console.log(`[TRACKING-SERVICE] Injetando escopo Multi-Tenant. Empresa-Id: "${empresaId}" | Role: "${role}"`);
    
    return new HttpHeaders({ 
      'User-Role': role,
      'X-Empresa-Id': empresaId
    });
  }

  // 1. IMPORTAR XML
  importarXml(arquivo: File): Observable<any> {
    const startTime = performance.now();
    const headers = this.criarHeadersSeguranca();
    console.log(`[TRACKING-SERVICE] [POST] Enviando XML de Nota de Recebimento para entrada no estoque. Arquivo: ${arquivo.name}`);

    const formData = new FormData();
    formData.append('xml', arquivo);

    return this.http.post<any>(`${this.apiUrl}/importar-xml`, formData, { headers }).pipe(
      tap((res) => {
        const endTime = performance.now();
        console.log(`[TRACKING-SERVICE] [SUCCESS] Nota Fiscal importada como RASCUNHO. Chave de Acesso: ${res.chaveAcesso || 'N/A'} | Itens detectados: ${res.itens?.length || 0} | Tempo: ${(endTime - startTime).toFixed(2)}ms`);
      }),
      catchError((err) => {
        console.error('[TRACKING-SERVICE] [ERROR] Falha crítica ao tentar processar entrada de XML de Nota.', err);
        return throwError(() => err);
      })
    );
  }

  // 2. VINCULAR ITEM (DE-PARA)
  vincularItem(itemNotaId: number, produtoId: number): Observable<any> {
    const startTime = performance.now();
    const headers = this.criarHeadersSeguranca();
    console.log(`[TRACKING-SERVICE] [POST] Preparando vínculo De-Para de Item de Nota de Entrada. ItemNotaID: ${itemNotaId} -> ProdutoSistemaID: ${produtoId}`);

    const payload = {
      itemNotaId: itemNotaId,
      produtoId: produtoId
    };

    return this.http.post<any>(`${this.apiUrl}/vincular-item`, payload, { headers }).pipe(
      tap(() => {
        const endTime = performance.now();
        console.log(`[TRACKING-SERVICE] [SUCCESS] Vínculo de relacionamento gravado no banco de dados com sucesso. Tempo: ${(endTime - startTime).toFixed(2)}ms`);
      }),
      catchError((err) => {
        console.error(`[TRACKING-SERVICE] [ERROR] Falha ao tentar mapear item ${itemNotaId} para o produto ${produtoId}`, err);
        return throwError(() => err);
      })
    );
  }

  // 3. CONFIRMAR ENTRADA (LANÇAMENTO FÍSICO/FINANCEIRO)
  confirmarEntrada(id: number): Observable<any> {
    const startTime = performance.now();
    const headers = this.criarHeadersSeguranca();
    console.log(`[TRACKING-SERVICE] [POST] REQUISIÇÃO CRÍTICA: Disparando trigger de fechamento físico/financeiro para a Nota ID: ${id}`);

    return this.http.post<any>(`${this.apiUrl}/${id}/confirmar`, {}, { headers }).pipe(
      tap(() => {
        const endTime = performance.now();
        console.log(`[TRACKING-SERVICE] [SUCCESS] Fechamento e consolidação de estoque da Nota Fiscal executado com sucesso! Status: CONFIRMADO | Tempo: ${(endTime - startTime).toFixed(2)}ms`);
      }),
      catchError((err) => {
        console.error(`[TRACKING-SERVICE] [CRITICAL-ERROR] Falha ao tentar processar a confirmação de entrada da nota ${id}.`, err);
        return throwError(() => err);
      })
    );
  }

  // 4. CANCELAR NOTA
  cancelarNota(id: number): Observable<any> {
    const startTime = performance.now();
    const headers = this.criarHeadersSeguranca();
    console.log(`[TRACKING-SERVICE] [POST] Solicitando cancelamento do rascunho da Nota ID: ${id}`);

    return this.http.post<any>(`${this.apiUrl}/${id}/cancelar`, {}, { headers }).pipe(
      tap(() => {
        const endTime = performance.now();
        console.log(`[TRACKING-SERVICE] [SUCCESS] Nota cancelada no sistema. Status: CANCELADO | Tempo: ${(endTime - startTime).toFixed(2)}ms`);
      }),
      catchError((err) => {
        console.error(`[TRACKING-SERVICE] [ERROR] Erro ao tentar cancelar a nota ${id}.`, err);
        return throwError(() => err);
      })
    );
  }

  // 5. LISTAR TODAS AS NOTAS (GRID HISTÓRICO)
  listarTodas(): Observable<any[]> {
    const startTime = performance.now();
    const headers = this.criarHeadersSeguranca();
    console.log(`[TRACKING-SERVICE] [GET] Solicitando histórico completo de Notas de Recebimento.`);

    return this.http.get<any[]>(this.apiUrl, { headers }).pipe(
      tap((res) => {
        const endTime = performance.now();
        console.log(`[TRACKING-SERVICE] [SUCCESS] Histórico de notas retornado. Total de documentos: ${res.length} | Tempo: ${(endTime - startTime).toFixed(2)}ms`);
      }),
      catchError((err) => {
        console.error('[TRACKING-SERVICE] [ERROR] Erro ao carregar grid de Notas de Entrada.', err);
        return throwError(() => err);
      })
    );
  }

  // 6. BUSCAR NOTA POR ID DETALHADO
  buscarPorId(id: number): Observable<any> {
    const headers = this.criarHeadersSeguranca();
    console.log(`[TRACKING-SERVICE] [GET] Buscando detalhes da Nota ID: ${id}`);
    
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers }).pipe(
      catchError((err) => {
        console.error(`[TRACKING-SERVICE] [ERROR] Erro ao buscar nota ${id}.`, err);
        return throwError(() => err);
      })
    );
  }
}