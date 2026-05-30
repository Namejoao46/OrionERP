package backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Comparator;

import org.springframework.transaction.annotation.Transactional;

import backend.model.Mensagem;
import backend.model.Colaborador;
import backend.repository.MensagemRepository;
import backend.repository.ColaboradorRepository;
import backend.service.NotificationService;

@RestController
@RequestMapping("/api/mensagens")
@CrossOrigin(origins = "*")
public class MensagemController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private MensagemRepository mensagemRepository;

    @Autowired
    private ColaboradorRepository colaboradorRepository;

    private static final Map<String, String> tokensUsuarios = new ConcurrentHashMap<>();

    // Registrar token de notificação
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

    // Enviar mensagem (remetente vem do JWT)
    @PostMapping("/enviar")
    public ResponseEntity<?> enviarMensagem(@RequestBody Map<String, String> payload, Principal principal) {
        String remetente = principal.getName(); // usuário autenticado
        String destinatario = payload.get("destinatario");
        String conteudo = payload.get("mensagem");

        if (destinatario == null || conteudo == null) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Dados inválidos"));
        }

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

    // Buscar mensagens pendentes para o usuário logado
    @GetMapping("/pendentes")
    public ResponseEntity<?> buscarMensagensPendentes(Principal principal) {
        String destinatario = principal.getName();
        List<Mensagem> mensagensPendentes = mensagemRepository.findByDestinatarioAndStatus(destinatario, "NAO_LIDA");
        return ResponseEntity.ok(mensagensPendentes);
    }

    // Marcar mensagem como lida
    @PostMapping("/marcar-lida")
    @Transactional
    public ResponseEntity<?> marcarMensagemComoLida(@RequestBody Map<String, String> payload) {
        try {
            Long idMensagem = Long.valueOf(payload.get("id"));
            mensagemRepository.marcarComoLida(idMensagem);
            return ResponseEntity.ok(Map.of("status", "Mensagem marcada como lida"));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Erro ao atualizar"));
        }
    }

    // Listar todos os usuários exceto o logado
    @GetMapping("/usuarios")
    public ResponseEntity<?> listarUsuarios(Principal principal) {
        String usuarioLogado = principal.getName();
        List<Colaborador> todos = colaboradorRepository.findAll();
        List<String> logins = todos.stream()
                .map(Colaborador::getLogin)
                .filter(login -> !login.equals(usuarioLogado))
                .toList();
        return ResponseEntity.ok(logins);
    }

    @GetMapping("/conversa/{contato}")
    public ResponseEntity<?> buscarConversa(@PathVariable String contato, Principal principal) {
        String usuarioLogado = principal.getName();
        List<Mensagem> conversa = mensagemRepository.findByRemetenteAndDestinatario(usuarioLogado, contato);
        conversa.addAll(mensagemRepository.findByRemetenteAndDestinatario(contato, usuarioLogado));
        conversa.sort(Comparator.comparing(Mensagem::getDataEnvio));
        return ResponseEntity.ok(conversa);
    }

}
