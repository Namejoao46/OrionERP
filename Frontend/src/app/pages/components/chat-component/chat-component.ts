import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router'; // Importante!
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
    private colaboradorService: ColaboradorService,
    private route: ActivatedRoute // Injetado
  ) {}

  ngOnInit(): void {
    this.carregarUsuarios();
    
    // Captura o usuário da URL (ex: /chat?usuario=leandro)
    this.route.queryParams.subscribe(params => {
      const loginUrl = params['usuario'];
      if (loginUrl) {
        // Aguarda um pouco os usuários carregarem e seleciona
        setTimeout(() => {
          const user = this.usuarios.find(u => u.username === loginUrl);
          if (user) this.selecionarUsuario(user);
        }, 500);
      }
    });
  }

  ngAfterViewChecked() { this.scrollToBottom(); }

  get meuUsername(): string { return localStorage.getItem('username') || ''; }

  carregarUsuarios(): void {
    this.mensagemService.listarUsuarios().subscribe({
      next: (data: any[]) => {
        this.usuarios = data.map(colab => ({
          username: colab.login,
          nome: colab.nome,
          foto: colab.foto ? 'data:image/jpeg;base64,' + colab.foto : null,
          cargo: colab.cargo,
          online: colab.online || false 
        }));
      }
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
      }
    });
  }

  enviar(): void {
    if (!this.novaMensagem.trim() || !this.usuarioSelecionado) return;
    this.mensagemService.enviarMensagem(this.usuarioSelecionado.username, this.novaMensagem).subscribe({
      next: () => {
        this.mensagens.push({
          remetente: this.meuUsername,
          mensagem: this.novaMensagem,
          enviadaPorMim: true,
          data: new Date()
        });
        this.novaMensagem = '';
      }
    });
  }

  private scrollToBottom(): void {
    try { this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight; } catch(err) { }
  }
}