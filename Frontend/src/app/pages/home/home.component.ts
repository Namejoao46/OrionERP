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
import { EdicaoProdutoComponent } from "../components/edicao-produto-component/edicao-produto-component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterModule, CommonModule, FormsModule, MenuBarComponent,
    OpcoesComponent, MenuFixoComponent, CardFlutuante,
    ChatComponent, CadastroGeralComponent, CadastroFornecedorComponent,
    Perfil, ProdutosFornecedor,
    EdicaoProdutoComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  public menuAberto: boolean = true;
  private cdr = inject(ChangeDetectorRef);
  private modalService = inject(ModalService);

  // Inscrições para evitar vazamento de memória
  private subFornecedor!: Subscription;
  private subCardProduto!: Subscription;

  // Estados para o fornecedor selecionado (Modal de visualização)
  public fornecedorSelecionadoId!: number;
  public fornecedorSelecionadoNome: string = '';

  // Estado para o produto que será editado
  public produtoSelecionado: any = null;

  @ViewChild('cardFornecedor') cardFornecedor!: CardFlutuante;
  @ViewChild('cardProdutosDoFornecedor') cardProdutosDoFornecedor!: CardFlutuante;
  @ViewChild('cardEdicaoProduto') cardEdicaoProduto!: CardFlutuante;

  ngOnInit() {
    // 1. Escuta pedidos de abertura para CADASTRAR novo fornecedor
    this.subFornecedor = this.modalService.abrirFornecedor$.subscribe(() => {
      if (this.cardFornecedor) {
        this.cardFornecedor.abrir();
        this.cdr.detectChanges();
      }
    });

    // 2. ESCUTA ATIVA: Filtra dinamicamente se o payload recebido é um Fornecedor ou um Produto
    this.subCardProduto = this.modalService.abrirCardProduto$.subscribe((payload) => {
      if (!payload) return;

      // Se o objeto possuir propriedades típicas de produto, abre o modal de edição
      if ('precoVenda' in payload || 'estoqueAtual' in payload || 'descricao' in payload) {
        console.log('[TRACKING-HOME] Identificado: Fluxo de Edição de Produto.', payload);
        this.produtoSelecionado = payload;
        
        this.cdr.detectChanges();
        if (this.cardEdicaoProduto) {
          this.cardEdicaoProduto.abrir();
        }
      } 
      // Caso contrário, trata como o fluxo clássico de abertura de produtos por Fornecedor
      else {
        console.log('[TRACKING-HOME] Identificado: Fluxo de Catálogo por Fornecedor.', payload);
        this.fornecedorSelecionadoId = payload.id || payload.codigo;
        this.fornecedorSelecionadoNome = payload.nomeTone || payload.nomeFantasia || payload.razaoSocial;

        this.cdr.detectChanges();
        if (this.cardProdutosDoFornecedor) {
          this.cardProdutosDoFornecedor.abrir();
        }
      }
    });
  }

  aoMudarMenu(estado: boolean) {
    this.menuAberto = estado;
  }

  onProdutoSalvo() {
    console.log('[TRACKING-HOME] Evento de sucesso capturado. Fechando modal de edição.');
    if (this.cardEdicaoProduto) {
      this.cardEdicaoProduto.fechar();
    }
    this.modalService.notificarProdutoSalvo();
  }

  ngOnDestroy() {
    if (this.subFornecedor) this.subFornecedor.unsubscribe();
    if (this.subCardProduto) this.subCardProduto.unsubscribe();
  }
}