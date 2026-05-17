import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ultimos-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ultimos-produtos.html',
  styleUrl: './ultimos-produtos.css',
})
export class UltimosProdutos {
  @Input() ultimos: any[] = [];
}
