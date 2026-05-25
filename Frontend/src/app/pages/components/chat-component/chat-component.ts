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
  userName: string = localStorage.getItem('userName') ?? '';

  constructor(private mensagemService: MensagemService) {}

  ngOnInit(): void {
    // Carregar lista de usuários do banco (exceto o logado)
    this.mensagemService.listarUsuarios().subscribe(users => {
      this.contatos = users;
    });

    // Carregar mensagens pendentes do logado
    this.carregarPendentes();

    // Conectar WebSocket
    this.conectarWebSocket();
  }

  carregarPendentes(): void {
    this.mensagemService.buscarPendentes().subscribe(data => {
      // só mostra mensagens entre logado e destinatário
      this.mensagens = data.filter(
        (msg: any) =>
          (msg.remetente === this.userName && msg.destinatario === this.destinatario) ||
          (msg.remetente === this.destinatario && msg.destinatario === this.userName)
      );
    });
  }

  enviar(): void {
    if (this.novaMensagem.trim() && this.destinatario) {
      this.mensagemService.enviarMensagem(this.destinatario, this.novaMensagem)
        .subscribe(() => {
          this.novaMensagem = '';
          this.mensagemService.buscarConversa(this.destinatario).subscribe(data => {
            this.mensagens = data;
          });
        });
    }
  }

  marcarComoLida(id: number): void {
    this.mensagemService.marcarComoLida(id).subscribe(() => {
      this.carregarPendentes();
    });
  }

  abrirConversa(contato: string): void {
    this.destinatario = contato;
    this.mensagemService.buscarConversa(contato).subscribe(data => {
      this.mensagens = data;
    });
  }

  logout(): void {
    console.log('Usuário desconectado');
    localStorage.clear();
    // redirecionar para login se necessário
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
      // Assina o tópico do usuário logado
      client.subscribe(`/topic/${this.userName}`, message => {
        console.log('Mensagem recebida via WebSocket:', message.body);
        this.carregarPendentes();
      });
    };

    client.activate();
  }
}
