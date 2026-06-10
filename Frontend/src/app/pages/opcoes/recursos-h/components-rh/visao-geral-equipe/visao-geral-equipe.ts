import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SetorEquipe {
  nome: string;
  qtd: number;
  porcentagem: string;
  cor: string;
}

@Component({
  selector: 'app-visao-geral-equipe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visao-geral-equipe.html',
  styleUrl: './visao-geral-equipe.css'
})
export class VisaoGeralEquipeComponent {
  setores: SetorEquipe[] = [
    { nome: 'Administrativo', qtd: 32, porcentagem: '25%', cor: '#00c3ff' }, // Ciano
    { nome: 'Comercial', qtd: 28, porcentagem: '22%', cor: '#00bf71' },      // Verde premium
    { nome: 'Operacional', qtd: 48, porcentagem: '38%', cor: '#ff9f43' },    // Laranja/Amarelo
    { nome: 'Financeiro', qtd: 20, porcentagem: '15%', cor: '#ff3366' }     // Vermelho/Magenta
  ];
}