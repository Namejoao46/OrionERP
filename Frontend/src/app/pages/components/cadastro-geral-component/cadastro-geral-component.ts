import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { EmpresaService } from '../../../core/services/empresa.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cadastro-geral',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cadastro-geral-component.html',
  styleUrl: './cadastro-geral-component.css',
})
export class CadastroGeralComponent implements OnInit {
  // Modelos de dados
  empresa = { nomeFantasia: '', cnpj: '', plano: 'Basico' };
  usuario = { login: '', senha: '', nome: '', role: '', cargo: '', matricula: '' };
  
  roleLogado: string = '';

  constructor(
    private http: HttpClient, 
    private empresaService: EmpresaService,
    private authService: AuthService 
  ) {}

  ngOnInit() {
    // Pega a role de quem está usando o sistema agora
    this.roleLogado = this.authService.getRole(); 
  }

  salvar() {
    if (this.roleLogado === 'ADMIN_DEV') {
      this.cadastrarEmpresaEMaster();
    } else if (this.roleLogado === 'MASTER') {
      this.cadastrarColaborador();
    }
  }

  // Lógica para o Super Admin
  private cadastrarEmpresaEMaster() {
    this.empresaService.cadastrar(this.empresa).subscribe({
      next: (empresaCriada: any) => {
        const payloadMaster = { 
          ...this.usuario, 
          role: 'MASTER', 
          empresa: { id: empresaCriada.id } 
        };
        this.enviarRequisicao(payloadMaster, 'Empresa e Master criados!');
      }
    });
  }

  // Lógica para o Master (Funcionário herda a empresa do Master)
  private cadastrarColaborador() {
    const dadosMaster = this.authService.getUsuarioLogado(); // Pega dados do Master que está logado
    const payloadColab = { 
      ...this.usuario, 
      role: 'COLABORADOR', 
      empresa: { id: dadosMaster.empresa.id } 
    };
    this.enviarRequisicao(payloadColab, 'Colaborador cadastrado com sucesso!');
  }

  private enviarRequisicao(payload: any, mensagem: string) {
    this.http.post('http://localhost:8080/api/auth/registrar', payload).subscribe({
      next: () => alert(mensagem),
      error: (err) => console.error('Erro no cadastro:', err)
    });
  }
}