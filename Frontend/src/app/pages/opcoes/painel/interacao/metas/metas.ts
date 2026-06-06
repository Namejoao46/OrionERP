import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-metas',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './metas.html',
  styleUrl: './metas.css',
})
export class Metas {

}
