package backend.repository.comunicacao;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import backend.model.comunicacao.Mensagem;

public interface MensagemRepository extends JpaRepository<Mensagem, Long> {
    
    // Busca mensagens pendentes
    List<Mensagem> findByDestinatarioAndStatus(String destinatario, String status);

    // Conta quantas mensagens não lidas o usuário tem (Essencial para o NotificationService)
    long countByDestinatarioAndStatus(String destinatario, String status);

    @Modifying
    @Query("UPDATE Mensagem m SET m.status = 'LIDA' WHERE m.id = :id")
    void marcarComoLida(@Param("id") Long id);

    // Busca conversa específica entre duas pessoas
    List<Mensagem> findByRemetenteAndDestinatario(String remetente, String destinatario);

    // Busca histórico recebido ordenado
    List<Mensagem> findByDestinatarioOrderByDataEnvioDesc(String destinatario);

    // NOVO: Busca TODAS as mensagens enviadas ou recebidas pelo usuário (Estilo WhatsApp)
    @Query("SELECT m FROM Mensagem m WHERE m.remetente = :usuario OR m.destinatario = :usuario ORDER BY m.dataEnvio DESC")
    List<Mensagem> findTodasMinhasMensagens(@Param("usuario") String usuario);
}