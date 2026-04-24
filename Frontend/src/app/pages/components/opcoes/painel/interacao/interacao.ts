import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Metas } from "./metas/metas";
import { Mensagens } from "./mensagens/mensagens";
import { Calendario } from "./calendario/calendario";

@Component({
  selector: 'app-interacao',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, Metas, Mensagens, Calendario],
  templateUrl: './interacao.html',
  styleUrls: ['./interacao.css'],
})
export class Interacao {

}
