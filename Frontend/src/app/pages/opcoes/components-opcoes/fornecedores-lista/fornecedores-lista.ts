import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FornecedorService } from '../../../../core/services/erp/fornecedor.service';
import { ModalService } from '../../../../core/services/ui/modal.service';

@Component({
  selector: 'app-fornecedores-lista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fornecedores-lista.html',
  styleUrl: './fornecedores-lista.css',
})
export class FornecedoresLista implements OnInit {
  fornecedores: any[] = [];
  private modalService = inject(ModalService);
  private service = inject(FornecedorService);

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  ngOnInit() { this.carregarFornecedores(); }

  carregarFornecedores() {
    this.service.listarTodos().subscribe(dados => this.fornecedores = dados);
  }

  abrirModalCriar() {
    this.modalService.notificarAbrirFornecedor(); // Avisa a Home!
  }

  scrollLeft() { this.scrollContainer.nativeElement.scrollBy({ left: -120, behavior: 'smooth' }); }
  scrollRight() { this.scrollContainer.nativeElement.scrollBy({ left: 120, behavior: 'smooth' }); }
}