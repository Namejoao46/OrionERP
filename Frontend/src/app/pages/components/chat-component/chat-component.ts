import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MensagemService } from '../../../services/mensagem.service'; 

@Component({
  selector: 'app-chat-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-component.html',
  styleUrls: ['./chat-component.css']
})
export class ChatComponent implements OnInit {
  usuarios: any[] = [];
  mensagens: any[] = [];
  usuarioSelecionado: any = null;
  novaMensagem: string = '';
  meuUsername: string | null = localStorage.getItem('username'); // Pega seu login do storage

  constructor(private mensagemService: MensagemService) {}

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios(): void {
    this.mensagemService.listarUsuarios().subscribe({
      next: (logins: string[]) => {
        // Mapeia os logins para objetos que o HTML entende
        this.usuarios = logins.map(login => ({
          username: login,
          nome: login === 'admin' ? 'Leandro (Admin)' : (login === 'admin2' ? 'João Paulo' : login),
          online: true // Você pode integrar com o status real depois
        }));
      },
      error: (err) => console.error('Erro ao listar usuários', err)
    });
  }

  selecionarUsuario(user: any): void {
    this.usuarioSelecionado = user;
    this.carregarMensagens();
  }

  carregarMensagens(): void {
  if (!this.usuarioSelecionado) return;

  // Pegamos o login salvo (agora garantimos que ele existe)
  const meuLogin = localStorage.getItem('username') || '';

  this.mensagemService.buscarConversa(this.usuarioSelecionado.username).subscribe({
    next: (historico: any[]) => {
      this.mensagens = historico.map(msg => {
        return {
          ...msg,
          mensagem: msg.conteudo,
          data: msg.dataEnvio,
          // Compara o remetente do banco com o login salvo no storage
          enviadaPorMim: String(msg.remetente).toLowerCase() === meuLogin.toLowerCase()
        };
      });
    }
  });
}

  enviar(): void {
    if (!this.novaMensagem.trim() || !this.usuarioSelecionado) return;

    this.mensagemService.enviarMensagem(this.usuarioSelecionado.username, this.novaMensagem).subscribe({
      next: () => {
        // Adiciona a mensagem localmente para feedback instantâneo
        this.mensagens.push({
          remetente: this.meuUsername,
          conteudo: this.novaMensagem,
          mensagem: this.novaMensagem,
          enviadaPorMim: true,
          dataEnvio: new Date()
        });
        this.novaMensagem = ''; // Limpa o input
      },
      error: (err) => console.error('Erro ao enviar', err)
    });
  }
}