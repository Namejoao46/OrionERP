import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-fornecedores-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fornecedores-lista.html',
  styleUrl: './fornecedores-lista.css',
})
export class FornecedoresLista {
  fornecedores = [
    { id: 1, nome: 'Tech World', foto: 'assets/test1.jpg' },
    { id: 2, nome: 'Global Peças', foto: 'assets/teste2.webp' },
    { id: 3, nome: 'Logística Express', foto: 'assets/teste3.jpg' },
    { id: 4, nome: 'Fornecedor X', foto: null },
    { id: 5, nome: 'Fornecedor Y', foto: null },
    { id: 6, nome: 'Fornecedor Z', foto: null },
    { id: 7, nome: 'Fornecedor Z', foto: null }
  ];

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  scrollLeft() {
    this.scrollContainer.nativeElement.scrollBy({ left: -120, behavior: 'smooth' });
  }

  scrollRight() {
    this.scrollContainer.nativeElement.scrollBy({ left: 120, behavior: 'smooth' });
  }
}
