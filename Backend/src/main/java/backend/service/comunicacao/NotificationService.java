package backend.service.comunicacao;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void enviarNotificacao(String destinatario, String titulo, String mensagem) {
        // envia para o tópico do usuário
        messagingTemplate.convertAndSend("/topic/" + destinatario,
                titulo + ": " + mensagem);
    }
}