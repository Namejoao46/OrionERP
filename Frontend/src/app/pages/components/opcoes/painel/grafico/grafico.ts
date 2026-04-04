import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-grafico',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './grafico.html',
  styleUrls: ['./grafico.css'],
})
export class Grafico {

}
