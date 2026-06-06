import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ColaboradorService } from '../../../../../../core/services/core/colaborador.service';
import { MensagemService } from '../../../../../../core/services/ui/mensagem.service';

@Component({
  selector: 'app-mensagens',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './mensagens.html',
  styleUrl: './mensagens.css',
})
export class Mensagens implements OnInit {
  ultimasMensagens: any[] = [];
  usuariosMap: Map<string, any> = new Map();

  constructor(
    private mensagemService: MensagemService,
    private colaboradorService: ColaboradorService
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  async carregarDados() {
    // 1. Primeiro carregamos os usuários para ter nomes e fotos
    this.mensagemService.listarUsuarios().subscribe({
      next: (users) => {
        users.forEach(u => this.usuariosMap.set(u.login, u));
        this.buscarMensagens();
      }
    });
  }

  buscarMensagens() {
    this.mensagemService.listarMensagensRecentes().subscribe({
      next: (mensagens: any[]) => {
        const agrupa = new Map();

        mensagens.forEach(m => {
          // Como o Java já manda ordenado por data desc, 
          // o primeiro que entrar no Map é o mais atual.
          if (!agrupa.has(m.remetente)) {
            const dadosUsuario = this.usuariosMap.get(m.remetente);
            
            agrupa.set(m.remetente, {
              nome: dadosUsuario?.nome || m.remetente,
              foto: dadosUsuario?.foto ? 'data:image/jpeg;base64,' + dadosUsuario.foto : 'assets/perfil.png',
              conteudo: m.conteudo,
              data: m.dataEnvio,
              login: m.remetente,
              status: m.status // Útil para colocar um ícone de "não lida" se quiser
            });
          }
        });

        this.ultimasMensagens = Array.from(agrupa.values());
      },
      error: (err) => console.error('Erro ao buscar histórico', err)
    });
  }
}
