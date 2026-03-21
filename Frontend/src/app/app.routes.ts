import { Routes } from '@angular/router';
import {LoginComponent} from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { MenuBarComponent } from './pages/components/menu-bar/menu-bar.component';
import { MenuComponent } from './pages/components/menu/menu.component';
import { OpcoesComponent } from './pages/components/opcoes/opcoes.component';
import { PainelComponent } from './pages/components/opcoes/painel/painel.component';
import { FinancasComponent } from './pages/components/opcoes/financas/financas.component';
import { VendasComponent } from './pages/components/opcoes/vendas/vendas.component';
import { ComprasComponent } from './pages/components/opcoes/compras/compras.component';
import { RecursosHComponent } from './pages/components/opcoes/recursos-h/recursos-h.component';
import { FiscalComponent } from './pages/components/opcoes/fiscal/fiscal.component';
import { MaisComponent } from './pages/components/opcoes/mais/mais.component';
import { MenuFixoComponent } from './pages/components/menu-fixo/menu-fixo.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent,
    children:[
      { path: 'painel', component: PainelComponent },
      { path: 'financas', component: FinancasComponent },
      { path: 'vendas', component: VendasComponent },
      { path: 'compras', component: ComprasComponent },
      { path: 'recursosH', component: RecursosHComponent },
      { path: 'fiscal', component: FiscalComponent },
      { path: 'mais', component: MaisComponent },

      { path: '', redirectTo: 'painel', pathMatch: 'full' },
    ]
  },


  /*componentes de auxilio*/
  { path: 'menuBar', component: MenuBarComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'opcoes', component: OpcoesComponent },
  { path: 'menu-fixo', component: MenuFixoComponent },


  
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
