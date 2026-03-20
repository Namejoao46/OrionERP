import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MenuComponent } from "../menu/menu.component";

@Component({
  selector: 'app-menu-bar',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, MenuComponent],
  templateUrl: './menu-bar.component.html',
  styleUrl: './menu-bar.component.css'
})
export class MenuBarComponent {
userName: any;
userImage: any;

}
