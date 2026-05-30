import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

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
        // ESTE LOG É A CHAVE DE TUDO
        console.log('--- RESPOSTA DO SERVIDOR ---');
        console.log(res); 
        console.log('---------------------------');

        if (res.token) {
          // Se no console o campo não for 'role', mude aqui embaixo:
          this.authService.setUserData(res.token, res.nome, res.foto, this.login, res.role);

          this.router.navigate(['/home']);
        }
      },
      error: (err: any) => {
        console.error('Erro no login:', err);
        alert('Erro na conexão');
      }
    });
  }
}