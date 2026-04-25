import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MenuBarComponent } from "../components/menu-bar/menu-bar.component";
import { OpcoesComponent } from "../components/opcoes/opcoes.component";
import { MenuFixoComponent } from "../components/menu-fixo/menu-fixo.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, MenuBarComponent, OpcoesComponent, MenuFixoComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  menuAberto: boolean = true;

  // Injetando ferramentas de diagnóstico
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    console.log('HomeComponent carregado. Verificando estabilidade do Zone.js...');

    // Este intervalo serve para testar se o Live Reload/Detecção de mudanças está vivo
    setInterval(() => {
      this.zone.run(() => {
        this.cdr.detectChanges();
      });
    }, 3000);
  }

  aoMudarMenu(estado: boolean) {
    this.menuAberto = estado;
  }
}
