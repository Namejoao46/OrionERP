import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { PainelComponent } from './pages/components/opcoes/painel/painel.component';
import { FinancasComponent } from './pages/components/opcoes/financas/financas.component';
import { VendasComponent } from './pages/components/opcoes/vendas/vendas.component';
import { ComprasComponent } from './pages/components/opcoes/compras/compras.component';
import { RecursosHComponent } from './pages/components/opcoes/recursos-h/recursos-h.component';
import { FiscalComponent } from './pages/components/opcoes/fiscal/fiscal.component';
import { MaisComponent } from './pages/components/opcoes/mais/mais.component';
import { GraficoFinancias } from './pages/components/opcoes/painel/grafico-financias/grafico-financias';
import { Grafico } from './pages/components/opcoes/components-opcoes/grafico/grafico';
import { Mensagens } from './pages/components/opcoes/painel/interacao/mensagens/mensagens';
import { Metas } from './pages/components/opcoes/painel/interacao/metas/metas';
import { Interacao } from './pages/components/opcoes/painel/interacao/interacao';
import { Calendario } from './pages/components/opcoes/painel/interacao/calendario/calendario';
import { Estoque } from './pages/components/opcoes/estoque/estoque';

// IMPORT DO NOVO COMPONENTE (Ajuste o caminho se necessário)
import { CadastroGeralComponent } from './pages/components/cadastro-geral-component/cadastro-geral-component';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  
  { 
    path: 'home', 
    component: HomeComponent,
    canActivate: [authGuard], 
    children: [
      { 
        path: 'painel', 
        component: PainelComponent,
        children: [
          { path: 'grafico', component: Grafico },
          { path: 'grafico-financias', component: GraficoFinancias },
          { 
            path: 'interacao', 
            component: Interacao,
            children: [
              { path: 'mensagens', component: Mensagens },
              { path: 'metas', component: Metas },
              { path: 'calendario', component: Calendario }
            ]
          }
        ]
      },
      
      // --- NOVAS ROTAS UNIFICADAS ---
      
      { 
        path: 'gestao-empresas', 
        component: CadastroGeralComponent, 
        canActivate: [roleGuard(['ADMIN_DEV'])] // Ajustado para ADMIN_DEV conforme seu DataInitializer
      },
      
      { 
        path: 'gestao-equipe', 
        component: CadastroGeralComponent, 
        canActivate: [roleGuard(['MASTER'])] 
      },

      // --- ROTAS EXISTENTES ---
      { path: 'financas', component: FinancasComponent },
      { path: 'vendas', component: VendasComponent },
      { path: 'compras', component: ComprasComponent },
      { path: 'recursosH', component: RecursosHComponent },
      { path: 'fiscal', component: FiscalComponent },
      { path: 'mais', component: MaisComponent },
      { path: 'estoque', component: Estoque },
      
      { path: '', redirectTo: 'painel', pathMatch: 'full' },
    ]
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];