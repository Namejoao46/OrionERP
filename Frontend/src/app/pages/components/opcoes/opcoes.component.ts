import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PainelComponent } from "./painel/painel.component";
import { FinancasComponent } from "./financas/financas.component";

@Component({
  selector: 'app-opcoes',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, PainelComponent, FinancasComponent],
  templateUrl: './opcoes.component.html',
  styleUrl: './opcoes.component.css'
})
export class OpcoesComponent {

}
