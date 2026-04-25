import { ApplicationRef, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationContainerComponent } from "./pages/components/notification-container/notification-container";
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationContainerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'OrionERP';

  constructor(private notify: NotificationService) {
    // Aqui a gente sobrescreve o alert padrão do navegador
    window.alert = (message: string) => {
      this.notify.show(message, 'info', 4000);
    };
  }

}
