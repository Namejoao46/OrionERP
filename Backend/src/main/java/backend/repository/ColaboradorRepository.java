package backend.repository;

import backend.model.Colaborador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ColaboradorRepository extends JpaRepository<Colaborador, Long> {
    
    boolean existsByLogin(String login);

    // O JOIN FETCH força o Hibernate a trazer o Colaborador E a Empresa na mesma conexão
    @Query("SELECT c FROM Colaborador c LEFT JOIN FETCH c.empresa WHERE c.login = :login")
    Optional<Colaborador> findByLogin(@Param("login") String login);
    
    List<Colaborador> findAllByEmpresaId(Long empresaId);
}