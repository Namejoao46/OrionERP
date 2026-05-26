import { Component, OnInit } from '@angular/core';
import { MensagemService } from '../../../services/mensagem.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './chat-component.html',
  styleUrls: ['./chat-component.css']
})
export class ChatComponent implements OnInit {
  contatos: string[] = [];
  mensagens: any[] = [];
  destinatario: string | null = null;
  novaMensagem = '';
  
  // Captura o nome do usuário logado
  userName: string = localStorage.getItem('userName') ?? '';

  constructor(private mensagemService: MensagemService) {}

  ngOnInit(): void {
    // Garante que temos o nome do usuário
    if (!this.userName) {
      this.userName = localStorage.getItem('userName') ?? '';
    }

    this.mensagemService.listarUsuarios().subscribe(users => {
      this.contatos = users;
    });

    this.carregarPendentes();
    this.conectarWebSocket();
  }

  // ESTA É A FUNÇÃO QUE DIRECIONA PARA A DIREITA OU ESQUERDA
  euEnviei(msg: any): boolean {
    if (!msg.remetente || !this.userName) return false;
    
    // Compara o remetente da mensagem com o usuário logado (ignora Case Sensitivity)
    return msg.remetente.trim().toLowerCase() === this.userName.trim().toLowerCase();
  }

  carregarPendentes(): void {
    this.mensagemService.buscarPendentes().subscribe(data => {
      this.mensagens = data.filter(
        (msg: any) =>
          (this.isMesmoUsuario(msg.remetente, this.userName) && this.isMesmoUsuario(msg.destinatario, this.destinatario)) ||
          (this.isMesmoUsuario(msg.remetente, this.destinatario) && this.isMesmoUsuario(msg.destinatario, this.userName))
      );
    });
  }

  isMesmoUsuario(user1: string | null, user2: string | null): boolean {
    if (!user1 || !user2) return false;
    return user1.trim().toLowerCase() === user2.trim().toLowerCase();
  }

  enviar(): void {
    if (this.novaMensagem.trim() && this.destinatario) {
      this.mensagemService.enviarMensagem(this.destinatario, this.novaMensagem)
        .subscribe(() => {
          this.novaMensagem = '';
          this.mensagemService.buscarConversa(this.destinatario!).subscribe(data => {
            this.mensagens = data;
          });
        });
    }
  }

  abrirConversa(contato: string): void {
    this.destinatario = contato;
    this.mensagemService.buscarConversa(contato).subscribe(data => {
      this.mensagens = data;
      
      console.log("Sistema de Lado - Meu userName:", this.userName);
      if(data.length > 0) {
        console.log("Remetente da msg:", data[0].remetente);
        console.log("Identificado como meu envio?", this.euEnviei(data[0]));
      }
    });
  }

  conectarWebSocket(): void {
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      connectHeaders: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      },
      debug: (str) => { console.log(str); },
      reconnectDelay: 5000,
      webSocketFactory: () => new SockJS('http://localhost:8080/ws')
    });

    client.onConnect = () => {
      console.log("WebSocket Conectado com sucesso!");
      if (this.userName) {
        client.subscribe(`/topic/${this.userName}`, message => {
          if (this.destinatario) {
            this.mensagemService.buscarConversa(this.destinatario).subscribe(data => {
              this.mensagens = data;
            });
          } else {
            this.carregarPendentes();
          }
        });
      }
    };

    client.activate();
  }
}