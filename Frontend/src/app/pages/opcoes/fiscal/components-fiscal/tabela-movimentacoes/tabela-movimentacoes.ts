import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MovimentacaoFiscal {
  documento: string;
  tipo: string;
  status: string;
  statusClass: string;
  data: string;
}

@Component({
  selector: 'app-tabela-movimentacoes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabela-movimentacoes.html',
  styleUrl: './tabela-movimentacoes.css'
})
export class TabelaMovimentacoesComponent {
  dados: MovimentacaoFiscal[] = [
    { documento: '123.456.789', tipo: 'NF-e', status: 'Autorizada', statusClass: 'autorizada', data: '24/05/2025 10:15' },
    { documento: '987.654.321', tipo: 'NFS-e', status: 'Pendente', statusClass: 'pendente', data: '24/05/2025 09:42' },
    { documento: '456.789.123', tipo: 'NF-e', status: 'Autorizada', statusClass: 'autorizada', data: '23/05/2025 16:33' },
    { documento: '321.654.987', tipo: 'NFC-e', status: 'Autorizada', statusClass: 'autorizada', data: '23/05/2025 14:08' }
  ];
}