package backend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import backend.model.Mensagem;

public interface MensagemRepository extends JpaRepository<Mensagem, Long> {
    List<Mensagem> findByDestinatarioAndStatus(String destinatario, String status);

    @Modifying
    @Query("UPDATE Mensagem m SET m.status = 'LIDA' WHERE m.id = :id")
    void marcarComoLida(@Param("id") Long id);

    // Novo: busca todas as mensagens entre remetente e destinatário
    List<Mensagem> findByRemetenteAndDestinatario(String remetente, String destinatario);
}
