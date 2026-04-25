import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // Adicione ChangeDetectorRef
import { CommonModule } from '@angular/common'; 
import { NotificationService, Notification } from '../../../services/notification.service';

@Component({
  selector: 'app-notification-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-container.html', 
  styleUrls: ['./notification-container.css']
})
export class NotificationContainerComponent implements OnInit {
  activeNotifications: Notification[] = [];

  // O cdr ajuda a avisar o Angular: "Ei, mudei algo, atualiza a tela agora!"
  constructor(private notifyService: NotificationService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.notifyService.notifications$.subscribe((note: Notification) => {
      this.activeNotifications.push(note);
      this.cdr.detectChanges(); // Força a renderização imediata

      const duration = note.duration || 3000;

      // Timer para iniciar a animação de saída
      setTimeout(() => {
        note.isRemoving = true;
        this.cdr.detectChanges(); // Avisa que o estado 'isRemoving' mudou

        // Timer final para remover do array (espera os 300ms do CSS)
        setTimeout(() => {
          this.activeNotifications = this.activeNotifications.filter(n => n !== note);
          this.cdr.detectChanges();
        }, 300);
        
      }, duration);
    });
  }
}