import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private apiUrl = 'http://localhost:8080/api/produtos';

  constructor(private http: HttpClient) {
    console.log('[TRACKING-SERVICE] ProdutoService instanciado e monitorado via Logs.');
  }

  listarTodos(): Observable<any[]> {
    const startTime = performance.now();
    console.log(`[TRACKING-SERVICE] [GET] Listando catálogo geral de produtos.`);

    return this.http.get<any[]>(this.apiUrl).pipe(
      tap((res) => {
        const endTime = performance.now();
        console.log(`[TRACKING-SERVICE] [SUCCESS] Catálogo carregado. Total: ${res.length} itens | Tempo: ${(endTime - startTime).toFixed(2)}ms`);
      }),
      catchError((err) => {
        console.error('[TRACKING-SERVICE] [ERROR] Falha ao carregar catálogo global de produtos.', err);
        return throwError(() => err);
      })
    );
  }

  listarAtivos(): Observable<any[]> {
    const startTime = performance.now();
    console.log(`[TRACKING-SERVICE] [GET] Filtrando apenas produtos ativos para operação comercial.`);

    return this.http.get<any[]>(`${this.apiUrl}/ativos`).pipe(
      tap((res) => {
        const endTime = performance.now();
        console.log(`[TRACKING-SERVICE] [SUCCESS] Lista de produtos ativos pronta. Quantidade: ${res.length} | Tempo: ${(endTime - startTime).toFixed(2)}ms`);
      }),
      catchError((err) => {
        console.error('[TRACKING-SERVICE] [ERROR] Erro ao recuperar produtos ativos.', err);
        return throwError(() => err);
      })
    );
  }

  buscar(termo: string): Observable<any[]> {
    const startTime = performance.now();
    console.log(`[TRACKING-SERVICE] [GET] Executando query de busca incremental por string. Termo pesquisado: "${termo}"`);

    const params = new HttpParams().set('termo', termo);

    return this.http.get<any[]>(`${this.apiUrl}/buscar`, { params }).pipe(
      tap((res) => {
        const endTime = performance.now();
        console.log(`[TRACKING-SERVICE] [SUCCESS] Busca refinada concluída. Correspondências encontradas para "${termo}": ${res.length} | Tempo: ${(endTime - startTime).toFixed(2)}ms`);
      }),
      catchError((err) => {
        console.error(`[TRACKING-SERVICE] [ERROR] Falha ao tentar pesquisar termo: "${termo}"`, err);
        return throwError(() => err);
      })
    );
  }

  cadastrar(produto: any): Observable<any> {
    const startTime = performance.now();
    console.log(`[TRACKING-SERVICE] [POST] Cadastrando novo SKU no sistema. Rota base: ${this.apiUrl}`, { payload: produto });

    return this.http.post(this.apiUrl, produto).pipe(
      tap((res: any) => {
        const endTime = performance.now();
        console.log(`[TRACKING-SERVICE] [SUCCESS] Produto cadastrado na base com sucesso. ID Gerado: ${res?.id} | SKU: ${res?.descricao} | Tempo: ${(endTime - startTime).toFixed(2)}ms`);
      }),
      catchError((err) => {
        console.error('[TRACKING-SERVICE] [ERROR] Erro ao submeter criação de produto.', err);
        return throwError(() => err);
      })
    );
  }

  editar(id: number, produto: any): Observable<any> {
    const startTime = performance.now();
    console.log(`[TRACKING-SERVICE] [PUT] Alterando dados cadastrais estruturais do produto ID: ${id}`, { payloadModificacao: produto });

    return this.http.put(`${this.apiUrl}/${id}`, produto).pipe(
      tap((res: any) => {
        const endTime = performance.now();
        console.log(`[TRACKING-SERVICE] [SUCCESS] Atualização do produto concluída para o ID ${id}. Tempo: ${(endTime - startTime).toFixed(2)}ms`);
      }),
      catchError((err) => {
        console.error(`[TRACKING-SERVICE] [ERROR] Erro ao atualizar produto ID ${id}.`, err);
        return throwError(() => err);
      })
    );
  }

  alterarStatus(id: number, status: string): Observable<any> {
    const startTime = performance.now();
    console.log(`[TRACKING-SERVICE] [PATCH] Alteração de estado de ativação de SKU. ID: ${id} -> Novo Status Desejado: "${status}"`);

    const params = new HttpParams().set('status', status);

    return this.http.patch(`${this.apiUrl}/${id}/status`, {}, { params }).pipe(
      tap((res: any) => {
        const endTime = performance.now();
        console.log(`[TRACKING-SERVICE] [SUCCESS] Transição de estado de ativação consolidada para o ID ${id}. Estado atual: ${res?.status || status} | Tempo: ${(endTime - startTime).toFixed(2)}ms`);
      }),
      catchError((err) => {
        console.error(`[TRACKING-SERVICE] [ERROR] Falha ao tentar mudar flag de ativação do produto ${id}.`, err);
        return throwError(() => err);
      })
    );
  }

  listarPorFornecedor(fornecedorId: number): Observable<any[]> {
    const startTime = performance.now();
    console.log(`[TRACKING-SERVICE] [GET] Buscando produtos vinculados ao fornecedor ID: ${fornecedorId}`);

    return this.http.get<any[]>(`${this.apiUrl}/por-fornecedor/${fornecedorId}`).pipe(
      tap((res) => {
        const endTime = performance.now();
        console.log(`[TRACKING-SERVICE] [SUCCESS] Produtos do fornecedor ${fornecedorId} carregados. Total: ${res.length} itens | Tempo: ${(endTime - startTime).toFixed(2)}ms`);
      }),
      catchError((err) => {
        console.error(`[TRACKING-SERVICE] [ERROR] Falha ao carregar produtos do fornecedor ${fornecedorId}`, err);
        return throwError(() => err);
      })
    );
  }

  deletar(id: number): Observable<void> {
    const startTime = performance.now();
    console.log(`[TRACKING-SERVICE] [DELETE] Solicitando exclusão do produto ID: ${id}`);

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const endTime = performance.now();
        console.log(`[TRACKING-SERVICE] [SUCCESS] Produto ID ${id} excluído com sucesso do banco | Tempo: ${(endTime - startTime).toFixed(2)}ms`);
      }),
      catchError((err) => {
        console.error(`[TRACKING-SERVICE] [ERROR] Erro ao deletar produto ID ${id}. Detalhes:`, err.error || err.message);
        return throwError(() => err);
      })
    );
  }

  listarEstoqueBaixo(): Observable<any[]> {
    const startTime = performance.now();
    console.log(`[TRACKING-SERVICE] [GET] Buscando itens com estoque em nível crítico.`);

    return this.http.get<any[]>(`${this.apiUrl}/estoque-baixo`).pipe(
      tap((res) => {
        const endTime = performance.now();
        console.log(`[TRACKING-SERVICE] [SUCCESS] Alerta de reposição gerado. Total crítico: ${res.length} SKUs | Tempo: ${(endTime - startTime).toFixed(2)}ms`);
      }),
      catchError((err) => {
        console.error('[TRACKING-SERVICE] [ERROR] Falha ao processar relatório de estoque crítico.', err);
        return throwError(() => err);
      })
    );
  }

  obterValorTotalEstoque(): Observable<number> {
    const startTime = performance.now();
    console.log(`[TRACKING-SERVICE] [GET] Requisitando avaliação patrimonial de inventário.`);

    return this.http.get<number>(`${this.apiUrl}/patrimonio-total`).pipe(
      tap((valor) => {
        const endTime = performance.now();
        console.log(`[TRACKING-SERVICE] [SUCCESS] Avaliação financeira de pátio: BRL ${valor} | Tempo: ${(endTime - startTime).toFixed(2)}ms`);
      }),
      catchError((err) => {
        console.error('[TRACKING-SERVICE] [ERROR] Falha ao obter avaliação do patrimônio.', err);
        return throwError(() => err);
      })
    );
  }
}