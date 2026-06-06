import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-calendario',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './calendario.html',
  styleUrl: './calendario.css',
})
export class Calendario implements OnInit {
  dataFoco: Date = new Date();
  diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  diasDoMes: number[] = [];
  diasVazios: number[] = [];
  diaSelecionado: number | null = null;

  ngOnInit() {
    this.gerarCalendario();
  }

  get mesExtenso(): string {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[this.dataFoco.getMonth()];
  }

  get anoAtual(): number {
    return this.dataFoco.getFullYear();
  }

  gerarCalendario() {
    const ano = this.dataFoco.getFullYear();
    const mes = this.dataFoco.getMonth();

    // Primeiro dia do mês (ex: quarta-feira)
    const primeiroDiaMes = new Date(ano, mes, 1).getDay();
    // Quantidade de dias no mês
    const totalDiasMes = new Date(ano, mes + 1, 0).getDate();

    this.diasVazios = Array(primeiroDiaMes).fill(0);
    this.diasDoMes = Array.from({ length: totalDiasMes }, (_, i) => i + 1);
  }

  alterarMes(offset: number) {
    this.dataFoco = new Date(this.dataFoco.getFullYear(), this.dataFoco.getMonth() + offset, 1);
    this.gerarCalendario();
  }

  selecionarDia(dia: number) {
    this.diaSelecionado = dia;
  }

  eHoje(dia: number): boolean {
    const hoje = new Date();
    return hoje.getDate() === dia && 
           hoje.getMonth() === this.dataFoco.getMonth() && 
           hoje.getFullYear() === this.dataFoco.getFullYear();
  }
}
