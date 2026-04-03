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
        localStorage.setItem('token', res.token);
        alert('Login realizado com sucesso!'); 
        
        this.router.navigate(['/home']).then(() => {
            this.cdr.detectChanges(); // Garante que a tela mude após navegar
        });
      },
      error: (err) => {
        console.error('Erro no login', err);
        alert('Credenciais inválidas');
      }
    });
  }
}