import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CardMetricaRhComponent } from './components-rh/card-metrica-rh/card-metrica-rh';
import { CardModuloRhComponent } from './components-rh/card-modulo-rh/card-modulo-rh';
import { VisaoGeralEquipeComponent } from './components-rh/visao-geral-equipe/visao-geral-equipe';
import { AcoesRapidasRh } from "./components-rh/acoes-rapidas-rh/acoes-rapidas-rh";

@Component({
  selector: 'app-recursos-h',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    CardMetricaRhComponent,
    CardModuloRhComponent,
    VisaoGeralEquipeComponent,
    AcoesRapidasRh
],
  templateUrl: './recursos-h.component.html',
  styleUrl: './recursos-h.component.css'
})
export class RecursosHComponent {
  
  metricasRH = [
    { titulo: 'Colaboradores Ativos', valor: '128', rodape: 'Total na empresa', icone: 'icon-users' },
    { titulo: 'Folha do Mês', valor: 'R$ 286.400', rodape: 'Valor bruto', icone: 'icon-dollar' },
    { titulo: 'Registros de Hoje', valor: '94%', rodape: 'Pontos registrados', icone: 'icon-clock' },
    { titulo: 'Documentos Pendentes', valor: '12', rodape: 'Aguardando ação', icone: 'icon-alert' }
  ];

  modulosRH = [
    { titulo: 'Folha de Pagamento', descricao: 'Cálculo de salários, descontos e benefícios.', icone: 'icon-wallet' },
    { titulo: 'Gestão de Ponto', descricao: 'Registro de entrada, saída e banco de horas.', icone: 'icon-calendar' },
    { titulo: 'Documentação e Contratos', descricao: 'Arquivo digital de documentos de funcionários.', icone: 'icon-folder' },
    { titulo: 'Avaliação de Desempenho', descricao: 'Metas atingidas por colaborador.', icone: 'icon-award' }
  ];
}