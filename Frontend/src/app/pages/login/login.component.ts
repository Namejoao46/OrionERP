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
      if (res.token) {
        // Agora passamos também o 'this.login' (o que foi digitado no input)
        this.authService.setUserData(res.token, res.nome, res.foto, this.login);

        alert('Login realizado com sucesso!');
        this.router.navigate(['/home']).then(() => {
          this.cdr.detectChanges();
        });
      }
    },
    error: (err) => {
      alert('Credenciais inválidas');
    }
  });
}
}