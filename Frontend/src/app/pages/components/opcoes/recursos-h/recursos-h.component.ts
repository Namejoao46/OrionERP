import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-recursos-h',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './recursos-h.component.html',
  styleUrl: './recursos-h.component.css'
})
export class RecursosHComponent {

}
