package backend.service;

import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    public void enviarNotificacao(String token, String titulo, String mensagem) {
        System.out.println(">>> Enviando notificação:");
        System.out.println("Token: " + token);
        System.out.println("Título: " + titulo);
        System.out.println("Mensagem: " + mensagem);
    }
}
