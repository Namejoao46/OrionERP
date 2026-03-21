import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-vendas',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './vendas.component.html',
  styleUrl: './vendas.component.css'
})
export class VendasComponent {

}
