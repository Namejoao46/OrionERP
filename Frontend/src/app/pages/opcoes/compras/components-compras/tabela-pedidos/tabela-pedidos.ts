import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GastosService } from '../../../../../core/services/finance/Gastos.service';

@Component({
  selector: 'app-tabela-pedidos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabela-pedidos.html',
  styleUrl: './tabela-pedidos.css',
})
export class TabelaPedidos implements OnInit {
  pedidos: any[] = [];

  constructor(private gastosService: GastosService) {}

  ngOnInit(): void {
    this.gastosService.listarPedidosRecentes().subscribe(dados => {
      this.pedidos = dados;
    });
  }
}