import { CommonModule } from '@angular/common';
import { Component, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-grafico',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './grafico.html',
  styleUrls: ['./grafico.css'],
})
export class Grafico {
  horaAtual: string = '';
  segundosAtual: string = '';
  tempoTrabalhadoHM: string = ''; // horas:minutos
  tempoTrabalhadoS: string = '';  // segundos
  entradaColaborador: Date;

  constructor(private ngZone: NgZone) {
    // tenta recuperar do LocalStorage
    const entradaSalva = localStorage.getItem('entradaColaborador');
    if (entradaSalva) {
      this.entradaColaborador = new Date(entradaSalva);
    } else {
      // se não existir, define agora como entrada
      this.entradaColaborador = new Date();
      localStorage.setItem('entradaColaborador', this.entradaColaborador.toISOString());
    }

    // roda fora da zona do Angular para não depender do change detection
    this.ngZone.runOutsideAngular(() => {
      setInterval(() => {
        this.atualizarHora();
        this.atualizarTempoTrabalhado();

        // força atualização apenas deste componente
        (window as any).ng?.applyChanges?.(this);
      }, 1000);
    });
  }

  atualizarHora() {
    const agora = new Date();
    const horas = this.pad(agora.getHours());
    const minutos = this.pad(agora.getMinutes());
    const segundos = this.pad(agora.getSeconds());

    this.horaAtual = `${horas}:${minutos}`;
    this.segundosAtual = segundos;
  }

  atualizarTempoTrabalhado() {
    const agora = new Date();
    const diffMs = agora.getTime() - this.entradaColaborador.getTime();

    const horas = Math.floor(diffMs / (1000 * 60 * 60));
    const minutos = Math.floor(diffMs / (1000 * 60)) % 60;
    const segundos = Math.floor(diffMs / 1000) % 60;

    this.tempoTrabalhadoHM = `${this.pad(horas)}:${this.pad(minutos)}`;
    this.tempoTrabalhadoS = this.pad(segundos);
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  limparEntrada() {
    localStorage.removeItem('entradaColaborador');
  }
}
