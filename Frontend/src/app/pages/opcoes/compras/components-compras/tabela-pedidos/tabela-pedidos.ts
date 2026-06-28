import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GastosService } from '../../../../../core/services/finance/Gastos.service';

@Component({
  selector: 'app-tabela-pedidos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabela-pedidos.html',
  styleUrl: './tabela-pedidos.css',
})
export class TabelaPedidos implements OnInit {
  pedidos: any[] = [];

  constructor(
    private gastosService: GastosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarPedidosRecentes();
  }

  carregarPedidosRecentes(): void {
    console.log('[🔍 RASTREAMENTO - TABELA] Buscando pedidos recentes...');
    this.gastosService.listarPedidosRecentes().subscribe({
      next: (dados) => {
        console.log('[✅ RASTREAMENTO - TABELA] Pedidos recebidos:', dados);
        this.pedidos = dados;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('[❌ RASTREAMENTO - TABELA] Erro ao listar pedidos:', err);
      }
    });
  }

  // 🔥 Adicionado: Captura a mudança do select e dispara a atualização vinculativa
  mudarStatus(id: number, novoStatus: string): void {
    console.log(`[🔄 VÍNCULO] Alterando status do pedido #${id} para: ${novoStatus}`);
    
    this.gastosService.alterarStatusPedido(id, novoStatus).subscribe({
      next: (resposta) => {
        console.log('[✅ VÍNCULO] Status atualizado no servidor com sucesso:', resposta);
        // Atualiza a lista local para refletir os novos valores de estoque/cards na tela global
        this.carregarPedidosRecentes();
      },
      error: (err) => {
        console.error('[❌ VÍNCULO] Erro ao mudar status do pedido:', err);
      }
    });
  }
}