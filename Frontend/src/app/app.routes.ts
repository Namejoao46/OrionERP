import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { CadastroGeralComponent } from './pages/components/cadastros/cadastro-geral-component/cadastro-geral-component';
import { Grafico } from './pages/opcoes/components-opcoes/grafico/grafico';
import { ComprasComponent } from './pages/opcoes/compras/compras.component';
import { Estoque } from './pages/opcoes/estoque/estoque';
import { FinancasComponent } from './pages/opcoes/financas/financas.component';
import { FiscalComponent } from './pages/opcoes/fiscal/fiscal.component';
import { MaisComponent } from './pages/opcoes/mais/mais.component';
import { GraficoFinancias } from './pages/opcoes/painel/grafico-financias/grafico-financias';
import { Calendario } from './pages/opcoes/painel/interacao/calendario/calendario';
import { Interacao } from './pages/opcoes/painel/interacao/interacao';
import { Mensagens } from './pages/opcoes/painel/interacao/mensagens/mensagens';
import { Metas } from './pages/opcoes/painel/interacao/metas/metas';
import { PainelComponent } from './pages/opcoes/painel/painel.component';
import { RecursosHComponent } from './pages/opcoes/recursos-h/recursos-h.component';
import { VendasComponent } from './pages/opcoes/vendas/vendas.component';

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