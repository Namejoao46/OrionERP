import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FornecedorService } from '../../../../core/services/fornecedor.service';

@Component({
  selector: 'app-cadastro-fornecedor-component',
 standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro-fornecedor-component.html',
  styleUrl: './cadastro-fornecedor-component.css',
})
export class CadastroFornecedorComponent {
  fornecedor: any = { razaoSocial: '', cnpj: '', nomeFantasia: '' };
  
  @Output() salvoComSucesso = new EventEmitter<void>();

  constructor(private service: FornecedorService) {}

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.service.importarXml(file).subscribe({
        next: (dados) => {
          this.fornecedor = dados;
          console.log('XML Processado:', dados);
        },
        error: () => alert('Erro ao processar o arquivo XML.')
      });
    }
  }

  salvar() {
    this.service.salvar(this.fornecedor).subscribe({
      next: () => {
        alert('Fornecedor cadastrado com sucesso!');
        this.salvoComSucesso.emit(); // Notifica o componente pai
        this.fornecedor = {}; // Limpa o form
      },
      error: (err) => alert('Erro ao salvar fornecedor.')
    });
  }
}
