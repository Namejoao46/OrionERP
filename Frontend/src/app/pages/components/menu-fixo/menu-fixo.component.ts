import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu-fixo',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './menu-fixo.component.html',
  styleUrl: './menu-fixo.component.css'
})
export class MenuFixoComponent {

}
