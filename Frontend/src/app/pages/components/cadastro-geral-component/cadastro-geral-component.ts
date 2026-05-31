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
  // Modelos de dados limpos para o binding
  empresa = { nomeFantasia: '', cnpj: '', plano: 'Basico' };
  usuario = { login: '', senha: '', nome: '', cargo: '', matricula: '' };
  
  roleLogado: string = '';

  constructor(
    private http: HttpClient, 
    private empresaService: EmpresaService,
    private authService: AuthService 
  ) {}

  ngOnInit() {
    this.roleLogado = this.authService.getRole(); 
  }

  salvar() {
    if (this.roleLogado === 'ADMIN_DEV') {
      this.cadastrarEmpresaEMaster();
    } else if (this.roleLogado === 'MASTER') {
      this.cadastrarColaborador();
    }
  }

  private cadastrarEmpresaEMaster() {
    // 1. Cria a empresa primeiro
    this.empresaService.cadastrar(this.empresa).subscribe({
      next: (empresaCriada: any) => {
        // 2. Com o ID da empresa, registra o usuário como MASTER
        const payloadMaster = { 
          ...this.usuario, 
          role: 'MASTER', 
          empresa: { id: empresaCriada.id } 
        };
        this.enviarRequisicaoAuth(payloadMaster, 'Empresa e Usuário Master criados com sucesso!');
      },
      error: (err) => alert('Erro ao cadastrar empresa: ' + (err.error?.erro || err.message))
    });
  }

  private cadastrarColaborador() {
    const dadosLogado = this.authService.getUsuarioLogado();
    
    const payloadColab = { 
      ...this.usuario, 
      role: 'FUNCIONARIO', // Ou 'COLABORADOR' conforme seu Enum no Java
      empresa: { id: dadosLogado.empresa.id } 
    };

    // Para gestão de equipe, usamos o endpoint de colaboradores (GestaoService no Java)
    this.http.post('http://localhost:8080/api/colaboradores/cadastrar', payloadColab).subscribe({
      next: () => {
        alert('Colaborador adicionado à sua equipe!');
        this.limparFormulario();
      },
      error: (err) => alert('Erro ao cadastrar colaborador: ' + (err.error || err.message))
    });
  }

  private enviarRequisicaoAuth(payload: any, mensagem: string) {
    this.http.post('http://localhost:8080/api/auth/registrar', payload).subscribe({
      next: () => {
        alert(mensagem);
        this.limparFormulario();
      },
      error: (err) => alert('Erro no registro: ' + (err.error?.erro || 'Verifique os dados'))
    });
  }

  private limparFormulario() {
    this.usuario = { login: '', senha: '', nome: '', cargo: '', matricula: '' };
    this.empresa = { nomeFantasia: '', cnpj: '', plano: 'Basico' };
  }
}