import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MensagemService } from '../../../core/services/mensagem.service';
import { ColaboradorService } from '../../../core/services/colaborador.service';

@Component({
  selector: 'app-chat-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-component.html',
  styleUrls: ['./chat-component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  usuarios: any[] = [];
  mensagens: any[] = [];
  usuarioSelecionado: any = null;
  novaMensagem: string = '';

  constructor(
    private mensagemService: MensagemService,
    private colaboradorService: ColaboradorService
  ) {}

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  ngAfterViewChecked() {        
    this.scrollToBottom();        
  } 

  get meuUsername(): string {
    return localStorage.getItem('username') || '';
  }

  carregarUsuarios(): void {
    this.colaboradorService.listarTodos().subscribe({
      next: (data: any[]) => {
        this.usuarios = data.map(colab => ({
          username: colab.login,
          nome: colab.nome,
          foto: colab.foto,
          cargo: colab.cargo,
          online: true 
        }));
      },
      error: (err: any) => console.error('Erro ao listar colaboradores', err)
    });
  }

  selecionarUsuario(user: any): void {
    this.usuarioSelecionado = user;
    this.carregarMensagens();
  }

  carregarMensagens(): void {
    if (!this.usuarioSelecionado) return;
    this.mensagemService.buscarConversa(this.usuarioSelecionado.username).subscribe({
      next: (historico: any[]) => {
        this.mensagens = historico.map(msg => ({
          ...msg,
          mensagem: msg.conteudo,
          data: msg.dataEnvio,
          enviadaPorMim: String(msg.remetente).toLowerCase() === this.meuUsername.toLowerCase()
        }));
      },
      error: (err: any) => console.error('Erro ao buscar mensagens', err)
    });
  }

  enviar(): void {
    if (!this.novaMensagem.trim() || !this.usuarioSelecionado) return;
    this.mensagemService.enviarMensagem(this.usuarioSelecionado.username, this.novaMensagem).subscribe({
      next: () => {
        this.mensagens.push({
          remetente: this.meuUsername,
          conteudo: this.novaMensagem,
          mensagem: this.novaMensagem,
          enviadaPorMim: true,
          dataEnvio: new Date()
        });
        this.novaMensagem = '';
      },
      error: (err: any) => console.error('Erro ao enviar', err)
    });
  }

  private scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }                 
  }
}