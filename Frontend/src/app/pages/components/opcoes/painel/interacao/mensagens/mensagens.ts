import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mensagens',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './mensagens.html',
  styleUrl: './mensagens.css',
})
export class Mensagens {

}
