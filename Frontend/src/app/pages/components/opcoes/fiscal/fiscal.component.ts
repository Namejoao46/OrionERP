import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-fiscal',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './fiscal.component.html',
  styleUrl: './fiscal.component.css'
})
export class FiscalComponent {

}
