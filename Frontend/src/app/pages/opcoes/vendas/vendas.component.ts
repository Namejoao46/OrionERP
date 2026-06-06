import { Component } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import localePt from '@angular/common/locales/pt';

// Import dos Subcomponentes
import { CardsIndicadores } from '../vendas/componentsVendas/cards-indicadores/cards-indicadores';
import { EvolucaoVendas } from './componentsVendas/evolucao-vendas/evolucao-vendas';
import { MetasVendas } from './componentsVendas/metas-vendas/metas-vendas';
import { ResumoFinanceiro } from './componentsVendas/resumo-financeiro/resumo-financeiro';
import { VendasRecentes } from './componentsVendas/vendas-recentes/vendas-recentes';

registerLocaleData(localePt); // Garante a formatação R$ correta

@Component({
  selector: 'app-vendas',
  standalone: true,
  imports: [
    RouterModule, 
    CommonModule, 
    FormsModule,
    CardsIndicadores,
    ResumoFinanceiro,
    MetasVendas,
    VendasRecentes,
    EvolucaoVendas
  ],
  templateUrl: './vendas.component.html',
  styleUrl: './vendas.component.css'
})
export class VendasComponent {}