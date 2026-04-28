import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Grafico } from "../components-opcoes/grafico/grafico";
import { GraficoFinancias } from "./grafico-financias/grafico-financias";
import { Interacao } from "./interacao/interacao";
import { CardTempoComponent } from "../components-opcoes/card-tempo/card-tempo";

@Component({
  selector: 'app-painel',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, Grafico, GraficoFinancias, Interacao, CardTempoComponent],
  templateUrl: './painel.component.html',
  styleUrls: ['./painel.component.css']
})
export class PainelComponent {
  horaAtual: any;
  segundosAtual: any;
  tempoTrabalhadoHM: any;
  tempoTrabalhadoS: any;

}
