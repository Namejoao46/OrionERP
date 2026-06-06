package backend.service.comunicacao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void enviarNotificacao(String destinatario, String titulo, String mensagem) {
        // envia para o tópico do usuário
        messagingTemplate.convertAndSend("/topic/" + destinatario,
                titulo + ": " + mensagem);
    }
}
