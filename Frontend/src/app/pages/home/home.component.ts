import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MenuBarComponent } from "../components/menu-bar/menu-bar.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, MenuBarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
