import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-tempo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-tempo.html',
  styleUrls: ['./card-tempo.css']
})
export class CardTempoComponent implements OnInit, OnDestroy {
  horaAtual: string = '';
  segundosAtual: string = '';
  tempoTrabalhadoHM: string = '';
  tempoTrabalhadoS: string = '';
  entradaColaborador: Date;
  private timerId: any;

  // Injetamos o ChangeDetectorRef para controlar a atualização manual
  constructor(private cdr: ChangeDetectorRef) {
    const entradaSalva = sessionStorage.getItem('entradaColaborador');
    this.entradaColaborador = entradaSalva ? new Date(entradaSalva) : new Date();
    
    if (!entradaSalva) {
      sessionStorage.setItem('entradaColaborador', this.entradaColaborador.toISOString());
    }
  }

  ngOnInit() {
    this.atualizarCronometro();

    // Criamos o intervalo de forma limpa
    this.timerId = setInterval(() => {
      this.atualizarCronometro();
      // ESSA LINHA É A CHAVE: Atualiza apenas este componente na tela
      this.cdr.detectChanges(); 
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timerId) clearInterval(this.timerId);
  }

  private atualizarCronometro() {
    const agora = new Date();
    this.horaAtual = `${this.pad(agora.getHours())}:${this.pad(agora.getMinutes())}`;
    this.segundosAtual = this.pad(agora.getSeconds());

    const diffMs = Math.max(0, agora.getTime() - this.entradaColaborador.getTime());
    const totalSegundos = Math.floor(diffMs / 1000);
    
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;

    this.tempoTrabalhadoHM = `${this.pad(horas)}:${this.pad(minutos)}`;
    this.tempoTrabalhadoS = this.pad(segundos);
  }

  private pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }
}