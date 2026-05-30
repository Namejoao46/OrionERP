package backend.repository;

import backend.model.Colaborador;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Repository;

@Repository
public interface ColaboradorRepository extends JpaRepository<Colaborador, Long> {
    UserDetails findByLogin(String login);
    
    // Crucial para o isolamento:
    List<Colaborador> findAllByEmpresaId(Long empresaId);
}