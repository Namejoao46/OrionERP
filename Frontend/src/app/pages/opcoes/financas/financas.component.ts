import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AcoesRapidasFinancasComponent } from './components-financas/acoes-rapidas-financas/acoes-rapidas-financas';
import { CardMetricaFinancasComponent } from './components-financas/card-metrica-financas/card-metrica-financas';
import { DreGerencialComponent } from './components-financas/dre-gerencial/dre-gerencial';
import { FluxoCaixaChartComponent } from './components-financas/fluxo-caixa-chart/fluxo-caixa-chart';
import { TabelaContasComponent } from './components-financas/tabela-contas/tabela-contas';
import { WidgetsLateraisComponent } from './components-financas/widgets-laterais/widgets-laterais';

@Component({
  selector: 'app-financas',
  standalone: true,
  imports: [
    RouterModule, 
    CommonModule, 
    FormsModule,
    CardMetricaFinancasComponent,
    FluxoCaixaChartComponent,
    DreGerencialComponent,
    TabelaContasComponent,
    WidgetsLateraisComponent,
    AcoesRapidasFinancasComponent
  ],
  templateUrl: './financas.component.html',
  styleUrls: ['./financas.component.css']
})
export class FinancasComponent {
  metricasFinancas = [
    { titulo: 'Saldo em Caixa', valor: 'R$ 512.240,75', rodape: '▲ +8,6% vs. mês anterior', icone: 'icon-wallet' },
    { titulo: 'A Receber', valor: 'R$ 1.248.900,50', rodape: '▲ +12,4% vs. mês anterior', icone: 'icon-trending-up' },
    { titulo: 'A Pagar', valor: 'R$ 732.560,40', rodape: '▼ -5,7% vs. mês anterior', icone: 'icon-trending-down' },
    { titulo: 'Inadimplência', valor: 'R$ 189.430,30', rodape: '▲ +9,1% vs. mês anterior', icone: 'icon-alert-triangle' }
  ];
}