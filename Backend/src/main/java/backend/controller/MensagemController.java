package backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.transaction.annotation.Transactional;

import backend.model.Mensagem;
import backend.repository.MensagemRepository;
import backend.service.NotificationService;


@RestController
@RequestMapping("/api/mensagens")
@CrossOrigin(origins = "*")
public class MensagemController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private MensagemRepository mensagemRepository;

    private static final Map<String, String> tokensUsuarios = new ConcurrentHashMap<>();

    @PostMapping("/registrar-token")
    public ResponseEntity<?> registrarToken(@RequestBody Map<String, String> payload) {
        String usuario = payload.get("username");
        String token = payload.get("token");

        if (usuario != null && token != null) {
            tokensUsuarios.put(usuario, token);
            System.out.println(">>> Token registrado para " + usuario + ": " + token);
            return ResponseEntity.ok(Map.of("status", "Token registrado com sucesso!"));
        }
        return ResponseEntity.badRequest().body(Map.of("erro", "Dados inválidos"));
    }

    @PostMapping("/enviar")
    public ResponseEntity<?> enviarMensagem(@RequestBody Map<String, String> payload) {
        String remetente = payload.get("remetente");       
        String destinatario = payload.get("destinatario"); 
        String conteudo = payload.get("mensagem");         

        Mensagem novaMensagem = new Mensagem();
        novaMensagem.setRemetente(remetente);
        novaMensagem.setDestinatario(destinatario);
        novaMensagem.setConteudo(conteudo);
        novaMensagem.setStatus("NAO_LIDA");
        novaMensagem.setDataEnvio(LocalDateTime.now());

        mensagemRepository.save(novaMensagem);

        String tokenDestinatario = tokensUsuarios.get(destinatario);
        if (tokenDestinatario != null) {
            notificationService.enviarNotificacao(tokenDestinatario, "Nova mensagem de " + remetente, conteudo);
            return ResponseEntity.ok(Map.of("status", "Mensagem salva e notificação enviada!"));
        } else {
            return ResponseEntity.ok(Map.of("status", "Mensagem salva, mas destinatário está offline."));
        }
    }

    @PostMapping("/pendentes")
    public ResponseEntity<?> buscarMensagensPendentes(@RequestBody Map<String, String> payload) {
        String destinatario = payload.get("destinatario");

        if (destinatario == null) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Destinatário não informado"));
        }

        List<Mensagem> mensagensPendentes = mensagemRepository.findByDestinatarioAndStatus(destinatario, "NAO_LIDA");

        return ResponseEntity.ok(mensagensPendentes);
    }

    @PostMapping("/marcar-lida")
    @Transactional
    public ResponseEntity<?> marcarMensagemComoLida(@RequestBody Map<String, String> payload) {
        try {
            Long idMensagem = Long.valueOf(payload.get("id"));
            mensagemRepository.marcarComoLida(idMensagem);
            return ResponseEntity.ok(Map.of("status", "Mensagem marcada como lida"));
        } catch (NumberFormatException | NullPointerException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", "ID inválido"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Erro ao atualizar"));
        }
    }
}