import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-financas',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './financas.component.html',
  styleUrls: ['./financas.component.css']
})
export class FinancasComponent {

  constructor(private notify: NotificationService) {}

  testarToast() {
    this.notify.show('Funciona! Olha a barrinha embaixo!', 'success', 5000);
  }
  testarToast1() {
    this.notify.show('Funciona! Olha a barrinha embaixo!', 'error', 5000);
  }
  testarToast2() {
    this.notify.show('Funciona! Olha a barrinha embaixo!', 'info', 5000);
  }
}
