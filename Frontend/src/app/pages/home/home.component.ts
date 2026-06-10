import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { MenuBarComponent } from "../components/menu-bar/menu-bar.component";
import { MenuFixoComponent } from "../components/menu-fixo/menu-fixo.component";
import { CardFlutuante } from "../components/card-flutuante/card-flutuante";
import { ChatComponent } from "../components/chat-component/chat-component";
import { CadastroGeralComponent } from '../components/cadastros/cadastro-geral-component/cadastro-geral-component';
import { ModalService } from '../../core/services/ui/modal.service';
import { CadastroFornecedorComponent } from '../components/cadastros/cadastro-fornecedor-component/cadastro-fornecedor-component';
import { Perfil } from "../components/menu-bar/perfil/perfil";
import { OpcoesComponent } from '../opcoes/opcoes.component';
import { ProdutosFornecedor } from "../opcoes/components-opcoes/fornecedores-lista/produtos-fornecedor/produtos-fornecedor";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterModule, CommonModule, FormsModule, MenuBarComponent,
    OpcoesComponent, MenuFixoComponent, CardFlutuante,
    ChatComponent, CadastroGeralComponent, CadastroFornecedorComponent,
    Perfil, ProdutosFornecedor
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  menuAberto: boolean = true;
  private cdr = inject(ChangeDetectorRef);
  private modalService = inject(ModalService);

  // Inscrições para evitar vazamento de memória
  private subFornecedor!: Subscription;
  private subProdutos!: Subscription;

  // Estados para o fornecedor selecionado que vai para o modal de produtos
  public fornecedorSelecionadoId!: number;
  public fornecedorSelecionadoNome: string = '';

  @ViewChild('cardFornecedor') cardFornecedor!: CardFlutuante;
  @ViewChild('cardProdutosDoFornecedor') cardProdutosDoFornecedor!: CardFlutuante;

  ngOnInit() {
    // Escuta pedidos de abertura para CADASTRAR novo fornecedor
    this.subFornecedor = this.modalService.abrirFornecedor$.subscribe(() => {
      if (this.cardFornecedor) {
        this.cardFornecedor.abrir();
        this.cdr.detectChanges();
      }
    });

    // ESCUTA ATIVA: Quando clica em um fornecedor existente para ver os PRODUTOS
    this.subProdutos = this.modalService.abrirCardProduto$.subscribe((fornecedor) => {
      if (fornecedor && this.cardProdutosDoFornecedor) {
        console.log('[TRACKING-HOME] Capturando fornecedor para exibir catálogo:', fornecedor);
        
        // Mapeia os dados dinamicamente vindos do clique da lista
        this.fornecedorSelecionadoId = fornecedor.id || fornecedor.codigo;
        this.fornecedorSelecionadoNome = fornecedor.nomeTone || fornecedor.nomeFantasia || fornecedor.razaoSocial;

        // Força a atualização dos bindings do template e abre o card flutuante
        this.cdr.detectChanges();
        this.cardProdutosDoFornecedor.abrir();
      }
    });
  }

  aoMudarMenu(estado: boolean) {
    this.menuAberto = estado;
  }

  ngOnDestroy() {
    if (this.subFornecedor) this.subFornecedor.unsubscribe();
    if (this.subProdutos) this.subProdutos.unsubscribe();
  }
}