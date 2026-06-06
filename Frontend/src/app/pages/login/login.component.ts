import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  login: string = '';
  senha: string = '';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {}
  
  entrar() {
    this.authService.login(this.login, this.senha).subscribe({
      next: (res: any) => {
        console.log('--- RESPOSTA DO SERVIDOR ---', res);

        if (res.token) {
          // Passa os dados para o serviço configurar os Subjects e o LocalStorage
          this.authService.setUserData(res);

          // Força o ciclo de detecção do Angular a atualizar a árvore de componentes antes de mudar de rota
          this.cdr.detectChanges();

          this.router.navigate(['/home']).then(() => {
            // Garante um reload limpo na rota inicial para remontar o layout do menu com a nova Role
            window.location.reload();
          });
        }
      },
      error: (err: any) => {
        console.error('Erro no login:', err);
        const mensagem = err.error?.erro || 'Usuário ou senha inválidos';
        alert(mensagem);
      }
    });
  }
}