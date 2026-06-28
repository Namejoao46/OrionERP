package backend.repository.erp;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import backend.model.erp.Fornecedor;

public interface FornecedorRepository extends JpaRepository<Fornecedor, Long> {
    
    // 🔒 Busca um fornecedor por CNPJ dentro de uma empresa específica
    Optional<Fornecedor> findByCnpjAndEmpresaId(String cnpj, Long empresaId);

    // 🔒 Lista todos os fornecedores de uma empresa específica
    List<Fornecedor> findByEmpresaId(Long empresaId);
    
    Optional<Fornecedor> findByCnpj(String cnpj);
}