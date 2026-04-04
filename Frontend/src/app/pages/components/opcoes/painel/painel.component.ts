import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Grafico } from "./grafico/grafico";

@Component({
  selector: 'app-painel',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, Grafico],
  templateUrl: './painel.component.html',
  styleUrls: ['./painel.component.css']
})
export class PainelComponent {

}
