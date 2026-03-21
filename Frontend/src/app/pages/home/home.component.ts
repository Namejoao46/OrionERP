import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MenuBarComponent } from "../components/menu-bar/menu-bar.component";
import { OpcoesComponent } from "../components/opcoes/opcoes.component";
import { MenuFixoComponent } from "../components/menu-fixo/menu-fixo.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, MenuBarComponent, OpcoesComponent, MenuFixoComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
