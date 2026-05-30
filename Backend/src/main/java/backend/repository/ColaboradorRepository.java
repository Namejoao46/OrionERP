package backend.repository;

import backend.model.Colaborador;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ColaboradorRepository extends JpaRepository<Colaborador, Long> {
    
    // Adicione esta linha para resolver o erro do LoginController:
    boolean existsByLogin(String login);

    Optional<Colaborador> findByLogin(String login);
    
    List<Colaborador> findAllByEmpresaId(Long empresaId);
}