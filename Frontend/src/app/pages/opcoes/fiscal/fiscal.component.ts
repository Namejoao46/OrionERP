import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AcoesRapidasComponent } from './components-fiscal/acoes-rapidas/acoes-rapidas';
import { CardMetricaComponent } from './components-fiscal/card-metrica/card-metrica';
import { CardModuloComponent } from './components-fiscal/card-modulo/card-modulo';
import { TabelaMovimentacoesComponent } from './components-fiscal/tabela-movimentacoes/tabela-movimentacoes';

@Component({
  selector: 'app-fiscal',
  standalone: true,
  imports: [
    RouterModule, 
    CommonModule, 
    FormsModule,
    CardMetricaComponent,
    CardModuloComponent,
    TabelaMovimentacoesComponent,
    AcoesRapidasComponent
  ],
  templateUrl: './fiscal.component.html',
  styleUrl: './fiscal.component.css'
})
export class FiscalComponent {
  // Dados simulados para popular a tela dinamicamente
  metricas = [
    { titulo: 'Notas Emitidas', valor: '1.248', rodape: 'Este mês', icone: 'icon-doc', color: 'rgba(0,188,212,0.1)' },
    { titulo: 'Pendências SEFAZ', valor: '23', rodape: 'Atualizado hoje', icone: 'icon-alert', color: 'rgba(255,152,0,0.1)' },
    { titulo: 'Manifestações Pendentes', valor: '15', rodape: 'Atualizado hoje', icone: 'icon-user', color: 'rgba(76,175,80,0.1)' },
    { titulo: 'Arquivos Gerados', valor: '48', rodape: 'Este mês', icone: 'icon-box', color: 'rgba(156,39,176,0.1)' }
  ];

  modulos = [
    { titulo: 'Emissão de Notas', descricao: 'NF-e, NFS-e e NFC-e com integração total.', icone: 'icon-add-doc' },
    { titulo: 'Manifestação de Destinatário', descricao: 'Saiba quem emitiu nota contra o seu CNPJ.', icone: 'icon-group' },
    { titulo: 'Cálculo Automático de Impostos', descricao: 'Cálculo baseado no NCM do produto.', icone: 'icon-calc' },
    { titulo: 'Geração de Arquivos', descricao: 'SPED e SINTEGRA para envio ao contador.', icone: 'icon-folder' }
  ];
}