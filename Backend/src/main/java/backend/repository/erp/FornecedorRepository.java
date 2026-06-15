package backend.repository.erp;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import backend.model.erp.Fornecedor;

public interface FornecedorRepository extends JpaRepository<Fornecedor, Long> {
    Optional<Fornecedor> findByCnpj(String cnpj);
}