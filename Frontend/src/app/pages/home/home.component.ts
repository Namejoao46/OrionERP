import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MenuBarComponent } from "../components/menu-bar/menu-bar.component";
import { OpcoesComponent } from "../components/opcoes/opcoes.component";
import { MenuFixoComponent } from "../components/menu-fixo/menu-fixo.component";
import { CardFlutuante } from "../components/card-flutuante/card-flutuante";
import { ChatComponent } from "../components/chat-component/chat-component";
import { CadastroGeralComponent } from '../components/cadastros/cadastro-geral-component/cadastro-geral-component';
import { ModalService } from '../../core/services/ui/modal.service';
import { CadastroFornecedorComponent } from '../components/cadastros/cadastro-fornecedor-component/cadastro-fornecedor-component';
import { Perfil } from "../components/menu-bar/perfil/perfil";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterModule, CommonModule, FormsModule, MenuBarComponent,
    OpcoesComponent, MenuFixoComponent, CardFlutuante,
    ChatComponent, CadastroGeralComponent, CadastroFornecedorComponent,
    Perfil
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  menuAberto: boolean = true;
  private cdr = inject(ChangeDetectorRef);
  private modalService = inject(ModalService);

  @ViewChild('cardFornecedor') cardFornecedor!: CardFlutuante;

  ngOnInit() {
    // Escuta pedidos de abertura vindos de componentes filhos (como o Estoque)
    this.modalService.abrirFornecedor$.subscribe(() => {
      if (this.cardFornecedor) {
        this.cardFornecedor.abrir();
        this.cdr.detectChanges();
      }
    });
  }

  aoMudarMenu(estado: boolean) {
    this.menuAberto = estado;
  }
}