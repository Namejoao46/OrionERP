import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-estoque',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './estoque.html',
  styleUrl: './estoque.css',
})
export class Estoque {

}
