import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-grafico-financias',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './grafico-financias.html',
  styleUrl: './grafico-financias.css',
})
export class GraficoFinancias {

}
