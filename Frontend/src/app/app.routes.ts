import { Routes } from '@angular/router';
import {LoginComponent} from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { MenuBarComponent } from './pages/components/menu-bar/menu-bar.component';
import { MenuComponent } from './pages/components/menu/menu.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent},


  /*componentes de auxilio*/
  { path: 'menuBar', component: MenuBarComponent },
  { path: 'menu', component: MenuComponent },


  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
