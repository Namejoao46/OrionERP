import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotaRecebimentoService {
  private apiUrl = 'http://localhost:8080/api/notas-recebimento';

  constructor(private http: HttpClient) {
    console.log('[TRACKING-SERVICE] NotaRecebimentoService instanciado para auditoria fiscal.');
  }

  importarXml(arquivo: File): Observable<any> {
    const startTime = performance.now();
    console.log(`[TRACKING-SERVICE] [POST] Enviando XML de Nota de Recebimento para entrada no estoque. Arquivo: ${arquivo.name}`);

    const formData = new FormData();
    formData.append('xml', arquivo);

    return this.http.post<any>(`${this.apiUrl}/importar-xml`, formData).pipe(
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

  vincularItem(itemNotaId: number, produtoId: number): Observable<void> {
    const startTime = performance.now();
    console.log(`[TRACKING-SERVICE] [POST] Preparando vínculo De-Para de Item de Nota de Entrada. ItemNotaID: ${itemNotaId} -> ProdutoSistemaID: ${produtoId}`);

    const params = new HttpParams()
      .set('itemId', itemNotaId.toString())
      .set('produtoId', produtoId.toString());

    return this.http.post<void>(`${this.apiUrl}/vincular-item`, null, { params }).pipe(
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

  confirmarEntrada(id: number): Observable<void> {
    const startTime = performance.now();
    console.log(`[TRACKING-SERVICE] [POST] REQUISIÇÃO CRÍTICA: Disparando trigger de fechamento físico/financeiro e recalculo de custo médio para a Nota ID: ${id}`);

    return this.http.post<void>(`${this.apiUrl}/${id}/confirmar`, {}).pipe(
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

  listarTodas(): Observable<any[]> {
    const startTime = performance.now();
    console.log(`[TRACKING-SERVICE] [GET] Solicitando histórico completo de Notas de Recebimento.`);

    return this.http.get<any[]>(this.apiUrl).pipe(
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
}