import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
   // Inicia o menu fechado
 menuAberto = false;

 constructor(private el: ElementRef){}

 //Alterna o menu para fchado ou aberto
 alternarMenu(){
  this.menuAberto = !this.menuAberto;
 }

 fecharMenu(){
  this.menuAberto = false;
 }

 //Escuta qualquer clique no documento — se for fora do menu, ele fecha
 @HostListener('document:click', ['$event'])
 onDocumentClick(event: MouseEvent){
  //Verifica se o clique foi dentro do componente (true) ou fora (false)
  const clicadoDentro = this.el.nativeElement.contains(event.target);
  if (!clicadoDentro && this.menuAberto){
    this.menuAberto = false;
  }
 }

}
