import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

export interface CaixaboxOption {
  label: string;
  value: any;
  icon?: string;
}

@Component({
  selector: 'app-caixabox',
  standalone: true,
  imports: [CommonModule], // Garanta que o CommonModule esteja aqui para o *ngFor
  templateUrl: './caixa-box.html', // ADICIONE O HÍFEN AQUI
  styleUrls: ['./caixa-box.css']   // ADICIONE O HÍFEN AQUI
})
export class CaixaboxComponent {
  options: CaixaboxOption[] = [];
  onSelect!: (value: any) => void;

  select(item: CaixaboxOption): void {
    if (this.onSelect) {
      this.onSelect(item.value);
    }
  }
}