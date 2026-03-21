import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-financas',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './financas.component.html',
  styleUrl: './financas.component.css'
})
export class FinancasComponent {

}
