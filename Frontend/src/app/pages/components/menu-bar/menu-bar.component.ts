import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MenuComponent } from "../menu/menu.component";
import { AuthService } from '../../../services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-menu-bar',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, MenuComponent],
  templateUrl: './menu-bar.component.html',
  styleUrl: './menu-bar.component.css'
})
export class MenuBarComponent {
  userName$: Observable<string | null>;
  userImage$: Observable<SafeUrl | null>;

  constructor(private authService: AuthService, private sanitizer: DomSanitizer) {
    this.userName$ = this.authService.userName$;

    // Tratamos a string Base64 para ser aceita pelo Angular como uma URL segura
    this.userImage$ = this.authService.userImage$.pipe(
      map(base64 => {
        if (!base64) return null;
        
        // Verifica se a string já possui o prefixo, se não, adiciona
        const prefixo = base64.startsWith('data:image') ? '' : 'data:image/jpeg;base64,';
        return this.sanitizer.bypassSecurityTrustUrl(`${prefixo}${base64}`);
      })
    );

    // Log de verificação no console
    this.authService.userImage$.subscribe(img => {
      if (img) {
        console.log("Base64 carregado no MenuBar:", img.substring(0, 50) + "...");
      } else {
        console.log("Nenhuma imagem de usuário encontrada.");
      }
    });
  }
}