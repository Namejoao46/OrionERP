import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

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

  // Injete o cdr no constructor
  constructor(
    private authService: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {}
  
  entrar() {
    this.authService.login(this.login, this.senha).subscribe({
      next: (res) => {
        console.log(">>> Resposta do Servidor:", res); // Isso vai nos mostrar se a foto veio no JSON
        
        if (res.token) {
          // Passa os dados para o service (o campo deve ser 'foto' conforme seu Controller Java)
          this.authService.setUserData(res.token, res.nome, res.foto);

          alert('Login realizado com sucesso!');
          this.router.navigate(['/home']).then(() => {
            this.cdr.detectChanges();
          });
        }
      },
      error: (err) => {
        console.error('Erro no login', err);
        alert('Credenciais inválidas');
      }
    });
  }
}